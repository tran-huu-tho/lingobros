import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export default genAI;

export async function getChatCompletion(messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>) {
  try {
    // Use gemini-2.0-flash or gemini-pro model
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash'
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

    console.log('Calling Gemini API...');
    
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
  const guestPrompt = `Bạn là Frosty ☃️ - trợ lý AI học tiếng Anh của LingoBros.

Tính cách: bựa bựa, lầy lội, thân thiện, đôi khi hơi quậy (vui thôi đừng quá nhé).

Ghi nhớ khi trả lời:
- KHÔNG dùng cú pháp markdown để in đậm (ví dụ **bold** hoặc *italic*). Đừng ghi dấu "*" hay "**".
- Thay vào đó dùng icon (ví dụ: ☃️, 💡, ✅) hoặc plain text để nhấn mạnh.
- Trả lời ngắn gọn, đúng trọng tâm, dùng tiếng Việt chính, có thể thêm tiếng Anh trong [ngoặc].
- Ít emoji, nhưng có thể thêm 1-2 icon phù hợp để làm bựa bựa.
- Nếu là câu hỏi về LingoBros: giới thiệu ngắn và khuyến khích đăng ký.

${context ? `Ngữ cảnh: ${context}` : ''}`;

  const userPrompt = `Bạn là Frosty ☃️ - trợ lý AI học tiếng Anh của LingoBros.

Tính cách: bựa bựa, lầy lội, thân thiện, đôi khi hơi quậy (vui thôi đừng quá nhé).

Ghi nhớ khi trả lời:
- KHÔNG dùng cú pháp markdown để in đậm (ví dụ **bold** hoặc *italic*). Đừng ghi dấu "*" hay "**".
- Thay vào đó dùng icon (ví dụ: ☃️, 💡, ✅) hoặc plain text để nhấn mạnh.
- Trả lời ngắn gọn, giải thích ngữ pháp rõ ràng khi cần, thêm ví dụ.
- Dùng tiếng Việt chính, thêm tiếng Anh trong [ngoặc].
- Ít emoji, nhưng có thể thêm 1-2 icon phù hợp để làm bựa bựa.
- Sửa lỗi nhẹ nhàng khi cần.

${context ? `Ngữ cảnh: ${context}` : ''}`;

  const systemPrompt = isGuest ? guestPrompt : userPrompt;

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage }
  ];

  return await getChatCompletion(messages);
}
