import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";

import TemplateBuilder from "./components/TemplateBuilder";
import TemplateSelection from "./components/TemplateSelection";
import TemplateBuilderWrapper from "./components/TemplateBuilderWrapper";
import AnalyzeAtsScore from "./components/AnalyzeAtsScore";
import Footer from "./components/Footer";
import Dashboard from "./components/Dashboard";
import Signup from "./components/Signup";
import Login from "./components/Login";

import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./components/admin/AdminDashboard";
import OrganisationsList from "./components/admin/OrganisationsList";
import CreateOrganisation from "./components/admin/CreateOrganisation";

import ProtectedRoute from "./components/ProtectedRoute";
import ResumeFilterWrapper from "./components/ResumeFilter/ResumeFilterWrapper";


function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/resume-builder" element={<TemplateBuilder />} />
            <Route path="/templates" element={<TemplateSelection />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              {/* Add other protected routes here */}
              {/* NEW: Add Filter Resumes route */}
              <Route path="/filter-resumes/*" element={<ResumeFilterWrapper/>} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route
                path="/builder/:templateId"
                element={<TemplateBuilderWrapper />}
              />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path="/analyze" element={<AnalyzeAtsScore />} />
            </Route>


            {/* Admin routes */}
            <Route path="/admin" element={<AdminLayout/>}>
              <Route index element={<AdminDashboard />} />
              <Route path="organisations" element={<OrganisationsList />} />
              <Route
                path="organisations/new"
                element={<CreateOrganisation />}
              />
              {/* Add more admin routes here */}
            </Route>

          </Routes>
        </div>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
