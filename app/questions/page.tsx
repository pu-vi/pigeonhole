'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import type { Question, QuestionTag } from '@prisma/client'
import { SUBJECTS, DIFFICULTIES, QUESTION_TYPES } from '@/lib/constants'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectIndicator,
  SelectPopover,
  ListBox,
  ListBoxItem,
  Input,
  Button,
  Label,
} from '@heroui/react'

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<(Question & { tags: QuestionTag[] })[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Filters
  const [subject, setSubject] = useState<string>('all')
  const [difficulty, setDifficulty] = useState<string>('all')
  const [type, setType] = useState<string>('all')
  const [tag, setTag] = useState<string>('')
  const [localTag, setLocalTag] = useState<string>('') // controlled input for tag before clicking search

  const [deletingId, setDeletingId] = useState<string | null>(null)

  const subjects = SUBJECTS
  const difficulties = DIFFICULTIES
  const questionTypes = QUESTION_TYPES

  const fetchQuestions = useCallback(async () => {
    setIsLoading(true)
    try {
      const query = new URLSearchParams()
      query.set('page', page.toString())
      query.set('limit', '20')
      if (subject && subject !== 'all') query.set('subject', subject)
      if (difficulty && difficulty !== 'all') query.set('difficulty', difficulty)
      if (type && type !== 'all') query.set('type', type)
      if (tag && tag.trim().length > 0) query.set('tag', tag.trim())

      const res = await fetch(`/api/questions?${query.toString()}`)
      const result = await res.json()
      if (result.success && result.data) {
        setQuestions(result.data.questions)
        setTotal(result.data.total)
        setTotalPages(result.data.totalPages)
      }
    } catch (err) {
      console.error('Error fetching questions:', err)
    } finally {
      setIsLoading(false)
    }
  }, [page, subject, difficulty, type, tag])

  // Trigger search when page, subject, difficulty, type or tag changes
  useEffect(() => {
    let active = true
    const run = async () => {
      await Promise.resolve()
      if (active) {
        fetchQuestions()
      }
    }
    run()
    return () => {
      active = false
    }
  }, [fetchQuestions])

  // Reset page when filters change
  const handleFilterChange = (filterType: string, value: string) => {
    setPage(1)
    if (filterType === 'subject') setSubject(value)
    if (filterType === 'difficulty') setDifficulty(value)
    if (filterType === 'type') setType(value)
  }

  const handleTagSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    setPage(1)
    setTag(localTag)
  }

  const handleClearFilters = () => {
    setPage(1)
    setSubject('all')
    setDifficulty('all')
    setType('all')
    setTag('')
    setLocalTag('')
  }

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return
    }
    setDeletingId(id)
    try {
      const res = await fetch(`/api/question?id=${id}`, {
        method: 'DELETE',
      })
      const result = await res.json()
      if (result.success) {
        fetchQuestions()
      } else {
        alert(result.message || 'Failed to delete question.')
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred while deleting.')
    } finally {
      setDeletingId(null)
    }
  }

  // Helper to format enum values into display text
  const formatEnumText = (text: string) => {
    return text
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

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
            Total Questions: <span className="text-violet-600 dark:text-violet-400 font-bold">{total}</span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 mb-8 shadow-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-end">
            {/* Subject Select */}
            <Select
              name="subject"
              selectedKey={subject}
              onSelectionChange={(key) => handleFilterChange('subject', key as string)}
              className="w-full flex flex-col gap-1.5"
            >
              <Label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Subject</Label>
              <SelectTrigger className="w-full flex items-center justify-between bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition shadow-sm">
                <SelectValue />
                <SelectIndicator className="w-4 h-4 ml-2" />
              </SelectTrigger>
              <SelectPopover className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg mt-1 p-1 z-50">
                <ListBox selectionMode="single" aria-label="Subject options">
                  <ListBoxItem id="all" textValue="All Subjects" className="px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white cursor-pointer transition-colors duration-100">
                    All Subjects
                  </ListBoxItem>
                  {subjects.map((sub) => (
                    <ListBoxItem id={sub} key={sub} textValue={formatEnumText(sub)} className="px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white cursor-pointer transition-colors duration-100">
                      {formatEnumText(sub)}
                    </ListBoxItem>
                  ))}
                </ListBox>
              </SelectPopover>
            </Select>

            {/* Difficulty Select */}
            <Select
              name="difficulty"
              selectedKey={difficulty}
              onSelectionChange={(key) => handleFilterChange('difficulty', key as string)}
              className="w-full flex flex-col gap-1.5"
            >
              <Label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Difficulty</Label>
              <SelectTrigger className="w-full flex items-center justify-between bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition shadow-sm">
                <SelectValue />
                <SelectIndicator className="w-4 h-4 ml-2" />
              </SelectTrigger>
              <SelectPopover className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg mt-1 p-1 z-50">
                <ListBox selectionMode="single" aria-label="Difficulty options">
                  <ListBoxItem id="all" textValue="All Difficulties" className="px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white cursor-pointer transition-colors duration-100">
                    All Difficulties
                  </ListBoxItem>
                  {difficulties.map((diff) => (
                    <ListBoxItem id={diff} key={diff} textValue={formatEnumText(diff)} className="px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white cursor-pointer transition-colors duration-100">
                      {formatEnumText(diff)}
                    </ListBoxItem>
                  ))}
                </ListBox>
              </SelectPopover>
            </Select>

            {/* Question Type Select */}
            <Select
              name="type"
              selectedKey={type}
              onSelectionChange={(key) => handleFilterChange('type', key as string)}
              className="w-full flex flex-col gap-1.5"
            >
              <Label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Question Type</Label>
              <SelectTrigger className="w-full flex items-center justify-between bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition shadow-sm">
                <SelectValue />
                <SelectIndicator className="w-4 h-4 ml-2" />
              </SelectTrigger>
              <SelectPopover className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg mt-1 p-1 z-50">
                <ListBox selectionMode="single" aria-label="Question type options">
                  <ListBoxItem id="all" textValue="All Types" className="px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white cursor-pointer transition-colors duration-100">
                    All Types
                  </ListBoxItem>
                  {questionTypes.map((t) => (
                    <ListBoxItem id={t} key={t} textValue={formatEnumText(t)} className="px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white cursor-pointer transition-colors duration-100">
                      {formatEnumText(t)}
                    </ListBoxItem>
                  ))}
                </ListBox>
              </SelectPopover>
            </Select>

            {/* Tag Search Input */}
            <div className="flex flex-col gap-1.5 w-full">
              <Label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Tag</Label>
              <form onSubmit={handleTagSearch} className="relative w-full">
                <Input
                  type="text"
                  aria-label="Filter by tag"
                  placeholder="e.g. algebra"
                  value={localTag}
                  onChange={(e) => setLocalTag(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition shadow-sm"
                />
                <button
                  type="submit"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition duration-150"
                  aria-label="Search by tag"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>
            </div>
          </div>

          {/* Active Filters Summary */}
          {(subject !== 'all' || difficulty !== 'all' || type !== 'all' || tag !== '') && (
            <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-zinc-400 dark:text-zinc-550">Active Filters:</span>
                {subject !== 'all' && (
                  <span className="text-xs bg-violet-50 dark:bg-violet-950/20 text-violet-700 dark:text-violet-400 border border-violet-100 dark:border-violet-955 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    Subject: {formatEnumText(subject)}
                    <button onClick={() => setSubject('all')} className="hover:text-red-500 font-bold ml-1">×</button>
                  </span>
                )}
                {difficulty !== 'all' && (
                  <span className="text-xs bg-violet-50 dark:bg-violet-950/20 text-violet-700 dark:text-violet-400 border border-violet-100 dark:border-violet-955 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    Difficulty: {formatEnumText(difficulty)}
                    <button onClick={() => setDifficulty('all')} className="hover:text-red-500 font-bold ml-1">×</button>
                  </span>
                )}
                {type !== 'all' && (
                  <span className="text-xs bg-violet-50 dark:bg-violet-950/20 text-violet-700 dark:text-violet-400 border border-violet-100 dark:border-violet-955 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    Type: {formatEnumText(type)}
                    <button onClick={() => setType('all')} className="hover:text-red-500 font-bold ml-1">×</button>
                  </span>
                )}
                {tag !== '' && (
                  <span className="text-xs bg-violet-50 dark:bg-violet-950/20 text-violet-700 dark:text-violet-400 border border-violet-100 dark:border-violet-955 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    Tag: #{tag}
                    <button onClick={() => { setTag(''); setLocalTag(''); }} className="hover:text-red-500 font-bold ml-1">×</button>
                  </span>
                )}
              </div>
              <button
                onClick={handleClearFilters}
                className="text-xs font-bold text-zinc-500 hover:text-red-500 transition duration-150"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Questions Display */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20">
            <svg className="animate-spin h-8 w-8 text-violet-600 mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading questions...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center border border-dashed border-zinc-300 dark:border-zinc-800 rounded-3xl bg-white dark:bg-zinc-900 p-16 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500 mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold tracking-tight">No questions found</h3>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mt-2 mb-6">
              There are no questions matching your active filters. Try resetting the filters or add a new question.
            </p>
            <Link
              href="/questions/create"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm px-5 py-3 shadow-md shadow-violet-500/10 transition duration-200 active:scale-95"
            >
              Add a Question
            </Link>
          </div>
        ) : (
          /* Three Column Table Listing */
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Question Details
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 text-center w-24">
                      Edit
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 text-center w-24">
                      Delete
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-850">
                  {questions.map((question) => (
                    <tr key={question.id} className="hover:bg-zinc-50/30 dark:hover:bg-zinc-800/10 transition duration-150">
                      <td className="px-6 py-5">
                        <div className="text-zinc-900 dark:text-zinc-100 font-semibold text-base mb-2.5 leading-relaxed">
                          {question.questionText}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-zinc-500 dark:text-zinc-450">
                          <span className="font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-350 uppercase tracking-wide">
                            {question.subject.replace(/_/g, ' ')}
                          </span>
                          <span className="text-zinc-300 dark:text-zinc-700">|</span>
                          <span className={`font-bold capitalize ${
                            question.difficulty === 'easy' ? 'text-emerald-600 dark:text-emerald-400' :
                            question.difficulty === 'medium' ? 'text-amber-600 dark:text-amber-400' :
                            'text-rose-600 dark:text-rose-400'
                          }`}>
                            {question.difficulty}
                          </span>
                          {question.tags.length > 0 && (
                            <>
                              <span className="text-zinc-300 dark:text-zinc-700">|</span>
                              <div className="flex flex-wrap gap-1.5">
                                {question.tags.map((t) => (
                                  <span key={t.tag} className="text-violet-600 dark:text-violet-400 font-bold">
                                    #{t.tag}
                                  </span>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center align-middle">
                        <Link
                          href={`/questions/${question.id}`}
                          className="inline-flex items-center justify-center p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-650 dark:text-zinc-350 hover:text-zinc-950 dark:hover:text-white transition duration-150 shadow-sm"
                          title="Edit Question"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                          </svg>
                        </Link>
                      </td>
                      <td className="px-6 py-5 text-center align-middle">
                        <Button
                          isDisabled={deletingId === question.id}
                          onPress={() => handleDeleteQuestion(question.id)}
                          className="inline-flex items-center justify-center p-2.5 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-950/40 transition duration-150 cursor-pointer shadow-sm"
                          aria-label="Delete Question"
                        >
                          {deletingId === question.id ? (
                            <span className="w-4 h-4 border-2 border-red-650 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <Button
              isDisabled={page === 1}
              onPress={() => setPage((p) => Math.max(p - 1, 1))}
              className="px-4 py-2.5 text-xs font-bold border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNumber = idx + 1
              return (
                <Button
                  key={pageNumber}
                  onPress={() => setPage(pageNumber)}
                  className={`w-10 h-10 flex items-center justify-center text-xs font-bold rounded-xl transition cursor-pointer shadow-sm ${
                    page === pageNumber
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20'
                      : 'border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-350'
                  }`}
                >
                  {pageNumber}
                </Button>
              )
            })}
            <Button
              isDisabled={page === totalPages}
              onPress={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="px-4 py-2.5 text-xs font-bold border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
            >
              Next
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
