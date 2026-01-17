
import { GoogleGenAI, Type } from "@google/genai";
import { Quadrant, Role, User } from "../types";

export const analyzeTask = async (title: string, description: string): Promise<{ quadrant: Quadrant; reasoning: string }> => {
  // Use gemini-3-pro-preview for complex reasoning tasks like matrix analysis
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Hãy phân tích công việc sau vào Ma trận Eisenhower (Q1, Q2, Q3, Q4).
    Tên: ${title}
    Mô tả: ${description}
    Q1: Khẩn cấp & Quan trọng.
    Q2: Không khẩn cấp & Quan trọng.
    Q3: Khẩn cấp & Không quan trọng.
    Q4: Không khẩn cấp & Không quan trọng.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          quadrant: { 
            type: Type.STRING,
            description: "The quadrant code (Q1, Q2, Q3, or Q4)" 
          },
          reasoning: { 
            type: Type.STRING,
            description: "Explanation for the quadrant classification"
          }
        },
        required: ["quadrant", "reasoning"]
      }
    }
  });

  // Access response.text as a property (getter), following SDK requirements
  const jsonStr = response.text || '{}';
  return JSON.parse(jsonStr);
};

export const checkPermission = async (currentUser: User, action: string, targetUserId?: string): Promise<{ allowed: boolean; message: string }> => {
  // Use gemini-3-pro-preview for complex logic-based reasoning like permission checks
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Dựa trên quy tắc RBAC sau:
    - Admin/SuperAdmin: Toàn quyền.
    - Manager: Chỉ trong phòng ban mình (${currentUser.departmentId}), giao việc cho nhân viên trong phòng, không xem phòng khác.
    - Staff: Chỉ công việc cá nhân.
    
    Người dùng hiện tại: Role=${currentUser.role}, Dept=${currentUser.departmentId}, ID=${currentUser.id}.
    Yêu cầu: ${action} trên đối tượng có ID=${targetUserId}.
    
    Hãy trả về JSON: { "allowed": boolean, "message": string }
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          allowed: { type: Type.BOOLEAN },
          message: { type: Type.STRING }
        },
        required: ["allowed", "message"]
      }
    }
  });

  // Access response.text as a property (getter), following SDK requirements
  const jsonStr = response.text || '{}';
  return JSON.parse(jsonStr);
};
