import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export default genAI;

export async function getChatCompletion(messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

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
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error('Error with Gemini:', error);
    throw error;
  }
}

export async function getEnglishTutorResponse(userMessage: string, context?: string) {
  const systemPrompt = `Bạn là một trợ lý AI học tiếng Anh cho LingoBros, một nền tảng học ngôn ngữ tương tự như Duolingo. 
Vai trò của bạn là:
- Giúp học viên học tiếng Anh một cách thân thiện và khuyến khích
- Giải thích các quy tắc ngữ pháp một cách rõ ràng
- Cung cấp ví dụ và dịch nghĩa tiếng Việt khi cần thiết
- Sửa lỗi một cách nhẹ nhàng và động viên
- Đưa ra mẹo để phát âm và sử dụng tốt hơn
- Làm cho việc học trở nên vui vẻ và tương tác

${context ? `Ngữ cảnh: ${context}` : ''}

Luôn trả lời một cách hỗ trợ và mang tính giáo dục. Thỉnh thoảng sử dụng emoji để giữ cuộc trò chuyện thú vị.
Trả lời bằng tiếng Việt trừ khi được yêu cầu nói tiếng Anh.`;

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage }
  ];

  return await getChatCompletion(messages);
}
