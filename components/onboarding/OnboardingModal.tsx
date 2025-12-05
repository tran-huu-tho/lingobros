'use client';

import { useState } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: OnboardingData) => void;
}

export interface OnboardingData {
  learningPurpose: 'communication' | 'study-abroad' | 'exam' | 'improvement' | 'other';
  dailyGoalMinutes: number;
  learningGoal: 'casual' | 'regular' | 'serious' | 'intense';
}

const LEARNING_PURPOSES = [
  { 
    id: 'communication', 
    label: 'Giao tiếp', 
    description: 'Nói chuyện hàng ngày, giao tiếp công việc',
    icon: '💬'
  },
  { 
    id: 'study-abroad', 
    label: 'Du học', 
    description: 'Chuẩn bị đi du học, sinh hoạt nước ngoài',
    icon: '✈️'
  },
  { 
    id: 'exam', 
    label: 'Thi cử', 
    description: 'IELTS, TOEIC, TOEFL, SAT...',
    icon: '📝'
  },
  { 
    id: 'improvement', 
    label: 'Cải thiện tiếng Anh', 
    description: 'Nâng cao trình độ tổng quát',
    icon: '📈'
  },
  { 
    id: 'other', 
    label: 'Khác', 
    description: 'Mục đích khác',
    icon: '🎯'
  },
];

const TIME_GOALS = [
  { minutes: 5, label: '5 phút', goal: 'casual', description: 'Nhẹ nhàng', emoji: '🌱' },
  { minutes: 10, label: '10 phút', goal: 'regular', description: 'Thường xuyên', emoji: '⚡' },
  { minutes: 15, label: '15 phút', goal: 'regular', description: 'Thường xuyên', emoji: '⚡' },
  { minutes: 30, label: '30 phút', goal: 'serious', description: 'Nghiêm túc', emoji: '🔥' },
  { minutes: 60, label: '60 phút', goal: 'intense', description: 'Cường độ cao', emoji: '💪' },
];

export default function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [selectedPurpose, setSelectedPurpose] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<number>(15);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 1 && selectedPurpose) {
      setStep(2);
    } else if (step === 2) {
      const selectedGoal = TIME_GOALS.find(g => g.minutes === selectedTime);
      onComplete({
        learningPurpose: selectedPurpose as OnboardingData['learningPurpose'],
        dailyGoalMinutes: selectedTime,
        learningGoal: selectedGoal?.goal as OnboardingData['learningGoal'] || 'regular',
      });
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-linear-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl border border-gray-700 overflow-hidden flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2 rounded-full bg-gray-800/50 hover:bg-gray-700 text-gray-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800">
          <div 
            className="h-full bg-linear-to-r from-blue-500 to-blue-600 transition-all duration-300"
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {/* Step 1: Learning Purpose */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="inline-block mb-4">
                  <div className="px-4 py-2 rounded-full bg-blue-900/30 border border-blue-800">
                    <span className="text-sm font-semibold text-blue-400">Bước 1/2</span>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white mb-1">
                  Bạn học tiếng Anh để làm gì?
                </h2>
                <p className="text-gray-400 text-sm">
                  Chúng tôi sẽ tùy chỉnh lộ trình phù hợp với mục tiêu của bạn
                </p>
              </div>

              <div className="grid gap-3">
                {LEARNING_PURPOSES.map((purpose) => (
                  <button
                    key={purpose.id}
                    onClick={() => setSelectedPurpose(purpose.id)}
                    className={`group p-3 rounded-xl border-2 transition-all text-left ${
                      selectedPurpose === purpose.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`text-2xl shrink-0 transition-transform ${
                        selectedPurpose === purpose.id ? 'scale-110' : ''
                      }`}>
                        {purpose.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-base font-bold mb-0.5 ${
                          selectedPurpose === purpose.id ? 'text-blue-400' : 'text-white'
                        }`}>
                          {purpose.label}
                        </h3>
                        <p className="text-gray-400 text-xs">{purpose.description}</p>
                      </div>
                      {selectedPurpose === purpose.id && (
                        <div className="shrink-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Daily Time Goal */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="inline-block mb-4">
                  <div className="px-4 py-2 rounded-full bg-blue-900/30 border border-blue-800">
                    <span className="text-sm font-semibold text-blue-400">Bước 2/2</span>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white mb-1">
                  Bạn có thể học bao nhiêu phút mỗi ngày?
                </h2>
                <p className="text-gray-400 text-sm">
                  Đừng lo, bạn có thể thay đổi sau
                </p>
              </div>

              <div className="grid gap-3">
                {TIME_GOALS.map((timeGoal) => (
                  <button
                    key={timeGoal.minutes}
                    onClick={() => setSelectedTime(timeGoal.minutes)}
                    className={`group p-3 rounded-xl border-2 transition-all text-left ${
                      selectedTime === timeGoal.minutes
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`text-2xl shrink-0 transition-transform ${
                        selectedTime === timeGoal.minutes ? 'scale-110' : ''
                      }`}>
                        {timeGoal.emoji}
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-base font-bold mb-0.5 ${
                          selectedTime === timeGoal.minutes ? 'text-blue-400' : 'text-white'
                        }`}>
                          {timeGoal.label} mỗi ngày
                        </h3>
                        <p className="text-gray-400 text-xs">{timeGoal.description}</p>
                      </div>
                      {selectedTime === timeGoal.minutes && (
                        <div className="shrink-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
            {step > 1 ? (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-semibold transition text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Quay lại
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-gray-400 hover:text-white font-semibold transition text-sm"
              >
                Bỏ qua
              </button>
            )}

            <button
              onClick={handleNext}
              disabled={step === 1 && !selectedPurpose}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition text-sm ${
                (step === 1 && !selectedPurpose)
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/30'
              }`}
            >
              {step === 2 ? 'Hoàn tất' : 'Tiếp tục'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
