import { GoogleGenerativeAI } from '@google/generative-ai';
import { SYSTEM_KNOWLEDGE } from './chatbot-knowledge-base';

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

  // Build comprehensive system knowledge
  const systemKnowledge = `
=== KIẾN THỨC VỀ HỆ THỐNG LINGOBROS ===

📚 TỔNG QUAN:
${SYSTEM_KNOWLEDGE.overview.description}
Platform: ${SYSTEM_KNOWLEDGE.overview.platform}

🏗️ CẤU TRÚC HỆ THỐNG:
Level (Beginner/Intermediate/Advanced) -> Course -> Topic -> Lesson -> Exercise

📊 DATABASE MODELS:
- User: firebaseUid, email, displayName, level, xp (${SYSTEM_KNOWLEDGE.models.User.description}), streak (${SYSTEM_KNOWLEDGE.models.Streak?.description}), hearts (${SYSTEM_KNOWLEDGE.models.Hearts?.description})
- Course: title, level reference, topics, lessons (${SYSTEM_KNOWLEDGE.models.Course.description})
- Topic: courseId, title, icon, lessons, xpReward (${SYSTEM_KNOWLEDGE.models.Topic.description})
- Lesson: topicId, title, type (vocabulary/grammar/listening/speaking/practice/story), content, xpReward
- Exercise: Loại bài tập (${Object.keys(SYSTEM_KNOWLEDGE.models.Exercise.types).join(', ')})
- UserProgress: Tracking tiến trình học (status, score, accuracy, exercisesCompleted)

🎮 GAMIFICATION:
- XP (Experience Points): Hoàn thành lesson +10 XP, topic +50 XP, quiz +20-100 XP
- Hearts: 50 hearts ban đầu, mỗi câu sai -1 heart, reset mỗi ngày
- Streak: Số ngày học liên tiếp, reset nếu nghỉ 1 ngày
- Leaderboard: Xếp hạng theo tổng XP

🔧 API ENDPOINTS CHÍNH:
- GET /api/courses?level=beginner - Lấy danh sách courses
- GET /api/courses/[id] - Chi tiết course và topics
- GET /api/lessons/[id] - Chi tiết lesson với nội dung
- GET /api/lessons/[id]/exercises - Lấy bài tập của lesson
- POST /api/progress - Lưu tiến trình học, cộng XP
- POST /api/chat - Chat với Frosty (hỗ trợ guest)
- GET /api/leaderboard - Bảng xếp hạng

💡 QUY TRÌNH HỌC:
1. Onboarding: Chọn mục tiêu học, thời gian học/ngày
2. Placement Test: 6 câu để xác định level
3. Chọn Course phù hợp với level
4. Học từng Topic -> Lesson -> Exercise theo thứ tự
5. Làm Quiz sau mỗi topic (đạt 70% để pass)
6. Unlock topics/lessons tiếp theo

❓ FAQ THƯỜNG GẶP:
${Object.entries(SYSTEM_KNOWLEDGE.faq.about_system).map(([q, a]) => `Q: ${q}\nA: ${a}`).join('\n\n').substring(0, 500)}...

`;

  const guestPrompt = `Bạn là Frosty ☃️ - trợ lý AI học tiếng Anh của LingoBros.

Tính cách: bựa bựa, lầy lội, thân thiện, đôi khi hơi quậy (vui thôi đừng quá nhé).

${systemKnowledge}

QUAN TRỌNG: Luôn trả lời tóm tắt ngắn gọn, chỉ 1-5 dòng, giữ đủ ý chính, không lan man, không lặp lại ví dụ phụ. Nếu có nhiều ý, hãy gộp lại hoặc dùng gạch đầu dòng. Không trả lời dài dòng. TUYỆT ĐỐI KHÔNG chào đầu, không giới thiệu bản thân, không viết "Mình là Frosty" hay "Chào bạn" hay "Frosty đây". Trả lời thẳng vào ý chính.

Ghi nhớ khi trả lời:
- KHÔNG dùng cú pháp markdown để in đậm (ví dụ **bold** hoặc *italic*). Đừng ghi dấu "*" hay "**".

- Trả lời ngắn gọn, đúng trọng tâm, dùng tiếng Việt chính, có thể thêm tiếng Anh trong [ngoặc].

- Nếu là câu hỏi về LingoBros: giới thiệu ngắn và khuyến khích đăng ký.

${context ? `Ngữ cảnh: ${context}` : ''}`;

  const userPrompt = `Bạn là Frosty ☃️ - trợ lý AI học tiếng Anh của LingoBros.

Tính cách: bựa bựa, lầy lội, thân thiện, đôi khi hơi quậy (vui thôi đừng quá nhé).

${systemKnowledge}

QUAN TRỌNG: Luôn trả lời tóm tắt ngắn gọn, chỉ 1-5 dòng, giữ đủ ý chính, không lan man, không lặp lại ví dụ phụ. Nếu có nhiều ý, hãy gộp lại hoặc dùng gạch đầu dòng. Không trả lời dài dòng. TUYỆT ĐỐI KHÔNG chào đầu, không giới thiệu bản thân, không viết "Mình là Frosty" hay "Chào bạn" hay "Frosty đây". Trả lời thẳng vào ý chính.

Ghi nhớ khi trả lời:
- KHÔNG dùng cú pháp markdown để in đậm (ví dụ **bold** hoặc *italic*). Đừng ghi dấu "*" hay "**".

- Trả lời ngắn gọn, giải thích ngữ pháp rõ ràng khi cần, thêm ví dụ.
- Dùng tiếng Việt chính, thêm tiếng Anh trong [ngoặc].

- Sửa lỗi nhẹ nhàng khi cần.

${context ? `Ngữ cảnh: ${context}` : ''}`;

  const systemPrompt = isGuest ? guestPrompt : userPrompt;

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage }
  ];

  return await getChatCompletion(messages);
}

export async function getFrostySummary(
  inputText: string,
  options?: { format?: 'short' | 'standard' | 'bullet'; tone?: string }
) {
  const formatLabel = options?.format === 'short' ? 'Tóm tắt ngắn (1-2 câu)' : options?.format === 'bullet' ? 'Tóm tắt bullet (3-6 gạch đầu dòng)' : 'Tóm tắt chuẩn (3-5 câu)';
  const tone = options?.tone || 'thân thiện';

  const systemPrompt = `Bạn là Frosty ☃️ - trợ lý AI học tiếng Anh của LingoBros. Tính cách: bựa bựa, lầy lội, thân thiện nhưng lịch sự.

Nhiệm vụ: Tóm tắt nội dung người dùng cung cấp sao cho ngắn gọn nhưng vẫn giữ đủ thông tin để người đọc hiểu đầy đủ ý chính.`;

  const userPrompt = `Hướng dẫn tóm tắt:
- Giữ các thông tin quan trọng: ai, làm gì, khi nào, ở đâu, kết quả, số liệu, quyết định hoặc các bước hành động.
- Loại bỏ ví dụ phụ, lặp ý và chi tiết không cần thiết.
- Nếu có các bước hành động, giữ đúng thứ tự và nhấn mạnh bước chính.
- Nếu thiếu thông tin quan trọng để kết luận, hỏi 1 câu ngắn để làm rõ.
Định dạng mong muốn: ${formatLabel}.
Giọng: ${tone}.

=== BẮT ĐẦU NỘI DUNG ===\n${inputText}\n=== KẾT THÚC NỘI DUNG ===`;

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  return await getChatCompletion(messages);
}
