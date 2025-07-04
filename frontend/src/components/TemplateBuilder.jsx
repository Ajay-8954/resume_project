import React, { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import ResumeForm from "./ResumeForm";
import Google from "./templates/Google";
import Meta from "./templates/Meta";
import Microsoft from "./templates/Microsoft";
import JDFeedback from "./JDFeedback";
import useResumeStore from "../store/useResumeStore";
import TemplateSelection from "./TemplateSelection";
import axios from "axios";

export default function TemplateBuilder() {
  const { templateId } = useParams();
  const { manualForm, loading } = useResumeStore();
  const previewRef = useRef();
  const [title, setTitle] = useState("");

  const handleDownloadPDF = async () => {
    try {
      const element = previewRef.current;
      const bodyContent = element.innerHTML;

      const response = await fetch("http://127.0.0.1:5000/download_pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          html: bodyContent,
          template: templateId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "resume.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert(`PDF generation failed: ${error.message}`);
    }
  };

  const handleSaveResume = async () => {
    if (!title) {
      alert("Please enter a title for your resume");
      return;
    }

    if (!manualForm || Object.keys(manualForm).length === 0) {
      alert(
        "Your resume content is empty. Please fill in your resume before saving."
      );
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/save",
        { title, content: manualForm },
        { withCredentials: true }
      );

      console.log("response of save resume is", res);
      alert("Resume saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save resume");
    }
  };

  const renderPreview = () => {
    const props = { data: manualForm };
    switch (templateId) {
      case "google":
        return <Google {...props} ref={previewRef} />;
      case "meta":
        return <Meta {...props} ref={previewRef} />;
      case "microsoft":
        return <Microsoft {...props} ref={previewRef} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 m-3">
      <div className="flex flex-grow">
        <div className="w-55 min-w-[18px] border-r border-blue-100 bg-white shadow-md p-0 border-0 sticky top-0 h-screen">
          <TemplateSelection />
        </div>

        <div className="flex flex-col lg:flex-row gap-2 px-2 py-1 w-full max-w-[calc(100%-240px)] mx-auto">
          <section className="w-full lg:w-1/2 bg-white rounded-xl border border-black-200 shadow-md transition-all">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-blue-600">
                <div className="w-10 h-10 border-4 border-blue-300 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-sm font-medium">Processing your resume...</p>
              </div>
            ) : (
              <ResumeForm />
            )}
          </section>

          <section className="w-full lg:w-1/2 bg-white rounded-xl p-2 max-h-[100vh] sticky top-4">
            <div className="sticky top-0 bg-white pb-3 z-10 flex flex-col gap-2 border-0 border-gray-200 mb-4">
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadPDF}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
                >
                  ⬇️ Download as PDF
                </button>

                <input
                  type="text"
                  placeholder="Resume Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border px-2 py-1 text-sm w-1/2"
                />

                <button
                  onClick={handleSaveResume}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
                >
                  💾 Save Resume
                </button>
              </div>
            </div>

            <div className="overflow-auto h-[80vh] p-4 bg-white shadow-inner">
              {renderPreview()}
            </div>
          </section>
        </div>
      </div>

      <section className="bg-gradient-to-r from-blue-50 to-blue-100 border-t border-blue-200 shadow-inner px-4 py-10 mt-10">
        <div className="max-w-5xl mx-auto bg-white border border-blue-200 rounded-xl shadow-lg p-6 space-y-4">
          <h2 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
            📊 Job Description Feedback
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Get AI-powered feedback based on your resume and job description.
          </p>
          <JDFeedback />
        </div>
      </section>
    </div>
  );
}
