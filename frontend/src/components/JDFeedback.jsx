import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Lightbulb,
  ListChecks,
  ListX,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import useResumeStore from "../store/useResumeStore";

export default function JDFeedback({ setCurrentStep, setCompletedSteps }) {
  const {
    jdTexts,
    setJdTexts,
    feedback,
    setFeedback,
    questionss,
    setQuestionss,
    jdAnalysis,
    setJdAnalysis,
    loading,
    setLoading,
    manualForm,
    answerss,
    setAnswerss,
    setManualForm,
  } = useResumeStore();

  const {
    ats_score,
    strengths = [],
    weaknesses = [],
    matching_skills = [],
    missing_skills = [],
    improvement_tips = [],
  } = jdAnalysis || {};

  const [openSections, setOpenSections] = useState({
    strengths: true,
    weaknesses: true,
    matching_skills: true,
    missing_skills: true,
    improvement_tips: true,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleGenerateFeedback = async () => {
  if (!jdTexts || !manualForm) {
    alert("Job Description or Resume is missing.");
    console.warn("Missing inputs:", { jdTexts, manualForm });
    return;
  }

  setLoading(true);

  try {
    console.log("🔁 Sending resume_text and jd_text to /analyze_resume");

    const formData = new URLSearchParams();
    formData.append("resume_text", manualForm);
    formData.append("jd_text", jdTexts);

    const analysisRes = await fetch("http://127.0.0.1:5000/analyze_resume", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const analysis = await analysisRes.json();
    console.log("✅ Analysis Response:", analysis);

    if (!analysisRes.ok) {
      console.error("❌ Analysis Error:", analysis.error);
      throw new Error(analysis.error || "Resume analysis failed.");
    }

    const parsedResume = analysis.parsed_resume_text;
    const score = analysis.overall_score;

    console.log("🔁 Sending parsed resume to /get_keyword_gaps");
    const gapRes = await fetch("http://127.0.0.1:5000/get_keyword_gaps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jd_text: jdTexts,
        resume_text: parsedResume,
      }),
    });

    const gaps = await gapRes.json();
    console.log("✅ Gaps Response:", gaps);

    if (!gapRes.ok) {
      console.error("❌ Gap Fetch Error:", gaps.error);
      throw new Error(gaps.error || "Keyword gap fetch failed.");
    }

    // Update global state
    setFeedback(analysis.summary || "");

    setJdAnalysis({
      ats_score: score || 0,
      strengths:
        analysis.analysis_breakdown?.content?.details
          ?.filter((d) => d.passed)
          .map((d) => d.comment) || [],
      weaknesses:
        analysis.analysis_breakdown?.content?.details
          ?.filter((d) => !d.passed)
          .map((d) => d.comment) || [],
      matching_skills: gaps.present_keywords || [],
      missing_skills: gaps.missing_keywords || [],
      improvement_tips:
        analysis.analysis_breakdown?.style?.details
          ?.filter((d) => !d.passed)
          .map((d) => d.comment) || [],
    });

    console.log("🌟 JD Analysis & Feedback Updated");

    setCurrentStep?.(3);
    setCompletedSteps?.((prev) => [...new Set([...prev, 3])]);
  } catch (error) {
    console.error("🔥 Analysis Error:", error.message);
    setFeedback("⚠️ Error generating analysis. Try again.");
  } finally {
    setLoading(false);
  }
};

 

  const sections = [
    { title: "Strengths", icon: ThumbsUp, color: "green", data: strengths },
    { title: "Weaknesses", icon: ThumbsDown, color: "red", data: weaknesses },
    { title: "Matching Skills", icon: ListChecks, color: "blue", data: matching_skills },
    { title: "Missing Skills", icon: ListX, color: "orange", data: missing_skills },
    { title: "Improvement Tips", icon: Lightbulb, color: "purple", data: improvement_tips },
  ];

  return (
    <div className="space-y-6">
      {/* JD Text Input */}
      <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm space-y-3">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          📄 Job Description
        </h3>
        <textarea
          className="w-full border border-gray-300 rounded-md p-3 text-sm resize-none focus:ring-2 focus:ring-blue-300"
          rows={4}
          placeholder="Paste your Job Description here..."
          value={jdTexts}
          onChange={(e) => setJdTexts(e.target.value)}
        />
        <button
          onClick={handleGenerateFeedback}
          className={`px-5 py-2 rounded-md text-white font-medium transition ${
            loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
          disabled={loading}
        >
          {loading ? "Generating..." : "✨ Generate Feedback"}
        </button>
      </div>

      {/* ATS Score */}
      {ats_score !== undefined && (
        <div className="bg-white border border-blue-100 p-4 rounded-lg shadow-sm flex items-center justify-between">
          <span className="text-lg font-medium flex items-center gap-2 text-blue-800">
            <Sparkles className="text-yellow-500" /> ATS Score:
          </span>
          <span className="text-3xl font-bold text-blue-700">{ats_score}/100</span>
        </div>
      )}

      {/* Overall Feedback */}
      {feedback && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg shadow-sm">
          <h4 className="font-semibold text-green-800 mb-2">✅ Overall Feedback</h4>
          <p className="text-sm text-green-700">{feedback}</p>
        </div>
      )}

      {/* Expandable Sections */}
      {sections.map(({ title, icon: Icon, color, data }) => {
        const key = title.toLowerCase().replace(/\s/g, "_");
        if (!data?.length) return null;
        return (
          <div key={key} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <button
              onClick={() => toggleSection(key)}
              className={`w-full flex justify-between items-center px-4 py-3 text-${color}-700 font-medium bg-${color}-50 hover:bg-${color}-100 transition`}
            >
              <span className="flex items-center gap-2">
                <Icon className="w-5 h-5" /> {title}
              </span>
              {openSections[key] ? <ChevronUp /> : <ChevronDown />}
            </button>
            <div
              className={`transition-all duration-500 ease-in-out overflow-hidden ${
                openSections[key] ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <ul className={`px-6 py-3 list-disc text-sm text-${color}-800 space-y-1`}>
                {data.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}

      {/* Questions Section */}
      {questionss?.length > 0 && (
        <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm space-y-4">
          <h4 className="text-lg font-semibold text-gray-800">✍️ Answer These Questions</h4>
          {questionss.map((q, i) => (
            <div key={i} className="space-y-2">
              <label className="block text-sm text-gray-700 font-medium">{q}</label>
              <textarea
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-300"
                rows={2}
                placeholder="Write your answer..."
                value={answerss[i] || ""}
                onChange={(e) => {
                  const newAnswers = [...answerss];
                  newAnswers[i] = e.target.value;
                  setAnswerss(newAnswers);
                }}
              />
            </div>
          ))}
          <button
            onClick={handleFixResume}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md font-medium transition"
          >
            ✅ Fix My Resume
          </button>
        </div>
      )}
    </div>
  );
}
