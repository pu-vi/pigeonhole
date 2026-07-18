'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Question, QuestionTag } from '@prisma/client'
import { FormState, generateQuestionWithAI } from '../actions'
import { SUBJECTS, DIFFICULTIES, QUESTION_TYPES } from '@/lib/constants'
import {
  Form,
  TextField,
  Label,
  Input,
  TextArea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectIndicator,
  SelectPopover,
  ListBox,
  ListBoxItem,
  Button,
  RadioGroup,
  Radio,
  RadioContent,
  RadioControl,
  RadioIndicator,
  FieldError,
} from '@heroui/react'

const INITIAL_STATE: FormState = {
  success: false,
  message: '',
}

interface QuestionFormProps {
  mode: 'create' | 'edit'
  initialQuestion?: Question & {
    tags: QuestionTag[]
  }
}

export default function QuestionForm({ mode, initialQuestion }: QuestionFormProps) {
  const [state, setState] = useState<FormState>(INITIAL_STATE)
  const [isSaving, setIsSaving] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  // Initialize form fields based on mode
  const [questionText, setQuestionText] = useState(initialQuestion?.questionText || '')
  const [option0, setOption0] = useState(
    initialQuestion?.options ? (initialQuestion.options as string[])[0] || '' : ''
  )
  const [option1, setOption1] = useState(
    initialQuestion?.options ? (initialQuestion.options as string[])[1] || '' : ''
  )
  const [option2, setOption2] = useState(
    initialQuestion?.options ? (initialQuestion.options as string[])[2] || '' : ''
  )
  const [option3, setOption3] = useState(
    initialQuestion?.options ? (initialQuestion.options as string[])[3] || '' : ''
  )

  const initialCorrectIndex = (() => {
    if (initialQuestion?.options && initialQuestion?.correctAnswer) {
      const idx = (initialQuestion.options as string[]).indexOf(initialQuestion.correctAnswer)
      return idx >= 0 ? idx.toString() : ''
    }
    return ''
  })()

  const [correctAnswer, setCorrectAnswer] = useState(initialCorrectIndex)
  const [explanation, setExplanation] = useState(initialQuestion?.explanation || '')
  const [tags, setTags] = useState(
    initialQuestion?.tags ? initialQuestion.tags.map((t) => t.tag).join(', ') : ''
  )
  const [mediaUrl, setMediaUrl] = useState(initialQuestion?.mediaUrl || '')
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    setState(INITIAL_STATE)

    const formData = new FormData(e.currentTarget)
    const payload: any = {
      questionText: formData.get('questionText'),
      mediaUrl: formData.get('mediaUrl'),
      type: formData.get('type'),
      subject: formData.get('subject'),
      difficulty: formData.get('difficulty'),
      tags: formData.get('tags'),
      option0: formData.get('option0'),
      option1: formData.get('option1'),
      option2: formData.get('option2'),
      option3: formData.get('option3'),
      correctAnswer: formData.get('correctAnswer'),
      explanation: formData.get('explanation'),
    }

    if (mode === 'edit' && initialQuestion) {
      payload.id = initialQuestion.id
    }

    try {
      const res = await fetch('/api/question', {
        method: mode === 'edit' ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      const result = await res.json()
      setState(result)
      if (result.success && mode === 'create') {
        formRef.current?.reset()
        setQuestionText('')
        setOption0('')
        setOption1('')
        setOption2('')
        setOption3('')
        setCorrectAnswer('')
        setExplanation('')
        setTags('')
        setMediaUrl('')
        setAiError(null)
      }
    } catch (err) {
      setState({
        success: false,
        message: err instanceof Error ? err.message : 'An unexpected error occurred.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleGenerateQuestion = async () => {
    setAiError(null)
    if (!formRef.current) return

    const formData = new FormData(formRef.current)
    const subjectVal = formData.get('subject') as string
    const difficultyVal = formData.get('difficulty') as string
    const tagsVal = formData.get('tags') as string

    setIsGenerating(true)
    try {
      const res = await generateQuestionWithAI(subjectVal, difficultyVal, tagsVal)
      if (res.success && res.data) {
        setQuestionText(res.data.questionText)
        setOption0(res.data.options[0] || '')
        setOption1(res.data.options[1] || '')
        setOption2(res.data.options[2] || '')
        setOption3(res.data.options[3] || '')
        setCorrectAnswer(res.data.correctAnswerIndex.toString())
        setExplanation(res.data.explanation)
      } else {
        setAiError(res.message || 'Failed to generate question.')
      }
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setIsGenerating(false)
    }
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
              <h1 className="text-xl font-bold tracking-tight">
                {mode === 'edit' ? 'Edit Question' : 'Create Question'}
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {mode === 'edit' ? 'Modify Question in the Bank (HeroUI)' : 'Add to the Question Bank (HeroUI)'}
              </p>
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
                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-400'
                : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/50 text-red-800 dark:text-red-400'
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
          <Form
            ref={formRef}
            onSubmit={handleSubmit}
            onReset={() => {
              setQuestionText(initialQuestion?.questionText || '')
              setOption0(initialQuestion?.options ? (initialQuestion.options as string[])[0] || '' : '')
              setOption1(initialQuestion?.options ? (initialQuestion.options as string[])[1] || '' : '')
              setOption2(initialQuestion?.options ? (initialQuestion.options as string[])[2] || '' : '')
              setOption3(initialQuestion?.options ? (initialQuestion.options as string[])[3] || '' : '')
              setCorrectAnswer(initialCorrectIndex)
              setExplanation(initialQuestion?.explanation || '')
              setTags(initialQuestion?.tags ? initialQuestion.tags.map((t) => t.tag).join(', ') : '')
              setMediaUrl(initialQuestion?.mediaUrl || '')
              setAiError(null)
            }}
            className="p-8 space-y-8"
          >
            {/* Subject, Difficulty, and Type Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Subject */}
              <Select name="subject" defaultValue={initialQuestion?.subject || 'computer_science'} className="w-full">
                <Label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Subject *</Label>
                <SelectTrigger className="w-full flex items-center justify-between bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition shadow-sm">
                  <SelectValue />
                  <SelectIndicator className="w-4 h-4 ml-2" />
                </SelectTrigger>
                <SelectPopover className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg mt-1 p-1 z-50">
                  <ListBox selectionMode="single">
                    {subjects.map((sub) => (
                      <ListBoxItem id={sub} key={sub} className="px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white cursor-pointer transition-colors duration-100">
                        {formatEnumText(sub)}
                      </ListBoxItem>
                    ))}
                  </ListBox>
                </SelectPopover>
                {state.errors?.subject && <p className="text-xs text-red-500 mt-1.5">{state.errors.subject}</p>}
              </Select>

              {/* Difficulty */}
              <Select name="difficulty" defaultValue={initialQuestion?.difficulty || 'medium'} className="w-full">
                <Label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Difficulty *</Label>
                <SelectTrigger className="w-full flex items-center justify-between bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition shadow-sm">
                  <SelectValue />
                  <SelectIndicator className="w-4 h-4 ml-2" />
                </SelectTrigger>
                <SelectPopover className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg mt-1 p-1 z-50">
                  <ListBox selectionMode="single">
                    {difficulties.map((diff) => (
                      <ListBoxItem id={diff} key={diff} className="px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white cursor-pointer transition-colors duration-100">
                        {formatEnumText(diff)}
                      </ListBoxItem>
                    ))}
                  </ListBox>
                </SelectPopover>
                {state.errors?.difficulty && (
                  <p className="text-xs text-red-500 mt-1.5">{state.errors.difficulty}</p>
                )}
              </Select>

              {/* Question Type */}
              <Select name="type" defaultValue={initialQuestion?.type || 'text'} className="w-full">
                <Label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Question Type *</Label>
                <SelectTrigger className="w-full flex items-center justify-between bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition shadow-sm">
                  <SelectValue />
                  <SelectIndicator className="w-4 h-4 ml-2" />
                </SelectTrigger>
                <SelectPopover className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg mt-1 p-1 z-50">
                  <ListBox selectionMode="single">
                    {questionTypes.map((t) => (
                      <ListBoxItem id={t} key={t} className="px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white cursor-pointer transition-colors duration-100">
                        {formatEnumText(t)}
                      </ListBoxItem>
                    ))}
                  </ListBox>
                </SelectPopover>
                {state.errors?.type && <p className="text-xs text-red-500 mt-1.5">{state.errors.type}</p>}
              </Select>
            </div>

            {/* Tags (Comma separated) */}
            <TextField name="tags" className="w-full">
              <Label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                Tags (Comma-separated)
              </Label>
              <Input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., algebra, calculus, physics"
                className="w-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition shadow-sm"
              />
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1.5">
                Separate multiple tags with commas. Casing will be normalized.
              </p>
            </TextField>

            {/* AI Generation Action */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-start">
                <Button
                  type="button"
                  onPress={handleGenerateQuestion}
                  isDisabled={isSaving || isGenerating}
                  className="inline-flex items-center gap-2 rounded-xl border border-violet-300 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-950/20 hover:bg-violet-100 dark:hover:bg-violet-900/40 text-violet-700 dark:text-violet-300 font-bold text-sm px-5 py-3 transition-all duration-200 active:scale-[0.98] shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-violet-700 dark:text-violet-300" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Generating Question...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3 15l5.096-.813L9 9l.813 5.187L15 15l-5.187.904zM18 10.5l-.375 2.625L15 13.5l2.625.375.375 2.625.375-2.625L21 13.5l-2.625-.375-.375-2.625zM14.25 4.5l-.188 1.313L12.75 6l1.313.188.188 1.313.188-1.313L15.75 6l-1.313-.188-.188-1.313z" />
                      </svg>
                      Generate Question with AI
                    </>
                  )}
                </Button>
              </div>
              {aiError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 rounded-xl text-xs text-red-800 dark:text-red-400 mt-1 max-w-xl flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{aiError}</span>
                </div>
              )}
            </div>

            {/* Question Text */}
            <TextField name="questionText" isInvalid={!!state.errors?.questionText} isRequired className="w-full">
              <Label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                Question Text *
              </Label>
              <TextArea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Enter the question text here..."
                className="w-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition resize-y min-h-[100px] shadow-sm"
              />
              {state.errors?.questionText && (
                <FieldError className="text-xs text-red-500 mt-1.5">{state.errors.questionText}</FieldError>
              )}
            </TextField>

            {/* Media Field */}
            <TextField name="mediaUrl" isInvalid={!!state.errors?.mediaUrl} className="w-full">
              <Label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                Media URL (Optional)
              </Label>
              <TextArea
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="Enter media URL if type is Image or Audio..."
                className="w-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition resize-y min-h-[60px] shadow-sm"
              />
              {state.errors?.mediaUrl && (
                <FieldError className="text-xs text-red-500 mt-1.5">{state.errors.mediaUrl}</FieldError>
              )}
            </TextField>

            {/* Options Selection */}
            <RadioGroup
              name="correctAnswer"
              value={correctAnswer}
              onChange={setCorrectAnswer}
              isRequired
              isInvalid={!!state.errors?.correctAnswer}
            >
              <Label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Options & Correct Answer *
              </Label>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                Enter four options and select the radio button next to the correct one.
              </p>

              <div className="space-y-4">
                {[0, 1, 2, 3].map((idx) => {
                  const getOptionVal = (index: number) => {
                    if (index === 0) return option0
                    if (index === 1) return option1
                    if (index === 2) return option2
                    return option3
                  }
                  const setOptionVal = (index: number, val: string) => {
                    if (index === 0) setOption0(val)
                    else if (index === 1) setOption1(val)
                    else if (index === 2) setOption2(val)
                    else setOption3(val)
                  }
                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <Radio value={idx.toString()} className="group">
                        <RadioContent className="flex items-center">
                          <RadioControl className="mr-2">
                            <RadioIndicator className="w-5 h-5 border border-zinc-300 dark:border-zinc-700 rounded-full flex items-center justify-center bg-white dark:bg-zinc-900 group-data-[selected=true]:bg-emerald-500 group-data-[selected=true]:border-emerald-500 transition-colors duration-150 shadow-sm">
                              <div className="w-2 h-2 rounded-full bg-white scale-0 group-data-[selected=true]:scale-100 transition-transform duration-150" />
                            </RadioIndicator>
                          </RadioControl>
                          <span className="text-sm font-bold text-zinc-500 dark:text-zinc-400 group-data-[selected=true]:text-emerald-600 dark:group-data-[selected=true]:text-emerald-400 transition-colors">
                            {String.fromCharCode(65 + idx)}
                          </span>
                        </RadioContent>
                      </Radio>
                      <Input
                        type="text"
                        name={`option${idx}`}
                        required
                        value={getOptionVal(idx)}
                        onChange={(e) => setOptionVal(idx, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                        className="flex-1 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition shadow-sm"
                      />
                    </div>
                  )
                })}
              </div>
              {state.errors?.options && (
                <FieldError className="text-xs text-red-500 mt-2 block">{state.errors.options}</FieldError>
              )}
              {state.errors?.correctAnswer && (
                <FieldError className="text-xs text-red-500 mt-2 block">{state.errors.correctAnswer}</FieldError>
              )}
            </RadioGroup>

            {/* Explanation */}
            <TextField name="explanation" isInvalid={!!state.errors?.explanation} className="w-full">
              <Label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                Explanation (Optional)
              </Label>
              <TextArea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Provide a step-by-step explanation for the correct answer..."
                className="w-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition resize-y min-h-[80px] shadow-sm"
              />
              {state.errors?.explanation && (
                <FieldError className="text-xs text-red-500 mt-1.5">{state.errors.explanation}</FieldError>
              )}
            </TextField>

            {/* Form Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 border-t border-zinc-100 dark:border-zinc-800 pt-6">
              <Button
                type="submit"
                isDisabled={isSaving || isGenerating}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:from-violet-650 disabled:to-indigo-650 text-white font-bold text-sm px-6 py-3.5 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 transition duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSaving ? 'Saving...' : 'Save Question'}
              </Button>
              <Button
                type="reset"
                isDisabled={isSaving || isGenerating}
                className="flex-1 sm:flex-none px-6 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 font-bold text-sm text-zinc-700 dark:text-zinc-300 transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Reset
              </Button>
            </div>
          </Form>
        </div>
      </main>
    </div>
  )
}
