'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import toast from 'react-hot-toast';

const PLACEMENT_TEST_QUESTIONS = [
  {
    id: 1,
    question: "What ___ your name?",
    options: ["is", "are", "am", "be"],
    correctAnswer: "is",
    level: "beginner"
  },
  {
    id: 2,
    question: "I ___ from Vietnam.",
    options: ["am", "is", "are", "be"],
    correctAnswer: "am",
    level: "beginner"
  },
  {
    id: 3,
    question: "She ___ to school every day.",
    options: ["go", "goes", "going", "gone"],
    correctAnswer: "goes",
    level: "elementary"
  },
  {
    id: 4,
    question: "I have ___ studying English for 3 years.",
    options: ["been", "be", "being", "was"],
    correctAnswer: "been",
    level: "intermediate"
  },
  {
    id: 5,
    question: "If I ___ rich, I would travel the world.",
    options: ["am", "was", "were", "be"],
    correctAnswer: "were",
    level: "upper-intermediate"
  },
  {
    id: 6,
    question: "The report ___ by tomorrow morning.",
    options: ["must finish", "must be finished", "must finished", "must finishing"],
    correctAnswer: "must be finished",
    level: "advanced"
  },
];

const LEARNING_GOALS = [
  { id: 'casual', label: '🌱 Nhẹ nhàng', description: '5 phút/ngày', minutes: 5 },
  { id: 'regular', label: '⚡ Thường xuyên', description: '15 phút/ngày', minutes: 15 },
  { id: 'serious', label: '🔥 Nghiêm túc', description: '30 phút/ngày', minutes: 30 },
  { id: 'intense', label: '💪 Cường độ cao', description: '60 phút/ngày', minutes: 60 },
];

const INTERESTS = [
  '🎬 Phim ảnh', '🎵 Âm nhạc', '📚 Sách', '✈️ Du lịch',
  '💼 Công việc', '🎮 Game', '🏃 Thể thao', '🍳 Nấu ăn',
];

export default function PlacementTest() {
  const { userData } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedGoal, setSelectedGoal] = useState('regular');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAnswerSelect = (answer: string) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < PLACEMENT_TEST_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setStep(2);
    }
  };

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const calculateLevel = () => {
    let correctCount = 0;
    answers.forEach((answer, index) => {
      if (answer === PLACEMENT_TEST_QUESTIONS[index].correctAnswer) {
        correctCount++;
      }
    });

    const percentage = (correctCount / PLACEMENT_TEST_QUESTIONS.length) * 100;

    if (percentage < 33) return 'beginner';
    if (percentage < 50) return 'elementary';
    if (percentage < 66) return 'intermediate';
    if (percentage < 83) return 'upper-intermediate';
    return 'advanced';
  };

  const handleComplete = async () => {
    setLoading(true);

    try {
      const level = calculateLevel();
      const goalData = LEARNING_GOALS.find(g => g.id === selectedGoal);

      // Update user preferences
      const token = await (userData as any)?.getIdToken?.();
      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          level,
          preferences: {
            learningGoal: selectedGoal,
            dailyGoalMinutes: goalData?.minutes || 15,
            interests: selectedInterests
          }
        })
      });

      if (response.ok) {
        toast.success('Hoàn thành! Đang tạo lộ trình học cho bạn...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const progress = step === 1
    ? ((currentQuestion + 1) / PLACEMENT_TEST_QUESTIONS.length) * 100
    : 100;

  return (
    <div className="min-h-screen bg-linear-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-green-600 mb-2">
              🦉 LingoBros
            </h1>
            <p className="text-gray-600">
              {step === 1 ? 'Kiểm tra trình độ' : 'Thiết lập mục tiêu học tập'}
            </p>
          </div>

          {/* Progress */}
          <Progress value={progress} max={100} color="green" className="mb-8" />

          {/* Step 1: Placement Test */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Câu {currentQuestion + 1} / {PLACEMENT_TEST_QUESTIONS.length}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <h2 className="text-2xl font-bold mb-6">
                  {PLACEMENT_TEST_QUESTIONS[currentQuestion].question}
                </h2>
                <div className="space-y-3">
                  {PLACEMENT_TEST_QUESTIONS[currentQuestion].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(option)}
                      className="w-full p-4 text-left rounded-xl border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition"
                    >
                      <span className="font-semibold">{option}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Goal Setting */}
          {step === 2 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Mục tiêu học tập của bạn là gì?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {LEARNING_GOALS.map((goal) => (
                      <button
                        key={goal.id}
                        onClick={() => setSelectedGoal(goal.id)}
                        className={`p-6 rounded-xl border-2 transition text-center ${
                          selectedGoal === goal.id
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-3xl mb-2">{goal.label.split(' ')[0]}</div>
                        <div className="font-bold mb-1">{goal.label.split(' ').slice(1).join(' ')}</div>
                        <div className="text-sm text-gray-600">{goal.description}</div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Bạn quan tâm đến chủ đề nào?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {INTERESTS.map((interest) => (
                      <button
                        key={interest}
                        onClick={() => handleInterestToggle(interest)}
                        className={`p-4 rounded-xl border-2 transition text-center ${
                          selectedInterests.includes(interest)
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={handleComplete}
                disabled={loading || selectedInterests.length === 0}
                size="lg"
                className="w-full"
              >
                {loading ? 'Đang xử lý...' : 'Hoàn thành'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
