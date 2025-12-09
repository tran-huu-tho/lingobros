'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useMemo } from 'react';
import { ArrowLeft, Clock, Trophy, CheckCircle2, XCircle, Award, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Exercise {
  _id: string;
  type: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  difficulty?: string;
  sentence?: string;
  blanks?: Array<{
    position: number;
    answer: string;
    acceptableAnswers?: string[];
  }>;
  words?: string[];
  correctOrder?: string[];
  pairs?: Array<{
    left: string;
    right: string;
  }>;
  hint?: string;
  explanation?: string;
}

interface QuizQuestion {
  exerciseId: Exercise;
  order: number;
  points: number;
}

interface Quiz {
  _id: string;
  title: string;
  description?: string;
  topicId?: {
    _id: string;
    title: string;
  };
  questions: QuizQuestion[];
  duration?: number; // minutes
  passingScore: number;
  shuffleQuestions: boolean;
}

interface UserAnswer {
  exerciseId: string;
  answer: string;
  isCorrect?: boolean;
}

export default function QuizPlayerPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const quizId = params?.id as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(0); // seconds
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [matchShuffleMap, setMatchShuffleMap] = useState<Record<string, number[]>>({}); // exerciseId -> shuffled indices

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
      return;
    }

    if (user && quizId) {
      fetchQuiz();
    }
  }, [user, loading, quizId]);

  useEffect(() => {
    if (quizStarted && !quizFinished && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitQuiz(true); // Auto submit when time runs out
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [quizStarted, quizFinished, timeRemaining]);

  const fetchQuiz = async () => {
    try {
      const token = await user!.getIdToken();
      const response = await fetch(`/api/quizzes/${quizId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setQuiz(data.quiz);
        
        // Initialize timer if quiz has duration
        if (data.quiz.duration) {
          setTimeRemaining(data.quiz.duration * 60); // Convert to seconds
        }
      } else {
        toast.error('Không thể tải bài kiểm tra');
        router.push('/quizzes');
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      toast.error('Đã có lỗi xảy ra');
      router.push('/quizzes');
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
    startTimeRef.current = Date.now();
  };

  const handleSelectAnswer = (exerciseId: string, answer: string) => {
    setUserAnswers(prev => {
      const existing = prev.find(a => a.exerciseId === exerciseId);
      if (existing) {
        return prev.map(a => 
          a.exerciseId === exerciseId 
            ? { ...a, answer }
            : a
        );
      }
      return [...prev, { exerciseId, answer }];
    });
  };

  const handleNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = async (autoSubmit = false) => {
    if (!quiz || submitting) return;

    if (!autoSubmit) {
      const answeredCount = userAnswers.length;
      const totalQuestions = quiz.questions.length;
      
      if (answeredCount < totalQuestions) {
        const confirmSubmit = confirm(
          `Bạn mới trả lời ${answeredCount}/${totalQuestions} câu. Bạn có chắc muốn nộp bài?`
        );
        if (!confirmSubmit) return;
      }
    }

    setSubmitting(true);

    try {
      // Calculate score with flexible matching
      let correctCount = 0;
      const answersWithCorrectness = userAnswers.map(ua => {
        const question = quiz.questions.find(q => q.exerciseId._id === ua.exerciseId);
        if (!question) return { ...ua, isCorrect: false };

        const exercise = question.exerciseId;
        let isCorrect = false;

        // Normalize strings for comparison
        const normalizeAnswer = (str: string) => 
          str.toLowerCase().trim().replace(/\s+/g, ' ');

        const userAns = normalizeAnswer(ua.answer);
        const correctAns = normalizeAnswer(exercise.correctAnswer || '');

        switch (exercise.type) {
          case 'multiple-choice':
            // Exact match for multiple choice
            isCorrect = ua.answer === exercise.correctAnswer;
            break;

          case 'fill-blank':
            // Check against acceptable answers or main answer
            if (exercise.blanks && exercise.blanks.length > 0) {
              const blank = exercise.blanks[0];
              const acceptableAnswers = blank.acceptableAnswers || [];
              isCorrect = userAns === normalizeAnswer(blank.answer) ||
                         acceptableAnswers.some(acc => normalizeAnswer(acc) === userAns);
            } else {
              isCorrect = userAns === correctAns;
            }
            break;

          case 'word-order':
            // Compare ordered words
            if (exercise.correctOrder && exercise.correctOrder.length > 0) {
              const correctSentence = normalizeAnswer(exercise.correctOrder.join(' '));
              isCorrect = userAns === correctSentence;
            } else {
              isCorrect = userAns === correctAns;
            }
            break;

          case 'translate':
            // Flexible matching for translation - accept if similar
            isCorrect = userAns === correctAns;
            break;

          case 'match':
            // Fill-in-the-blank style matching
            // User input format: "answer1|answer2|answer3|answer4"
            if (exercise.pairs && exercise.pairs.length > 0) {
              const userAnswerArray = ua.answer.split('|').map(a => normalizeAnswer(a));
              const correctAnswerArray = exercise.pairs.map(pair => normalizeAnswer(pair.right));
              
              // Check if all answers match
              isCorrect = userAnswerArray.length === correctAnswerArray.length &&
                userAnswerArray.every((ans, idx) => ans === correctAnswerArray[idx]);
            } else {
              isCorrect = userAns === correctAns;
            }
            break;

          default:
            isCorrect = userAns === correctAns;
        }

        if (isCorrect) correctCount++;
        return { ...ua, isCorrect };
      });

      const totalQuestions = quiz.questions.length;
      const calculatedScore = (correctCount / totalQuestions) * 100;
      const isPassed = calculatedScore >= quiz.passingScore;

      setUserAnswers(answersWithCorrectness);
      setScore(calculatedScore);
      setQuizFinished(true);

      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Calculate time spent
      const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);

      // Save to database
      const token = await user!.getIdToken();
      const response = await fetch('/api/progress/complete-quiz', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quizId: quiz._id,
          answers: answersWithCorrectness,
          score: calculatedScore,
          timeSpent,
          passed: isPassed
        })
      });

      if (response.ok) {
        if (autoSubmit) {
          toast.error('Hết giờ! Bài kiểm tra đã được nộp tự động');
        } else {
          toast.success(isPassed ? 'Chúc mừng! Bạn đã đạt!' : 'Hãy cố gắng hơn lần sau!');
        }
      } else {
        toast.error('Không thể lưu kết quả');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Đã có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Shuffle match pairs - must be before any conditional returns
  const shuffledMatchPairs = useMemo(() => {
    if (!quiz || currentQuestionIndex >= quiz.questions.length) return [];
    
    const currentQ = quiz.questions[currentQuestionIndex];
    if (!currentQ?.exerciseId?.pairs) return [];
    
    const exerciseId = currentQ.exerciseId._id;
    const pairs = currentQ.exerciseId.pairs;
    
    // Only shuffle the right side texts, keep letters A,B,C,D in order
    const rightTexts = pairs.map(pair => pair.right);
    const shuffledTexts = [...rightTexts].sort(() => Math.random() - 0.5);
    
    // Map: letter position -> original index of the text
    const mapping = shuffledTexts.map(text => rightTexts.indexOf(text));
    setMatchShuffleMap(prev => ({ ...prev, [exerciseId]: mapping }));
    
    // Return fixed letters with shuffled texts
    return shuffledTexts.map((text, idx) => ({
      letter: String.fromCharCode(65 + idx), // A, B, C, D in order
      text: text,
      originalIndex: rightTexts.indexOf(text)
    }));
  }, [quiz, currentQuestionIndex]);

  if (loading || loadingQuiz) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-950 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return null;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const currentAnswer = userAnswers.find(a => a.exerciseId === currentQuestion?.exerciseId?._id);
  const totalQuestions = quiz.questions.length;
  const answeredCount = userAnswers.length;

  // Start screen
  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          {/* Back button */}
          <Link 
            href="/quizzes"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </Link>

          <div className="bg-gray-800/50 border border-gray-700 rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="h-3 bg-linear-to-r from-purple-500 to-pink-500" />

            <div className="p-8">
              <div className="text-center mb-8">
                <div className="inline-flex p-4 bg-purple-500/20 rounded-2xl border border-purple-500/30 mb-4">
                  <Trophy className="w-12 h-12 text-purple-400" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">{quiz.title}</h1>
                {quiz.description && (
                  <p className="text-gray-400">{quiz.description}</p>
                )}
                {quiz.topicId && (
                  <p className="text-sm text-purple-400 mt-2">{quiz.topicId.title}</p>
                )}
              </div>

              {/* Quiz Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 text-center">
                  <div className="text-gray-400 text-sm mb-1">Số câu hỏi</div>
                  <div className="text-2xl font-bold text-white">{totalQuestions}</div>
                </div>

                {quiz.duration && (
                  <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 text-center">
                    <div className="text-gray-400 text-sm mb-1">Thời gian</div>
                    <div className="text-2xl font-bold text-orange-400">{quiz.duration} phút</div>
                  </div>
                )}

                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 text-center">
                  <div className="text-gray-400 text-sm mb-1">Điểm đạt</div>
                  <div className="text-2xl font-bold text-green-400">{quiz.passingScore}%</div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-8">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-300">
                    <p className="font-semibold mb-2 text-white">Lưu ý:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Đọc kỹ từng câu hỏi trước khi trả lời</li>
                      {quiz.duration && <li>Làm bài trong thời gian quy định</li>}
                      <li>Điểm đạt tối thiểu: {quiz.passingScore}%</li>
                      <li>Bạn có thể làm lại bài kiểm tra nhiều lần</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={handleStartQuiz}
                className="w-full py-4 bg-linear-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <Trophy className="w-5 h-5" />
                Bắt đầu làm bài
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results screen
  if (quizFinished) {
    const isPassed = score >= quiz.passingScore;
    const correctCount = userAnswers.filter(a => a.isCorrect).length;

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="bg-gray-800/50 border border-gray-700 rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className={`h-3 bg-linear-to-r ${
              isPassed ? 'from-green-500 to-emerald-500' : 'from-orange-500 to-red-500'
            }`} />

            <div className="p-8">
              {/* Result Icon */}
              <div className="text-center mb-8">
                <div className={`inline-flex p-6 rounded-full border-4 mb-4 ${
                  isPassed 
                    ? 'bg-green-500/20 border-green-500/30' 
                    : 'bg-orange-500/20 border-orange-500/30'
                }`}>
                  {isPassed ? (
                    <Trophy className="w-16 h-16 text-green-400" />
                  ) : (
                    <AlertCircle className="w-16 h-16 text-orange-400" />
                  )}
                </div>

                <h2 className="text-3xl font-bold text-white mb-2">
                  {isPassed ? 'Chúc mừng! Bạn đã đạt!' : 'Chưa đạt yêu cầu'}
                </h2>
                <p className="text-gray-400">
                  {isPassed 
                    ? 'Bạn đã hoàn thành xuất sắc bài kiểm tra này!' 
                    : 'Đừng nản lòng, hãy thử lại nhé!'}
                </p>
              </div>

              {/* Score */}
              <div className="bg-gray-900/50 border border-gray-700 rounded-2xl p-8 mb-6 text-center">
                <div className="text-sm text-gray-400 mb-2">Điểm số của bạn</div>
                <div className={`text-6xl font-bold mb-2 ${
                  isPassed ? 'text-green-400' : 'text-orange-400'
                }`}>
                  {Math.round(score)}%
                </div>
                <div className="text-gray-400">
                  {correctCount}/{totalQuestions} câu đúng
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                    <div>
                      <div className="text-sm text-gray-400">Câu đúng</div>
                      <div className="text-xl font-bold text-white">{correctCount}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <XCircle className="w-8 h-8 text-red-400" />
                    <div>
                      <div className="text-sm text-gray-400">Câu sai</div>
                      <div className="text-xl font-bold text-white">{totalQuestions - correctCount}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Answers */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">Xem lại đáp án</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {quiz.questions.map((q, index) => {
                    const userAnswer = userAnswers.find(ua => ua.exerciseId === q.exerciseId._id);
                    const isCorrect = userAnswer?.isCorrect || false;
                    
                    return (
                      <div 
                        key={index}
                        className={`border rounded-xl p-4 ${
                          isCorrect 
                            ? 'bg-green-500/10 border-green-500/30' 
                            : 'bg-red-500/10 border-red-500/30'
                        }`}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                            isCorrect ? 'bg-green-500' : 'bg-red-500'
                          }`}>
                            {isCorrect ? (
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            ) : (
                              <XCircle className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-semibold mb-2">
                              Câu {index + 1}: {q.exerciseId.question}
                            </p>
                            
                            {/* User's Answer */}
                            <div className="mb-2">
                              <span className="text-sm text-gray-400">Câu trả lời của bạn: </span>
                              {q.exerciseId.type === 'match' && userAnswer?.answer ? (
                                <div className="mt-1 space-y-1">
                                  {userAnswer.answer.split('|').map((ans: string, idx: number) => (
                                    <div key={idx} className="text-sm">
                                      <span className="text-blue-400">{q.exerciseId.pairs?.[idx]?.left || `${idx + 1}`}</span>
                                      <span className="text-gray-500"> → </span>
                                      <span className={`font-medium ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                        {ans || '(không trả lời)'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className={`font-medium ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                  {userAnswer?.answer || '(Không trả lời)'}
                                </span>
                              )}
                            </div>

                            {/* Correct Answer if wrong */}
                            {!isCorrect && (
                              <div className="mb-2">
                                <span className="text-sm text-gray-400">Đáp án đúng: </span>
                                {q.exerciseId.type === 'match' && q.exerciseId.pairs ? (
                                  <div className="mt-2 space-y-1">
                                    {q.exerciseId.pairs.map((pair: any, pairIndex: number) => {
                                      const userAnswerArray = userAnswer?.answer ? userAnswer.answer.split('|') : [];
                                      const userAns = userAnswerArray[pairIndex] || '';
                                      const correctAns = pair.right;
                                      const isPairCorrect = userAns.toLowerCase().trim() === correctAns.toLowerCase().trim();
                                      
                                      return (
                                        <div key={pairIndex} className="flex items-center gap-2 text-sm">
                                          <span className="text-blue-400">{pair.left}</span>
                                          <span className="text-gray-500">→</span>
                                          <span className={isPairCorrect ? 'text-green-400' : 'text-red-400'}>
                                            {userAns || '(không trả lời)'}
                                          </span>
                                          {!isPairCorrect && (
                                            <>
                                              <span className="text-gray-500">✗</span>
                                              <span className="text-green-400">{correctAns}</span>
                                            </>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : q.exerciseId.type === 'word-order' && q.exerciseId.correctOrder ? (
                                  <span className="font-medium text-green-400">
                                    {q.exerciseId.correctOrder.join(' ')}
                                  </span>
                                ) : q.exerciseId.type === 'fill-blank' && q.exerciseId.blanks && q.exerciseId.blanks.length > 0 ? (
                                  <span className="font-medium text-green-400">
                                    {q.exerciseId.blanks[0].answer}
                                  </span>
                                ) : (
                                  <span className="font-medium text-green-400">
                                    {q.exerciseId.correctAnswer || '(Chưa có đáp án)'}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Explanation if available */}
                            {q.exerciseId.explanation && (
                              <div className="mt-2 pt-2 border-t border-gray-700">
                                <p className="text-sm text-gray-300">
                                  💡 {q.exerciseId.explanation}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Link
                  href="/quizzes"
                  className="flex-1 py-3 border border-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors text-center font-semibold"
                >
                  Về danh sách
                </Link>
                <button
                  onClick={() => window.location.reload()}
                  className={`flex-1 py-3 rounded-xl font-semibold ${
                    isPassed
                      ? 'bg-linear-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg'
                      : 'bg-linear-to-r from-orange-500 to-red-500 text-white hover:shadow-lg'
                  }`}
                >
                  Làm lại
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz playing screen
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 to-gray-900">
      {/* Header with Timer */}
      <header className="backdrop-blur-xl bg-gray-950/80 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">{quiz.title}</h1>
              <p className="text-sm text-gray-400">
                Câu {currentQuestionIndex + 1}/{totalQuestions} • 
                Đã trả lời: {answeredCount}/{totalQuestions}
              </p>
            </div>

            {quiz.duration && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
                timeRemaining < 60 
                  ? 'bg-red-500/20 border-red-500/30' 
                  : timeRemaining < 300
                    ? 'bg-orange-500/20 border-orange-500/30'
                    : 'bg-gray-800/50 border-gray-700'
              }`}>
                <Clock className={`w-5 h-5 ${
                  timeRemaining < 60 ? 'text-red-400' : 'text-orange-400'
                }`} />
                <span className={`font-mono text-lg font-bold ${
                  timeRemaining < 60 ? 'text-red-400' : 'text-white'
                }`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mt-4 bg-gray-800 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-linear-to-r from-purple-500 to-pink-500 transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
      </header>

      {/* Question Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl shadow-xl p-8">
          {/* Question */}
          <div className="mb-8">
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-8 h-8 bg-purple-500/20 border border-purple-500/30 rounded-lg flex items-center justify-center">
                <span className="text-purple-400 font-bold">{currentQuestionIndex + 1}</span>
              </div>
              <h2 className="text-xl font-semibold text-white flex-1">
                {currentQuestion.exerciseId.question}
              </h2>
            </div>
          </div>

          {/* Answer Input based on exercise type */}
          <div className="mb-8">
            {/* Multiple Choice */}
            {currentQuestion.exerciseId.type === 'multiple-choice' && currentQuestion.exerciseId.options && currentQuestion.exerciseId.options.length > 0 && (
              <div className="space-y-3">
                {currentQuestion.exerciseId.options.map((option, index) => {
                  const isSelected = currentAnswer?.answer === option;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleSelectAnswer(currentQuestion.exerciseId._id, option)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-gray-600 bg-gray-900/50 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'border-purple-500 bg-purple-500'
                            : 'border-gray-500'
                        }`}>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <span className="text-white">{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Fill Blank */}
            {currentQuestion.exerciseId.type === 'fill-blank' && (
              <div>
                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 mb-4">
                  <p className="text-lg text-gray-300 leading-relaxed">
                    {currentQuestion.exerciseId.sentence}
                  </p>
                </div>
                <input
                  type="text"
                  value={currentAnswer?.answer || ''}
                  onChange={(e) => handleSelectAnswer(currentQuestion.exerciseId._id, e.target.value)}
                  placeholder="Điền từ còn thiếu vào chỗ trống..."
                  className="w-full px-4 py-4 rounded-xl bg-gray-900/50 border-2 border-gray-600 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 transition-colors text-lg"
                />
              </div>
            )}

            {/* Word Order */}
            {currentQuestion.exerciseId.type === 'word-order' && currentQuestion.exerciseId.words && (
              <div>
                <div className="mb-4">
                  <label className="text-sm text-gray-400 mb-2 block">Sắp xếp các từ theo đúng thứ tự:</label>
                  <div className="flex flex-wrap gap-2 bg-gray-900/50 border border-gray-700 rounded-xl p-4 min-h-[60px]">
                    {currentQuestion.exerciseId.words.map((word, index) => (
                      <span key={index} className="px-3 py-2 bg-gray-700 text-white rounded-lg text-sm">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  value={currentAnswer?.answer || ''}
                  onChange={(e) => handleSelectAnswer(currentQuestion.exerciseId._id, e.target.value)}
                  placeholder="Nhập câu hoàn chỉnh (cách nhau bằng dấu cách)..."
                  className="w-full px-4 py-4 rounded-xl bg-gray-900/50 border-2 border-gray-600 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 transition-colors text-lg"
                />
              </div>
            )}

            {/* Match Pairs - Fill in style */}
            {currentQuestion.exerciseId.type === 'match' && currentQuestion.exerciseId.pairs && (
              <div>
                <div className="mb-4">
                  <label className="text-sm text-gray-400 mb-3 block">Điền nghĩa tiếng Việt tương ứng vào ô trống:</label>
                  <div className="space-y-3">
                    {currentQuestion.exerciseId.pairs.map((pair, index) => {
                      const currentAnswers = currentAnswer?.answer ? currentAnswer.answer.split('|') : [];
                      return (
                        <div key={index} className="flex items-center gap-3">
                          <span className="text-blue-400 font-bold text-lg w-6">{index + 1}.</span>
                          <div className="flex items-center gap-3 flex-1">
                            <div className="px-4 py-3 bg-blue-500/20 border border-blue-500/30 rounded-lg text-white min-w-[150px]">
                              {pair.left}
                            </div>
                            <span className="text-gray-400">→</span>
                            <input
                              type="text"
                              value={currentAnswers[index] || ''}
                              onChange={(e) => {
                                const newAnswers = [...currentAnswers];
                                const pairsLength = currentQuestion.exerciseId.pairs?.length || 0;
                                while (newAnswers.length < pairsLength) {
                                  newAnswers.push('');
                                }
                                newAnswers[index] = e.target.value;
                                handleSelectAnswer(currentQuestion.exerciseId._id, newAnswers.join('|'));
                              }}
                              placeholder="Nhập nghĩa tiếng Việt..."
                              className="flex-1 px-4 py-3 rounded-lg bg-gray-900/50 border-2 border-gray-600 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Translate */}
            {currentQuestion.exerciseId.type === 'translate' && (
              <div>
                <input
                  type="text"
                  value={currentAnswer?.answer || ''}
                  onChange={(e) => handleSelectAnswer(currentQuestion.exerciseId._id, e.target.value)}
                  placeholder="Nhập bản dịch của bạn..."
                  className="w-full px-4 py-4 rounded-xl bg-gray-900/50 border-2 border-gray-600 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 transition-colors text-lg"
                />
              </div>
            )}

            {/* Hint if available */}
            {currentQuestion.exerciseId.hint && (
              <div className="mt-4 flex items-start gap-2 text-sm text-gray-400 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Gợi ý: {currentQuestion.exerciseId.hint}</span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-3 border border-gray-600 text-white rounded-xl hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Câu trước
            </button>

            <div className="flex-1 text-center text-sm text-gray-400">
              {answeredCount}/{totalQuestions} câu đã trả lời
            </div>

            {currentQuestionIndex < totalQuestions - 1 ? (
              <button
                onClick={handleNextQuestion}
                className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
              >
                Câu tiếp
              </button>
            ) : (
              <button
                onClick={() => handleSubmitQuiz(false)}
                disabled={submitting}
                className="px-6 py-3 bg-linear-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg disabled:opacity-50 transition-all font-semibold flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang nộp bài...
                  </>
                ) : (
                  <>
                    <Award className="w-5 h-5" />
                    Nộp bài
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Question Grid Navigator */}
        <div className="mt-6 bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-4">Tổng quan câu hỏi</h3>
          <div className="grid grid-cols-8 gap-2">
            {quiz.questions.map((q, index) => {
              const isAnswered = userAnswers.some(a => a.exerciseId === q.exerciseId._id);
              const isCurrent = index === currentQuestionIndex;

              return (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`aspect-square rounded-lg flex items-center justify-center font-semibold text-sm transition-all ${
                    isCurrent
                      ? 'bg-purple-500 text-white border-2 border-purple-400'
                      : isAnswered
                        ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                        : 'bg-gray-700 border border-gray-600 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
