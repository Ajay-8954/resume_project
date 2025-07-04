import React from "react";
import { RocketIcon, FileTextIcon, SearchIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-blue-50 to-blue-100">
      {/* Hero Section */}
      <section className="text-center py-20 px-4 animate-fade-in">
        <h2 className="text-5xl font-extrabold text-blue-800 mb-4 animate-slide-down">
          Build Smarter Resumes 🚀
        </h2>

        <p className="text-lg text-gray-700 max-w-xl mx-auto animate-fade-in-up">
          Create your professional resume, match it with job descriptions, and
          get AI-powered feedback instantly.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up">
          <button
            className="flex items-center justify-center px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg text-lg shadow-lg transition-all duration-300"
            onClick={() => navigate("/resume-builder")}
          >
            <RocketIcon className="mr-2" size={20} /> Create Resume
          </button>

          <button
            className="flex items-center justify-center px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-100 text-lg shadow-sm transition-all duration-300"
            onClick={() => navigate("/analyze")}
          >
            <SearchIcon className="mr-2" size={20} /> Analyze Score
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16 px-6 animate-fade-in-up">
        <h3 className="text-3xl font-bold text-center text-blue-800 mb-12">
          Why Choose ResumeMatcher?
        </h3>

        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto text-center">
          {[
            {
              icon: FileTextIcon,
              title: "Resume Builder",
              desc: "Create resumes tailored to your experience level – whether you're a fresher or experienced professional.",
            },
            {
              icon: SearchIcon,
              title: "JD Matching",
              desc: "Paste any job description to instantly match and score your resume for ATS compatibility.",
            },
            {
              icon: RocketIcon,
              title: "AI Feedback",
              desc: "Get smart suggestions to optimize your resume for recruiters and Applicant Tracking Systems.",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="p-8 bg-blue-50 border border-blue-100 rounded-2xl shadow-md hover:scale-105 transition-all duration-300"
            >
              <feature.icon className="mx-auto mb-4 text-blue-700 animate-pulse" size={40} />
              <h4 className="text-xl font-semibold text-blue-800 mb-2">{feature.title}</h4>
              <p className="text-sm text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ATS Information Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-blue-100 to-blue-50 animate-fade-in-up">
        <h3 className="text-3xl font-bold text-center text-blue-800 mb-6">
          What is ATS and Why is it Important?
        </h3>

        <div className="max-w-4xl mx-auto text-center text-gray-700 text-lg space-y-4">
          <p>
            ATS stands for <span className="font-semibold">Applicant Tracking System</span>. It's software that companies use to
            filter, rank, and manage job applications automatically.
          </p>
          <p>
            If your resume isn't optimized for ATS, it might never reach human recruiters, even if you're qualified. That's why
            making your resume ATS-friendly increases your chances of getting noticed.
          </p>
          <p className="font-semibold text-blue-700">
            ResumeMatcher helps you build, analyze, and optimize your resume to pass ATS filters with ease.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
