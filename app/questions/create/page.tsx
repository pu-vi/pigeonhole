'use client'

import { useActionState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createQuestion, FormState } from '../actions'

import { SUBJECTS, DIFFICULTIES, QUESTION_TYPES } from '@/lib/constants'


const INITIAL_STATE: FormState = {
  success: false,
  message: '',
}

export default function CreateQuestionPage() {
  const [state, formAction, isPending] = useActionState(createQuestion, INITIAL_STATE)
  const formRef = useRef<HTMLFormElement>(null)

  // Clear form inputs on successful save
  useEffect(() => {
    if (state.success) {
      formRef.current?.reset()
    }
  }, [state.success])

  const subjects = SUBJECTS
  const difficulties = DIFFICULTIES
  const questionTypes = QUESTION_TYPES


  // Helper to format enum values into display text
  const formatEnumText = (text: string) => {
    return text
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 font-sans pb-16">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/questions"
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-850 rounded-xl transition duration-200 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              aria-label="Back to Questions"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Create Question</h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Add to the Question Bank</p>
            </div>
          </div>
          <Link
            href="/questions"
            className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition duration-200"
          >
            Cancel
          </Link>
        </div>
      </header>

      {/* Main container */}
      <main className="max-w-3xl mx-auto px-6 mt-10">
        {/* Status Messages */}
        {state.message && (
          <div
            className={`mb-6 p-4 rounded-2xl border flex items-start gap-3 shadow-sm ${
              state.success
                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-450'
                : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/50 text-red-800 dark:text-red-450'
            }`}
          >
            {state.success ? (
              <svg
                className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
            )}
            <div className="flex-1">
              <p className="font-bold text-sm">{state.success ? 'Success' : 'Error'}</p>
              <p className="text-sm mt-0.5">{state.message}</p>
              {state.success && (
                <div className="mt-3 flex gap-3">
                  <Link
                    href="/questions"
                    className="text-xs bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-500 transition duration-200"
                  >
                    View Question Bank
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-md overflow-hidden">
          <form ref={formRef} action={formAction} className="p-8 space-y-8">
            
            {/* Subject and Difficulty Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="subject" className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  defaultValue="computer_science"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition"
                >
                  {subjects.map((sub) => (
                    <option key={sub} value={sub}>
                      {formatEnumText(sub)}
                    </option>
                  ))}
                </select>
                {state.errors?.subject && (
                  <p className="text-xs text-red-500 mt-1.5">{state.errors.subject}</p>
                )}
              </div>

              <div>
                <label htmlFor="difficulty" className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                  Difficulty *
                </label>
                <select
                  id="difficulty"
                  name="difficulty"
                  required
                  defaultValue="medium"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition"
                >
                  {difficulties.map((diff) => (
                    <option key={diff} value={diff}>
                      {formatEnumText(diff)}
                    </option>
                  ))}
                </select>
                {state.errors?.difficulty && (
                  <p className="text-xs text-red-500 mt-1.5">{state.errors.difficulty}</p>
                )}
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                  Question Type *
                </label>
                <select
                  id="type"
                  name="type"
                  required
                  defaultValue="text"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition"
                >
                  {questionTypes.map((t) => (
                    <option key={t} value={t}>
                      {formatEnumText(t)}
                    </option>
                  ))}
                </select>
                {state.errors?.type && (
                  <p className="text-xs text-red-500 mt-1.5">{state.errors.type}</p>
                )}
              </div>
            </div>

            {/* Question Text */}
            <div>
              <label htmlFor="questionText" className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                Question Text *
              </label>
              <textarea
                id="questionText"
                name="questionText"
                rows={4}
                required
                placeholder="Enter the question text here..."
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition resize-y"
              />
              {state.errors?.questionText && (
                <p className="text-xs text-red-500 mt-1.5">{state.errors.questionText}</p>
              )}
            </div>

            {/* Media Field */}
            <div>
              <label htmlFor="mediaUrl" className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                Media URL (Optional)
              </label>
              <textarea
                id="mediaUrl"
                name="mediaUrl"
                rows={2}
                placeholder="Enter media URL if type is Image or Audio..."
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition resize-y"
              />
              {state.errors?.mediaUrl && (
                <p className="text-xs text-red-500 mt-1.5">{state.errors.mediaUrl}</p>
              )}
            </div>

            {/* Options Selection */}
            <div>
              <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Options & Correct Answer *
              </label>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                Enter four options and select the radio button next to the correct one.
              </p>

              <div className="space-y-4">
                {[0, 1, 2, 3].map((idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <label className="relative flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="correctAnswer"
                        value={idx}
                        required
                        className="peer sr-only"
                        aria-label={`Mark Option ${String.fromCharCode(65 + idx)} as correct`}
                      />
                      <div className="w-6 h-6 rounded-full border border-zinc-300 dark:border-zinc-750 flex items-center justify-center text-xs font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950 peer-checked:bg-emerald-500 peer-checked:border-emerald-500 peer-checked:text-white transition duration-200">
                        {String.fromCharCode(65 + idx)}
                      </div>
                    </label>
                    <input
                      type="text"
                      name={`option${idx}`}
                      required
                      placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                      className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition"
                    />
                  </div>
                ))}
              </div>
              {state.errors?.options && (
                <p className="text-xs text-red-500 mt-2">{state.errors.options}</p>
              )}
              {state.errors?.correctAnswer && (
                <p className="text-xs text-red-500 mt-2">{state.errors.correctAnswer}</p>
              )}
            </div>

            {/* Tags (Comma separated) */}
            <div>
              <label htmlFor="tags" className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                Tags (Comma-separated)
              </label>
              <input
                id="tags"
                type="text"
                name="tags"
                placeholder="e.g., algebra, calculus, physics"
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition"
              />
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1.5">
                Separate multiple tags with commas. Casing will be normalized.
              </p>
            </div>

            {/* Explanation */}
            <div>
              <label htmlFor="explanation" className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                Explanation (Optional)
              </label>
              <textarea
                id="explanation"
                name="explanation"
                rows={3}
                placeholder="Provide a step-by-step explanation for the correct answer..."
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition resize-y"
              />
              {state.errors?.explanation && (
                <p className="text-xs text-red-500 mt-1.5">{state.errors.explanation}</p>
              )}
            </div>

            {/* Form Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 border-t border-zinc-100 dark:border-zinc-800 pt-6">
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:from-violet-650 disabled:to-indigo-650 text-white font-bold text-sm px-6 py-3.5 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 transition duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Question'
                )}
              </button>
              <button
                type="reset"
                disabled={isPending}
                className="flex-1 sm:flex-none px-6 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 font-bold text-sm text-zinc-700 dark:text-zinc-300 transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  )
}
