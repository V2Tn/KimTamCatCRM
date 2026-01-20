
import { User, Role, Department } from '../types';

/**
 * Hàm làm sạch chuỗi JSON thô từ Webhook một cách mạnh mẽ
 * Giải quyết các lỗi: Dấu phẩy thừa, ngoặc lồng sai, thiếu ngoặc, unquoted keys
 */
const superCleanJson = (text: string): string => {
  let cleaned = text.trim();
  if (!cleaned || cleaned === 'Accepted' || cleaned === 'OK') return '[]';

  try {
    // 1. Xử lý các artifact của Make.com (ngoặc nhọn lồng nhau {{ }} thay vì mảng)
    cleaned = cleaned.replace(/\{\{/g, '[{').replace(/\}\}/g, '}]');
    
    // 2. Vá lỗi "data": {{ ... }} hoặc "data": [ "id": ... ]
    cleaned = cleaned.replace(/"data":\s*\{\{/g, '"data": [');
    cleaned = cleaned.replace(/\[\s*"id":/g, '[{"id":');

    // 3. KHỬ DẤU PHẨY THỪA (Nguyên nhân chính gây lỗi Expected double-quoted property name)
    // Khử dấu phẩy trước dấu đóng ngoặc nhọn: { "a": 1, } -> { "a": 1 }
    cleaned = cleaned.replace(/,\s*\}/g, '}');
    // Khử dấu phẩy trước dấu đóng ngoặc vuông: [ 1, 2, ] -> [ 1, 2 ]
    cleaned = cleaned.replace(/,\s*\]/g, ']');

    // 4. Vá lỗi thiếu dấu đóng ngoặc nhọn cho object cuối cùng trong mảng
    // Nếu kết thúc bằng giá trị rồi đến ] mà không có }
    cleaned = cleaned.replace(/(:\s*(?:"[^"]*"|[\d\.]+|null|true|false))\s*\]/g, '$1 }]');

    // 5. Sửa lỗi dấu ngoặc nhọn kép ở cuối mảng: }} ] -> }]
    cleaned = cleaned.replace(/\}\s*\}\s*\]/g, '}]');

    return cleaned;
  } catch (e) {
    return cleaned;
  }
};

/**
 * Cố gắng trích xuất mảng JSON bằng Regex nếu parse lỗi
 */
const tryManualExtract = (text: string): any[] => {
  try {
    // Tìm nội dung bên trong mảng "data": [ ... ]
    const dataMatch = text.match(/"data"\s*:\s*\[([\s\S]*?)\]/);
    const content = dataMatch ? dataMatch[1] : text;

    // Tách các object dựa trên cấu trúc { ... }
    const results: any[] = [];
    const objectRegex = /\{[\s\S]*?\}/g;
    let match;
    
    while ((match = objectRegex.exec(content)) !== null) {
      try {
        // Làm sạch từng object nhỏ trước khi parse
        let objStr = match[0].replace(/,\s*\}/g, '}');
        results.push(JSON.parse(objStr));
      } catch (e) {
        // Bỏ qua object lỗi
      }
    }
    return results;
  } catch (e) {
    return [];
  }
};

export const syncUsersFromMake = async (url: string): Promise<User[]> => {
  const response = await fetch(url);
  
  if (response.status === 410) {
    throw new Error("Link Webhook (410) đã hết hạn. Hãy tạo link mới trên Make.com");
  }
  
  if (!response.ok) {
    throw new Error(`Lỗi kết nối máy chủ (HTTP ${response.status})`);
  }

  const rawText = await response.text();
  const cleaned = superCleanJson(rawText);
  let sourceArray: any[] = [];

  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) {
      sourceArray = parsed;
    } else if (parsed.data && Array.isArray(parsed.data)) {
      sourceArray = parsed.data;
    } else if (parsed.data) {
      sourceArray = [parsed.data];
    } else {
      sourceArray = Object.values(parsed).filter(v => typeof v === 'object' && v !== null);
    }
  } catch (e) {
    console.warn("JSON.parse thất bại, đang thử trích xuất thủ công...");
    sourceArray = tryManualExtract(rawText);
    if (sourceArray.length === 0) {
      throw new Error("Không thể đọc được dữ liệu. Hãy kiểm tra JSON Stringify trên Make.");
    }
  }

  return sourceArray.map((item: any) => {
    try {
      const d = (item.json && typeof item.json === 'string') ? JSON.parse(item.json) : (item.json || item);
      
      if (!d.id && !d["0"]) return null;
      if (!d.name && !d["2"] && !d.username && !d.userName) return null;

      return {
        id: (d.id || d["0"]).toString(),
        name: d.name || d["2"] || 'Thành viên mới',
        username: d.username || d.userName || d["3"] || `user_${d.id}`,
        email: d.email || d["5"] || '',
        role: (d.role || d["8"] || Role.STAFF) as Role,
        departmentId: (d.departmentId || d["9"] || '').toString(),
        isOnline: (d.isOnline === 1 || d.isOnline === '1' || d.isOnline === true) ? 1 : 2,
        phoneNumber: d.phoneNumber || d["4"] || '',
        password: d.password || d["6"] || '123456',
        gender: d.gender || d["7"] || 'Nam',
        image_avatar: d.image_avatar || d.avatar || d["1"] || '',
        createdAt: d.createdAt || d["13"] || new Date().toISOString(),
        createdBy: d.createdBy || d["12"] || 'hub'
      };
    } catch (e) {
      return null;
    }
  }).filter((u: any): u is User => u !== null);
};

export const postSyncAction = async (
  url: string, 
  actionType: 'CREATE_USER' | 'UPDATE_USER' | 'DELETE_USER' | 'CREATE_DEPT' | 'UPDATE_DEPT' | 'DELETE_DEPT',
  data: any
) => {
  if (!url) return;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        action: actionType,
        payload: data
      })
    });
    return response;
  } catch (error) {
    console.error(`Network Error: ${actionType}`, error);
  }
};
