import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import type { Question, QuestionTag } from '@prisma/client'


export const dynamic = 'force-dynamic'

export default async function QuestionsPage() {
  const questions = await prisma.question.findMany({
    include: {
      tags: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 font-sans">
      {/* Navbar / Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
              P
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-zinc-950 to-zinc-700 dark:from-zinc-50 dark:to-zinc-300 bg-clip-text text-transparent">
                Pigeonhole
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Quiz & Question Bank</p>
            </div>
          </div>
          <Link
            href="/questions/create"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium text-sm px-4 py-2.5 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition duration-200 active:scale-95"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Question
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Question Bank</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              Manage and organize quiz questions across multiple subjects and difficulties.
            </p>
          </div>
          <div className="text-sm font-medium px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
            Total Questions: <span className="text-violet-600 dark:text-violet-400 font-bold">{questions.length}</span>
          </div>
        </div>

        {questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center border border-dashed border-zinc-300 dark:border-zinc-800 rounded-3xl bg-white dark:bg-zinc-900 p-16 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500 mb-6">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold tracking-tight">No questions yet</h3>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mt-2 mb-6">
              Your question bank is empty. Get started by creating your first quiz question.
            </p>
            <Link
              href="/questions/create"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm px-5 py-3 shadow-md shadow-violet-500/10 transition duration-200 active:scale-95"
            >
              Add Your First Question
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {questions.map((question: Question & { tags: QuestionTag[] }) => (
              <div
                key={question.id}
                className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition duration-200"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 uppercase tracking-wider">
                      {question.subject.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 uppercase tracking-wider">
                      {question.type}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                        question.difficulty === 'easy'
                          ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400'
                          : question.difficulty === 'medium'
                          ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400'
                          : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400'
                      }`}
                    >
                      {question.difficulty}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    {new Date(question.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-150 leading-relaxed mb-4">
                  {question.questionText}
                </p>

                {question.mediaUrl && (
                  <div className="mb-4 text-xs font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                    <span className="font-bold text-zinc-600 dark:text-zinc-350">Media URL: </span>
                    {question.mediaUrl}
                  </div>
                )}

                {/* Options Grid */}
                <div className="grid sm:grid-cols-2 gap-3 mb-6">
                  {Array.isArray(question.options) &&
                    (question.options as string[]).map((option, idx) => {
                      const isCorrect = option === question.correctAnswer
                      return (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-xl border flex items-center gap-3 transition-colors ${
                            isCorrect
                              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500 text-emerald-900 dark:text-emerald-350 font-medium'
                              : 'bg-zinc-50/50 dark:bg-zinc-800/10 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400'
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              isCorrect
                                ? 'bg-emerald-500 text-white'
                                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                            }`}
                          >
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{option}</span>
                          {isCorrect && (
                            <span className="ml-auto text-xs bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                              Correct
                            </span>
                          )}
                        </div>
                      )
                    })}
                </div>

                {/* Tags and Explanation */}
                <div className="flex flex-col gap-4 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                  {question.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 mr-1.5">Tags:</span>
                      {question.tags.map((t) => (
                        <span
                          key={t.tag}
                          className="text-xs bg-violet-50 dark:bg-violet-950/20 text-violet-700 dark:text-violet-400 px-2.5 py-0.5 rounded-full border border-violet-100 dark:border-violet-950/50"
                        >
                          #{t.tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {question.explanation && (
                    <div className="bg-zinc-50 dark:bg-zinc-800/30 p-4 rounded-xl border border-zinc-150 dark:border-zinc-800">
                      <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                        Explanation
                      </p>
                      <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-350">
                        {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
