
import { User, Role, Department } from '../types';

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
    rawData = JSON.parse(rawText);
  } catch (e) {
    console.warn("Dữ liệu không chuẩn JSON, đang thực hiện vá định dạng thô...");
    try {
      const dataKey = '"data":';
      const dataKeyIdx = rawText.indexOf(dataKey);
      if (dataKeyIdx !== -1) {
        const startOfDataIdx = rawText.indexOf('{', dataKeyIdx);
        const endOfDataIdx = rawText.lastIndexOf('}');
        if (startOfDataIdx !== -1 && endOfDataIdx > startOfDataIdx) {
          const dataContent = rawText.substring(startOfDataIdx, endOfDataIdx).trim();
          if (!dataContent.startsWith('[')) {
            const fixedText = rawText.substring(0, startOfDataIdx) + '[' + dataContent + ']' + rawText.substring(endOfDataIdx);
            rawData = JSON.parse(fixedText);
          } else {
            throw e;
          }
        } else {
          throw e;
        }
      } else {
        const wrapText = `[${rawText}]`;
        rawData = JSON.parse(wrapText);
      }
    } catch (retryError) {
      throw new Error("Định dạng dữ liệu từ Make.com không hợp lệ.");
    }
  }
  
  let sourceArray: any[] = [];
  if (Array.isArray(rawData)) {
    sourceArray = rawData;
  } else if (rawData.status === "success" && Array.isArray(rawData.data)) {
    sourceArray = rawData.data;
  } else if (rawData.data && Array.isArray(rawData.data)) {
    sourceArray = rawData.data;
  } else {
    throw new Error("Không tìm thấy mảng dữ liệu hợp lệ.");
  }

  return sourceArray.map((item: any) => {
    try {
      const userData = (typeof item.json === 'string') ? JSON.parse(item.json) : (item.json || item);
      
      // Xử lý isOnline sang number 1 hoặc 2
      let onlineStatus = 2; // Default offline
      if (userData.isOnline === 1 || userData.isOnline === true || userData.isOnline === '1' || userData.isOnline === 'true') {
        onlineStatus = 1;
      }

      return {
        id: userData.id?.toString() || Math.random().toString(36).substr(2, 9),
        name: userData.name || 'Thành viên mới',
        username: userData.username || userData.name?.toLowerCase().replace(/\s/g, '') || `user_${userData.id}`,
        email: userData.email || '',
        role: (userData.role as Role) || Role.STAFF,
        departmentId: userData.departmentId || '',
        isOnline: onlineStatus,
        phoneNumber: userData.phoneNumber || '',
        password: userData.password || '123456',
        gender: userData.gender || 'Nam',
        image_avatar: userData.image_avatar || '',
        createdAt: userData.createdAt || new Date().toISOString(),
        createdBy: userData.createdBy || 'hub',
        updatedAt: userData.updatedAt || userData.createdAt || new Date().toISOString(),
        updatedBy: userData.updatedBy || userData.createdBy || 'hub'
      };
    } catch (e) {
      return null;
    }
  }).filter((u: any): u is User => u !== null);
};

/**
 * Gửi yêu cầu đồng bộ (POST) tới Webhook khi có thay đổi dữ liệu
 */
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

    if (!response.ok) {
      console.error(`Sync Action Failed: ${actionType}`, response.status);
    }
    return response;
  } catch (error) {
    console.error(`Network Error during Sync: ${actionType}`, error);
  }
};
