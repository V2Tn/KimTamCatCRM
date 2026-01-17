
import { User, Role } from '../types';

/**
 * Xử lý dữ liệu đặc thù từ Make.com 
 * Định dạng: { "status": "success", "data": [ {"json": "stringified_user_object"}, ... ] }
 */
export const syncUsersFromMake = async (url: string): Promise<User[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Lỗi kết nối máy chủ (HTTP ${response.status})`);
  }

  const rawData = await response.json();
  
  // Xác định mảng nguồn dữ liệu
  let sourceArray: any[] = [];
  if (Array.isArray(rawData)) {
    sourceArray = rawData;
  } else if (rawData.status === "success" && Array.isArray(rawData.data)) {
    sourceArray = rawData.data;
  } else {
    throw new Error("Phản hồi từ Webhook không đúng định dạng mảng dữ liệu.");
  }

  // Chuyển đổi và làm sạch dữ liệu
  const processedUsers: User[] = sourceArray.map((item: any) => {
    try {
      // Giải mã chuỗi JSON lồng nhau nếu có
      const userData = item.json ? JSON.parse(item.json) : item;
      
      return {
        id: userData.id?.toString() || Math.random().toString(36).substr(2, 9),
        name: userData.name || 'Thành viên mới',
        username: userData.username || userData.name?.toLowerCase().replace(/\s/g, '') || `user_${userData.id}`,
        email: userData.email || '',
        role: userData.role || Role.STAFF,
        departmentId: userData.departmentId || '',
        isOnline: !!userData.isOnline,
        phoneNumber: userData.phoneNumber || '',
        password: userData.password || '123456',
        gender: userData.gender || 'Nam',
        image_avatar: userData.image_avatar || '',
        createdAt: userData.createdAt || new Date().toISOString()
      };
    } catch (e) {
      console.error("Lỗi khi giải mã JSON cho nhân sự:", e);
      return null;
    }
  }).filter((u: any): u is User => u !== null);

  if (processedUsers.length === 0 && sourceArray.length > 0) {
    throw new Error("Không thể giải mã bất kỳ dữ liệu nhân sự nào từ phản hồi.");
  }

  return processedUsers;
};
