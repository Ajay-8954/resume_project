// components/Results.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const backendUrl = 'http://localhost:5000';

const Results = () => {
  const { jdId } = useParams();
  const navigate = useNavigate();
  const [extractedData, setExtractedData] = useState({ processed_resumes: [], total_uploaded: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/get-results/${jdId}`);
        const data = await response.json();
        console.log("Fetched results:", data);
        setExtractedData(data);
        setIsProcessing(data.pending_count > 0);
      } catch (err) {
        console.error("Failed to fetch results:", err);
      }
    };

    fetchResults(); // Initial fetch

    let interval;
    if (isProcessing) {
      interval = setInterval(fetchResults, 3000);
    }

    return () => clearInterval(interval);
  }, [jdId, isProcessing]);

  const startOver = () => {
    navigate('/filter-resumes');
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/download-results/${jdId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `resume_results_${jdId}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        setMessage('Failed to download results');
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 2000);
      }
    } catch (error) {
      setMessage('Error downloading results', error);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 w-full">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-7xl transform transition-all duration-500 animate-fade-in-up">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Resume Filtering Results</h2>
            <p className="text-gray-600">Showing {extractedData?.processed_resumes?.length || 0} out of {extractedData?.total_uploaded || 0} resumes processed</p>
          </div>
          {!isProcessing && extractedData?.processed_resumes?.length > 0 && (
            <button onClick={handleDownload} className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-green-700 transition-transform transform hover:scale-105">
              Download CSV
            </button>
          )}
        </div>
        {isProcessing && (
          <div className="text-center mb-6">
            <p className="text-lg font-semibold text-purple-600">Processing resumes...</p>
            <p className="text-sm text-gray-600">{extractedData?.processed_resumes?.length || 0} completed out of {extractedData?.total_uploaded || 0}</p>
            <div className="mt-4 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          </div>
        )}

        {extractedData?.processed_resumes && extractedData.processed_resumes.length > 0 ? (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Education</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skills</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Exp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conclusion</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {extractedData.processed_resumes.map((resume, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{resume.data.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{resume.data.email || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                      <div className="max-h-32 overflow-y-auto">
                        {resume.data.phone && resume.data.phone.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {resume.data.phone.map((ph, i) => (
                              <span key={i} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{ph}</span>
                            ))}
                          </div>
                        ) : <span className="text-gray-400">N/A</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col items-start">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          resume.score >= 75 ? 'bg-green-100 text-green-800' : resume.score >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {resume.score}/100
                        </span>
                        {resume.comparison_details && <div className="mt-1 text-xs text-gray-500">{resume.comparison_details.recommendation}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                      <div className="max-h-32 overflow-y-auto">
                        {resume.data.education && resume.data.education.length > 0 ? (
                          <div className="space-y-1">
                            {resume.data.education.map((edu, i) => (
                              <div key={i} className="border-l-2 border-purple-300 pl-2">
                                <div className="font-medium text-gray-900 text-xs">{edu.degree}</div>
                                <div className="text-xs text-gray-600">{edu.domain} • {edu.institution}{edu.year && ` • ${edu.year}`}</div>
                              </div>
                            ))}
                          </div>
                        ) : <span className="text-gray-400">N/A</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                      <div className="max-h-32 overflow-y-auto">
                        {resume.data.experience && resume.data.experience.length > 0 ? (
                          <div className="space-y-1">
                            {resume.data.experience.map((exp, i) => (
                              <div key={i} className="border-l-2 border-blue-300 pl-2">
                                <div className="font-medium text-gray-900 text-xs">{exp.role}</div>
                                <div className="text-xs text-gray-600">{exp.company} • {exp.duration}</div>
                              </div>
                            ))}
                          </div>
                        ) : <span className="text-gray-400">N/A</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                      <div className="max-h-32 overflow-y-auto">
                        {resume.data.skills && resume.data.skills.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {resume.data.skills.slice(0, 8).map((skill, i) => (
                              <span key={i} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{skill}</span>
                            ))}
                            {resume.data.skills.length > 8 && <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">+{resume.data.skills.length - 8} more</span>}
                          </div>
                        ) : <span className="text-gray-400">N/A</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{resume.data.total_experience || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-md">
                      <div className="max-h-32 overflow-y-auto">
                        {resume.data.conclusion ? <p className="text-justify leading-relaxed text-xs">{resume.data.conclusion}</p> : <span className="text-gray-400">No conclusion available</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">No resumes processed yet. Please upload and process resumes first.</div>
        )}

        <div className="flex justify-between mt-8">
          <button onClick={() => navigate(`../resume-upload/${jdId}`)} className="bg-gray-300 text-gray-800 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-400 transition-transform transform hover:scale-105">Back</button>
          <button onClick={startOver} className="bg-purple-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-purple-700 transition-transform transform hover:scale-105">Start Over</button>
        </div>
      </div>
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 animate-fade-in-up z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl text-center w-full max-w-sm">
            <p className="text-xl font-bold mb-4">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;