'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Eye, CheckCircle } from 'lucide-react'

export default function FacultyReviewPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [finalScore, setFinalScore] = useState('')
  const [remarks, setRemarks] = useState('')

  const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '')

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/review/faculty', {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        })

        const data = await res.json()
        setReviews(Array.isArray(data) ? data : Array.isArray(data?.reviews) ? data.reviews : [])
      } catch (_err) {
        setReviews([])
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [])

  const openReview = (review: any) => {
    setSelected(review)
    setFinalScore(String(Number(review?.aiScore || review?.quizAttempt?.score || 0)))
    setRemarks('')
    setShowModal(true)
  }

  const submitReview = async () => {
    if (!selected) return
    const score = Number(finalScore)

    await fetch(`http://localhost:5000/api/review/${selected._id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        finalScore: Number.isFinite(score) ? score : 0,
        remarks,
      }),
    })

    setReviews((prev) => prev.filter((r) => r._id !== selected._id))
    setShowModal(false)
    setSelected(null)
    setFinalScore('')
    setRemarks('')
  }

  if (loading) return <div className="p-8">Loading reviews...</div>

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Student Quiz Reviews</h1>

      <Card className="p-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Student</th>
              <th className="text-left py-2">Quiz Type</th>
              <th className="text-left py-2">AI Score</th>
              <th className="text-left py-2">Submitted</th>
              <th className="text-left py-2">Status</th>
              <th className="text-left py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {reviews.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-6 text-muted-foreground">
                  No reviews pending
                </td>
              </tr>
            )}
            {reviews.map((r) => (
              <tr key={r._id} className="border-b">
                <td className="py-2">{r.student?.fullName || 'N/A'}</td>
                <td className="py-2">{r.quizAttempt?.quizType || 'CUSTOM'}</td>
                <td className="py-2">{Number(r.aiScore || 0)}%</td>
                <td className="py-2">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td className="py-2">
                  <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
                </td>
                <td className="py-2">
                  <Button size="sm" variant="outline" className="gap-2" onClick={() => openReview(r)}>
                    <Eye className="w-4 h-4" />
                    Review
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {showModal && selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <Card className="w-full max-w-3xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold">Review Submission</h2>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Student</p>
                <p className="font-semibold">{selected.student?.fullName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">AI Score</p>
                <p className="font-semibold">{Number(selected.aiScore || 0)}%</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Answers</h3>
              {(selected?.quizAttempt?.correctAnswers || []).map((q: any, idx: number) => {
                const answers = selected?.quizAttempt?.answers || []
                const ans = answers.find((a: any) => String(a.questionId) === String(q.questionId))
                const options = Array.isArray(q.options) ? q.options : []
                const selectedIndex =
                  ans?.selectedIndex === null || ans?.selectedIndex === undefined
                    ? null
                    : Number(ans.selectedIndex)
                const correctIndex = Number(q.correctAnswer)
                const selectedOption =
                  selectedIndex !== null && selectedIndex >= 0 && selectedIndex < options.length
                    ? options[selectedIndex]
                    : 'Not answered'
                const correctOption =
                  correctIndex >= 0 && correctIndex < options.length ? options[correctIndex] : 'N/A'
                const isCorrect = selectedIndex !== null && selectedIndex === correctIndex

                return (
                  <div
                    key={q.questionId || idx}
                    className={`border rounded p-3 ${isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}
                  >
                    <p className="font-semibold">
                      Q{idx + 1}. {q.question || 'Question'}
                    </p>
                    <p className="text-sm">Student: {selectedOption}</p>
                    <p className="text-sm">Correct: {correctOption}</p>
                  </div>
                )
              })}
            </div>

            <div className="space-y-2">
              <Label>Final Score (0-100)</Label>
              <Input type="number" value={finalScore} onChange={(e) => setFinalScore(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Remarks</Label>
              <textarea
                rows={3}
                className="w-full border rounded p-2"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <Button className="flex-1 gap-2" onClick={submitReview}>
                <CheckCircle className="w-4 h-4" />
                Submit Review
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
