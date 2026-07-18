import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import QuestionForm from '../components/QuestionForm'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditQuestionPage({ params }: PageProps) {
  const { id } = await params

  const question = await prisma.question.findUnique({
    where: { id },
    include: {
      tags: {
        orderBy: {
          tag: 'asc',
        },
      },
    },
  })

  if (!question) {
    notFound()
  }

  return <QuestionForm mode="edit" initialQuestion={question} />
}
