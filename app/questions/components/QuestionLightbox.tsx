'use client'

import { useEffect, useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import type { Question, QuestionTag } from '@prisma/client'

interface QuestionLightboxProps {
  question: Question & { tags?: QuestionTag[] }
  onClose: () => void
}

export default function QuestionLightbox({ question, onClose }: QuestionLightboxProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)

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

  const handleDownloadImage = async () => {
    if (!cardRef.current) return
    setIsGenerating(true)
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 0.95,
        pixelRatio: 2,
      })
      const link = document.createElement('a')
      const sanitizedSubject = question.subject.replace(/[^a-zA-Z0-9]/g, '_')
      link.download = `flashcard-${sanitizedSubject}-${question.id.slice(0, 6)}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Error generating flashcard image:', err)
    } finally {
      setIsGenerating(false)
    }
  }

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-amber-400 via-amber-400 to-yellow-500 backdrop-blur-md transition-opacity duration-200 overflow-y-auto"
      onClick={onClose}
    >
      {/* Top Action Bar (Floating Header) */}
      <div className="absolute top-5 right-5 sm:top-6 sm:right-6 z-20 flex items-center gap-3">
        {/* Download Flashcard Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleDownloadImage()
          }}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-zinc-900 hover:bg-black text-white font-semibold text-xs sm:text-sm shadow-xl hover:shadow-2xl transition duration-150 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Download flashcard image"
        >
          {isGenerating ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              <span>Download Image</span>
            </>
          )}
        </button>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-2.5 sm:p-3 rounded-full bg-black/10 hover:bg-black/20 text-zinc-900 transition duration-150 active:scale-95 cursor-pointer"
          aria-label="Close lightbox"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 4:5 Exportable Flashcard Container */}
      <div
        ref={cardRef}
        className="relative w-full max-w-[380px] sm:max-w-[420px] aspect-[4/5] p-5 sm:p-6 bg-gradient-to-br from-amber-400 via-amber-400 to-yellow-500 rounded-[38px] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-full">
          {/* Solid Black Offset Shadow Layer */}
          <div className="absolute inset-0 bg-black rounded-[34px] sm:rounded-[38px] translate-x-3.5 translate-y-3.5 sm:translate-x-4 sm:translate-y-4" />

          {/* Main White Flashcard Container */}
          <div className="relative h-full w-full bg-white rounded-[28px] sm:rounded-[32px] p-5 sm:p-7 flex flex-col justify-between items-center text-zinc-950 shadow-xl overflow-hidden border border-black/10">
            
            {/* Question Media (Optional) */}
            {question.mediaUrl && (
              <div className="w-full max-h-24 sm:max-h-28 mb-2 rounded-2xl overflow-hidden bg-zinc-100 flex items-center justify-center flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={question.mediaUrl}
                  alt="Question diagram or illustration"
                  className="max-h-24 sm:max-h-28 object-contain"
                />
              </div>
            )}

            {/* Question Text Centered */}
            <div className="flex-1 flex items-center justify-center w-full px-2 py-3">
              <h2 className="text-center font-bold text-lg sm:text-xl md:text-2xl text-zinc-900 leading-snug tracking-tight">
                {question.questionText}
              </h2>
            </div>

            {/* Options Grid (Vertical Pills) */}
            <div className="w-full space-y-2.5 sm:space-y-3 mt-auto">
              {options.map((option, idx) => {
                const letter = String.fromCharCode(65 + idx)
                return (
                  <div
                    key={idx}
                    className="w-full bg-[#FFC700] rounded-xl sm:rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3 flex items-center text-zinc-950 text-sm sm:text-base shadow-sm"
                  >
                    <span className="font-bold text-base sm:text-lg mr-3 sm:mr-3.5 min-w-[24px]">
                      {letter}.
                    </span>
                    <span className="flex-1 text-left leading-tight font-medium">
                      {option}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Neon Logo Watermark after last option */}
            <div className="w-full flex justify-center items-center pt-1 mt-1.5 pb-0 flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/neon-logo.png"
                alt="Neon Logo"
                className="h-4 sm:h-5 object-contain opacity-90"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
