export const SUBJECTS = [
  'english',
  'mathematics',
  'science',
  'social_studies',
  'history',
  'geography',
  'space_science',
  'economics',
  'computer_science',
  'general_knowledge',
  'current_affairs',
  'reasoning',
  'aptitude',
  'environment',
  'arts',
  'music',
  'sports',
] as const

export type SubjectType = (typeof SUBJECTS)[number]

export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const

export type DifficultyType = (typeof DIFFICULTIES)[number]

export const QUESTION_TYPES = ['text', 'image', 'audio'] as const

export type QuestionTypeEnum = (typeof QUESTION_TYPES)[number]
