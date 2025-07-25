import { create } from "zustand";

const useResumeStore = create((set) => ({
  // Toggle for fresher/experienced user
  toggle: "fresher", // Default to fresher
  setToggle: (value) => set({ toggle: value }),

  // Current step in the workflow
  currentStep: "INITIAL_UPLOAD",
  setCurrentStep: (step) => set({ currentStep: step }),

  // User inputs
  resumeFile: null,
  setResumeFile: (file) => set({ resumeFile: file }),
  jdText: "",
  setJdText: (text) => set({ jdText: text }),

  // Ajay code
  resumeFiles: null,
  setResumeFiles: (file) => set({ resumeFiles: file }),

  // Current template ID
  template: "microsoft", // Default template
  setTemplate: (template) => set({ template }), // Action to update template

  // Form data for manual resume building
  manualForm: {
    Name: "",
    jobTitle: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    summary: "",
    objective: "",
    experience: [],
    education: [],
    projects: [],
    skills: [],
    languages: [],
    interests: [],
    achievements: [],
    internships: [],
    certifications: [],
    newExperience: { jobTitle: "", company: "", startDate: "", endDate: "", description: "" },
    newEducation: { degree: "", school: "", startDate: "", endDate: "" },
    newProject: { title: "", startDate: "", endDate: "", tech: "", description: "" },
    newAchievement: { title: "", description: "" },
    newInternship: { role: "", company: "", startDate: "", endDate: "", description: "" },
    newCertification: { name: "", issuer: "", date: "" },
  },

  setManualForm: (form) =>
    set((state) => ({
      manualForm: typeof form === "function" ? form(state.manualForm) : form,
    })),

  editingIndex: { internship: null, experience: null, project: null },
  setEditingIndex: (index) => set({ editingIndex: index }),

  // Temporary Form States
  newExperience: { jobTitle: "", company: "", startDate: "", endDate: "", description: "" },
  setNewExperience: (data) => set({ newExperience: data }),
  newProject: { title: "", tech: "", startDate: "", endDate: "", description: "" },
  setNewProject: (data) => set({ newProject: data }),
  newInternship: { role: "", company: "", startDate: "", endDate: "", description: "" },
  setNewInternship: (data) => set({ newInternship: data }),
  newEducation: { degree: "", school: "", startDate: "", endDate: "" },
  setNewEducation: (data) => set({ newEducation: data }),
  newAchievement: { title: "", description: "" },
  setNewAchievement: (data) => set({ newAchievement: data }),
  newCertification: { name: "", issuer: "", date: "" },
  setNewCertification: (data) => set({ newCertification: data }),

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

  answerss: [],
  setAnswerss: (answers) => set({ answerss: answers }),

  resumeId: null,
  setResumeId: (id) => set({ resumeId: id }),

  fileId: null,
  setFileId: (id) => set({ fileId: id }),
  parsedResumeText: "",
  setParsedResumeText: (text) => set({ parsedResumeText: text }),

  analysis: null,
  setAnalysis: (data) => set({ analysis: data }),
  keywordGaps: null,
  setKeywordGaps: (gaps) => set({ keywordGaps: gaps }),

  questions: [],
  setQuestions: (qs) => set({ questions: qs }),
  answers: {},
  setAnswer: (question, answer) =>
    set((state) => ({
      answers: { ...state.answers, [question]: answer },
    })),
  optimizedResumeFile: null,
  setOptimizedResumeFile: (file) => set({ optimizedResumeFile: file }),

  scoreHistory: [],
  addScoreToHistory: (score) =>
    set((state) => ({
      scoreHistory: [...state.scoreHistory, score],
    })),

  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  dataToBuild: null,
  setDataToBuild: (data) => set({ dataToBuild: data }),

  // Reset function to clear state, preserving resumeId for existing resumes
  reset: (preserveResumeId = false) =>
    set((state) => ({
      currentStep: "INITIAL_UPLOAD",
      resumeFile: null,
      jdText: "",
      resumeFiles: null,
      manualForm: {
        Name: "",
        jobTitle: "",
        email: "",
        phone: "",
        location: "",
        linkedin: "",
        github: "",
        summary: "",
        objective: "",
        experience: [],
        education: [],
        projects: [],
        skills: [],
        languages: [],
        interests: [],
        achievements: [],
        internships: [],
        certifications: [],
        newExperience: { jobTitle: "", company: "", startDate: "", endDate: "", description: "" },
        newEducation: { degree: "", school: "", startDate: "", endDate: "" },
        newProject: { title: "", startDate: "", endDate: "", tech: "", description: "" },
        newAchievement: { title: "", description: "" },
        newInternship: { role: "", company: "", startDate: "", endDate: "", description: "" },
        newCertification: { name: "", issuer: "", date: "" },
      },
      newExperience: { jobTitle: "", company: "", startDate: "", endDate: "", description: "" },
      newProject: { title: "", tech: "", startDate: "", endDate: "", description: "" },
      newInternship: { role: "", company: "", startDate: "", endDate: "", description: "" },
      newEducation: { degree: "", school: "", startDate: "", endDate: "" },
      newAchievement: { title: "", description: "" },
      newCertification: { name: "", issuer: "", date: "" },
      fileId: null,
      parsedResumeText: "",
      analysis: null,
      keywordGaps: null,
      questions: [],
      answers: {},
      optimizedResumeFile: null,
      scoreHistory: [],
      dataToBuild: null,
      isLoading: false,
      resumeId: preserveResumeId ? state.resumeId : null, // Preserve resumeId if specified
      template: "microsoft", // Reset to default template
    })),
}));

export default useResumeStore;