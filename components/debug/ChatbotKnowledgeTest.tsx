/**
 * Chatbot Knowledge Base Test Component
 * Drop this in any page to test Frosty's knowledge
 */

'use client';

import { useState } from 'react';

const TEST_QUESTIONS = [
  // System
  { q: "LingoBros là gì?", cat: "System" },
  { q: "Có những tính năng gì?", cat: "System" },
  { q: "Cấu trúc bài học như thế nào?", cat: "System" },
  
  // Gamification
  { q: "XP là gì?", cat: "Gamification" },
  { q: "Hearts là gì?", cat: "Gamification" },
  { q: "Streak là gì?", cat: "Gamification" },
  
  // Technical
  { q: "Database có những model nào?", cat: "Technical" },
  { q: "Exercise có những loại nào?", cat: "Technical" },
  { q: "API nào để lấy courses?", cat: "Technical" },
  
  // English
  { q: "Phân biệt affect và effect?", cat: "English" },
  { q: "Cách dùng present perfect?", cat: "English" },
];

export default function ChatbotKnowledgeTest() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');

  const testQuestion = async (question: string) => {
    const startTime = Date.now();
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question })
      });

      const data = await response.json();
      const duration = Date.now() - startTime;

      return {
        question,
        answer: data.message || data.error,
        isFAQ: data.isFAQ || false,
        duration,
        success: !!data.message
      };
    } catch (error: any) {
      return {
        question,
        answer: `Error: ${error.message}`,
        isFAQ: false,
        duration: Date.now() - startTime,
        success: false
      };
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    setResults([]);

    for (const test of TEST_QUESTIONS) {
      const result = await testQuestion(test.q);
      setResults(prev => [...prev, { ...result, category: test.cat }]);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    setLoading(false);
  };

  const testCustomQuestion = async () => {
    if (!customQuestion.trim()) return;

    setLoading(true);
    const result = await testQuestion(customQuestion);
    setResults(prev => [...prev, { ...result, category: 'Custom' }]);
    setLoading(false);
    setCustomQuestion('');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          🤖 Frosty Knowledge Base Test
        </h1>
        <p className="text-gray-600">
          Test chatbot với {TEST_QUESTIONS.length} câu hỏi mẫu
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg p-6 mb-6 shadow">
        <div className="flex gap-4 mb-4">
          <button
            onClick={runAllTests}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {loading ? '⏳ Testing...' : '▶️ Run All Tests'}
          </button>

          <button
            onClick={() => setResults([])}
            disabled={loading || results.length === 0}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            🗑️ Clear Results
          </button>
        </div>

        {/* Custom Question */}
        <div className="flex gap-4">
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && testCustomQuestion()}
            placeholder="Nhập câu hỏi của bạn..."
            disabled={loading}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={testCustomQuestion}
            disabled={loading || !customQuestion.trim()}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            💬 Test
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {results.map((result, index) => (
          <div
            key={index}
            className={`bg-white rounded-lg p-6 shadow ${
              result.success ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full mb-2">
                  {result.category}
                </span>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  ❓ {result.question}
                </h3>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">
                  {result.duration}ms
                </div>
                {result.isFAQ && (
                  <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded mt-1">
                    ⚡ FAQ
                  </span>
                )}
              </div>
            </div>

            <div className={`p-4 rounded-lg ${
              result.success ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <p className={`text-sm ${
                result.success ? 'text-green-900' : 'text-red-900'
              }`}>
                <strong>Frosty:</strong> {result.answer}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      {results.length > 0 && (
        <div className="mt-8 bg-white rounded-lg p-6 shadow">
          <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {results.length}
              </div>
              <div className="text-sm text-gray-600">Total Tests</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {results.filter(r => r.success).length}
              </div>
              <div className="text-sm text-gray-600">Success</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {results.filter(r => r.isFAQ).length}
              </div>
              <div className="text-sm text-gray-600">FAQ Responses</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {Math.round(
                  results.reduce((sum, r) => sum + r.duration, 0) / results.length
                )}ms
              </div>
              <div className="text-sm text-gray-600">Avg Response Time</div>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-700 mb-2">Legend:</h4>
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
          <div>🟢 Green border = Success</div>
          <div>🔴 Red border = Error</div>
          <div>⚡ FAQ badge = Instant response (no AI call)</div>
          <div>⏱️ Duration = Response time in milliseconds</div>
        </div>
      </div>
    </div>
  );
}
