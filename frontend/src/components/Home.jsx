// import React from "react";
// import { RocketIcon, FileTextIcon, SearchIcon } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// const Home = () => {
//   const navigate = useNavigate();

//   return (
//     <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-blue-50 to-blue-100">
//       {/* Hero Section */}
//       <section className="text-center py-20 px-4 animate-fade-in">
//         <h2 className="text-5xl font-extrabold text-blue-800 mb-4 animate-slide-down">
//           Build Smarter Resumes 🚀
//         </h2>

//         <p className="text-lg text-gray-700 max-w-xl mx-auto animate-fade-in-up">
//           Create your professional resume, match it with job descriptions, and
//           get AI-powered feedback instantly.
//         </p>

//         <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up">
//           <button
//             className="flex items-center justify-center px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg text-lg shadow-lg transition-all duration-300"
//             onClick={() => navigate("/resume-builder")}
//           >
//             <RocketIcon className="mr-2" size={20} /> Create Resume
//           </button>

//           <button
//             className="flex items-center justify-center px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-100 text-lg shadow-sm transition-all duration-300"
//             onClick={() => navigate("/analyze")}
//           >
//             <SearchIcon className="mr-2" size={20} /> Analyze Score
//           </button>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section className="bg-white py-16 px-6 animate-fade-in-up">
//         <h3 className="text-3xl font-bold text-center text-blue-800 mb-12">
//           Why Choose ResumeMatcher?
//         </h3>

//         <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto text-center">
//           {[
//             {
//               icon: FileTextIcon,
//               title: "Resume Builder",
//               desc: "Create resumes tailored to your experience level – whether you're a fresher or experienced professional.",
//             },
//             {
//               icon: SearchIcon,
//               title: "JD Matching",
//               desc: "Paste any job description to instantly match and score your resume for ATS compatibility.",
//             },
//             {
//               icon: RocketIcon,
//               title: "AI Feedback",
//               desc: "Get smart suggestions to optimize your resume for recruiters and Applicant Tracking Systems.",
//             },
//           ].map((feature, index) => (
//             <div
//               key={index}
//               className="p-8 bg-blue-50 border border-blue-100 rounded-2xl shadow-md hover:scale-105 transition-all duration-300"
//             >
//               <feature.icon className="mx-auto mb-4 text-blue-700 animate-pulse" size={40} />
//               <h4 className="text-xl font-semibold text-blue-800 mb-2">{feature.title}</h4>
//               <p className="text-sm text-gray-600">{feature.desc}</p>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* ATS Information Section */}
//       <section className="py-16 px-6 bg-gradient-to-r from-blue-100 to-blue-50 animate-fade-in-up">
//         <h3 className="text-3xl font-bold text-center text-blue-800 mb-6">
//           What is ATS and Why is it Important?
//         </h3>

//         <div className="max-w-4xl mx-auto text-center text-gray-700 text-lg space-y-4">
//           <p>
//             ATS stands for <span className="font-semibold">Applicant Tracking System</span>. It's software that companies use to
//             filter, rank, and manage job applications automatically.
//           </p>
//           <p>
//             If your resume isn't optimized for ATS, it might never reach human recruiters, even if you're qualified. That's why
//             making your resume ATS-friendly increases your chances of getting noticed.
//           </p>
//           <p className="font-semibold text-blue-700">
//             ResumeMatcher helps you build, analyze, and optimize your resume to pass ATS filters with ease.
//           </p>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default Home;



import React from "react";
import { RocketIcon, FileTextIcon, SearchIcon, ArrowRightIcon, Star, UploadCloud, ScanLine, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import useAuthStore from "../store/useAuthStore";

import { PenTool } from "lucide-react";

// Framer Motion Variants for animations
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeInOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const Home = () => {
  const navigate = useNavigate();
   const { isAuthenticated } = useAuthStore(); // Get authentication status

  
   // Handle "Create New Resume" button click
 const handleCreateResumeClick = () => {
 if (isAuthenticated) {
 navigate("/resume-builder"); // User is logged in, go to resume builder
 } else {
 navigate("/login", { state: { from: "/resume-builder" } }); // Redirect to login with intended destination
 }
 };



  const handleAnalyzeResume = () => {
 if (isAuthenticated) {
 navigate("/analyze"); // User is logged in, go to resume builder
 } else {
 navigate("/login", { state: { from: "/analyze" } }); // Redirect to login with intended destination
 }
 };



  const features = [
    {
      icon: FileTextIcon,
      title: "Intelligent Resume Builder",
      desc: "Effortlessly create a professional, ATS-optimized resume. Our smart editor guides you to include what matters most.",
    },
    {
      icon: SearchIcon,
      title: "Instant JD Analysis",
      desc: "Pinpoint keyword gaps and score your resume's match against any job description in seconds.",
    },
    {
      icon: RocketIcon,
      title: "AI-Powered Optimization",
      desc: "Get concrete, actionable feedback to enhance your resume, boost your score, and secure more interviews.",
    },
  ];

  const testimonials = [
    {
      quote: "This tool was a game-changer. I went from getting no responses to landing three interviews in one week. The AI feedback is spot-on.",
      name: "Sarah L.",
      title: "Software Engineer",
    },
    {
      quote: "As a recent graduate, I had no idea how to write a resume that would pass ATS. ResumeMatcher made it simple and effective.",
      name: "Michael B.",
      title: "Marketing Graduate",
    },
    {
      quote: "The JD matching feature is brilliant. It helped me tailor my resume for each application and finally get noticed by my dream company.",
      name: "Jessica P.",
      title: "Project Manager",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-800 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative w-full py-24 md:py-32 px-6 lg:px-8">
         <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
            <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#C9D6FF,#ffffff)]"></div>
        </div>
        
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center"
        >
          {/* Left Content */}
          <div className="text-center md:text-left">
            <motion.h1 variants={fadeIn} className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tighter">
              Stop Getting Rejected by <span className="text-blue-600">Robots.</span>
            </motion.h1>
            <motion.p variants={fadeIn} className="mt-6 max-w-xl text-lg text-slate-600 mx-auto md:mx-0">
              Your resume's first hurdle isn't a person—it's an algorithm. We give you the tools to craft an ATS-beating resume that recruiters can't ignore.
            </motion.p>
            
            {/* --- BOTH BUTTONS ARE PRESENT HERE --- */}
            <motion.div variants={fadeIn} className="mt-10 flex flex-col sm:flex-row justify-center md:justify-start gap-4">
                {/* Primary Button */}
                <button
                    className="group flex items-center justify-center px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg text-lg font-semibold shadow-lg shadow-blue-500/30 transition-all duration-300 transform hover:scale-105"
                    onClick={handleCreateResumeClick}
                >
                    <PenTool className="mr-2 transition-transform duration-300 group-hover:-rotate-12" size={20} /> Create New Resume
                </button>
                
                {/* Secondary "Analyze Score" Button */}
                <button
                    className="flex items-center justify-center px-6 py-3 border border-slate-300 text-slate-700 bg-white/70 backdrop-blur-sm rounded-lg hover:bg-slate-100 text-lg font-semibold shadow-sm transition-all duration-300"
                    onClick={handleAnalyzeResume}
                >
                    <Sparkles className="mr-2" size={20} /> Analyze Existing
                </button>
            </motion.div>
          </div>

          {/* Right Visual - 'Before & After' concept */}
          <motion.div variants={fadeIn} className="hidden md:flex items-center justify-center gap-4">
              {/* Before */}
              <div className="p-4 bg-white rounded-2xl shadow-lg shadow-slate-500/10 border border-slate-200 w-1/2">
                <div className="text-center font-bold text-red-500 mb-2">BEFORE</div>
                <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl space-y-3">
                    <div className="h-3 bg-slate-200 rounded w-full"></div>
                    <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                    <div className="h-8 bg-red-200/50 border border-red-400 rounded-lg mt-4 flex items-center justify-center">
                        <span className="text-red-700 font-bold">ATS Score: 47%</span>
                    </div>
                     <div className="h-3 bg-slate-200 rounded w-full"></div>
                </div>
              </div>
              <ArrowRightIcon className="text-blue-500 flex-shrink-0" size={32}/>
              {/* After */}
              <div className="p-4 bg-white rounded-2xl shadow-2xl shadow-blue-500/20 border-2 border-blue-500 w-1/2 transform scale-110">
                 <div className="text-center font-bold text-green-500 mb-2">AFTER</div>
                <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl space-y-3">
                    <div className="h-3 bg-slate-200 rounded w-full"></div>
                    <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                    <div className="h-8 bg-green-200/50 border border-green-500 rounded-lg mt-4 flex items-center justify-center">
                        <span className="text-green-700 font-bold">✓ ATS Score: 92%</span>
                    </div>
                     <div className="h-3 bg-slate-200 rounded w-full"></div>
                </div>
              </div>
          </motion.div>
        </motion.div>
      </section>
      
      {/* Features Section */}
      <section className="bg-white py-20 px-6 lg:px-8">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
          className="max-w-6xl mx-auto"
        >
          <motion.h2 variants={fadeIn} className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-4">
            A Smarter Way to Job Hunt
          </motion.h2>
          <motion.p variants={fadeIn} className="text-lg text-center text-slate-600 mb-16 max-w-2xl mx-auto">
            Our platform provides a complete toolkit to take you from application to interview.
          </motion.p>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeIn}
                className="group p-8 bg-slate-50/50 rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="mb-5 w-14 h-14 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:bg-blue-600 transition-all duration-300">
                   <feature.icon className="text-blue-600 group-hover:text-white transition-all duration-300" size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 lg:px-8 bg-slate-50">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
          className="max-w-5xl mx-auto text-center"
        >
          <motion.h2 variants={fadeIn} className="text-3xl md:text-4xl font-bold text-slate-900 mb-16">
            Get Hired in 3 Simple Steps
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8 items-start">
             {[
                { icon: UploadCloud, text: 'Create or Upload' },
                { icon: ScanLine, text: 'Analyze & Score' },
                { icon: Send, text: 'Optimize & Apply' }
             ].map((step, i) => (
                <motion.div key={i} variants={fadeIn} className="flex flex-col items-center">
                    <div className="mb-4 bg-white border-4 border-blue-500 p-5 rounded-full text-blue-600">
                        <step.icon size={40} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-1">{step.text}</h3>
                    <p className="text-2xl font-bold text-slate-300">{`0${i+1}`}</p>
                </motion.div>
             ))}
          </div>
        </motion.div>
      </section>

       {/* Social Proof / Testimonials Section */}
      <section className="bg-white py-20 px-6 lg:px-8">
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="max-w-5xl mx-auto"
        >
            <motion.h2 variants={fadeIn} className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-12">
                Trusted by Job Seekers Like You
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-8">
                {testimonials.map((testimonial) => (
                    <motion.div key={testimonial.name} variants={fadeIn} className="p-8 bg-slate-50/50 rounded-2xl border border-slate-200">
                        <div className="flex mb-4">
                            {[...Array(5)].map((_, i) => <Star key={i} className="text-amber-400 fill-amber-400" size={20}/>)}
                        </div>
                        <p className="text-slate-600 mb-6">"{testimonial.quote}"</p>
                        <div>
                            <p className="font-bold text-slate-800">{testimonial.name}</p>
                            <p className="text-sm text-slate-500">{testimonial.title}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
      </section>


      {/* Final CTA */}
      <footer className="bg-slate-900 text-white py-20 px-6 lg:px-8 text-center">
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeIn}
        >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Noticed?</h2>
            <p className="text-slate-300 max-w-xl mx-auto mb-8">
                Stop guessing and start getting interviews. Build your perfect resume today.
            </p>
            <button
                className="group flex items-center justify-center mx-auto px-8 py-4 bg-white text-blue-600 rounded-lg text-xl font-bold shadow-lg hover:bg-slate-100 transition-all duration-300 transform hover:scale-105"
                onClick={() => navigate("/resume-builder")}
            >
                Start Building for Free <ArrowRightIcon className="ml-2 transition-transform duration-300 group-hover:translate-x-1" size={22} />
            </button>
        </motion.div>
      </footer>
    </div>
  );
};

export default Home;