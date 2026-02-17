import QuizAttempt from "../models/QuizAttempt.js";
import Exam from "../models/Exam.js";

/* ---------------- GET EXAM ATTEMPTS ---------------- */

export const getExamAttempts = async (req, res) => {
  try {
    const { examId } = req.params;
    
    const attempts = await QuizAttempt.find({
      quizId: examId,
      quizType: "SCHEDULED",
      isFinalized: true,
    })
    .populate('student', 'name email')
    .sort({ submittedAt: -1 });

    res.json(attempts);
  } catch (err) {
    console.error("Failed to fetch exam attempts:", err);
    res.status(500).json({ message: "Failed to fetch attempts" });
  }
};

/* ---------------- GET ATTEMPT DETAILS ---------------- */

export const getAttemptDetails = async (req, res) => {
  try {
    const { attemptId } = req.params;
    
    const attempt = await QuizAttempt.findById(attemptId)
      .populate('student', 'name email');

    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    res.json(attempt);
  } catch (err) {
    console.error("Failed to fetch attempt details:", err);
    res.status(500).json({ message: "Failed to fetch attempt details" });
  }
};

/* ---------------- GET ALL FACULTY QUIZ ATTEMPTS ---------------- */

export const getAllFacultyAttempts = async (req, res) => {
  try {
    const facultyId = req.user._id;
    
    // Get all exams created by this faculty
    const exams = await Exam.find({ faculty: facultyId }).select('_id');
    const examIds = exams.map(exam => exam._id);

    // Get all attempts for these exams
    const attempts = await QuizAttempt.find({
      quizId: { $in: examIds },
      quizType: "SCHEDULED",
      isFinalized: true,
    })
    .populate('student', 'name email')
    .populate('quizId', 'title subject')
    .sort({ submittedAt: -1 });

    res.json(attempts);
  } catch (err) {
    console.error("Failed to fetch faculty attempts:", err);
    res.status(500).json({ message: "Failed to fetch attempts" });
  }
};
