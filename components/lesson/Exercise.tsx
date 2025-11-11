'use client';

import React from 'react';
import { Exercise as ExerciseType } from '@/types';
import { Button } from '@/components/ui/Button';
import { Volume2 } from 'lucide-react';

interface ExerciseProps {
  exercise: ExerciseType;
  onSubmit: (answer: string | string[]) => void;
  isCorrect?: boolean | null;
}

export function Exercise({ exercise, onSubmit, isCorrect }: ExerciseProps) {
  const [selectedAnswer, setSelectedAnswer] = React.useState<string>('');

  const handleSubmit = () => {
    if (selectedAnswer) {
      onSubmit(selectedAnswer);
    }
  };

  const playAudio = (url: string) => {
    const audio = new Audio(url);
    audio.play();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Question */}
      <div className="text-center space-y-4">
        {exercise.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={exercise.imageUrl}
            alt="Exercise"
            className="w-64 h-64 mx-auto object-cover rounded-2xl"
          />
        )}
        
        <div className="flex items-center justify-center gap-3">
          <h2 className="text-2xl font-bold">{exercise.question}</h2>
          {exercise.questionAudio && (
            <button
              onClick={() => playAudio(exercise.questionAudio!)}
              className="p-2 bg-green-100 rounded-full hover:bg-green-200 transition"
            >
              <Volume2 className="w-5 h-5 text-green-600" />
            </button>
          )}
        </div>
      </div>

      {/* Options */}
      {exercise.type === 'multiple-choice' && exercise.options && (
        <div className="grid grid-cols-1 gap-3">
          {exercise.options.map((option, index) => (
            <button
              key={index}
              onClick={() => setSelectedAnswer(option)}
              disabled={isCorrect !== null}
              className={`p-4 text-left rounded-xl border-2 transition-all ${
                selectedAnswer === option
                  ? isCorrect === null
                    ? 'border-green-500 bg-green-50'
                    : isCorrect
                    ? 'border-green-500 bg-green-100'
                    : 'border-red-500 bg-red-100'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <span className="font-semibold">{option}</span>
            </button>
          ))}
        </div>
      )}

      {exercise.type === 'fill-blank' && (
        <div className="space-y-4">
          <input
            type="text"
            value={selectedAnswer}
            onChange={(e) => setSelectedAnswer(e.target.value)}
            disabled={isCorrect !== null}
            className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
            placeholder="Nhập câu trả lời..."
          />
        </div>
      )}

      {/* Explanation */}
      {isCorrect !== null && exercise.explanation && (
        <div
          className={`p-4 rounded-xl ${
            isCorrect ? 'bg-green-100 border-2 border-green-500' : 'bg-red-100 border-2 border-red-500'
          }`}
        >
          <p className="font-semibold mb-2">
            {isCorrect ? '🎉 Chính xác!' : '❌ Chưa đúng'}
          </p>
          <p className="text-gray-700">{exercise.explanation}</p>
        </div>
      )}

      {/* Submit Button */}
      {isCorrect === null && (
        <div className="flex justify-center">
          <Button
            onClick={handleSubmit}
            disabled={!selectedAnswer}
            size="lg"
            className="w-full max-w-xs"
          >
            Kiểm tra
          </Button>
        </div>
      )}
    </div>
  );
}
