'use client';

import React, { useState } from 'react';
import { Lesson } from '@/types';
import { Exercise } from './Exercise';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { X, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LessonPlayerProps {
  lesson: Lesson;
  onComplete: (score: number) => void;
}

export function LessonPlayer({ lesson, onComplete }: LessonPlayerProps) {
  const router = useRouter();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [hearts, setHearts] = useState(5);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  const currentExercise = lesson.content.exercises[currentExerciseIndex];
  const totalExercises = lesson.content.exercises.length;
  const progress = ((currentExerciseIndex + 1) / totalExercises) * 100;

  const handleAnswer = (answer: string | string[]) => {
    const correct = Array.isArray(currentExercise.correctAnswer)
      ? currentExercise.correctAnswer.includes(answer as string)
      : answer === currentExercise.correctAnswer;

    setIsCorrect(correct);

    if (correct) {
      setCorrectAnswers(prev => prev + 1);
    } else {
      setHearts(prev => Math.max(0, prev - 1));
    }
  };

  const handleNext = () => {
    if (currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setIsCorrect(null);
    } else {
      // Lesson completed
      const score = Math.round((correctAnswers / totalExercises) * 100);
      onComplete(score);
    }
  };

  const handleExit = () => {
    if (confirm('Bạn có chắc muốn thoát? Tiến trình sẽ không được lưu.')) {
      router.back();
    }
  };

  if (hearts === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-6 p-8 bg-white rounded-2xl shadow-lg max-w-md">
          <div className="text-6xl">💔</div>
          <h2 className="text-2xl font-bold">Hết tim rồi!</h2>
          <p className="text-gray-600">
            Bạn đã mất hết tim. Hãy nghỉ ngơi và thử lại sau nhé!
          </p>
          <Button onClick={() => router.back()} variant="default">
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={handleExit}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>

            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" fill="currentColor" />
              <span className="font-bold text-red-500">{hearts}</span>
            </div>
          </div>

          <Progress value={progress} max={100} color="green" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Exercise
          exercise={currentExercise}
          onSubmit={handleAnswer}
          isCorrect={isCorrect}
        />

        {/* Next Button */}
        {isCorrect !== null && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
            <div className="max-w-4xl mx-auto">
              <Button
                onClick={handleNext}
                variant={isCorrect ? 'success' : 'default'}
                size="lg"
                className="w-full"
              >
                {currentExerciseIndex < totalExercises - 1 ? 'Tiếp tục' : 'Hoàn thành'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
