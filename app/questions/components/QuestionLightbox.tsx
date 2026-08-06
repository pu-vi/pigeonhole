'use client'

import { useEffect, useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import type { Question, QuestionTag } from '@prisma/client'

interface QuestionLightboxProps {
  question: Question & { tags?: QuestionTag[] }
  onClose: () => void
}

interface ThemeConfig {
  id: string
  name: string
  swatchBg: string
  outerBg: string
  shadowBg: string
  cardBg: string
  cardText: string
  cardBorder: string
  optionBg: string
  optionText: string
  optionLetter: string
  mediaBg: string
}

const THEMES: ThemeConfig[] = [
  {
    id: 'yellow',
    name: 'Yellow',
    swatchBg: 'bg-amber-400',
    outerBg: 'bg-gradient-to-br from-amber-400 via-amber-400 to-yellow-500',
    shadowBg: 'bg-black',
    cardBg: 'bg-white',
    cardText: 'text-zinc-900',
    cardBorder: 'border-black/10',
    optionBg: 'bg-[#FFC700]',
    optionText: 'text-zinc-950',
    optionLetter: 'text-zinc-950',
    mediaBg: 'bg-zinc-100',
  },
  {
    id: 'cyber',
    name: 'Cyber Violet',
    swatchBg: 'bg-violet-600',
    outerBg: 'bg-gradient-to-br from-purple-700 via-violet-600 to-indigo-700',
    shadowBg: 'bg-zinc-950 border border-violet-500/40',
    cardBg: 'bg-zinc-900',
    cardText: 'text-white',
    cardBorder: 'border-violet-500/30',
    optionBg: 'bg-gradient-to-r from-violet-600 to-indigo-600',
    optionText: 'text-white',
    optionLetter: 'text-amber-300',
    mediaBg: 'bg-zinc-800',
  },
  {
    id: 'mint',
    name: 'Mint Teal',
    swatchBg: 'bg-emerald-400',
    outerBg: 'bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500',
    shadowBg: 'bg-emerald-950',
    cardBg: 'bg-white',
    cardText: 'text-zinc-900',
    cardBorder: 'border-emerald-900/10',
    optionBg: 'bg-emerald-400',
    optionText: 'text-emerald-950',
    optionLetter: 'text-emerald-950',
    mediaBg: 'bg-zinc-100',
  },
  {
    id: 'coral',
    name: 'Coral Sunset',
    swatchBg: 'bg-rose-500',
    outerBg: 'bg-gradient-to-br from-rose-500 via-pink-500 to-orange-400',
    shadowBg: 'bg-rose-950',
    cardBg: 'bg-white',
    cardText: 'text-zinc-900',
    cardBorder: 'border-rose-900/10',
    optionBg: 'bg-gradient-to-r from-orange-400 to-rose-400',
    optionText: 'text-white',
    optionLetter: 'text-white',
    mediaBg: 'bg-zinc-100',
  },
  {
    id: 'dark',
    name: 'Midnight',
    swatchBg: 'bg-zinc-900',
    outerBg: 'bg-gradient-to-br from-zinc-900 via-zinc-950 to-black',
    shadowBg: 'bg-zinc-800 border border-zinc-700',
    cardBg: 'bg-zinc-950',
    cardText: 'text-zinc-50',
    cardBorder: 'border-zinc-800',
    optionBg: 'bg-zinc-850 bg-zinc-900 border border-zinc-800',
    optionText: 'text-zinc-100',
    optionLetter: 'text-amber-400',
    mediaBg: 'bg-zinc-900',
  },
]

export default function QuestionLightbox({ question, onClose }: QuestionLightboxProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [selectedThemeId, setSelectedThemeId] = useState<string>('yellow')
  const [isGenerating, setIsGenerating] = useState(false)

  const activeTheme = THEMES.find((t) => t.id === selectedThemeId) || THEMES[0]

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
      link.download = `flashcard-${selectedThemeId}-${sanitizedSubject}-${question.id.slice(0, 6)}.png`
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
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-4 sm:p-6 ${activeTheme.outerBg} backdrop-blur-md transition-colors duration-300 overflow-y-auto`}
      onClick={onClose}
    >
      {/* Fixed Close Button (Top Right Corner) */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-30 p-2.5 sm:p-3 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-md transition duration-150 active:scale-95 cursor-pointer border border-white/20 shadow-lg"
        aria-label="Close lightbox"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Top Controls Header (Theme Selector & Download Button) */}
      <div className="z-20 flex flex-wrap items-center justify-center gap-3 mb-4 sm:mb-6 max-w-full px-4 pr-16 sm:pr-0">
        {/* Theme Radio Selector Bar */}
        <div
          className="flex items-center gap-1.5 sm:gap-2 bg-black/40 backdrop-blur-md p-1.5 rounded-full border border-white/20 shadow-xl overflow-x-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {THEMES.map((theme) => {
            const isSelected = selectedThemeId === theme.id
            return (
              <button
                key={theme.id}
                onClick={() => setSelectedThemeId(theme.id)}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold transition duration-150 cursor-pointer ${isSelected
                  ? 'bg-white text-zinc-950 shadow-md scale-105'
                  : 'text-white/80 hover:text-white hover:bg-white/15'
                  }`}
              >
                <span className={`w-3 h-3 rounded-full ${theme.swatchBg} border border-white/40 shadow-sm`} />
                <span>{theme.name}</span>
              </button>
            )
          })}
        </div>

        {/* Download Flashcard Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleDownloadImage()
          }}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 px-4 py-2 sm:py-2.5 rounded-full bg-zinc-900 hover:bg-black text-white font-semibold text-xs sm:text-sm shadow-xl hover:shadow-2xl transition duration-150 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
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
      </div>

      {/* 4:5 Exportable Flashcard Container */}
      <div
        ref={cardRef}
        className={`relative w-full max-w-[380px] sm:max-w-[420px] aspect-[4/5] p-5 sm:p-6 ${activeTheme.outerBg} rounded-[38px] flex items-center justify-center transition-colors duration-300`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-full">
          {/* Solid Offset Shadow Layer */}
          <div className={`absolute inset-0 ${activeTheme.shadowBg} rounded-[34px] sm:rounded-[38px] translate-x-3.5 translate-y-3.5 sm:translate-x-4 sm:translate-y-4 transition-colors duration-300`} />

          {/* Main Flashcard Container */}
          <div className={`relative h-full w-full ${activeTheme.cardBg} rounded-[28px] sm:rounded-[32px] p-5 sm:p-3 flex flex-col justify-between items-center ${activeTheme.cardText} shadow-xl overflow-hidden border ${activeTheme.cardBorder} transition-colors duration-300`}>

            {/* Question Media (Optional) */}
            {question.mediaUrl && (
              <div className={`w-full max-h-24 sm:max-h-28 mb-2 rounded-2xl overflow-hidden ${activeTheme.mediaBg} flex items-center justify-center flex-shrink-0`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={question.mediaUrl}
                  alt="Question diagram or illustration"
                  className="max-h-24 sm:max-h-28 object-contain"
                />
              </div>
            )}

            {/* Question Text Centered */}
            <div className="flex-1 flex items-center justify-center w-full p-2">
              <h2 className="text-center font-bold text-lg sm:text-xl md:text-2xl leading-snug tracking-tight">
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
                    className={`w-full ${activeTheme.optionBg} rounded-xl sm:rounded-2xl px-4 sm:px-5 py-2.5 sm:py-2 flex items-center ${activeTheme.optionText} text-sm sm:text-base shadow-sm transition-colors duration-300`}
                  >
                    <span className={`font-bold text-base sm:text-lg mr-3 sm:mr-3.5 min-w-[24px] ${activeTheme.optionLetter}`}>
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
