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
import ProtectedRoute from "./components/ProtectedRoute";

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
        </Route>


            <Route
              path="/builder/:templateId"
              element={<TemplateBuilderWrapper />}
            />
            <Route path="/analyze" element={<AnalyzeAtsScore />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
