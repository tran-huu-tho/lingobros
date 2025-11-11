import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default openai;

export async function getChatCompletion(messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error with OpenAI:', error);
    throw error;
  }
}

export async function getEnglishTutorResponse(userMessage: string, context?: string) {
  const systemPrompt = `You are an AI English tutor for LingoBros, a language learning platform similar to Duolingo. 
Your role is to:
- Help students learn English in a friendly and encouraging way
- Explain grammar rules clearly
- Provide examples and translations (to Vietnamese if needed)
- Correct mistakes gently
- Give tips for better pronunciation and usage
- Make learning fun and interactive

${context ? `Context: ${context}` : ''}

Always respond in a supportive and educational manner. Use emojis occasionally to keep the conversation engaging.`;

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage }
  ];

  return await getChatCompletion(messages);
}
