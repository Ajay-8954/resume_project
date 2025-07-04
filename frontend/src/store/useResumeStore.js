import { create } from 'zustand';

const useResumeStore = create((set) => ({
  // Current step in the workflow
  currentStep: 'INITIAL_UPLOAD',
  setCurrentStep: (step) => set({ currentStep: step }),

  // User inputs
  resumeFile: null,
  setResumeFile: (file) => set({ resumeFile: file }),
  jdText: "",
  setJdText: (text) => set({ jdText: text }),

  //Ajay code *********
  resumeFiles: null,
  setResumeFiles: (file) => set({ resumeFiles: file }),

  manualForm: {},
  setManualForm: (form) =>
    set((state) => ({
      manualForm:
        typeof form === "function" ? form(state.manualForm) : form,
    })),



  jdTexts: "",
  setJdTexts: (text) => set({ jdTexts: text }),


  loading: false,
  setLoading: (status) => set({ loading: status }),


  jdAnalysis: {},
  setJdAnalysis: (ja) => set({ jdAnalysis: ja }),


  questionss: [],
  setQuestionss: (qs) => set({ questionss: qs }),



  feedback: "",
  setFeedback: (fb) => set({ feedback: fb }),


  answerss: [],  // Initialize as array
  setAnswerss: (answers) => set({ answerss: answers }),





  // File management
  fileId: null,
  setFileId: (id) => set({ fileId: id }),
  parsedResumeText: "",
  setParsedResumeText: (text) => set({ parsedResumeText: text }),

  // Analysis results
  analysis: null,
  setAnalysis: (data) => set({ analysis: data }),
  keywordGaps: null,
  setKeywordGaps: (gaps) => set({ keywordGaps: gaps }),

  // Optimization process
  questions: [],
  setQuestions: (qs) => set({ questions: qs }),
  answers: {},
  setAnswer: (question, answer) => set((state) => ({
    answers: { ...state.answers, [question]: answer }
  })),
  optimizedResumeFile: null,
  setOptimizedResumeFile: (file) => set({ optimizedResumeFile: file }),

  // Score tracking
  scoreHistory: [],
  addScoreToHistory: (score) => set((state) => ({
    scoreHistory: [...state.scoreHistory, score]
  })),

  // Loading state
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  // Reset function
  reset: () => set({
    currentStep: 'INITIAL_UPLOAD',
    resumeFile: null,
    jdText: "",
    fileId: null,
    parsedResumeText: "",
    analysis: null,
    keywordGaps: null,
    questions: [],
    answers: {},
    optimizedResumeFile: null,
    scoreHistory: [],
    isLoading: false
  })
}));

export default useResumeStore;






