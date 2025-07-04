// import { useState } from "react";
// import { UploadCloud, GaugeCircle, CheckCircle, XCircle, Loader2, ChevronDown, ChevronUp, FileText, Palette, Target, PenTool, BookOpen, Wand2, Download, RefreshCw, Clipboard, BrainCircuit } from "lucide-react";
// import useResumeStore from "../store/useResumeStore";

// const AnalysisCategory = ({ categoryKey, data }) => {
//   const [isOpen, setIsOpen] = useState(true);
//   const styles = {
//     tailoring: { icon: Target, color: "blue", title: "Tailoring" },
//     format: { icon: FileText, color: "purple", title: "Format" },
//     content: { icon: BookOpen, color: "green", title: "Content" },
//     sections: { icon: PenTool, color: "yellow", title: "Sections" },
//     style: { icon: Palette, color: "red", title: "Style" }
//   };
  
//   const { icon: Icon, color, title } = styles[categoryKey];
//   const scoreColor = data.score >= 80 ? 'text-green-600' : data.score >= 60 ? 'text-yellow-600' : 'text-red-600';
//   const borderColor = `border-${color}-200`;
//   const textColor = `text-${color}-800`;
//   const hoverBgColor = `hover:bg-${color}-50`;
//   const iconColor = `text-${color}-500`;

//   return (
//     <div className={`mb-4 border ${borderColor} rounded-md shadow-sm bg-white`}>
//       <button 
//         onClick={() => setIsOpen(!isOpen)} 
//         className={`w-full flex justify-between items-center px-4 py-3 font-semibold text-left ${textColor} ${hoverBgColor} rounded-t-md`}
//       >
//         <span className="flex items-center gap-3">
//           <Icon className={`w-6 h-6 ${iconColor}`} />
//           <span>{title}</span>
//         </span>
//         <div className="flex items-center gap-4">
//           <span className={`text-xl font-bold ${scoreColor}`}>
//             {data.score}<span className="text-gray-500">/100</span>
//           </span>
//           {isOpen ? <ChevronUp /> : <ChevronDown />}
//         </div>
//       </button>
//       {isOpen && (
//         <div className="p-4 border-t border-gray-200">
//           <p className="mb-4 text-sm text-gray-600 italic">"{data.feedback}"</p>
//           <ul className="space-y-2">
//             {data.details.map((item, i) => (
//               <li key={i} className="flex items-start gap-3 text-sm">
//                 {item.passed ? (
//                   <CheckCircle className="w-5 h-5 text-green-500 mt-0.5"/>
//                 ) : (
//                   <XCircle className="w-5 h-5 text-red-500 mt-0.5"/>
//                 )}
//                 <div>
//                   <span className="font-semibold">{item.criterion}:</span>
//                   <span className="ml-1">{item.comment}</span>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// };

// const LoadingView = () => (
//   <div className="flex flex-col items-center justify-center min-h-[80vh] text-purple-600">
//     <Loader2 className="w-12 h-12 animate-spin mb-4" />
//     <p className="text-xl font-medium">Analyzing...</p>
//   </div>
// );

// const InitialUploadView = ({ resumeFile, setResumeFile, handleInitialAnalysis, error, reset }) => (
//   <div className="flex items-center justify-center min-h-[90vh]">
//     <div className="max-w-2xl w-full bg-white rounded-xl shadow-2xl p-8 space-y-6">
//       <h2 className="text-3xl font-bold text-gray-800 text-center">ATS Resume Checker</h2>
//       <p className="text-gray-500 text-center">Get a detailed analysis of your resume and optimize it against any job description.</p>
      
//       <div>
//         <label className="font-semibold text-gray-700 flex items-center gap-2 mb-2">
//           <UploadCloud className="text-purple-500"/>1. Upload Your Resume
//         </label>
//         <label className="flex items-center justify-center p-4 bg-gray-50 rounded-lg cursor-pointer border-2 border-dashed border-gray-300 hover:bg-gray-100">
//           <span className="text-gray-600 font-medium">
//             {resumeFile ? `✅ ${resumeFile.name}` : "Click to select file (.docx )"}
//           </span>
//           <input 
//             type="file" 
//             accept=".pdf,.docx" 
//             className="hidden" 
//             onChange={(e) => setResumeFile(e.target.files[0])} ////event handler
//           />
//         </label>
//       </div>
      
//       {error && (
//         <p className="text-sm text-red-600 text-center bg-red-50 p-2 rounded-md">
//           ❌ {error}
//         </p>
//       )}
      
//       <button 
//         onClick={handleInitialAnalysis} 
//         disabled={!resumeFile} 
//         className="w-full flex items-center justify-center gap-3 py-3 bg-purple-600 text-white text-lg font-semibold rounded-md hover:bg-purple-700 disabled:bg-gray-400"
//       >
//         <BrainCircuit /> Get Initial Score
//       </button>
      
//       <button 
//         onClick={reset} 
//         className="w-full text-center text-sm text-gray-500 hover:text-gray-700 mt-2"
//       >
//         Start Over
//       </button>
//     </div>
//   </div>
// );

// const AnalysisView = ({ isInitial, analysis, keywordGaps, jdText, setJdText, handleMatchAnalysis, handleGenerateQuestions, error }) => {
//   const score = analysis?.overall_score;
//   const scoreColor = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';
  
//   return (
//     <div className="max-w-4xl mx-auto space-y-6">
//       <div className="bg-white rounded-xl shadow-lg p-6">
//         <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
//           {isInitial ? "Initial Analysis Report" : "Resume vs. Job Description Match"}
//         </h3>
        
//         <div className="text-center mb-6">
//           <p className="text-sm text-gray-500">Overall Score</p>
//           <div className={`text-6xl font-bold ${scoreColor}`}>
//             {score}<span className="text-3xl text-gray-400">/100</span>
//           </div>
//           <p className="mt-2 text-gray-700 font-medium max-w-md mx-auto">
//             {analysis?.summary}
//           </p>
//         </div>
        
//         {!isInitial && keywordGaps && (
//           <div className="mb-6 border-t pt-4">
//             <h4 className="font-semibold text-lg mb-2 text-gray-800">Keyword Gap Analysis</h4>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="bg-red-50 p-3 rounded-md border border-red-200">
//                 <h5 className="font-bold text-red-700 mb-2">Missing Keywords</h5>
//                 <div className="flex flex-wrap gap-2">
//                   {keywordGaps.missing_keywords?.map(kw => (
//                     <span key={kw} className="bg-red-200 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
//                       {kw}
//                     </span>
//                   ))}
//                 </div>
//                 {keywordGaps.missing_qualifications?.length > 0 && (
//                   <>
//                     <h5 className="font-bold text-red-700 mt-3 mb-2">Missing Qualifications</h5>
//                     <ul className="list-disc pl-5 text-sm text-red-700">
//                       {keywordGaps.missing_qualifications.map((q, i) => (
//                         <li key={i}>{q}</li>
//                       ))}
//                     </ul>
//                   </>
//                 )}
//               </div>
//               <div className="bg-green-50 p-3 rounded-md border border-green-200">
//                 <h5 className="font-bold text-green-700 mb-2">Matched Keywords</h5>
//                 <div className="flex flex-wrap gap-2">
//                   {keywordGaps.present_keywords?.map(kw => (
//                     <span key={kw} className="bg-green-200 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
//                       {kw}
//                     </span>
//                   ))}
//                 </div>
//                 {keywordGaps.matched_qualifications?.length > 0 && (
//                   <>
//                     <h5 className="font-bold text-green-700 mt-3 mb-2">Matched Qualifications</h5>
//                     <ul className="list-disc pl-5 text-sm text-green-700">
//                       {keywordGaps.matched_qualifications.map((q, i) => (
//                         <li key={i}>{q}</li>
//                       ))}
//                     </ul>
//                   </>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}

//         <div className="max-h-[500px] overflow-y-auto pr-2">
//           {analysis && Object.entries(analysis.analysis_breakdown).map(([key, value]) => (
//             <AnalysisCategory key={key} categoryKey={key} data={value} />
//           ))}
//         </div>
//       </div>

//       {isInitial ? (
//         <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
//           <h3 className="text-2xl font-bold text-gray-800 text-center">Next: Match with a Job</h3>
//           <label htmlFor="jd" className="font-semibold text-gray-700 flex items-center gap-2">
//             <Clipboard/>2. Paste Job Description
//           </label>
//           <textarea 
//             id="jd" 
//             rows="6" //////Sets the visible height of the textarea to 6 lines tall
//             value={jdText} 
//             onChange={(e) => setJdText(e.target.value)} 
//             className="w-full p-3 border rounded-md focus:ring-2 focus:ring-purple-500" 
//             placeholder="Paste the job description here..."
//           ></textarea>
          
//           {error && (
//             <p className="text-sm text-red-600 text-center bg-red-50 p-2 rounded-md">
//               ❌ {error}
//             </p>
//           )}
          
//           <button 
//             onClick={handleMatchAnalysis} 
//             disabled={!jdText.trim()} 
//             className="w-full flex items-center justify-center gap-3 py-3 bg-purple-600 text-white text-lg font-semibold rounded-md hover:bg-purple-700 disabled:bg-gray-400"
//           >
//             Analyze Match
//           </button>
//         </div>
//       ) : (
//         <div className="bg-white rounded-xl shadow-lg p-6 text-center">
//           <h3 className="text-2xl font-bold text-gray-800 mb-4">Ready to Improve Your Score?</h3>
//           <p className="text-gray-600 mb-4">Let's generate questions to fill the gaps we found.</p>
//           <button 
//             onClick={handleGenerateQuestions} 
//             className="flex items-center justify-center mx-auto gap-3 py-3 px-6 bg-green-600 text-white text-lg font-semibold rounded-md hover:bg-green-700"
//           >
//             <Wand2/> Start Optimization
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// const OptimizerView = ({ questions, answers, setAnswer, handleOptimize, error }) => (
//   <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 space-y-6">
//     <h2 className="text-3xl font-bold text-gray-800 text-center">Fill the Gaps</h2>
//     <p className="text-center text-gray-600">
//       Your answers will be used to add powerful, metric-driven bullet points to your resume.
//     </p>
    
//     <div className="space-y-4 pt-4 border-t">
//       {questions.map((q, i) => (
//         <div key={i}>
//           <label className="text-md font-medium text-gray-700">
//             {i + 1}. {q}
//           </label>
//           <input 
//             type="text" 
//             value={answers[q] || ''}
//             onChange={(e) => setAnswer(q, e.target.value)} 
//             className="w-full mt-1 p-2 border rounded-md focus:ring-1 focus:ring-purple-500" 
//             placeholder="Your specific, quantifiable answer..."
//           />
//         </div>
//       ))}
//     </div>
    
//     {error && (
//       <p className="text-sm text-red-600 text-center bg-red-50 p-2 rounded-md">
//         ❌ {error}
//       </p>
//     )}
    
//     <button 
//       onClick={handleOptimize} 
//       className="w-full flex items-center justify-center gap-3 py-3 bg-green-600 text-white text-lg font-semibold rounded-md hover:bg-green-700"
//     >
//       <Wand2/> Create My Optimized Resume
//     </button>
//   </div>
// );

// const ResultView = ({ optimizedResumeFile, downloadFile, handleRecheck, analysis, error }) => {
//   const [isChecking, setIsChecking] = useState(false);
//   const [showResults, setShowResults] = useState(false);
  
//   const handleCheckAndShow = async () => {
//     setIsChecking(true);
//     try {
//       const success = await handleRecheck();
//       if (success) {
//         setShowResults(true);
//       }
//     } finally {
//       setIsChecking(false);
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-[90vh]">
//       <div className="max-w-lg w-full bg-white p-8 rounded-xl shadow-2xl text-center space-y-4">
//         {showResults ? (
//           <>
//             <CheckCircle className="w-16 h-16 text-green-500 mx-auto"/>
//             <h2 className="text-3xl font-bold text-gray-800">Optimization Results</h2>
//             <div className="text-center">
//               <p className="text-gray-600 mb-2">Your new ATS score:</p>
//               <div className={`text-5xl font-bold ${
//                 analysis?.overall_score >= 80 ? 'text-green-600' : 
//                 analysis?.overall_score >= 60 ? 'text-yellow-600' : 'text-red-600'
//               }`}>
//                 {analysis?.overall_score}<span className="text-2xl text-gray-400">/100</span>
//               </div>
//               {analysis?.summary && (
//                 <p className="mt-3 text-gray-600 italic">"{analysis.summary}"</p>
//               )}
//             </div>
//             <button 
//               onClick={downloadFile} 
//               className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
//             >
//               <Download/> Download Optimized Resume
//             </button>
//           </>
//         ) : (
//           <>
//             <Wand2 className="w-16 h-16 text-purple-500 mx-auto"/>
//             <h2 className="text-3xl font-bold text-gray-800">Optimization Complete</h2>
//             <p className="text-gray-600 mb-6">
//               Let's check how much your score improved.
//             </p>
//             {error && (
//               <p className="text-sm text-red-600 text-center bg-red-50 p-2 rounded-md mb-4">
//                 ❌ {error}
//               </p>
//             )}
//             <button 
//               onClick={handleCheckAndShow}
//               disabled={isChecking}
//               className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 disabled:bg-purple-400"
//             >
//               {isChecking ? (
//                 <>
//                   <Loader2 className="animate-spin"/> Checking...
//                 </>
//               ) : (
//                 <>
//                   <RefreshCw/> Check Improved Score
//                 </>
//               )}
//             </button>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default function AnalyzeAtsScore() {
//   const { 
//     currentStep, 
//     isLoading, 
//     setIsLoading,
//     resumeFile,
//     setResumeFile,
//     jdText,
//     setJdText,
//     setAnalysis,
//     setFileId,
//     setParsedResumeText,
//     setCurrentStep,
//     analysis,
//     setQuestions,
//     parsedResumeText,
//     keywordGaps,
//     setKeywordGaps,
//     questions,
//     answers,
//     setAnswer,
//     fileId,
//     setOptimizedResumeFile,
//     optimizedResumeFile,
//     reset,
//     addScoreToHistory
//   } = useResumeStore();

//   const [error, setError] = useState(null);

//   const handleInitialAnalysis = async () => {
//     if (!resumeFile) {
//       setError("Please upload your resume first.");
//       return;
//     }
    
//     setIsLoading(true);
//     setError(null);
    
//     const formData = new FormData();
//     formData.append("resume_file", resumeFile);
    
//     try {
//       const res = await fetch("http://localhost:5000/analyze_resume", {
//         method: "POST",
//         body: formData
//       });
      
//       const data = await res.json();/////convert responce from server into jon format
      
//       if (res.ok) {
//         setAnalysis(data);
//         setFileId(data.file_id);
//         setParsedResumeText(data.parsed_resume_text);
//         addScoreToHistory(data.overall_score);
//         setCurrentStep('SHOW_INITIAL_ANALYSIS');
//       } else {
//         setError(data.error || "Analysis failed.");
//       }
//     } catch (err) {
//       setError("Network error.");
//     }
    
//     setIsLoading(false);
//   };

//   const handleMatchAnalysis = async () => {
//     if (!jdText.trim()) {
//       setError("Please paste the job description.");
//       return;
//     }
    
//     setIsLoading(true);
//     setError(null);
    
//     const formData = new FormData();
//     formData.append("resume_file", resumeFile);
//     formData.append("jd_text", jdText);
    
//     try {
//       const [analysisRes, gapsRes] = await Promise.all([
//         fetch("http://localhost:5000/analyze_resume", {
//           method: "POST",
//           body: formData
//         }),
//         fetch("http://localhost:5000/get_keyword_gaps", {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ 
//             jd_text: jdText, 
//             resume_text: parsedResumeText 
//           })
//         })
//       ]);
      
//       const analysisData = await analysisRes.json();
//       const gapsData = await gapsRes.json();

//       if (analysisRes.ok) {
//         setAnalysis(analysisData);
//         addScoreToHistory(analysisData.overall_score);
//       } else {
//         setError(analysisData.error || "Analysis failed.");
//       }

//       if (gapsRes.ok) {
//         setKeywordGaps(gapsData);
//       }
      
//       if (analysisRes.ok) {
//         setCurrentStep('SHOW_MATCH_ANALYSIS');
//       }
//     } catch (err) {
//       setError("Network error.");
//     }
    
//     setIsLoading(false);
//   };
  
//   const handleGenerateQuestions = async () => {
//     setIsLoading(true);
    
//     try {
//       const res = await fetch("http://localhost:5000/generate_questions", {
//         method: "POST",
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ 
//           jd_text: jdText, 
//           resume_text: parsedResumeText 
//         })
//       });
      
//       const data = await res.json();
      
//       if (res.ok) {
//         setQuestions(data.questions || []);
//         setCurrentStep('OPTIMIZING');
//       } else {
//         setError(data.error || "Failed to generate questions.");
//       }
//     } catch (err) {
//       setError("Network error.");
//     }
    
//     setIsLoading(false);
//   };

//   const handleOptimize = async () => {
//     setIsLoading(true);
    
//     try {
//       const res = await fetch("http://localhost:5000/optimize_resume", {
//         method: "POST",
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ 
//           jd_text: jdText, 
//           answers, 
//           file_id: fileId 
//         })
//       });
      
//       if (res.ok) {
//         const blob = await res.blob();
//         const file = new File([blob], 'Optimized_Resume.docx', { 
//           type: res.headers.get('content-type') 
//         });
        
//         setOptimizedResumeFile(file);
//         setCurrentStep('RESULT');
//       } else {
//         const data = await res.json();
//         setError(data.error || "Optimization failed.");
//       }
//     } catch(err) {
//       setError("Network error.");
//     }
    
//     setIsLoading(false);
//   };

//   const handleRecheck = async () => {
//     setError(null);
  
//     const formData = new FormData();
//     formData.append("resume_file", optimizedResumeFile);
//     formData.append("jd_text", jdText);
  
//     try {
//       const analysisRes = await fetch("http://localhost:5000/analyze_resume", {
//         method: "POST",
//         body: formData,
//       });
  
//       const analysisData = await analysisRes.json();
//       if (!analysisRes.ok) {
//         setError(analysisData.error || "Re-check failed during analysis.");
//         return false;
//       }
  
//       setAnalysis(analysisData);
//       setFileId(analysisData.file_id);
//       setParsedResumeText(analysisData.parsed_resume_text);
//       addScoreToHistory(analysisData.overall_score);
  
//       const newResumeText = analysisData.parsed_resume_text;
//       const gapsRes = await fetch("http://localhost:5000/get_keyword_gaps", {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           jd_text: jdText,
//           resume_text: newResumeText,
//         }),
//       });
      
//       const gapsData = await gapsRes.json();
//       if (gapsRes.ok) {
//         setKeywordGaps(gapsData);
//       } else {
//         console.error("Failed to update keyword gaps:", gapsData.error);
//       }
  
//       setResumeFile(optimizedResumeFile); 
//       return true;
  
//     } catch (err) {
//       setError("Network error during re-check.");
//       return false;
//     }
//   };

//   const downloadFile = () => {
//     const url = URL.createObjectURL(optimizedResumeFile);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = optimizedResumeFile.name;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(url);
//   };

//   const renderStep = () => {
//     if (isLoading) return <LoadingView />;
    
//     switch (currentStep) {
//       case 'INITIAL_UPLOAD':
//         return (
//           <InitialUploadView 
//             resumeFile={resumeFile}
//             setResumeFile={setResumeFile}
//             handleInitialAnalysis={handleInitialAnalysis}
//             error={error}
//             reset={reset}
//           />
//         );
//       case 'SHOW_INITIAL_ANALYSIS':
//         return (
//           <AnalysisView 
//             isInitial={true}
//             analysis={analysis}
//             jdText={jdText}
//             setJdText={setJdText}
//             handleMatchAnalysis={handleMatchAnalysis}
//             error={error}
//           />
//         );
//       case 'SHOW_MATCH_ANALYSIS':
//         return (
//           <AnalysisView 
//             isInitial={false}
//             analysis={analysis}
//             keywordGaps={keywordGaps}
//             handleGenerateQuestions={handleGenerateQuestions}
//           />
//         );
//       case 'OPTIMIZING':
//         return (
//           <OptimizerView 
//             questions={questions}
//             answers={answers}
//             setAnswer={setAnswer}
//             handleOptimize={handleOptimize}
//             error={error}
//           />
//         );
//       case 'RESULT':
//         return (
//           <ResultView 
//             optimizedResumeFile={optimizedResumeFile}
//             downloadFile={downloadFile}
//             handleRecheck={handleRecheck}
//             analysis={analysis}
//             error={error}
//           />
//         );
//       default:
//         return <InitialUploadView />;
//     }
//   };

//   return <div className="min-h-screen bg-gray-50 p-4">{renderStep()}</div>;
// }





import { useState } from "react";
import { 
    UploadCloud, GaugeCircle, CheckCircle, XCircle, Loader2, ChevronDown, 
    ChevronUp, FileText, Palette, Target, PenTool, BookOpen, Wand2, 
    Download, RefreshCw, Clipboard, BrainCircuit, ArrowUp, BarChart as BarChartIcon 
} from "lucide-react";
import useResumeStore from "../store/useResumeStore";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

// --- UI/UX ENHANCEMENT: Static color mapping for Tailwind CSS ---
// This prevents issues with dynamic class name purging in production builds.
const categoryStyles = {
    tailoring: { icon: Target, title: "Tailoring", styles: { border: 'border-blue-200', text: 'text-blue-800', hoverBg: 'hover:bg-blue-50', icon: 'text-blue-500' }},
    format: { icon: FileText, title: "Format", styles: { border: 'border-purple-200', text: 'text-purple-800', hoverBg: 'hover:bg-purple-50', icon: 'text-purple-500' }},
    content: { icon: BookOpen, title: "Content", styles: { border: 'border-green-200', text: 'text-green-800', hoverBg: 'hover:bg-green-50', icon: 'text-green-500' }},
    sections: { icon: PenTool, title: "Sections", styles: { border: 'border-yellow-200', text: 'text-yellow-800', hoverBg: 'hover:bg-yellow-50', icon: 'text-yellow-500' }},
    style: { icon: Palette, title: "Style", styles: { border: 'border-red-200', text: 'text-red-800', hoverBg: 'hover:bg-red-50', icon: 'text-red-500' }}
};

const AnalysisCategory = ({ categoryKey, data }) => {
    const [isOpen, setIsOpen] = useState(true);
    const { icon: Icon, title, styles } = categoryStyles[categoryKey];
    const scoreColor = data.score >= 80 ? 'text-green-600' : data.score >= 60 ? 'text-yellow-600' : 'text-red-600';

    return (
        <div className={`mb-4 border ${styles.border} rounded-lg shadow-sm bg-white overflow-hidden`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex justify-between items-center px-4 py-3 font-semibold text-left ${styles.text} ${styles.hoverBg} transition-colors duration-200`}
            >
                <span className="flex items-center gap-3">
                    <Icon className={`w-6 h-6 ${styles.icon}`} />
                    <span>{title}</span>
                </span>
                <div className="flex items-center gap-4">
                    <span className={`text-xl font-bold ${scoreColor}`}>
                        {data.score}<span className="text-sm text-gray-500">/100</span>
                    </span>
                    {isOpen ? <ChevronUp /> : <ChevronDown />}
                </div>
            </button>
            {isOpen && (
                <div className="p-4 border-t border-gray-200">
                    <p className="mb-4 text-sm text-gray-600 italic">"{data.feedback}"</p>
                    <ul className="space-y-2">
                        {data.details.map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm">
                                {item.passed ? (
                                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"/>
                                ) : (
                                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0"/>
                                )}
                                <div>
                                    <span className="font-semibold">{item.criterion}:</span>
                                    <span className="ml-1 text-gray-700">{item.comment}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

// --- UI/UX ENHANCEMENT 1: Engaging loading animation ---
const EngagingLoader = () => (
    <div className="relative w-40 h-40">
      <div className="absolute inset-0 rounded-full border-2 border-purple-300 opacity-50 animate-pulse"></div>
      <div className="absolute inset-3 rounded-full border-2 border-purple-400 opacity-50 animate-pulse" style={{animationDelay: '0.2s'}}></div>
      <div className="absolute inset-6 rounded-full border-2 border-purple-500 opacity-50 animate-pulse" style={{animationDelay: '0.4s'}}></div>
      <div 
        className="absolute top-1/2 left-1/2 w-1/2 h-0.5 bg-gradient-to-r from-transparent to-purple-500 origin-left animate-spin" 
        style={{ animationDuration: '2s' }}
      ></div>
    </div>
  );
  
const LoadingView = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-purple-600">
        <EngagingLoader />
        <p className="text-2xl font-medium mt-8 tracking-wider text-gray-700">ANALYZING YOUR FUTURE...</p>
        <p className="text-gray-500 mt-2">Our AI is meticulously scanning your resume.</p>
    </div>
);


const InitialUploadView = ({ resumeFile, setResumeFile, handleInitialAnalysis, error, reset, jdText, setJdText }) => (
    <div className="flex items-center justify-center min-h-[90vh]">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-2xl p-8 space-y-6">
            <h2 className="text-3xl font-bold text-gray-800 text-center">ATS Resume Checker</h2>
            <p className="text-gray-500 text-center">Upload your resume and job description to get started.</p>
            <div>
                <label className="font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <UploadCloud className="text-purple-500"/>1. Upload Your Resume
                </label>
                <label className="flex items-center justify-center p-4 bg-gray-50 rounded-lg cursor-pointer border-2 border-dashed border-gray-300 hover:bg-gray-100 transition-colors">
                    <span className="text-gray-600 font-medium">
                        {resumeFile ? `✅ ${resumeFile.name}` : "Click to select file (.docx or .pdf)"}
                    </span>
                    <input type="file" accept=".pdf,.docx" className="hidden" onChange={(e) => setResumeFile(e.target.files[0])} />
                </label>
            </div>
            <div>
                <label htmlFor="jd" className="font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <Clipboard/>2. Paste Job Description
                </label>
                <textarea id="jd" rows="6" value={jdText} onChange={(e) => setJdText(e.target.value)} className="w-full p-3 border rounded-md focus:ring-2 focus:ring-purple-500 transition-shadow" placeholder="Paste the job description here..."></textarea>
            </div>
            {error && <p className="text-sm text-red-600 text-center bg-red-50 p-2 rounded-md">❌ {error}</p>}
            <button onClick={handleInitialAnalysis} disabled={!resumeFile || !jdText.trim()} className="w-full flex items-center justify-center gap-3 py-3 bg-purple-600 text-white text-lg font-semibold rounded-md hover:bg-purple-700 disabled:bg-gray-400 transition-all transform hover:scale-105 disabled:transform-none">
                <BrainCircuit /> Analyze Resume
            </button>
            <button onClick={reset} className="w-full text-center text-sm text-gray-500 hover:text-gray-700 mt-2">Start Over</button>
        </div>
    </div>
);

// --- UI/UX ENHANCEMENT 2a: Keyword Analysis Chart ---
const KeywordChart = ({ keywordGaps }) => {
    if (!keywordGaps) return null;
    const data = [{
        name: 'Keywords Fit',
        Matched: (keywordGaps.present_keywords?.length || 0) + (keywordGaps.matched_qualifications?.length || 0),
        Missing: (keywordGaps.missing_keywords?.length || 0) + (keywordGaps.missing_qualifications?.length || 0),
    }];
    return (
        <div className="my-6 p-4 bg-gray-50 rounded-lg border">
            <h4 className="font-semibold text-lg mb-4 text-gray-800 text-center flex items-center justify-center gap-2"><BarChartIcon size={20}/> Resume vs. Job Description Fit</h4>
            <ResponsiveContainer width="100%" height={80}>
                <BarChart data={data} layout="vertical" barSize={30}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" hide />
                    <Tooltip cursor={{fill: 'rgba(240, 240, 240, 0.5)'}} />
                    <Legend wrapperStyle={{ position: 'relative', marginTop: '10px' }}/>
                    <Bar dataKey="Matched" stackId="a" fill="#16a34a" name="Matched Keywords"/> 
                    <Bar dataKey="Missing" stackId="a" fill="#dc2626" name="Missing Keywords"/>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

const AnalysisView = ({ analysis, keywordGaps, handleGenerateQuestions, error }) => {
    const score = analysis?.overall_score;
    const scoreColor = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';
    // --- UI/UX ENHANCEMENT 2b: Local loading state for smoother flow ---
    const [isGenerating, setIsGenerating] = useState(false);

    const handleStartOptimization = async () => {
        setIsGenerating(true);
        await handleGenerateQuestions();
        // The component will unmount on success, so no need to set state back to false
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Resume vs. Job Description Match</h3>
                <div className="text-center mb-6">
                    <p className="text-sm text-gray-500">Overall Match Score</p>
                    <div className={`text-6xl font-bold ${scoreColor}`}>{score}<span className="text-3xl text-gray-400">/100</span></div>
                    <p className="mt-2 text-gray-700 font-medium max-w-2xl mx-auto">{analysis?.summary}</p>
                </div>
                
                {keywordGaps && <KeywordChart keywordGaps={keywordGaps} />}

                {keywordGaps && (
                    <div className="mb-6 border-t pt-4">
                        <h4 className="font-semibold text-lg mb-2 text-gray-800">Keyword Gap Analysis</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-red-50 p-3 rounded-md border border-red-200">
                                <h5 className="font-bold text-red-700 mb-2">Missing Keywords & Qualifications</h5>
                                <div className="flex flex-wrap gap-2">
                                    {keywordGaps.missing_keywords?.map(kw => <span key={kw} className="bg-red-200 text-red-800 text-xs font-medium px-2 py-1 rounded-full">{kw}</span>)}
                                </div>
                                {keywordGaps.missing_qualifications?.length > 0 && (
                                    <ul className="list-disc pl-5 text-sm text-red-700 mt-3">
                                        {keywordGaps.missing_qualifications.map((q, i) => <li key={i}>{q}</li>)}
                                    </ul>
                                )}
                            </div>
                            <div className="bg-green-50 p-3 rounded-md border border-green-200">
                                <h5 className="font-bold text-green-700 mb-2">Matched Keywords & Qualifications</h5>
                                <div className="flex flex-wrap gap-2">
                                    {keywordGaps.present_keywords?.map(kw => <span key={kw} className="bg-green-200 text-green-800 text-xs font-medium px-2 py-1 rounded-full">{kw}</span>)}
                                </div>
                                {keywordGaps.matched_qualifications?.length > 0 && (
                                    <ul className="list-disc pl-5 text-sm text-green-700 mt-3">
                                        {keywordGaps.matched_qualifications.map((q, i) => <li key={i}>{q}</li>)}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                <div className="max-h-[500px] overflow-y-auto pr-2">
                    {analysis && Object.entries(analysis.analysis_breakdown).map(([key, value]) => <AnalysisCategory key={key} categoryKey={key} data={value} />)}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Ready to Improve Your Score?</h3>
                <p className="text-gray-600 mb-4">Let's generate targeted questions to fill the gaps we found and optimize your resume.</p>
                <button onClick={handleStartOptimization} disabled={isGenerating} className="flex items-center justify-center mx-auto gap-3 py-3 px-6 bg-green-600 text-white text-lg font-semibold rounded-md hover:bg-green-700 disabled:bg-green-400 transition-all transform hover:scale-105">
                    {isGenerating ? <><Loader2 className="animate-spin" /> Generating Questions...</> : <><Wand2/> Start Optimization</>}
                </button>
                {error && <p className="text-sm text-red-600 text-center bg-red-50 p-2 rounded-md mt-4">❌ {error}</p>}
            </div>
        </div>
    );
};


const OptimizerView = ({ questions, answers, setAnswer, handleOptimize, error }) => (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 space-y-6">
        <h2 className="text-3xl font-bold text-gray-800 text-center">Fill the Gaps</h2>
        <p className="text-center text-gray-600">Your answers will be used to add powerful, metric-driven bullet points to your resume.</p>
        <div className="space-y-4 pt-4 border-t">
            {questions.map((q, i) => (
                <div key={i}>
                    <label className="text-md font-medium text-gray-700">{i + 1}. {q}</label>
                    <input type="text" value={answers[q] || ''} onChange={(e) => setAnswer(q, e.target.value)} className="w-full mt-1 p-2 border rounded-md focus:ring-1 focus:ring-purple-500" placeholder="Your specific, quantifiable answer..."/>
                </div>
            ))}
        </div>
        {error && <p className="text-sm text-red-600 text-center bg-red-50 p-2 rounded-md">❌ {error}</p>}
        <button onClick={handleOptimize} className="w-full flex items-center justify-center gap-3 py-3 bg-green-600 text-white text-lg font-semibold rounded-md hover:bg-green-700 transition-all transform hover:scale-105">
            <Wand2/> Create My Optimized Resume
        </button>
    </div>
);



// --- UI/UX ENHANCEMENT 4: Impactful Results Display ---
const ScoreImprovement = ({ oldScore, newScore }) => {
    if (oldScore === null || newScore === null || oldScore === newScore) return null;
    const improvement = newScore - oldScore;
    const improvementColor = improvement > 0 ? 'text-green-500' : 'text-red-500';
    return (
        <div className="flex items-center justify-center gap-4 sm:gap-8 my-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-col items-center">
                <span className="text-xs text-gray-500">Old Score</span>
                <span className="text-3xl font-bold text-gray-400">{oldScore}</span>
            </div>
            <div className={`flex flex-col items-center ${improvementColor}`}>
                <ArrowUp className={`w-8 h-8 ${improvement < 0 ? 'transform rotate-180' : ''}`} />
                <span className="font-bold text-lg">{improvement > 0 ? `+${improvement}` : improvement}</span>
            </div>
            <div className="flex flex-col items-center">
                <span className={`text-xs ${improvementColor}`}>New Score</span>
                <span className={`text-5xl font-bold ${improvementColor}`}>{newScore}</span>
                </div>
        </div>
    );
    
}




const EnhancementsSummary = ({ answers }) => {
    const enhancements = [
      "Refined bullet points for quantifiable impact.",
      "Integrated keywords tailored to the job description.",
      "Strengthened action verbs for a more dynamic tone.",
      "Improved formatting for better readability and ATS parsing.",
    ];
    if (Object.values(answers).some(a => a.trim() !== '')) {
      enhancements.push("Incorporated your specific experiences and metrics provided.");
    }
    return (
      <div className="text-left bg-gray-50 p-4 rounded-lg my-6 border">
          <h4 className="font-bold text-lg text-gray-800 mb-3">Summary of Enhancements</h4>
          <ul className="space-y-2">
              {enhancements.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{item}</span>
                  </li>
              ))}
          </ul>
      </div>
    );
};

const ResultView = ({ downloadFile, handleRecheck, analysis, scoreHistory, answers, error }) => {
    const [isChecking, setIsChecking] = useState(false);
    const [showResults, setShowResults] = useState(false);
    
    const handleCheckAndShow = async () => {
        setIsChecking(true);
        try {
            const success = await handleRecheck();
            if (success) {
                setShowResults(true);
            }
        } finally {
            setIsChecking(false);
        }
    };
    
    const newScore = analysis?.overall_score;
    const oldScore = scoreHistory.length > 1 ? scoreHistory[scoreHistory.length - 2] : null;

    return (
        <div className="flex items-center justify-center min-h-[90vh]">
            <div className="max-w-lg w-full bg-white p-8 rounded-xl shadow-2xl text-center space-y-4">
                {showResults ? (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto"/>
                        <h2 className="text-3xl font-bold text-gray-800">Optimization Results</h2>
                        <ScoreImprovement oldScore={oldScore} newScore={newScore} />
                        {analysis?.summary && <p className="mt-3 text-gray-600 italic">"{analysis.summary}"</p>}
                        <EnhancementsSummary answers={answers} />
                        <button onClick={downloadFile} className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-all transform hover:scale-105">
                            <Download/> Download Optimized Resume
                        </button>
                    </motion.div>
                ) : (
                    // --- UI/UX ENHANCEMENT 3: Enhanced Recheck Screen ---
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-white to-purple-50 p-8 rounded-lg">
                        <Wand2 className="w-16 h-16 text-purple-500 mx-auto"/>
                        <h2 className="text-3xl font-bold text-gray-800 mt-4">Almost There!</h2>
                        <p className="text-gray-600 my-4">Your resume has been enhanced. Let's run a final check to see your new and improved score.</p>
                        {error && <p className="text-sm text-red-600 text-center bg-red-50 p-2 rounded-md mb-4">❌ {error}</p>}
                        <button onClick={handleCheckAndShow} disabled={isChecking} className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 disabled:bg-purple-400 transition-all transform hover:scale-105">
                            {isChecking ? <><Loader2 className="animate-spin"/> Checking...</> : <><RefreshCw/> Check Improved Score</>}
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default function AnalyzeAtsScore() {
    const {
        currentStep, isLoading, setIsLoading, resumeFile, setResumeFile, jdText, setJdText, 
        setAnalysis, setFileId, setParsedResumeText, setCurrentStep, analysis, setQuestions, 
        parsedResumeText, keywordGaps, setKeywordGaps, questions, answers, setAnswer, 
        fileId, setOptimizedResumeFile, optimizedResumeFile, reset, addScoreToHistory, scoreHistory
    } = useResumeStore();
    const [error, setError] = useState(null);

    const handleInitialAnalysis = async () => {
        if (!resumeFile) { setError("Please upload your resume first."); return; }
        if (!jdText || jdText.trim() === "") { setError("Please paste the job description."); return; }
        setIsLoading(true);
        setError(null);
        
        const formData = new FormData();
        formData.append("resume_file", resumeFile);
        formData.append("jd_text", jdText);

        try {
            // Fetch analysis first to get parsed text
            const analysisRes = await fetch("http://localhost:5000/analyze_resume", { method: "POST", body: formData });
            const analysisData = await analysisRes.json();

            if (analysisRes.ok) {
                setAnalysis(analysisData);
                setFileId(analysisData.file_id);
                const newParsedText = analysisData.parsed_resume_text;
                setParsedResumeText(newParsedText);
                addScoreToHistory(analysisData.overall_score);

                // Now fetch gaps with the correct parsed text
                const gapsRes = await fetch("http://localhost:5000/get_keyword_gaps", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ jd_text: jdText, resume_text: newParsedText })
                });
                const gapsData = await gapsRes.json();
                if (gapsRes.ok) {
                    setKeywordGaps(gapsData);
                }

                setCurrentStep('SHOW_MATCH_ANALYSIS');
            } else {
                setError(analysisData.error || "Analysis failed.");
            }
        } catch (err) {
            setError("A network error occurred. Please check your connection.");
        }
        setIsLoading(false);
    };

    const handleGenerateQuestions = async () => {
        // NOTE: Deliberately not using global isLoading for a smoother UX on the button
        setError(null);
        try {
            const res = await fetch("http://localhost:5000/generate_questions", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jd_text: jdText, resume_text: parsedResumeText })
            });
            const data = await res.json();
            if (res.ok) {
                setQuestions(data.questions || []);
                setCurrentStep('OPTIMIZING');
            } else {
                setError(data.error || "Failed to generate questions.");
                throw new Error(data.error); // throw to be caught by the caller
            }
        } catch (err) {
            setError(err.message || "Network error during question generation.");
            // Re-throw so the local loading state can be reset
            throw err;
        }
    };
    
    const handleOptimize = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch("http://localhost:5000/optimize_resume", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jd_text: jdText, answers, file_id: fileId })
            });
            if (res.ok) {
                const blob = await res.blob();
                const file = new File([blob], 'Optimized_Resume.docx', { type: res.headers.get('content-type') });
                setOptimizedResumeFile(file);
                setCurrentStep('RESULT');
            } else {
                const data = await res.json();
                setError(data.error || "Optimization failed.");
            }
        } catch(err) {
            setError("Network error during optimization.");
        }
        setIsLoading(false);
    };

    const handleRecheck = async () => {
        setError(null);
        const formData = new FormData();
        formData.append("resume_file", optimizedResumeFile);
        formData.append("jd_text", jdText);

        try {
            const res = await fetch("http://localhost:5000/analyze_resume", { method: "POST", body: formData });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Re-check failed during analysis.");
                return false;
            }
            setAnalysis(data);
            addScoreToHistory(data.overall_score);
            setResumeFile(optimizedResumeFile); // Update the main resume file for future actions
            return true;
        } catch (err) {
            setError("Network error during re-check.");
            return false;
        }
    };
    
    const downloadFile = () => {
        const url = URL.createObjectURL(optimizedResumeFile);
        const link = document.createElement('a');
        link.href = url;
        link.download = optimizedResumeFile.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const renderStep = () => {
        if (isLoading) return <LoadingView />;
        switch (currentStep) {
            case 'INITIAL_UPLOAD':
                return <InitialUploadView resumeFile={resumeFile} setResumeFile={setResumeFile} handleInitialAnalysis={handleInitialAnalysis} error={error} reset={reset} jdText={jdText} setJdText={setJdText} />;
            case 'SHOW_MATCH_ANALYSIS':
                return <AnalysisView analysis={analysis} keywordGaps={keywordGaps} handleGenerateQuestions={handleGenerateQuestions} error={error} />;
            case 'OPTIMIZING':
                return <OptimizerView questions={questions} answers={answers} setAnswer={setAnswer} handleOptimize={handleOptimize} error={error} />;
            case 'RESULT':
                return <ResultView downloadFile={downloadFile} handleRecheck={handleRecheck} analysis={analysis} scoreHistory={scoreHistory} answers={answers} error={error} />;
            default:
                return <InitialUploadView resumeFile={resumeFile} setResumeFile={setResumeFile} handleInitialAnalysis={handleInitialAnalysis} error={error} reset={reset} jdText={jdText} setJdText={setJdText} />;
        }
    };

    return <div className="min-h-screen bg-gray-50 p-4">{renderStep()}</div>;
}