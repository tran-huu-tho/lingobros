'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  suggestions?: string[];
}

// Extract suggestions from message content
function extractSuggestions(content: string): { text: string; suggestions: string[] } {
  const suggestionRegex = /💡\s*Gợi ý câu hỏi:\s*\n((?:•[^\n]+\n?)+)/;
  const match = content.match(suggestionRegex);
  
  if (match) {
    const suggestionsText = match[1];
    const suggestions = suggestionsText
      .split('\n')
      .map(s => s.replace(/^•\s*/, '').trim())
      .filter(s => s.length > 0);
    
    const textWithoutSuggestions = content.replace(suggestionRegex, '').trim();
    return { text: textWithoutSuggestions, suggestions };
  }
  
  return { text: content, suggestions: [] };
}

export function AIChatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
 

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when an assistant reply finishes and we're not loading
  useEffect(() => {
    if (!isOpen) return;
    if (loading) return;
    if (messages.length === 0) return;

    const last = messages[messages.length - 1];
    if (last.role === 'assistant') {
      inputRef.current?.focus();
    }
  }, [messages, loading, isOpen]);

  // Load chat history when user opens chat
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!user) {
        // Guest welcome message with suggestions
        setMessages([{
          role: 'assistant',
          content: 'Xin chào! Mình là Frosty ☃️ — trợ lý AI học tiếng Anh của LingoBros! 🎉\n\nMình có thể giúp cậu học tiếng Anh vui vẻ và hiệu quả! ❄️✨',
          suggestions: [
            'LingoBros là gì và có gì hay?',
            'Làm sao để học tiếng Anh hiệu quả?',
            'Cách đăng ký tài khoản như thế nào?'
          ]
        }]);
        setTimeout(() => inputRef.current?.focus(), 0);
        return;
      }

      setLoadingHistory(true);
      try {
        const token = await user.getIdToken();
        const response = await fetch('/api/chat', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.messages && data.messages.length > 0) {
            // Process messages to extract suggestions
            const processedMessages = data.messages.map((msg: Message) => {
              const { text, suggestions } = extractSuggestions(msg.content);
              return {
                ...msg,
                content: text,
                suggestions: suggestions.length > 0 ? suggestions : undefined
              };
            });
            setMessages(processedMessages);
          } else {
            // Logged in user welcome message
            setMessages([{
              role: 'assistant',
              content: `Chào mừng cậu trở lại! ☃️❄️\n\nMình là Frosty — trợ lý học tiếng Anh siêu nhiệt tình của cậu đây! 🎉\n\nCậu muốn học gì hôm nay nào? Hỏi mình bất cứ điều gì về tiếng Anh nhé! 💪✨`
            }]);
          }
          // focus input after loading history
          setTimeout(() => inputRef.current?.focus(), 0);
        }
      } catch (error) {
        console.error('Load chat history error:', error);
        setMessages([{
          role: 'assistant',
          content: `Chào cậu! ☃️ Mình là Frosty đây! Có vẻ mình hơi "đóng băng" một chút khi load lịch sử chat 😅\n\nNhưng không sao, mình vẫn sẵn sàng giúp cậu học tiếng Anh! Hỏi mình gì đi nào! 💪`
        }]);
        setTimeout(() => inputRef.current?.focus(), 0);
      } finally {
        setLoadingHistory(false);
      }
    };

    if (isOpen) {
      loadChatHistory();
    }
  }, [user, isOpen]);

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      
      if (user) {
        const token = await user.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: messageText })
      });

      const data = await response.json();
      
      if (data.message) {
        const { text, suggestions } = extractSuggestions(data.message);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: text,
          suggestions: suggestions.length > 0 ? suggestions : undefined,
          timestamp: new Date(data.timestamp)
        }]);
        // focus input after assistant replies
        setTimeout(() => inputRef.current?.focus(), 0);
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Ối! Mình bị "đóng băng" một chút rồi... ❄️😅 Có lỗi xảy ra, cậu thử lại nhé!' 
      }]);
      setTimeout(() => inputRef.current?.focus(), 0);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = () => handleSendMessage(input);
  const handleSuggestionClick = (suggestion: string) => handleSendMessage(suggestion);

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-all z-50 hover:scale-110"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] z-50 animate-in slide-in-from-bottom-5">
          <Card className="h-full flex flex-col shadow-2xl">
            <CardHeader className="border-b flex-row items-center justify-between space-y-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-2xl">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <span className="text-xl">☃️</span>
                Frosty - AI Tutor
              </CardTitle>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-blue-600 p-1 rounded-lg transition-colors"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-blue-50 to-white">
              {loadingHistory ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <div key={index} className="space-y-2">
                      <div
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-2.5 rounded-xl text-sm ${
                            message.role === 'user'
                              ? 'bg-blue-500 text-white'
                              : 'bg-white text-gray-800 shadow-md border border-blue-100'
                          }`}
                        >
                          <div className="whitespace-pre-wrap">{message.content}</div>
                        </div>
                      </div>
                      {/* Suggestion buttons */}
                      {message.role === 'assistant' && message.suggestions && message.suggestions.length > 0 && (
                        <div className="flex flex-col gap-2 ml-2">
                          {message.suggestions.map((suggestion, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSuggestionClick(suggestion)}
                              disabled={loading}
                              className="text-left px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              💡 {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-white p-2.5 rounded-xl shadow-md border border-blue-100">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100" />
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </CardContent>

            <div className="border-t p-4 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Hỏi Frosty điều gì đó... ❄️"
                  className="flex-1 px-3 py-2 text-sm border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={loading || !input.trim()}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
