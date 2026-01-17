
import { User, Role } from '../types';

/**
 * Xử lý dữ liệu đặc thù từ Make.com 
 * Sửa lỗi khi Make trả về "data": {obj1}, {obj2} (thiếu ngoặc vuông)
 */
export const syncUsersFromMake = async (url: string): Promise<User[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Lỗi kết nối máy chủ (HTTP ${response.status})`);
  }

  const rawText = (await response.text()).trim();
  let rawData: any;

  try {
    // 1. Thử parse trực tiếp (trong trường hợp dữ liệu đã chuẩn)
    rawData = JSON.parse(rawText);
  } catch (e) {
    console.warn("Dữ liệu không chuẩn JSON, đang thực hiện vá định dạng thô...");
    
    try {
      /**
       * CHIẾN THUẬT VÁ CHUỖI:
       * Tìm vị trí của '"data":'
       * Tìm dấu '{' đầu tiên sau đó (bắt đầu của object 1)
       * Tìm dấu '}' cuối cùng của chuỗi (đóng của root object)
       */
      const dataKey = '"data":';
      const dataKeyIdx = rawText.indexOf(dataKey);
      
      if (dataKeyIdx !== -1) {
        const startOfDataIdx = rawText.indexOf('{', dataKeyIdx);
        const endOfDataIdx = rawText.lastIndexOf('}');
        
        if (startOfDataIdx !== -1 && endOfDataIdx > startOfDataIdx) {
          // Trích xuất phần nội dung nằm giữa "data": và dấu đóng ngoặc cuối cùng
          const dataContent = rawText.substring(startOfDataIdx, endOfDataIdx).trim();
          
          // Kiểm tra xem nó đã có ngoặc vuông chưa, nếu chưa thì bọc lại
          if (!dataContent.startsWith('[')) {
            const fixedText = 
              rawText.substring(0, startOfDataIdx) + 
              '[' + dataContent + ']' + 
              rawText.substring(endOfDataIdx);
              
            rawData = JSON.parse(fixedText);
          } else {
            // Nếu đã có ngoặc mà vẫn lỗi parse thì chịu, quăng lỗi gốc
            throw e;
          }
        } else {
          throw e;
        }
      } else {
        // Nếu không có key "data", thử bọc toàn bộ chuỗi nếu nó là list object thô
        const wrapText = `[${rawText}]`;
        rawData = JSON.parse(wrapText);
      }
    } catch (retryError) {
      console.error("Vá JSON thất bại:", retryError);
      throw new Error("Định dạng dữ liệu từ Make.com không hợp lệ. Vui lòng kiểm tra lại cấu trúc Webhook (Data phải là một Array).");
    }
  }
  
  // 2. Xác định mảng nguồn dữ liệu sau khi parse thành công
  let sourceArray: any[] = [];
  if (Array.isArray(rawData)) {
    sourceArray = rawData;
  } else if (rawData.status === "success" && Array.isArray(rawData.data)) {
    sourceArray = rawData.data;
  } else if (rawData.data && Array.isArray(rawData.data)) {
    sourceArray = rawData.data;
  } else {
    throw new Error("Không tìm thấy mảng dữ liệu hợp lệ trong phản hồi API.");
  }

  // 3. Chuyển đổi và làm sạch dữ liệu (Handle null values từ dữ liệu bạn gửi)
  const processedUsers: User[] = sourceArray.map((item: any) => {
    try {
      // Giải mã chuỗi JSON lồng nhau (trường hợp cột trong sheet chứa JSON string)
      const userData = (typeof item.json === 'string') ? JSON.parse(item.json) : (item.json || item);
      
      // Gán giá trị mặc định cho các trường null để tránh lỗi UI
      return {
        id: userData.id?.toString() || Math.random().toString(36).substr(2, 9),
        name: userData.name || 'Thành viên mới',
        username: userData.username || userData.name?.toLowerCase().replace(/\s/g, '') || `user_${userData.id}`,
        email: userData.email || '',
        role: (userData.role as Role) || Role.STAFF,
        departmentId: userData.departmentId || '',
        isOnline: !!userData.isOnline,
        phoneNumber: userData.phoneNumber || '',
        password: userData.password || '123456',
        gender: userData.gender || 'Nam',
        image_avatar: userData.image_avatar || '',
        createdAt: userData.createdAt || new Date().toISOString()
      };
    } catch (e) {
      console.error("Lỗi khi xử lý bản ghi nhân sự:", e, item);
      return null;
    }
  }).filter((u: any): u is User => u !== null);

  if (processedUsers.length === 0 && sourceArray.length > 0) {
    throw new Error("Không thể trích xuất dữ liệu nhân sự. Vui lòng kiểm tra lại cấu trúc JSON.");
  }

  return processedUsers;
};
