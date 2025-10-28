import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const backendUrl = 'http://localhost:5000';

const StartPage = () => {
  const navigate = useNavigate();
  const [pastJds, setPastJds] = useState([]);
  const [selectedJd, setSelectedJd] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jdDetails, setJdDetails] = useState({});
  const [limit, setLimit] = useState(10);

  // Fetch past JDs when component loads
  useEffect(() => {
    const fetchPastJds = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/get-past-jds`);
        const data = await response.json();
        if (data.jds) {
          setPastJds(data.jds);
          fetchJdDetails(data.jds);
        }
      } catch (err) {
        console.error("Failed to fetch past JDs:", err);
      }
    };

    fetchPastJds();
  }, []);

  // Fetch JD details to get job roles
  const fetchJdDetails = async (jds) => {
    const details = {};
    for (const jd of jds) {
      try {
        const response = await fetch(`${backendUrl}/api/get-jd/${jd.jd_id}`);
        if (response.ok) {
          const data = await response.json();
          details[jd.jd_id] = {
            jobRole: data.extracted_data?.jobRole || data.filters?.jobRole || 'Not Specified',
            original_text: data.original_text
          };
        }
      } catch (error) {
        console.error(`Error fetching JD ${jd.jd_id}:`, error);
        details[jd.jd_id] = {
          jobRole: 'Not Available',
          original_text: jd.job_description
        };
      }
    }
    setJdDetails(details);
  };

  const displayedJds = pastJds.slice(0, limit);

  // Function to navigate to resume upload page
  const handleUploadResumes = (jdId) => {
    navigate(`./resume-upload/${jdId}`);
  };

  // Function to navigate to results page
  const handleViewResults = (jdId) => {
    navigate(`./results/${jdId}`);
  };

  // Function to fetch and download CSV
  const handleDownloadCSV = async (jdId) => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/download-results/${jdId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `results_${jdId}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download CSV. Please try again.');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed. Check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100 p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Welcome Section - Enhanced with Fade-in and Scale Animation */}
      <div className="flex flex-col items-center justify-center text-center mb-8 pt-8 relative z-10 animate-fade-in-up">
        <div className="relative w-32 h-32 mb-6 transform transition-all duration-1000 ease-out hover:rotate-12 group">
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full blur opacity-20 animate-ping-slow"></div>
          <div className="relative animate-bounce-slow text-6xl group-hover:animate-spin-slow transition-all duration-500">
            🚀
          </div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-purple-500 font-bold animate-pulse">Launch!</div>
        </div>
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-800 via-purple-600 to-indigo-700 mb-4 transform transition-all duration-700 hover:scale-105">
          Welcome, HR!
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-md leading-relaxed transform transition-all duration-500 opacity-0 animate-fade-in delay-300">
          Let's find the perfect candidates for your job role with a touch of magic ✨
        </p>
        <button
          onClick={() => navigate('/filter-resumes/jd-input')}
          className="group relative bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-white font-bold py-4 px-10 rounded-full shadow-xl hover:shadow-2xl transform transition-all duration-300 ease-out hover:scale-110 focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-offset-2 mb-8 overflow-hidden"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></span>
          <span className="relative">🚀 Upload JD</span>
        </button>
      </div>

      {/* Past Results Section - Enhanced with Slide-in and Glow Effects */}
      {pastJds.length > 0 && (
        <div className="bg-white/80  backdrop-blur-sm p-8 rounded-3xl shadow-2xl w-full max-w-7xl mx-auto border border-white/20 relative z-10 transform transition-all duration-1000 ease-out animate-slide-in-up delay-500">
          <h2 className="text-3xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-gray-800 via-purple-600 to-indigo-700 relative">
            Previous Job Descriptions
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full blur opacity-30 animate-pulse"></div>
          </h2>

          <div className="flex justify-end mb-4">
            <div className="flex items-center space-x-2 bg-white p-2 rounded-lg shadow">
              <label className="text-sm text-gray-600">Show entries:</label>
              <input 
                type="number" 
                min="1" 
                value={limit} 
                onChange={(e) => setLimit(parseInt(e.target.value) || 1)}
                className="w-20 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="overflow-auto max-h-96">
            <table className="w-full border-collapse border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              <thead className="bg-gradient-to-r from-purple-100 via-indigo-100 to-pink-100 text-gray-800">
                <tr>
                  <th className="border border-gray-300 px-6 py-4 text-left font-semibold transform transition-all duration-300 hover:scale-105">Job Role</th>
                  <th className="border border-gray-300 px-6 py-4 text-left font-semibold transform transition-all duration-300 hover:scale-105">JD Preview</th>
                  <th className="border border-gray-300 px-6 py-4 text-left font-semibold transform transition-all duration-300 hover:scale-105">Upload Resumes</th>
                  <th className="border border-gray-300 px-6 py-4 text-left font-semibold transform transition-all duration-300 hover:scale-105">View Results</th>
                  <th className="border border-gray-300 px-6 py-4 text-left font-semibold transform transition-all duration-300 hover:scale-105">Download</th>
                  <th className="border border-gray-300 px-6 py-4 text-left font-semibold transform transition-all duration-300 hover:scale-105">Uploaded Date</th>
                </tr>
              </thead>
              <tbody>
                {displayedJds.map((jd, index) => (
                  <tr 
                    key={index} 
                    className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all duration-500 ease-out transform hover:scale-[1.01] hover:shadow-lg"
                  >
                    {/* Job Role Column */}
                    <td className="border border-gray-300 px-6 py-4 animate-fade-in delay-1000">
                      <div className="font-bold text-gray-800 transform transition-all duration-300 hover:text-purple-600">
                        {jdDetails[jd.jd_id]?.jobRole || 'Loading...'}
                      </div>
                      <div className="text-sm text-gray-500 font-mono mt-2 bg-gray-100 px-3 py-1 rounded-full inline-block animate-pulse-slow">
                        ID: {jd.jd_id.substring(0, 8)}...
                      </div>
                    </td>
                    
                    {/* JD Preview Column */}
                    <td className="border border-gray-300 px-6 py-4">
                      <button
                        onClick={() => setSelectedJd({
                          ...jd,
                          jobRole: jdDetails[jd.jd_id]?.jobRole || 'Not Specified'
                        })}
                        className="text-purple-600 hover:text-purple-800  text-base font-semibold transform transition-all duration-300 hover:scale-105 hover:rotate-1"
                      >
                        View Full JD
                      </button>
                    </td>
                    
                    {/* Upload Resumes Column */}
                    <td className="border border-gray-300 px-6 py-4">
                      <button
                        onClick={() => handleUploadResumes(jd.jd_id)}
                        className="group relative bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl text-sm hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg w-full font-semibold overflow-hidden"
                      >
                        <span className="absolute inset-0 bg-white/20 transform skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></span>
                        <span className="relative">📤 Upload Resumes</span>
                      </button>
                    </td>
                    
                    {/* View Results Column */}
                    <td className="border border-gray-300 px-6 py-4">
                      <button
                        onClick={() => handleViewResults(jd.jd_id)}
                        className="group relative bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl text-sm hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg w-full font-semibold overflow-hidden"
                      >
                        <span className="absolute inset-0 bg-white/20 transform skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></span>
                        <span className="relative">📊 View Results</span>
                      </button>
                    </td>
                    
                    {/* Download Column */}
                    <td className="border border-gray-300 px-6 py-4">
                      <button
                        onClick={() => handleDownloadCSV(jd.jd_id)}
                        className="group relative bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-xl text-sm hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg w-full font-semibold overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        disabled={loading}
                      >
                        <span className="absolute inset-0 bg-white/20 transform skew-x-12 -translate-x-full group-hover:!translate-x-full transition-transform duration-700 ease-out disabled:hidden"></span>
                        <span className="relative flex items-center justify-center">
                          {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Downloading...
                            </>
                          ) : (
                            '📥 Download CSV'
                          )}
                        </span>
                      </button>
                    </td>
                    
                    {/* Uploaded Date Column */}
                    <td className="border border-gray-300 px-6 py-4">
                      <div className="text-base font-semibold text-gray-700">
                        {new Date(jd.uploaded_at).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500 animate-fade-in delay-200">
                        {new Date(jd.uploaded_at).toLocaleTimeString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Past Results Message - Enhanced */}
      {pastJds.length === 0 && (
        <div className="text-center py-12 relative z-10 animate-fade-in-up delay-1000">
          <div className="inline-block p-8 bg-white rounded-3xl shadow-2xl border border-gray-200 transform hover:scale-105 transition-all duration-500">
            <div className="text-6xl mb-4 animate-bounce">📋</div>
            <p className="text-gray-600 text-lg font-medium">No previous job descriptions found.</p>
            <p className="text-sm text-gray-500 mt-3">Create your first job description to get started!</p>
          </div>
        </div>
      )}

      {/* JD Details Modal - Enhanced with Slide and Scale Animation */}
      {selectedJd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in backdrop-blur-sm">
          <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full max-w-5xl relative max-h-[85vh] flex flex-col transform transition-all duration-500 ease-out scale-95 animate-slide-in-scale">
            {/* Close JD Dialog - Enhanced */}
            <button
              onClick={() => setSelectedJd(null)}
              className="absolute top-4 right-4 group text-gray-600 hover:text-red-500 font-bold text-2xl transform transition-all duration-300 hover:scale-110 hover:rotate-90"
            >
              <span className="group-hover:absolute inset-0 bg-red-500 rounded-full blur opacity-20 animate-ping"></span>
              ✕
            </button>

            <h3 className="text-2xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-gray-800 via-purple-600 to-indigo-700 relative animate-fade-in">
              Job Description Details
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full blur opacity-20 animate-pulse -z-10"></div>
            </h3>

            <div className="flex-1 overflow-y-auto space-y-6 animate-slide-in-left delay-200">
              <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-200">
                <strong className="text-gray-700 block mb-1">Job Role:</strong> 
                <span className="ml-0 text-purple-600 font-bold text-lg block">{selectedJd.jobRole}</span>
              </div>
              <div className="p-4 bg-gradient-to-r from-indigo-50 to-pink-50 rounded-2xl border border-indigo-200">
                <strong className="text-gray-700 block mb-1">JD ID:</strong> 
                <span className="ml-0 font-mono text-base bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-2 rounded-full block">{selectedJd.jd_id}</span>
              </div>
              <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl border border-pink-200">
                <strong className="text-gray-700 block mb-1">Uploaded:</strong> 
                <span className="ml-0 text-sm">{new Date(selectedJd.uploaded_at).toLocaleString()}</span>
              </div>
              <div className="border-t pt-6 bg-gray-50 rounded-2xl p-4 border-gray-200">
                <strong className="text-gray-700 block mb-3 text-lg">Job Description:</strong>
                <div className="mt-2 p-6 bg-white rounded-xl max-h-72 overflow-y-auto text-gray-700 whitespace-pre-wrap border border-gray-300 shadow-inner animate-fade-in delay-400">
                  {selectedJd.job_description}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200 animate-slide-in-right delay-300">
              <button
                onClick={() => handleUploadResumes(selectedJd.jd_id)}
                className="group relative bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold overflow-hidden"
              >
                <span className="absolute inset-0 bg-white/20 transform skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></span>
                <span className="relative">📤 Upload Resumes</span>
              </button>
              <button
                onClick={() => handleViewResults(selectedJd.jd_id)}
                className="group relative bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold overflow-hidden"
              >
                <span className="absolute inset-0 bg-white/20 transform skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></span>
                <span className="relative">📊 View Results</span>
              </button>
              <button
                onClick={() => setSelectedJd(null)}
                className="group bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700 px-6 py-3 rounded-xl hover:from-gray-400 hover:to-gray-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold overflow-hidden"
              >
                <span className="absolute inset-0 bg-white/20 transform skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></span>
                <span className="relative">Close</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
        @keyframes slide-in-up {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in-up { animation: slide-in-up 1s ease-out forwards; }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-1000 { animation-delay: 1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-400 { animation-delay: 0.4s; }
        @keyframes slide-in-scale {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-slide-in-scale { animation: slide-in-scale 0.5s ease-out forwards; }
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in-left { animation: slide-in-left 0.6s ease-out forwards; }
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in-right { animation: slide-in-right 0.6s ease-out forwards; }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow { animation: bounce-slow 3s infinite; }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 2s linear infinite; }
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 1; }
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        .animate-ping-slow { animation: ping-slow 2s infinite; }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse-slow { animation: pulse-slow 2s infinite; }
      `}</style>
    </div>
  );
};

export default StartPage;