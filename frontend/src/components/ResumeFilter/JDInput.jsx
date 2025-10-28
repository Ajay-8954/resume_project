// components/JDInput.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const backendUrl = 'http://localhost:5000';

const JDInput = () => {
  const navigate = useNavigate();
  const [jd, setJd] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [message, setMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  const handleJdChange = (e) => {
    setJd(e.target.value);
    setUploadedFileName('');
  };

  const handleJdFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFileName(file.name);
      setJd(`Uploaded file: ${file.name}`);
    } else {
      setUploadedFileName('');
      setJd('');
    }
  };

  const saveJd = async () => {
    if (!jd) {
      setMessage('Please enter or paste a job description.');
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2000);
      return;
    }

    setMessage('Saving job description...');
    setShowPopup(true);

    try {
      const response = await fetch(`${backendUrl}/api/save-jd`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_description: jd }),
      });

      if (!response.ok) throw new Error('Failed to save job description.');

      const result = await response.json();
      const jdId = result.jd_id;

      setMessage('JD saved and analyzed successfully!');
      setTimeout(() => {
        setShowPopup(false);
        navigate(`../filters/${jdId}`);
      }, 1500);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 w-full">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-4xl transform transition-all duration-500 animate-fade-in-up">
        <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">Enter Job Description</h2>
        <p className="text-gray-500 text-center mb-6">Paste, type, or upload the job description to begin.</p>
        <div className="flex flex-col md:flex-row gap-6 mb-4">
          <div className="w-full md:w-1/2">
            <textarea
              value={jd}
              onChange={handleJdChange}
              className="w-full h-72 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors resize-none"
              placeholder="Paste the job description here..."
            />
          </div>
          <div className="w-full md:w-1/2 flex items-center justify-center">
            <label htmlFor="jd-file" className="flex flex-col items-center justify-center w-full h-72 border-2 border-purple-300 border-dashed rounded-lg cursor-pointer bg-purple-50 hover:bg-purple-100 transition-all duration-300">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-4 text-purple-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.207a5.52 5.52 0 0 0-1.09.303A5.5 5.5 0 0 0 4 13h12a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3h15.25A5.75 5.75 0 0 0 20 9.25V9A6 6 0 0 0 13 3.5"/>
                </svg>
                <p className="mb-2 text-sm text-purple-600"><span className="font-semibold">{uploadedFileName || 'Click to upload or drag and drop'}</span></p>
                <p className="text-xs text-purple-500">PDF, DOC, DOCX (Max 5MB)</p>
              </div>
              <input id="jd-file" type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleJdFileUpload} />
            </label>
          </div>
        </div>
        <div className="flex justify-between mt-4">
          <button onClick={() => navigate('/')} className="bg-gray-300 text-gray-800 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-400 transition-transform transform hover:scale-105">Back</button>
          <button onClick={saveJd} className="bg-purple-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-purple-700 transition-transform transform hover:scale-105">Save and Analyze</button>
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

export default JDInput;