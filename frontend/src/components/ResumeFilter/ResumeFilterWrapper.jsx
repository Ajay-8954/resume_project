// components/ResumeFilter/ResumeFilterWrapper.jsx

import { Routes, Route } from 'react-router-dom';
import StartPage from './StartPage';
import JDInput from './JDInput';
import ResumeUpload from './ResumeUpload';
import Results from './Results';
import Filters from './Filters';
import PastResultsModal from './PastResultsModal';



const ResumeFilterWrapper = () => {


  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative font-sans bg-gradient-to-br from-indigo-50 to-purple-100">
      {/* Nested routes for ResumeFilter */}
      <Routes>
        <Route index element={<StartPage/>} />
        <Route path="/jd-input" element={<JDInput />} />
        <Route path="/filters/:jdId" element={<Filters />} />
        <Route path="/resume-upload/:jdId" element={<ResumeUpload />} />
        <Route path="/results/:jdId" element={<Results />} />
      </Routes>

    </div>
  );
};

export default ResumeFilterWrapper;