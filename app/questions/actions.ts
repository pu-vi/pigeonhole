'use server'

import { prisma } from '@/lib/prisma'
import { Subject, Difficulty, QuestionType } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export type FormState = {
  success: boolean
  message: string
  errors?: Record<string, string>
}

export async function createQuestion(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  // Extract fields
  const questionText = formData.get('questionText') as string
  const mediaUrl = formData.get('mediaUrl') as string
  const typeString = formData.get('type') as string
  const subjectString = formData.get('subject') as string
  const difficultyString = formData.get('difficulty') as string
  const tagsString = formData.get('tags') as string
  const explanation = formData.get('explanation') as string

  // Options input
  const option0 = formData.get('option0') as string
  const option1 = formData.get('option1') as string
  const option2 = formData.get('option2') as string
  const option3 = formData.get('option3') as string
  const correctAnswerIndexStr = formData.get('correctAnswer') as string

  const errors: Record<string, string> = {}

  // Validation
  if (!questionText || questionText.trim().length === 0) {
    errors.questionText = 'Question text is required.'
  }

  const options = [option0, option1, option2, option3].map(opt => opt?.trim() || '')
  if (options.some(opt => opt.length === 0)) {
    errors.options = 'All four options must be filled out.'
  }

  if (correctAnswerIndexStr === null || correctAnswerIndexStr === undefined || correctAnswerIndexStr === '') {
    errors.correctAnswer = 'You must select one option as the correct answer.'
  }

  const correctAnswerIndex = Number(correctAnswerIndexStr)
  if (isNaN(correctAnswerIndex) || correctAnswerIndex < 0 || correctAnswerIndex > 3) {
    errors.correctAnswer = 'Invalid correct answer selection.'
  }

  // Validate QuestionType enum
  if (!Object.values(QuestionType).includes(typeString as QuestionType)) {
    errors.type = 'Invalid question type.'
  }

  // Validate Subject enum
  if (!Object.values(Subject).includes(subjectString as Subject)) {
    errors.subject = 'Invalid subject selected.'
  }

  // Validate Difficulty enum
  if (!Object.values(Difficulty).includes(difficultyString as Difficulty)) {
    errors.difficulty = 'Invalid difficulty selected.'
  }

  // If there are validation errors, return them
  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: 'Please correct the errors in the form.',
      errors,
    }
  }

  const type = typeString as QuestionType
  const subject = subjectString as Subject
  const difficulty = difficultyString as Difficulty
  const correctAnswerText = options[correctAnswerIndex]

  // Parse tags: split by comma, trim, lowercase, deduplicate, filter empty
  const tags = Array.from(
    new Set(
      (tagsString || '')
        .split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0)
    )
  )

  try {
    // Save to DB in a single transaction/create statement
    await prisma.question.create({
      data: {
        subject,
        type,
        difficulty,
        questionText: questionText.trim(),
        mediaUrl: mediaUrl?.trim() || null,
        options,
        correctAnswer: correctAnswerText,
        explanation: explanation?.trim() || null,
        tags: {
          create: tags.map(tag => ({
            tag,
          })),
        },
      },
    })

    // Revalidate paths to refresh listing cache
    revalidatePath('/questions')

    return {
      success: true,
      message: 'Question saved successfully!',
    }
  } catch (error) {
    console.error('Database error in createQuestion action:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'A database error occurred while saving the question.',
    }
  }
}
