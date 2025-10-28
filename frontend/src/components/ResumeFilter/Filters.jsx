// components/Filters.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const backendUrl = 'http://localhost:5000';

const Filters = () => {
  const { jdId } = useParams();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    experience: 'both',
    years: '',
    domain: [],
    jobRole: '',
    location: '',
  });
  const [message, setMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [isDomainDropdownOpen, setIsDomainDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const domainOptions = [
    'B.Tech CSE', 'B.Tech Mechanical', 'B.Tech Civil', 'B.Tech Electrical', 'B.Tech Bio-informatics',
    'Bio-tech', 'Food-tech', 'MBA', 'BBA', 'B.COM', 'BA-LLB', 'B-Pharma', 'M-Pharma', 'Agriculture',
    'M.Tech CSE', 'M.Tech Mechanical', 'M.Tech Civil', 'M.Tech Electrical', 'M.Tech Bio-informatics', 'Ph.D.'
  ];

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/get-jd/${jdId}`); // Add this endpoint in backend
        if (!response.ok) throw new Error('Failed to fetch JD');
        const data = await response.json();
        setFilters(data.filters || data.extracted_data || filters);
      } catch (err) {
        console.error(err);
        setMessage('Failed to load filters');
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 2000);
      }
    };
    fetchFilters();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDomainDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [jdId]);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFilters(prev => ({
        ...prev,
        [name]: checked ? [...prev[name], value] : prev[name].filter(item => item !== value)
      }));
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  const saveFilters = async () => {
    setMessage('Saving filters and proceeding...');
    setShowPopup(true);

    try {
      const response = await fetch(`${backendUrl}/api/save-filters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jd_id: jdId, filters }),
      });

      if (!response.ok) throw new Error('Failed to save filters');

      setMessage('Filters updated successfully!');
      setTimeout(() => {
        setShowPopup(false);
        navigate(`../resume-upload/${jdId}`);
      }, 1500);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 w-full h-full">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-4xl animate-fade-in-up bg-gradient-to-br from-purple-50 to-indigo-50">
        <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">Candidate Filters</h2>
        <p className="text-gray-500 text-center mb-6">The filters below have been auto-filled based on the job description. Feel free to edit them.</p>

        {/* Mandatory Filters Section */}
        <div className="mb-8 p-6 bg-white rounded-xl shadow-lg">
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">Mandatory Filters</h3>
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Experience Level</label>
            <select name="experience" value={filters.experience} onChange={handleFilterChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors" disabled={filters.years && filters.years > 0}>
              <option value="both">Fresher and Experienced (Both)</option>
              <option value="fresher" disabled={filters.years && filters.years > 0}>Fresher</option>
              <option value="experienced">Experienced</option>
            </select>
            {filters.years && filters.years > 0 && <p className="text-sm text-red-500 mt-1">'Fresher' is disabled because the JD requires {filters.years} years of experience.</p>}
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Years of Experience</label>
            <input type="number" name="years" value={filters.years} onChange={handleFilterChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors" placeholder="e.g., 2" />
          </div>
          <div className="mb-6 relative" ref={dropdownRef}>
            <label className="block text-gray-700 font-medium mb-2">Education Domain</label>
            <button type="button" onClick={() => setIsDomainDropdownOpen(!isDomainDropdownOpen)} className="flex justify-between items-center w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors bg-white">
              <span>{filters.domain.length > 0 ? filters.domain.join(', ') : 'Select domains'}</span>
              <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isDomainDropdownOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            {isDomainDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-xl border border-gray-300 max-h-60 overflow-y-auto">
                {domainOptions.map(domain => (
                  <label key={domain} className="flex items-center space-x-2 p-3 hover:bg-gray-100 cursor-pointer">
                    <input type="checkbox" name="domain" value={domain} checked={filters.domain.includes(domain)} onChange={handleFilterChange} className="form-checkbox h-5 w-5 text-purple-600 rounded-md" />
                    <span>{domain}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Optional Filters Section */}
        <div className="p-6 bg-white rounded-xl shadow-lg">
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">Optional Filters</h3>
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Years of Experience (Optional)</label>
            <input type="number" name="years" value={filters.years} onChange={handleFilterChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors" placeholder="e.g., 2" />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Desired Job Role (Optional)</label>
            <input type="text" name="jobRole" value={filters.jobRole} onChange={handleFilterChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors" placeholder="e.g., Software Engineer" />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Location (Optional)</label>
            <input type="text" name="location" value={filters.location} onChange={handleFilterChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors" placeholder="e.g., Bangalore or Anywhere in India" />
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <button onClick={() => navigate('/jd-input')} className="bg-gray-300 text-gray-800 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-400 transition-transform transform hover:scale-105">Back</button>
          <button onClick={saveFilters} className="bg-purple-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-purple-700 transition-transform transform hover:scale-105">Proceed to Resume Comparison</button>
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

export default Filters;