'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, User, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

type Attempt = {
  _id: string
  student: {
    _id: string
    name: string
    email: string
  }
  quizType: 'CUSTOM' | 'SCHEDULED'
  questions: Array<{
    questionId: string
    question: string
    options: string[]
    correctAnswer: number
  }>
  answers: Array<{
    questionId: string
    selectedIndex: number | null
  }>
  correctAnswers: Array<{
    questionId: string
    correctAnswer: number
    question: string
    options: string[]
  }>
  score: number
  totalQuestions: number
  status: 'ONGOING' | 'SUBMITTED' | 'AUTO_SUBMITTED'
  warnings: {
    tab: number
    face: number
  }
  submittedAt?: string
  isFinalized: boolean
  submissionType?: 'MANUAL' | 'AUTO' | 'TIME_UP'
}

export default function AttemptDetailPage() {
  const params = useParams()
  const router = useRouter()
  const attemptId = params.attemptId as string

  const [attempt, setAttempt] = useState<Attempt | null>(null)
  const [loading, setLoading] = useState(true)

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''

  useEffect(() => {
    fetchAttempt()
  }, [])

  const fetchAttempt = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/faculty/attempts/${attemptId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error('Failed to fetch attempt')

      const data = await res.json()
      setAttempt(data)
    } catch (err) {
      console.error('Failed to fetch attempt:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string, submissionType?: string) => {
    if (status === 'AUTO_SUBMITTED') {
      return <Badge variant="destructive">Auto Submitted</Badge>
    }
    if (submissionType === 'TIME_UP') {
      return <Badge variant="secondary">Time Up</Badge>
    }
    return <Badge variant="default">Submitted</Badge>
  }

  const getAccuracyColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return <div className="p-8">Loading attempt details...</div>
  }

  if (!attempt) {
    return <div className="p-8">Attempt not found</div>
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Attempt Review</h1>
          <p className="text-muted-foreground">
            Detailed review of student's quiz attempt
          </p>
        </div>
      </div>

      {/* Student Info & Score */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{attempt.student.name}</h2>
              <p className="text-muted-foreground">{attempt.student.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Score</p>
              <p className={`text-3xl font-bold ${getAccuracyColor(attempt.score)}`}>
                {attempt.score}%
              </p>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">Status</p>
              {getStatusBadge(attempt.status, attempt.submissionType)}
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">Quiz Type</p>
              <Badge variant="outline">{attempt.quizType}</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Correct</p>
              <p className="text-xl font-bold text-green-600">
                {attempt.answers.filter(a => {
                  const correct = attempt.correctAnswers.find(c => c.questionId === a.questionId)
                  return correct && a.selectedIndex === correct.correctAnswer
                }).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-sm text-muted-foreground">Incorrect</p>
              <p className="text-xl font-bold text-red-600">
                {attempt.answers.filter(a => {
                  const correct = attempt.correctAnswers.find(c => c.questionId === a.questionId)
                  return correct && a.selectedIndex !== null && a.selectedIndex !== correct.correctAnswer
                }).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-sm text-muted-foreground">Tab Warnings</p>
              <p className="text-xl font-bold text-yellow-600">{attempt.warnings.tab}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <div>
              <p className="text-sm text-muted-foreground">Face Warnings</p>
              <p className="text-xl font-bold text-orange-600">{attempt.warnings.face}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Questions Review */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Question-wise Review</h3>
        
        {attempt.questions.map((question, index) => {
          const answer = attempt.answers.find(a => a.questionId === question.questionId)
          const isCorrect = answer?.selectedIndex === question.correctAnswer
          
          return (
            <Card key={question.questionId} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium bg-muted px-2 py-1 rounded">
                      Question {index + 1}
                    </span>
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    {answer?.selectedIndex === null && (
                      <Badge variant="outline">Not Attempted</Badge>
                    )}
                  </div>
                  <p className="font-medium mb-3">{question.question}</p>
                  
                  <div className="space-y-2">
                    {question.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={`p-3 rounded border ${
                          optIndex === question.correctAnswer
                            ? 'bg-green-50 border-green-200'
                            : answer?.selectedIndex === optIndex
                            ? 'bg-red-50 border-red-200'
                            : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {optIndex === question.correctAnswer && (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                          {answer?.selectedIndex === optIndex && optIndex !== question.correctAnswer && (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span className="flex-1">{option}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Submission Details */}
      {attempt.submittedAt && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Submission Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Submitted At</p>
              <p className="font-medium">
                {new Date(attempt.submittedAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Submission Type</p>
              <p className="font-medium">{attempt.submissionType || 'MANUAL'}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
