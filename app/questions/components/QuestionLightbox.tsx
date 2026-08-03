'use client'

import { useEffect } from 'react'
import type { Question, QuestionTag } from '@prisma/client'

interface QuestionLightboxProps {
  question: Question & { tags?: QuestionTag[] }
  onClose: () => void
}

export default function QuestionLightbox({ question, onClose }: QuestionLightboxProps) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Parse options array safely
  const rawOptions = question.options
  const options: string[] = Array.isArray(rawOptions)
    ? (rawOptions as string[])
    : typeof rawOptions === 'string'
    ? (() => {
        try {
          return JSON.parse(rawOptions)
        } catch {
          return []
        }
      })()
    : []

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-amber-400 via-amber-400 to-yellow-500 backdrop-blur-md transition-opacity duration-200"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 sm:top-6 sm:right-6 z-10 p-3 rounded-full bg-black/10 hover:bg-black/20 text-zinc-900 transition duration-150 active:scale-95 cursor-pointer"
        aria-label="Close lightbox"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Lightbox Container with 4:5 Aspect Ratio */}
      <div
        className="relative w-full max-w-[380px] sm:max-w-[420px] aspect-[4/5] max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Solid Black Offset Shadow Layer */}
        <div className="absolute inset-0 bg-black rounded-[34px] sm:rounded-[38px] translate-x-3.5 translate-y-3.5 sm:translate-x-4 sm:translate-y-4" />

        {/* Main White Flashcard Container */}
        <div className="relative h-full w-full bg-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 flex flex-col justify-between items-center text-zinc-950 shadow-xl overflow-hidden border border-black/10">
          
          {/* Question Media (Optional) */}
          {question.mediaUrl && (
            <div className="w-full max-h-32 mb-2 rounded-2xl overflow-hidden bg-zinc-100 flex items-center justify-center flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={question.mediaUrl}
                alt="Question diagram or illustration"
                className="max-h-32 object-contain"
              />
            </div>
          )}

          {/* Question Text Centered */}
          <div className="flex-1 flex items-center justify-center w-full px-2 py-4">
            <h2 className="text-center font-bold text-xl sm:text-2xl text-zinc-900 leading-snug tracking-tight">
              {question.questionText}
            </h2>
          </div>

          {/* Options Grid (Vertical Pills) */}
          <div className="w-full space-y-3 sm:space-y-3.5 mt-auto">
            {options.map((option, idx) => {
              const letter = String.fromCharCode(65 + idx)
              return (
                <div
                  key={idx}
                  className="w-full bg-[#FFC700] hover:bg-[#F2BD00] transition duration-150 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 flex items-center text-zinc-950 text-base sm:text-lg shadow-sm"
                >
                  <span className="font-bold text-lg sm:text-xl mr-3 sm:mr-3.5 min-w-[24px]">
                    {letter}.
                  </span>
                  <span className="flex-1 text-left leading-tight font-medium">
                    {option}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
