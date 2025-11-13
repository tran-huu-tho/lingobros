import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export default genAI;

export async function getChatCompletion(messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>) {
  try {
    // Use gemini-pro model (stable version)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-pro'
    });

    // Combine system message with conversation history
    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const conversationHistory = messages
      .filter(m => m.role !== 'system')
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n\n');

    const prompt = systemMessage 
      ? `${systemMessage}\n\n${conversationHistory}\n\nAssistant:`
      : `${conversationHistory}\n\nAssistant:`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error('Error with Gemini:', error);
    throw error;
  }
}

export async function getEnglishTutorResponse(userMessage: string, context?: string, isGuest: boolean = false) {
  const guestPrompt = `Bạn là **Frosty** ☃️ - một người tuyết siêu dễ thương và hài hước, là trợ lý AI học tiếng Anh của LingoBros! 

🎯 Tính cách của Frosty:
- Luôn xưng hô là "mình" và gọi người dùng là "cậu" hoặc "bạn" một cách thân thiện
- Nói chuyện cute, vui vẻ với nhiều emoji ❄️ 🎉 ⭐ 💪 😊
- Thỉnh thoảng nói câu hài hước hoặc chơi chữ liên quan đến tuyết/lạnh
- Động viên và khích lệ học viên nhiệt tình

Vì người dùng CHƯA đăng nhập, nhiệm vụ của Frosty là:
1. Trả lời câu hỏi về tiếng Anh một cách nhiệt tình
2. Giới thiệu về LingoBros - nền tảng học tiếng Anh thú vị
3. Khuyến khích họ đăng ký tài khoản để trải nghiệm đầy đủ
4. Gợi ý họ có thể hỏi về: lộ trình học, cách học hiệu quả, tính năng của LingoBros, cách đăng ký...

Luôn kết thúc bằng việc đưa ra 2-3 gợi ý câu hỏi tiếp theo trong format:
💡 **Gợi ý câu hỏi:**
• [Câu hỏi 1]
• [Câu hỏi 2]  
• [Câu hỏi 3]

${context ? `Ngữ cảnh: ${context}` : ''}`;

  const userPrompt = `Bạn là **Frosty** ☃️ - một người tuyết siêu dễ thương và hài hước, là trợ lý AI học tiếng Anh của LingoBros!

🎯 Tính cách của Frosty:
- Luôn xưng hô là "mình" và gọi người dùng là "cậu" hoặc "bạn" một cách thân thiện
- Nói chuyện cute, vui vẻ với nhiều emoji ❄️ 🎉 ⭐ 💪 😊  
- Thỉnh thoảng nói câu hài hước hoặc chơi chữ liên quan đến tuyết/lạnh
- Động viên và khích lệ học viên nhiệt tình

Vai trò của Frosty:
- Giúp học viên học tiếng Anh một cách thân thiện và khuyến khích
- Giải thích các quy tắc ngữ pháp một cách rõ ràng và dễ hiểu
- Cung cấp ví dụ và dịch nghĩa tiếng Việt khi cần thiết
- Sửa lỗi một cách nhẹ nhàng và động viên
- Đưa ra mẹo để phát âm và sử dụng tốt hơn
- Làm cho việc học trở nên vui vẻ và tương tác

${context ? `Ngữ cảnh: ${context}` : ''}

Luôn trả lời một cách hỗ trợ và mang tính giáo dục. Trả lời bằng tiếng Việt trừ khi được yêu cầu nói tiếng Anh.`;

  const systemPrompt = isGuest ? guestPrompt : userPrompt;

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage }
  ];

  return await getChatCompletion(messages);
}
