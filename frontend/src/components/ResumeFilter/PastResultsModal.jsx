import React, { useState } from "react";

const PastResultsModal = ({ isOpen, onClose, pastJds }) => {
  const [selectedJd, setSelectedJd] = useState(null);
  const [loading, setLoading] = useState(false); // For download/view loading states

  // Function to fetch and download CSV
  const handleDownloadCSV = async (jdId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/download-results/${jdId}`);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in-up">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-5xl relative">
        {/* Close Main Modal */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 font-bold text-xl"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">
          Past Job Descriptions
        </h2>

        {pastJds.length === 0 ? (
          <p className="text-gray-600 text-center">No past results available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 rounded-lg shadow-md">
              <thead className="bg-purple-100 text-gray-800">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left">JD ID</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">JD</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Download</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Uploaded Date</th>
                </tr>
              </thead>
              <tbody>
                {pastJds.map((jd, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">{jd.jd_id}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <button
                        onClick={() => setSelectedJd(jd)}
                        className="text-purple-600 hover:underline"
                      >
                        View
                      </button>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <button
                        onClick={() => handleDownloadCSV(jd.jd_id)}
                        className="text-blue-600 hover:underline"
                        disabled={loading}
                      >
                        {loading ? 'Downloading...' : 'Download CSV'}
                      </button>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {new Date(jd.uploaded_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Inner JD Details Dialog */}
        {selectedJd && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-3xl relative animate-fade-in-up">
              {/* Close JD Dialog */}
              <button
                onClick={() => setSelectedJd(null)}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 font-bold text-xl"
              >
                ✕
              </button>

              <h3 className="text-xl font-semibold mb-4 text-gray-800 text-center">
                Job Description Details
              </h3>

              <div className="max-h-96 overflow-y-auto text-gray-700 whitespace-pre-wrap">
                {selectedJd.job_description}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PastResultsModal;