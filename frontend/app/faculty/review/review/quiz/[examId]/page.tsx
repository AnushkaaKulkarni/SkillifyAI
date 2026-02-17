'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, User, Clock, AlertTriangle, CheckCircle, XCircle, Eye } from 'lucide-react'

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

export default function QuizReviewPage() {
  const params = useParams()
  const router = useRouter()
  const examId = params.examId as string

  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [selectedAttempt, setSelectedAttempt] = useState<Attempt | null>(null)
  const [loading, setLoading] = useState(true)

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''

  useEffect(() => {
    fetchAttempts()
  }, [])

  const fetchAttempts = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/faculty/exams/${examId}/attempts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error('Failed to fetch attempts')

      const data = await res.json()
      setAttempts(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to fetch attempts:', err)
      setAttempts([])
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
    return <div className="p-8">Loading attempts...</div>
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Quiz Attempts Review</h1>
          <p className="text-muted-foreground">
            Review student attempts and performance analytics
          </p>
        </div>
      </div>

      {/* Attempts List */}
      {!selectedAttempt ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Student Attempts</h2>
          
          {attempts.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              No attempts found for this exam
            </Card>
          ) : (
            <div className="grid gap-4">
              {attempts.map((attempt) => (
                <Card key={attempt._id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{attempt.student.name}</h3>
                        <p className="text-sm text-muted-foreground">{attempt.student.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Score</p>
                        <p className={`text-2xl font-bold ${getAccuracyColor(attempt.score)}`}>
                          {attempt.score}%
                        </p>
                      </div>

                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Warnings</p>
                        <div className="flex gap-2">
                          <Badge variant={attempt.warnings.tab > 0 ? 'destructive' : 'secondary'}>
                            Tab: {attempt.warnings.tab}
                          </Badge>
                          <Badge variant={attempt.warnings.face > 0 ? 'destructive' : 'secondary'}>
                            Face: {attempt.warnings.face}
                          </Badge>
                        </div>
                      </div>

                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Status</p>
                        {getStatusBadge(attempt.status, attempt.submissionType)}
                      </div>

                      <Button
                        onClick={() => setSelectedAttempt(attempt)}
                        className="gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Review
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Detailed Attempt Review */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setSelectedAttempt(null)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Attempts
            </Button>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Student</p>
                <p className="font-semibold">{selectedAttempt.student.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Final Score</p>
                <p className={`text-2xl font-bold ${getAccuracyColor(selectedAttempt.score)}`}>
                  {selectedAttempt.score}%
                </p>
              </div>
            </div>
          </div>

          {/* Analytics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Correct</p>
                  <p className="text-xl font-bold text-green-600">
                    {selectedAttempt.answers.filter(a => {
                      const correct = selectedAttempt.correctAnswers.find(c => c.questionId === a.questionId)
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
                    {selectedAttempt.answers.filter(a => {
                      const correct = selectedAttempt.correctAnswers.find(c => c.questionId === a.questionId)
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
                  <p className="text-sm text-muted-foreground">Total Warnings</p>
                  <p className="text-xl font-bold text-yellow-600">
                    {selectedAttempt.warnings.tab + selectedAttempt.warnings.face}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Submission</p>
                  <p className="text-sm font-semibold">
                    {selectedAttempt.submissionType || 'MANUAL'}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Question-wise Review */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Question-wise Performance</h3>
            
            {selectedAttempt.questions.map((question, index) => {
              const answer = selectedAttempt.answers.find(a => a.questionId === question.questionId)
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
        </div>
      )}
    </div>
  )
}
