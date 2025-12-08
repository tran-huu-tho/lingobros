'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, Trophy, Flame, Heart, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Exercise {
  _id: string;
  type: string;
  question: string;
  questionAudio?: string;
  questionImage?: string;
  options?: string[];
  correctAnswer?: string;
  sentence?: string;
  blanks?: Array<{
    position: number;
    answer: string;
    acceptableAnswers?: string[];
  }>;
  words?: string[];
  correctOrder?: string[];
  explanation?: string;
  hint?: string;
  difficulty: string;
  xpReward: number;
  order: number;
}

interface Topic {
  _id: string;
  title: string;
  description?: string;
  icon?: string;
  color: string;
  xpReward: number;
  courseId?: string;
}

interface TopicContent {
  topic: Topic;
  exercises: Exercise[];
}

export default function TopicLearnPage() {
  const { user, userData, refreshUserData } = useAuth();
  const router = useRouter();
  const params = useParams();
  const topicId = params.id as string;

  const [content, setContent] = useState<TopicContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  
  // For match exercise - drag and drop
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [shuffledRightItems, setShuffledRightItems] = useState<Record<string, string[]>>({});
  const [isTopicCompleted, setIsTopicCompleted] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    fetchTopicContent();
    checkTopicCompleted();
  }, [user, topicId]);

  const fetchTopicContent = async () => {
    try {
      const token = await user!.getIdToken();
      const response = await fetch(`/api/topics/${topicId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setContent(data);
        
        // Shuffle right items cho tất cả match exercises ngay từ đầu
        const shuffled: Record<string, string[]> = {};
        data.exercises.forEach((ex: Exercise) => {
          if (ex.type === 'match' && (ex as any).pairs) {
            const pairs = (ex as any).pairs;
            const rightItems = pairs.map((p: any) => p.right);
            shuffled[ex._id] = rightItems.sort(() => Math.random() - 0.5);
          }
        });
        setShuffledRightItems(shuffled);
      } else {
        toast.error('Không thể tải nội dung');
      }
    } catch (error) {
      console.error('Error fetching topic content:', error);
      toast.error('Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const checkTopicCompleted = async () => {
    try {
      const token = await user!.getIdToken();
      const response = await fetch('/api/progress/user', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const progress = data.progressMap?.[topicId];
        setIsTopicCompleted(progress?.status === 'completed');
      }
    } catch (error) {
      console.error('Error checking topic completion:', error);
    }
  };

  const handleAnswer = (exerciseId: string, answer: any) => {
    setUserAnswers(prev => ({ ...prev, [exerciseId]: answer }));
  };

  const checkAnswer = (exercise: Exercise) => {
    const userAnswer = userAnswers[exercise._id];
    if (!userAnswer) return false;

    switch (exercise.type) {
      case 'multiple-choice':
        return userAnswer === exercise.correctAnswer;
        
      case 'fill-blank':
        if (!exercise.blanks) return false;
        return exercise.blanks.every((blank, index) => {
          const answer = userAnswer[index]?.toLowerCase().trim();
          return answer === blank.answer.toLowerCase() || 
                 blank.acceptableAnswers?.some((a: string) => a.toLowerCase() === answer);
        });
        
      case 'word-order':
        return JSON.stringify(userAnswer) === JSON.stringify(exercise.correctOrder);
        
      case 'translate':
        // Simple check - can be improved with fuzzy matching
        const correctAns = exercise.correctAnswer?.toLowerCase().trim();
        const userAns = userAnswer.toLowerCase().trim();
        return userAns === correctAns;
        
      case 'match':
        if (!(exercise as any).pairs) return false;
        return Object.keys(userAnswers[exercise._id] || {}).length === (exercise as any).pairs.length &&
          (exercise as any).pairs.every((pair: any) => 
            userAnswers[exercise._id]?.[pair.left] === pair.right
          );
        
      default:
        return false;
    }
  };

  const handleSubmitAnswer = async (exercise: Exercise) => {
    const correct = checkAnswer(exercise);
    setIsCorrect(correct);
    setShowResult(true);
    
    // Tính thời gian làm bài (giây)
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    // Gọi API lưu progress
    try {
      const token = await user!.getIdToken();
      const response = await fetch('/api/progress/complete-exercise', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topicId,
          exerciseId: exercise._id,
          isCorrect: correct,
          timeSpent,
          exerciseType: exercise.type
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (correct) {
          // Chỉ hiển thị XP nếu chưa hoàn thành topic (lần đầu làm)
          if (!isTopicCompleted && data.xpReward > 0) {
            toast.success(`Chính xác! +${data.xpReward} XP`, { duration: 2000 });
          } else if (isTopicCompleted) {
            toast.success('Chính xác!', { duration: 2000 });
          } else {
            toast.success(`Chính xác! +${data.xpReward} XP`, { duration: 2000 });
          }
          // Đánh dấu bài tập đã hoàn thành
          setCompletedExercises(prev => new Set([...prev, exercise._id]));
          // Refresh user data để cập nhật XP, Level
          await refreshUserData();
        } else {
          // Làm sai - thông báo mất heart và thời gian hồi
          if (data.heartDeducted) {
            const timeText = data.minutesUntilNextHeart > 0 
              ? ` (Hồi sau ${data.minutesUntilNextHeart}p)`
              : '';
            toast.error(`Chưa đúng! Còn ${data.hearts} ❤️${timeText}`, { duration: 3000 });
          } else {
            toast.error('Chưa đúng! Tiếp tục câu sau nhé', { duration: 2000 });
          }
        }
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handleContinue = () => {
    setShowResult(false);
    setUserAnswers({});
    setStartTime(Date.now());
    
    // Luôn chuyển sang câu tiếp theo (dù đúng hay sai)
    if (currentStep < (content?.exercises.length || 0) - 1) {
      setCurrentStep(currentStep + 1);
      setSelectedLeft(null);
      setMatches({});
    } else {
      // Hoàn thành topic
      handleCompleteTopic();
    }
  };

  const handleCompleteTopic = async () => {
    try {
      console.log('🎯 Starting handleCompleteTopic...');
      const token = await user!.getIdToken();
      
      console.log('📤 Sending request to complete-topic API:', {
        topicId,
        courseId: content?.topic.courseId
      });
      
      const response = await fetch('/api/progress/complete-topic', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topicId,
          courseId: content?.topic.courseId
        })
      });

      console.log('📥 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Complete topic success:', data);
        
        if (data.bonusXP > 0) {
          toast.success(`🎉 Hoàn thành! +${data.bonusXP} XP thưởng!`, { duration: 3000 });
        } else {
          toast.success('🎉 Hoàn thành chủ đề!', { duration: 3000 });
        }
        
        await refreshUserData();
        
        // Chuyển về dashboard sau 2s
        setTimeout(() => {
          console.log('🏠 Redirecting to dashboard...');
          router.push('/dashboard');
        }, 2000);
      } else {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        toast.error('Có lỗi xảy ra khi lưu tiến trình');
        // Vẫn chuyển về dashboard
        setTimeout(() => router.push('/dashboard'), 1000);
      }
    } catch (error) {
      console.error('💥 Error completing topic:', error);
      toast.error('Có lỗi xảy ra');
      // Vẫn chuyển về dashboard
      setTimeout(() => router.push('/dashboard'), 1000);
    }
  };

  const renderExercise = (exercise: Exercise) => {
    switch (exercise.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-4">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              {exercise.questionImage && (
                <img 
                  src={exercise.questionImage} 
                  alt="Question" 
                  className="w-full max-w-md mx-auto rounded-lg mb-4"
                />
              )}
              <h3 className="text-2xl font-bold text-white mb-4">{exercise.question}</h3>
              {exercise.questionAudio && (
                <audio controls className="w-full mb-4">
                  <source src={exercise.questionAudio} type="audio/mpeg" />
                </audio>
              )}
            </div>

            <div className="space-y-3">
              {exercise.options?.map((option, index) => {
                const isSelected = userAnswers[exercise._id] === option;
                const showCorrect = showResult && option === exercise.correctAnswer;
                const showWrong = showResult && isSelected && !isCorrect;

                return (
                  <button
                    key={index}
                    onClick={() => !showResult && handleAnswer(exercise._id, option)}
                    disabled={showResult}
                    className={`w-full text-left p-4 rounded-xl border-2 transition ${
                      showCorrect
                        ? 'bg-green-600/20 border-green-500'
                        : showWrong
                        ? 'bg-red-600/20 border-red-500'
                        : isSelected
                        ? 'bg-blue-600/20 border-blue-500'
                        : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                    } ${showResult ? 'cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">{option}</span>
                      {showCorrect && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 'fill-blank':
        const parts = exercise.sentence?.split('___') || [];
        return (
          <div className="space-y-4">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">{exercise.question}</h3>
              <div className="text-xl text-gray-300 leading-relaxed">
                {parts.map((part, index) => (
                  <span key={index}>
                    {part}
                    {index < (exercise.blanks?.length || 0) && (
                      <input
                        type="text"
                        className={`inline-block mx-2 px-4 py-2 bg-gray-900 border-b-2 text-white focus:outline-none rounded ${
                          showResult
                            ? checkAnswer(exercise)
                              ? 'border-green-500'
                              : 'border-red-500'
                            : 'border-blue-500 focus:border-blue-400'
                        }`}
                        style={{ width: '180px' }}
                        onChange={(e) => {
                          const newAnswers = { ...(userAnswers[exercise._id] || {}) };
                          newAnswers[index] = e.target.value;
                          handleAnswer(exercise._id, newAnswers);
                        }}
                        value={userAnswers[exercise._id]?.[index] || ''}
                        placeholder="..."
                        disabled={showResult}
                      />
                    )}
                  </span>
                ))}
              </div>
              {showResult && !isCorrect && (
                <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-yellow-400 text-sm">
                    Đáp án đúng: {exercise.blanks?.map(b => b.answer).join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'word-order':
        const selectedWords = userAnswers[exercise._id] || [];
        const availableWords = exercise.words?.filter(w => !selectedWords.includes(w)) || [];

        return (
          <div className="space-y-4">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">{exercise.question}</h3>
              
              {/* Selected words area */}
              <div className={`min-h-[100px] bg-gray-900 border-2 border-dashed rounded-xl p-4 mb-6 ${
                showResult
                  ? isCorrect
                    ? 'border-green-500'
                    : 'border-red-500'
                  : 'border-gray-700'
              }`}>
                <div className="flex flex-wrap gap-2 justify-center">
                  {selectedWords.length === 0 ? (
                    <p className="text-gray-500 text-center">Nhấn vào các từ bên dưới để sắp xếp</p>
                  ) : (
                    selectedWords.map((word: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => {
                          if (!showResult) {
                            const newWords = selectedWords.filter((_: string, i: number) => i !== index);
                            handleAnswer(exercise._id, newWords);
                          }
                        }}
                        disabled={showResult}
                        className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg font-medium text-lg transition"
                      >
                        {word}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Available words */}
              {availableWords.length > 0 && !showResult && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {availableWords.map((word, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(exercise._id, [...selectedWords, word])}
                      className="px-5 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium text-lg transition"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              )}

              {showResult && !isCorrect && (
                <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-yellow-400">
                    Đáp án đúng: <span className="font-bold">{exercise.correctOrder?.join(' ')}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'translate':
        return (
          <div className="space-y-4">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">{exercise.question}</h3>
              
              <div className={`bg-gray-900 border-2 rounded-xl p-4 ${
                showResult
                  ? isCorrect
                    ? 'border-green-500'
                    : 'border-red-500'
                  : 'border-gray-700'
              }`}>
                <textarea
                  className="w-full bg-transparent text-white text-lg resize-none focus:outline-none"
                  rows={3}
                  placeholder="Nhập bản dịch của bạn..."
                  value={userAnswers[exercise._id] || ''}
                  onChange={(e) => handleAnswer(exercise._id, e.target.value)}
                  disabled={showResult}
                />
              </div>

              {showResult && !isCorrect && (
                <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-yellow-400">
                    <span className="font-bold">Đáp án tham khảo:</span> {exercise.correctAnswer}
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'match':
        const pairs = (exercise as any).pairs || [];
        const leftItems = pairs.map((p: any) => p.left);
        // Sử dụng shuffled items đã tạo từ đầu thay vì shuffle mỗi lần render
        const rightItems = shuffledRightItems[exercise._id] || pairs.map((p: any) => p.right);

        return (
          <div className="space-y-4">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">{exercise.question}</h3>
              
              <div className="grid grid-cols-2 gap-8">
                {/* Left column */}
                <div className="space-y-4">
                  {leftItems.map((left: string, index: number) => {
                    const isSelected = selectedLeft === left;
                    const isMatched = matches[left];
                    const showCorrect = showResult && pairs.find((p: any) => p.left === left && p.right === matches[left]);
                    const showWrong = showResult && isMatched && !pairs.find((p: any) => p.left === left && p.right === matches[left]);

                    return (
                      <button
                        key={index}
                        onClick={() => {
                          if (!showResult && !isMatched) {
                            setSelectedLeft(isSelected ? null : left);
                          }
                        }}
                        disabled={showResult || !!isMatched}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all relative ${
                          showCorrect
                            ? 'bg-green-600/20 border-green-500'
                            : showWrong
                            ? 'bg-red-600/20 border-red-500'
                            : isSelected
                            ? 'bg-blue-600/30 border-blue-500 ring-2 ring-blue-400'
                            : isMatched
                            ? 'bg-gray-700/50 border-gray-600'
                            : 'bg-gray-700 border-gray-600 hover:border-blue-500'
                        } ${showResult || isMatched ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <p className="text-white font-medium">{left}</p>
                        {isMatched && (
                          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                            {Object.keys(matches).indexOf(left) + 1}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Right column */}
                <div className="space-y-4">
                  {rightItems.map((right: string, index: number) => {
                    const isMatchedWith = Object.keys(matches).find(k => matches[k] === right);
                    const showCorrect = showResult && pairs.find((p: any) => p.right === right && p.left === isMatchedWith);
                    const showWrong = showResult && isMatchedWith && !pairs.find((p: any) => p.right === right && p.left === isMatchedWith);

                    return (
                      <button
                        key={index}
                        onClick={() => {
                          if (!showResult && selectedLeft && !isMatchedWith) {
                            const newMatches = { ...matches, [selectedLeft]: right };
                            setMatches(newMatches);
                            handleAnswer(exercise._id, newMatches);
                            setSelectedLeft(null);
                          }
                        }}
                        disabled={showResult || !!isMatchedWith}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all relative ${
                          showCorrect
                            ? 'bg-green-600/20 border-green-500'
                            : showWrong
                            ? 'bg-red-600/20 border-red-500'
                            : isMatchedWith
                            ? 'bg-gray-700/50 border-gray-600'
                            : selectedLeft
                            ? 'bg-gray-700 border-blue-500 hover:bg-blue-600/20'
                            : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                        } ${showResult || isMatchedWith ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <p className="text-white font-medium">{right}</p>
                        {isMatchedWith && (
                          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                            {Object.keys(matches).indexOf(isMatchedWith) + 1}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hint for matching */}
              {!showResult && selectedLeft && (
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-blue-400 text-sm text-center">
                    👆 Đã chọn "<span className="font-bold">{selectedLeft}</span>" - Nhấn vào đáp án bên phải để nối
                  </p>
                </div>
              )}

              {showResult && !isCorrect && (
                <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-yellow-400 font-bold mb-2">Đáp án đúng:</p>
                  <div className="space-y-1">
                    {pairs.map((pair: any, index: number) => (
                      <p key={index} className="text-yellow-300 flex items-center gap-2">
                        <span className="font-medium">{pair.left}</span>
                        <span className="text-yellow-500">→</span>
                        <span className="font-medium">{pair.right}</span>
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 text-center">
            <p className="text-gray-400">Loại bài tập "{exercise.type}" chưa được hỗ trợ</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-950 to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!content || content.exercises.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-950 to-gray-900">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Chưa có bài tập</h3>
          <p className="text-gray-400 mb-6">Chuyên đề này đang được phát triển</p>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition"
          >
            Quay lại dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { topic, exercises } = content;
  const currentExercise = exercises[currentStep];
  const progress = ((currentStep + 1) / exercises.length) * 100;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 to-gray-900">
      {/* Header */}
      <header className="backdrop-blur-xl bg-gray-950/80 border-b border-gray-800 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Thoát</span>
            </Link>

            <div className="flex-1 max-w-2xl mx-6">
              <div className="bg-gray-800 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-linear-to-r from-green-500 to-green-400 h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/20 border border-orange-500/30 rounded-lg">
                <Flame className="w-5 h-5 text-orange-400" />
                <span className="font-bold text-white">{userData?.streak || 0}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-lg">
                <Heart className="w-5 h-5 text-red-400" />
                <span className="font-bold text-white">{userData?.hearts || 5}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Topic Header */}
          <div className="mb-8 text-center">
            <div 
              className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl"
              style={{ 
                backgroundColor: topic.color + '30', 
                border: `3px solid ${topic.color}` 
              }}
            >
              {topic.icon || '📚'}
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{topic.title}</h1>
            {topic.description && <p className="text-gray-400">{topic.description}</p>}
            <div className="flex items-center justify-center gap-6 mt-4">
              <span className="text-sm text-gray-500">
                Câu {currentStep + 1}/{exercises.length}
              </span>
              <span className="text-sm text-green-400 flex items-center gap-1">
                <Trophy className="w-4 h-4" />
                {isTopicCompleted ? 'Ôn tập' : '+50 XP'}
              </span>
            </div>
          </div>

          {/* Exercise Content */}
          <div className="bg-linear-to-br from-gray-900/50 to-gray-900/30 border border-gray-800 rounded-2xl p-8 mb-6">
            {renderExercise(currentExercise)}

            {/* Hint */}
            {currentExercise.hint && !showResult && (
              <div className="mt-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                <p className="text-yellow-400 text-sm flex items-center gap-2">
                  <span className="text-lg">💡</span>
                  <span>{currentExercise.hint}</span>
                </p>
              </div>
            )}

            {/* Explanation */}
            {currentExercise.explanation && showResult && (
              <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <p className="text-blue-400 text-sm">
                  <span className="font-bold">Giải thích:</span> {currentExercise.explanation}
                </p>
              </div>
            )}
          </div>

          {/* Action Button */}
          {!showResult ? (
            <button
              onClick={() => handleSubmitAnswer(currentExercise)}
              disabled={
                currentExercise.type === 'match' 
                  ? Object.keys(matches).length < ((currentExercise as any).pairs?.length || 0)
                  : !userAnswers[currentExercise._id]
              }
              className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition"
            >
              Kiểm tra
            </button>
          ) : (
            <div className={`p-6 rounded-xl border-2 ${
              isCorrect
                ? 'bg-green-600/20 border-green-500'
                : 'bg-orange-600/20 border-orange-500'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-2xl font-bold mb-1 ${
                    isCorrect ? 'text-green-400' : 'text-orange-400'
                  }`}>
                    {isCorrect 
                      ? (isTopicCompleted ? '🎉 Chính xác!' : '🎉 Chính xác! +50 XP')
                      : '😔 Chưa đúng'
                    }
                  </h3>
                  <p className="text-gray-400">
                    {isCorrect 
                      ? `Bạn đã hoàn thành ${completedExercises.size}/${exercises.length} câu`
                      : 'Tiếp tục câu tiếp theo nhé!'
                    }
                  </p>
                </div>
                <button
                  onClick={handleContinue}
                  className={`px-8 py-3 rounded-xl font-bold text-white transition ${
                    isCorrect
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {currentStep < exercises.length - 1 ? 'Câu tiếp theo' : 'Hoàn thành'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
