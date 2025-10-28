// components/ResumeUpload.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const backendUrl = 'http://localhost:5000';

const ResumeUpload = () => {
  const { jdId } = useParams();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [message, setMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [jdInfo, setJdInfo] = useState(null);
  const [existingResumes, setExistingResumes] = useState(0);

  // Fetch JD information and existing resume count
  useEffect(() => {
    const fetchJdInfo = async () => {
      try {
        // Fetch JD details
        const jdResponse = await fetch(`${backendUrl}/api/get-jd/${jdId}`);
        if (jdResponse.ok) {
          const jdData = await jdResponse.json();
          setJdInfo(jdData);
        }

        // Check for existing resumes
        const resultsResponse = await fetch(`${backendUrl}/api/get-results/${jdId}`);
        if (resultsResponse.ok) {
          const resultsData = await resultsResponse.json();
          setExistingResumes(resultsData.total_uploaded || 0);
        }
      } catch (error) {
        console.error('Error fetching JD info:', error);
      }
    };

    if (jdId) {
      fetchJdInfo();
    }
  }, [jdId]);

  const handleResumeUpload = (e) => {
    const files = Array.from(e.target.files);
    setResumes(files);
  };

  const extractAndStoreResumes = async () => {
    if (resumes.length === 0) {
      setMessage('Please upload at least one resume.');
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2000);
      return;
    }

    setMessage('Starting resume processing...');
    setShowPopup(true);

    const formData = new FormData();
    formData.append('jd_id', jdId);
    resumes.forEach((file) => formData.append('files', file));

    try {
      const response = await fetch(`${backendUrl}/api/process-resumes`, { 
        method: 'POST', 
        body: formData 
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process resumes.');
      }

      const result = await response.json();
      console.log("Resume processing result:", result);

      setMessage(`Processing started for ${resumes.length} resumes!`);
      setTimeout(() => {
        setShowPopup(false);
        navigate(`../results/${jdId}`);
      }, 2000);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    }
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 w-full">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-4xl transform transition-all duration-500 animate-fade-in-up">
        
        {/* Header with JD Info */}
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Upload Resumes</h2>
          {jdInfo && (
            <div className="text-gray-600 mb-4">
              <p className="text-sm">For Job Description ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{jdId.substring(0, 8)}...</span></p>
              {existingResumes > 0 && (
                <p className="text-green-600 text-sm mt-1">
                  ⓘ {existingResumes} resume(s) already processed for this JD. New resumes will be added.
                </p>
              )}
            </div>
          )}
          <p className="text-gray-500">Upload one or more resumes (in PDF, DOC, or DOCX format) to be processed.</p>
        </div>

        {/* Upload Area */}
        <div className="mb-6">
          <label htmlFor="resume-file" className="flex flex-col items-center justify-center w-full h-72 border-2 border-purple-300 border-dashed rounded-lg cursor-pointer bg-purple-50 hover:bg-purple-100 transition-all duration-300">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-4 text-purple-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.207a5.52 5.52 0 0 0-1.09.303A5.5 5.5 0 0 0 4 13h12a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3h15.25A5.75 5.75 0 0 0 20 9.25V9A6 6 0 0 0 13 3.5"/>
              </svg>
              <p className="mb-2 text-sm text-purple-600">
                <span className="font-semibold">Click to upload or drag and drop</span>
              </p>
              <p className="text-xs text-purple-500">PDF, DOC, DOCX only</p>
            </div>
            <input 
              id="resume-file" 
              type="file" 
              className="hidden" 
              accept=".pdf, .doc, .docx" 
              multiple 
              onChange={handleResumeUpload} 
            />
          </label>
        </div>

        {/* Uploaded Files List */}
        {resumes.length > 0 && (
          <div className="mb-6 p-4 bg-gray-100 rounded-lg max-h-48 overflow-y-auto">
            <h4 className="text-md font-semibold text-gray-700 mb-2">
              New Files to Upload ({resumes.length}):
            </h4>
            <ul className="list-disc list-inside text-gray-600 mt-2">
              {resumes.map((file, index) => (
                <li key={index} className="truncate">{file.name}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/filter-resumes')}
              className="bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-full shadow-lg hover:bg-gray-400 transition-transform transform hover:scale-105"
            >
              Home
            </button>
            <button 
              onClick={() => navigate(`../filters/${jdId}`)}
              className="bg-blue-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105"
            >
              Edit Filters
            </button>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={extractAndStoreResumes}
              className="bg-purple-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-purple-700 transition-transform transform hover:scale-105"
              disabled={resumes.length === 0}
            >
              {resumes.length > 0 ? `Process ${resumes.length} Resume(s)` : 'Submit Resumes'}
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> You can upload additional resumes to existing Job Descriptions. 
            All resumes will be processed with the same filters and compared against the same JD.
          </p>
        </div>
      </div>

      {/* Popup Message */}
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

export default ResumeUpload;