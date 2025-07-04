import React, { useRef, useState, useEffect } from "react";
import { CloudUpload } from "lucide-react";
import useResumeStore from "../store/useResumeStore";

export default function ResumeForm() {
  const { resumeFiles, setResumeFiles, manualForm, setManualForm } =
    useResumeStore();

  const fileInputRef = useRef(null);
  const [newExperience, setNewExperience] = useState({
    jobTitle: "",
    company: "",
    startDate: "",
    endDate: "",
    description: "",
  });
  const [newEducation, setNewEducation] = useState({
    degree: "",
    school: "",
    startDate: "",
    endDate: "",
  });

  const [newProject, setNewProject] = useState({
    title: "",
    startDate: "",
    endDate: "",
    tech: "",
    points: [],
  });
  const [newPoint, setNewPoint] = useState("");

  const [newSkill, setNewSkill] = useState("");
  const [newLanguage, setNewLanguage] = useState("");
  const [newInterest, setNewInterest] = useState("");

  const [newAchievement, setNewAchievement] = useState({
    title: "",
    points: [],
  });

  // New sections state
  const [newInternship, setNewInternship] = useState({
    role: "",
    company: "",
    startDate: "",
    endDate: "",
    description: [""],
  });

  const [newCertification, setNewCertification] = useState({
    name: "",
    issuer: "",
    date: "",
  });

  // new code for toggles
  const [showSections, setShowSections] = useState({
    internships: false,
    achievements: false,
    certifications: false,
  });

  const [editingIndex, setEditingIndex] = useState({
    experience: null,
    education: null,
    project: null,
    achievement: null,
    internship: null,
  });

  const uploadAndExtractResume = async (file) => {
    setResumeFiles(file);
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await fetch("http://127.0.0.1:5000/extract", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to upload resume");
      }

      const data = await res.json();
      console.log("Data is ", data);

      // Ensure we got valid data
      if (typeof data !== "object" || data === null) {
        throw new Error("Invalid response format");
      }

      // Merge with default structure
      setManualForm((prev) => ({
        ...prev,
        ...data,
        experience: data.experience || [],
        education: data.education || [],
        skills: data.skills || [],
        languages: data.languages || [],
        interests: data.interests || [],
      }));
    } catch (err) {
      console.error("Upload error:", err);
      alert(`Error: ${err.message || "Failed to process resume"}`);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) uploadAndExtractResume(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) uploadAndExtractResume(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFieldChange = (field, value) => {
    setManualForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddItem = (field, value) => {
    if (!value) return;
    setManualForm((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), value],
    }));
  };

  const handleRemoveItem = (field, index) => {
    setManualForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleCertificationChange = (index, field, value) => {
    const updated = [...(manualForm.certifications || [])];
    updated[index][field] = value;
    setManualForm((prev) => ({ ...prev, certifications: updated }));
  };

  const handleAddCertification = () => {
    if (!newCertification.name || !newCertification.issuer) return;
    handleAddItem("certifications", {
      ...newCertification,
      date: new Date().toLocaleDateString(),
    });
    setNewCertification({ name: "", issuer: "", date: "" });
  };

  const handleInternshipChange = (index, field, value) => {
    const updated = [...(manualForm.internships || [])];
    updated[index][field] = value;
    setManualForm((prev) => ({ ...prev, internships: updated }));
  };

  const handleInternshipResponsibilityChange = (index, respIndex, value) => {
    const updated = [...(manualForm.internships || [])];
    updated[index].responsibilities[respIndex] = value;
    setManualForm((prev) => ({ ...prev, internships: updated }));
  };

  const addInternshipResponsibility = (index) => {
    const updated = [...(manualForm.internships || [])];
    updated[index].responsibilities.push("");
    setManualForm((prev) => ({ ...prev, internships: updated }));
  };

  const removeInternshipResponsibility = (index, respIndex) => {
    const updated = [...(manualForm.internships || [])];
    updated[index].responsibilities.splice(respIndex, 1);
    setManualForm((prev) => ({ ...prev, internships: updated }));
  };

  const handleAddInternship = () => {
    if (!newInternship.role || !newInternship.company) return;

    if (editingIndex.internship !== null) {
      handleEditItem("internships", editingIndex.internship, newInternship);
      setEditingIndex({ ...editingIndex, internship: null });
    } else {
      setManualForm((prev) => ({
        ...prev,
        internships: [...(prev.internships || []), newInternship],
      }));
    }

    setNewInternship({
      role: "",
      company: "",
      startDate: "",
      endDate: "",
      description: [""],
    });
  };

  const handleEditItem = (field, index, updatedValue) => {
    setManualForm((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) =>
        i === index ? updatedValue : item
      ),
    }));
  };

  const handleEditAchievement = (index) => {
    setEditingIndex({ ...editingIndex, achievement: index });
    setNewAchievement(JSON.parse(JSON.stringify(manualForm.achievements[index])));
  };

  const handleEditExperience = (index) => {
    setEditingIndex({ ...editingIndex, experience: index });
    setNewExperience(manualForm.experience[index]);
  };

  const handleEditEducation = (index) => {
    setEditingIndex({ ...editingIndex, education: index });
    setNewEducation(manualForm.education[index]);
  };

  const handleEditProject = (index) => {
    setEditingIndex({ ...editingIndex, project: index });
    setNewProject(manualForm.projects[index]);
  };

  const handleEditInternship = (index) => {
    setEditingIndex({ ...editingIndex, internship: index });
    setNewInternship(manualForm.internships[index]);
  };

  const handleAddExperience = () => {
    if (!newExperience.jobTitle || !newExperience.company) return;

    if (editingIndex.experience !== null) {
      handleEditItem("experience", editingIndex.experience, newExperience);
      setEditingIndex({ ...editingIndex, experience: null });
    } else {
      setManualForm((prev) => ({
        ...prev,
        experience: [...(prev.experience || []), newExperience],
      }));
    }

    setNewExperience({
      jobTitle: "",
      company: "",
      startDate: "",
      endDate: "",
      description: "",
    });
  };

  const handleAddEducation = () => {
    if (!newEducation.degree || !newEducation.school) return;

    if (editingIndex.education !== null) {
      handleEditItem("education", editingIndex.education, newEducation);
      setEditingIndex({ ...editingIndex, education: null });
    } else {
      setManualForm((prev) => ({
        ...prev,
        education: [...(prev.education || []), newEducation],
      }));
    }

    setNewEducation({
      degree: "",
      school: "",
      startDate: "",
      endDate: "",
    });
  };

  const handleAddProject = () => {
    if (!newProject.title || newProject.points.length === 0) return;

    if (editingIndex.project !== null) {
      handleEditItem("projects", editingIndex.project, newProject);
      setEditingIndex({ ...editingIndex, project: null });
    } else {
      setManualForm((prev) => ({
        ...prev,
        projects: [...(prev.projects || []), newProject],
      }));
    }

    setNewProject({
      title: "",
      startDate: "",
      endDate: "",
      tech: "",
      points: [],
    });
  };

  const handleAddAchievement = () => {
    if (!newAchievement.title || newAchievement.points.length === 0) return;

    if (editingIndex.achievement !== null) {
      handleEditItem("achievements", editingIndex.achievement, newAchievement);
      setEditingIndex({ ...editingIndex, achievement: null });
    } else {
      setManualForm((prev) => ({
        ...prev,
        achievements: [...(prev.achievements || []), newAchievement],
      }));
    }

    setNewAchievement({
      title: "",
      points: [],
    });
     setNewPoint(""); // Clear the point input after adding
  };

  useEffect(() => {
    console.log("Current manualForm state:", manualForm);
  }, [manualForm]);

  return (
    <section className="space-y-1 max-w-3xl mx-auto bg-white shadow-lg p-5 rounded-xl border border-gray-200">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Resume Builder</h1>
      </div>

      {/* Upload Box */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Upload Resume</h3>
        <div
          className="flex items-center justify-center border border-dashed border-blue-400 rounded-md p-4 text-blue-600 bg-blue-50 hover:bg-blue-100 transition cursor-pointer"
          onClick={() => fileInputRef.current.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className="flex items-center gap-3">
            <CloudUpload className="w-6 h-6 text-blue-500" />
            <div className="text-sm">
              {resumeFiles ? (
                <>
                  <div className="font-medium">{resumeFiles.name}</div>
                  <div className="text-xs text-gray-600">
                    Click or drag to change
                  </div>
                </>
              ) : (
                <>
                  <div className="font-medium">
                    Click or drag to upload resume
                  </div>
                  <div className="text-xs text-gray-500">
                    (.pdf, .docx, .txt)
                  </div>
                </>
              )}
            </div>
          </div>
          <input
            type="file"
            accept=".txt,.pdf,.doc,.docx"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      <div className="border-t border-gray-300 my-4"></div>

      {/* Personal Details Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">
          Personal Details
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">
              Your Name
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
              value={manualForm.Name || ""}
              onChange={(e) => handleFieldChange("Name", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">
              Job Title
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
              value={manualForm.jobTitle || ""}
              onChange={(e) => handleFieldChange("jobTitle", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Email</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
              value={manualForm.email || ""}
              onChange={(e) => handleFieldChange("email", e.target.value)}
              placeholder="your.email@example.com"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Phone</label>
            <input
              type="tel"
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
              value={manualForm.phone || ""}
              onChange={(e) => handleFieldChange("phone", e.target.value)}
              placeholder="123-456-7890"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Location</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
              value={manualForm.location || ""}
              onChange={(e) => handleFieldChange("location", e.target.value)}
              placeholder="City, Country"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">LinkedIn</label>
            <input
              type="url"
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
              value={manualForm.linkedin || ""}
              onChange={(e) => handleFieldChange("linkedin", e.target.value)}
              placeholder="LinkedIn URL"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">GitHub</label>
            <input
              type="url"
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
              value={manualForm.github || ""}
              onChange={(e) => handleFieldChange("github", e.target.value)}
              placeholder="GitHub URL"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-300 my-4"></div>

      {/* Professional Summary Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-700">
            Professional Summary
          </h2>
          <button
            className="bg-blue-50 text-blue-600 px-3 py-1 rounded-md text-sm hover:bg-blue-100 transition-colors"
            onClick={async () => {
              if (!manualForm.summary?.trim()) {
                alert("Please enter some text first");
                return;
              }

              try {
                const response = await fetch(
                  "http://127.0.0.1:5000/enhance-summary",
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text: manualForm.summary }),
                  }
                );

                const data = await response.json();
                if (response.ok) {
                  handleFieldChange("summary", data.enhancedText);
                } else {
                  alert(data.error || "Enhancement failed");
                }
              } catch (error) {
                alert("Failed to connect to server");
              }
            }}
          >
            Enhance with AI
          </button>
        </div>
        <textarea
          rows={4}
          className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
          value={manualForm.summary || ""}
          onChange={(e) => handleFieldChange("summary", e.target.value)}
          placeholder="A brief summary about your professional background..."
        />
      </div>

      <div className="border-t border-gray-300 my-4"></div>

      {/* Experience Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">Experience</h2>

        {(manualForm.experience || []).map((exp, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-md p-4 relative"
          >
            <div className="flex justify-between">
              <div>
                <h3 className="font-medium">{exp.jobTitle || "Job Title"}</h3>
                <p className="text-sm text-gray-600">
                  {exp.company || "Company"}
                </p>
              </div>
              <div className="text-sm text-gray-500">
                {exp.startDate || "Start Date"} - {exp.endDate || "End Date"}
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-700">
              {exp.description || "Job responsibilities and achievements..."}
            </p>
            <button
              className="text-blue-500 text-sm"
              onClick={() => handleEditExperience(index)}
            >
              Edit
            </button>
            <button
              className="absolute top-2 right-2 text-red-500 text-sm"
              onClick={() => handleRemoveItem("experience", index)}
            >
              Delete
            </button>
          </div>
        ))}

        <div className="border-t border-gray-300 my-4"></div>

        <div className="space-y-3">
          <h3 className="font-medium">Add Experience</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Job Title
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
                value={newExperience.jobTitle}
                onChange={(e) =>
                  setNewExperience({
                    ...newExperience,
                    jobTitle: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Company
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
                value={newExperience.company}
                onChange={(e) =>
                  setNewExperience({
                    ...newExperience,
                    company: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Start Date
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
                value={newExperience.startDate}
                onChange={(e) =>
                  setNewExperience({
                    ...newExperience,
                    startDate: e.target.value,
                  })
                }
                placeholder="Jan 2020"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                End Date
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
                value={newExperience.endDate}
                onChange={(e) =>
                  setNewExperience({
                    ...newExperience,
                    endDate: e.target.value,
                  })
                }
                placeholder="Present"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
              value={newExperience.description}
              onChange={(e) =>
                setNewExperience({
                  ...newExperience,
                  description: e.target.value,
                })
              }
              placeholder="Job responsibilities and achievements..."
            />
          </div>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm"
            onClick={handleAddExperience}
          >
            {editingIndex.experience !== null
              ? "Update Experience"
              : "Add Experience"}
          </button>
        </div>
      </div>

      <div className="border-t border-gray-300 my-4"></div>

      {/* Education Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">Education</h2>

        {(manualForm.education || []).map((edu, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-md p-4 relative"
          >
            <div className="flex justify-between">
              <div>
                <h3 className="font-medium">
                  {edu.degree || "Degree (e.g., B.S. in Computer Science)"}
                </h3>
                <p className="text-sm text-gray-600">
                  {edu.school || "School/University"}
                </p>
              </div>
              <div className="text-sm text-gray-500">
                {edu.startDate || "Start Date"} - {edu.endDate || "End Date"}
              </div>
            </div>

            <button
              className="text-blue-500 text-sm"
              onClick={() => handleEditEducation(index)}
            >
              Edit
            </button>

            <button
              className="absolute top-2 right-2 text-red-500 text-sm"
              onClick={() => handleRemoveItem("education", index)}
            >
              Delete
            </button>
          </div>
        ))}

        <div className="border-t border-gray-300 my-4"></div>

        <div className="space-y-3">
          <h3 className="font-medium">Add Education</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Degree</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
                value={newEducation.degree}
                onChange={(e) =>
                  setNewEducation({ ...newEducation, degree: e.target.value })
                }
                placeholder="B.S. in Computer Science"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                School/University
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
                value={newEducation.school}
                onChange={(e) =>
                  setNewEducation({ ...newEducation, school: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Start Date
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
                value={newEducation.startDate}
                onChange={(e) =>
                  setNewEducation({
                    ...newEducation,
                    startDate: e.target.value,
                  })
                }
                placeholder="Aug 2016"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                End Date
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
                value={newEducation.endDate}
                onChange={(e) =>
                  setNewEducation({ ...newEducation, endDate: e.target.value })
                }
                placeholder="May 2020"
              />
            </div>
          </div>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm"
            onClick={handleAddEducation}
          >
            {editingIndex.education !== null
              ? "Update Education"
              : "Add Education"}
          </button>
        </div>
      </div>

      <div className="border-t border-gray-300 my-4"></div>

      {/* Skills Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {(manualForm.skills || []).map((skill, index) => (
            <div
              key={index}
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
            >
              {skill}
              <button
                className="ml-1 text-blue-600"
                onClick={() => handleRemoveItem("skills", index)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
            placeholder="Add a skill and press Enter"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newSkill) {
                handleAddItem("skills", newSkill);
                setNewSkill("");
              }
            }}
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm"
            onClick={() => {
              if (newSkill) {
                handleAddItem("skills", newSkill);
                setNewSkill("");
              }
            }}
          >
            Add
          </button>
        </div>
      </div>

      <div className="border-t border-gray-300 my-4"></div>

      {/* Languages Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">Languages</h2>
        <div className="flex flex-wrap gap-2">
          {(manualForm.languages || []).map((language, index) => (
            <div
              key={index}
              className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center"
            >
              {language}
              <button
                className="ml-1 text-green-600"
                onClick={() => handleRemoveItem("languages", index)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
            placeholder="Add a language and press Enter"
            value={newLanguage}
            onChange={(e) => setNewLanguage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newLanguage) {
                handleAddItem("languages", newLanguage);
                setNewLanguage("");
              }
            }}
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm"
            onClick={() => {
              if (newLanguage) {
                handleAddItem("languages", newLanguage);
                setNewLanguage("");
              }
            }}
          >
            Add
          </button>
        </div>
      </div>

      <div className="border-t border-gray-300 my-4"></div>

      {/* Interests & Hobbies Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">
          Interests & Hobbies
        </h2>
        <div className="flex flex-wrap gap-2">
          {(manualForm.interests || []).map((interest, index) => (
            <div
              key={index}
              className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center"
            >
              {interest}
              <button
                className="ml-1 text-purple-600"
                onClick={() => handleRemoveItem("interests", index)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
            placeholder="Add an interest or hobby and press Enter"
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newInterest) {
                handleAddItem("interests", newInterest);
                setNewInterest("");
              }
            }}
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm"
            onClick={() => {
              if (newInterest) {
                handleAddItem("interests", newInterest);
                setNewInterest("");
              }
            }}
          >
            Add
          </button>
        </div>
      </div>

      <div className="border-t border-gray-300 my-4"></div>

      {/* Projects Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">Projects</h2>

        {(manualForm.projects || []).map((project, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-md p-4 relative"
          >
            <div className="flex justify-between">
              <div>
                <h3 className="font-medium">{project.title}</h3>
                <p className="text-sm text-gray-600">{project.tech}</p>
              </div>
              <div className="text-sm text-gray-500">
                {project.startDate} - {project.endDate}
              </div>
            </div>
            <ul className="mt-2 list-disc list-inside text-sm text-gray-700 space-y-1">
              {project.points?.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>

            <button
              className="text-blue-500 text-sm"
              onClick={() => handleEditProject(index)}
            >
              Edit
            </button>
            <button
              className="absolute top-2 right-2 text-red-500 text-sm"
              onClick={() => handleRemoveItem("projects", index)}
            >
              Delete
            </button>
          </div>
        ))}

        <div className="border-t border-gray-300 my-4"></div>

        <div className="space-y-3">
          <h3 className="font-medium">Add Project</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Title</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
                value={newProject.title}
                onChange={(e) =>
                  setNewProject({ ...newProject, title: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Tech Stack
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
                value={newProject.tech}
                onChange={(e) =>
                  setNewProject({ ...newProject, tech: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Start Date
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
                value={newProject.startDate}
                onChange={(e) =>
                  setNewProject({ ...newProject, startDate: e.target.value })
                }
                placeholder="Month Year"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                End Date
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
                value={newProject.endDate}
                onChange={(e) =>
                  setNewProject({ ...newProject, endDate: e.target.value })
                }
                placeholder="Month Year"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-1">
              Add Points
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
                placeholder="Point about the project"
                value={newPoint}
                onChange={(e) => setNewPoint(e.target.value)}
              />
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm"
                onClick={() => {
                  if (newPoint) {
                    setNewProject({
                      ...newProject,
                      points: [...newProject.points, newPoint],
                    });
                    setNewPoint("");
                  }
                }}
              >
                Add
              </button>
            </div>
            <ul className="list-disc list-inside text-sm space-y-1">
              {newProject.points.map((pt, i) => (
                <li key={i}>{pt}</li>
              ))}
            </ul>
          </div>

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm"
            onClick={() => {
              if (newProject.title && newProject.points.length > 0) {
                handleAddItem("projects", newProject);
                setNewProject({
                  title: "",
                  startDate: "",
                  endDate: "",
                  tech: "",
                  points: [],
                });
              }
            }}
          >
            {editingIndex.project !== null ? "Update Project" : "Add Project"}
          </button>
        </div>
      </div>

      {/* Internships Section */}
      {/* Internships Section */}
      {showSections.internships && (
        <div className="space-y-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-700">Internships</h2>

          {(manualForm.internships || []).map((internship, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-md p-4 relative group"
            >
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Role
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    value={internship.role || ""}
                    onChange={(e) =>
                      handleInternshipChange(index, "role", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    value={internship.company || ""}
                    onChange={(e) =>
                      handleInternshipChange(index, "company", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Start Date
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    value={internship.startDate || ""}
                    onChange={(e) =>
                      handleInternshipChange(index, "startDate", e.target.value)
                    }
                    placeholder="MM/YYYY"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    End Date
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    value={internship.endDate || ""}
                    onChange={(e) =>
                      handleInternshipChange(index, "endDate", e.target.value)
                    }
                    placeholder="MM/YYYY or Present"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-sm text-gray-500 mb-1">
                  Responsibilities
                </label>
                {internship.description?.map((resp, respIndex) => (
                  <div key={respIndex} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md p-2 text-sm"
                      value={resp}
                      onChange={(e) =>
                        handleInternshipResponsibilityChange(
                          index,
                          respIndex,
                          e.target.value
                        )
                      }
                    />
                    <button
                      className="text-red-500"
                      onClick={() =>
                        removeInternshipResponsibility(index, respIndex)
                      }
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  className="text-blue-500 text-sm mt-1"
                  onClick={() => addInternshipResponsibility(index)}
                >
                  + Add Responsibility
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  className="text-blue-500 text-sm"
                  onClick={() => handleEditInternship(index)}
                >
                  Edit
                </button>
                <button
                  className="text-red-500 text-sm"
                  onClick={() => handleRemoveItem("internships", index)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {/* Add New Internship Form */}
          <div className="border-t border-gray-300 pt-4">
            <h3 className="font-medium mb-3">
              {editingIndex.internship !== null
                ? "Edit Internship"
                : "Add New Internship"}
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Role</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                  value={newInternship.role}
                  onChange={(e) =>
                    setNewInternship({ ...newInternship, role: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                  value={newInternship.company}
                  onChange={(e) =>
                    setNewInternship({
                      ...newInternship,
                      company: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">
                  Start Date
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                  value={newInternship.startDate}
                  onChange={(e) =>
                    setNewInternship({
                      ...newInternship,
                      startDate: e.target.value,
                    })
                  }
                  placeholder="MM/YYYY"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">
                  End Date
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                  value={newInternship.endDate}
                  onChange={(e) =>
                    setNewInternship({
                      ...newInternship,
                      endDate: e.target.value,
                    })
                  }
                  placeholder="MM/YYYY or Present"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-sm text-gray-500 mb-1">
                Responsibilities
              </label>
              {newInternship.description.map((resp, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    value={resp}
                    onChange={(e) => {
                      const updated = [...newInternship.description];
                      updated[index] = e.target.value;
                      setNewInternship({
                        ...newInternship,
                        description: updated,
                      });
                    }}
                  />
                  {index > 0 && (
                    <button
                      className="text-red-500"
                      onClick={() => {
                        const updated = [...newInternship.description];
                        updated.splice(index, 1);
                        setNewInternship({
                          ...newInternship,
                          description: updated,
                        });
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                className="text-blue-500 text-sm mt-1"
                onClick={() =>
                  setNewInternship({
                    ...newInternship,
                    description: [...newInternship.description, ""],
                  })
                }
              >
                + Add Responsibility
              </button>
            </div>

            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm"
              onClick={handleAddInternship}
              disabled={!newInternship.role || !newInternship.company}
            >
              {editingIndex.internship !== null
                ? "Update Internship"
                : "Add Internship"}
            </button>
            {editingIndex.internship !== null && (
              <button
                className="ml-2 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition text-sm"
                onClick={() => {
                  setEditingIndex({ ...editingIndex, internship: null });
                  setNewInternship({
                    jobTitle: "",
                    company: "",
                    startDate: "",
                    endDate: "",
                    description: [""],
                  });
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}



  {/* Achievements Section */}
      {showSections.achievements && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Achievements</h2>

          {/* Existing Achievements List */}
          {(manualForm.achievements || []).map((achievement, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-md p-4 relative"
            >
              <div className="flex justify-between">
                <h3 className="font-medium">{achievement.title || "Achievement Title"}</h3>
                <div>
                  <button
                    className="text-blue-500 text-sm mr-2"
                    onClick={() => handleEditAchievement(index)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-500 text-sm"
                    onClick={() => handleRemoveItem("achievements", index)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Achievement Description Points */}
              <ul className="mt-2 list-disc list-inside text-sm text-gray-700 space-y-1">
                {(achievement.points || []).map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          ))}

          <div className="border-t border-gray-300 my-4"></div>

          {/* Add/Edit Achievement */}
          <div className="space-y-3">
            <h3 className="font-medium">
              {editingIndex.achievement !== null ? "Edit Achievement" : "Add Achievement"}
            </h3>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Title</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
                value={newAchievement.title || ""}
                onChange={(e) =>
                  setNewAchievement({ ...newAchievement, title: e.target.value })
                }
              />
            </div>

            {/* Points for Achievement */}
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Points / Highlights
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  className="flex-1 border border-gray-300 rounded-md p-2 text-sm"
                  placeholder="Add point"
                  value={newPoint}
                  onChange={(e) => setNewPoint(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newPoint) {
                      setNewAchievement({
                        ...newAchievement,
                        points: [...(newAchievement.points || []), newPoint],
                      });
                      setNewPoint("");
                    }
                  }}
                />
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                  onClick={() => {
                    if (newPoint) {
                      setNewAchievement({
                        ...newAchievement,
                        points: [...(newAchievement.points || []), newPoint],
                      });
                      setNewPoint("");
                    }
                  }}
                >
                  Add Point
                </button>
              </div>

              {/* List of Points */}
              <ul className="list-disc list-inside text-sm space-y-1">
                {(newAchievement.points || []).map((pt, i) => (
                  <li key={i} className="flex items-center">
                    {pt}
                    <button
                      className="ml-2 text-red-500 text-xs"
                      onClick={() => {
                        const updatedPoints = [...newAchievement.points];
                        updatedPoints.splice(i, 1);
                        setNewAchievement({
                          ...newAchievement,
                          points: updatedPoints,
                        });
                      }}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Add/Update Button */}
            <div className="flex gap-2">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                onClick={handleAddAchievement}
                disabled={
                  !newAchievement.title ||
                  (newAchievement.points || []).length === 0
                }
              >
                {editingIndex.achievement !== null ? "Update Achievement" : "Add Achievement"}
              </button>
              {editingIndex.achievement !== null && (
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 text-sm"
                  onClick={() => {
                    setEditingIndex({ ...editingIndex, achievement: null });
                    setNewAchievement({
                      title: "",
                      points: [],
                    });
                    setNewPoint("");
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}




     {/* Certifications Section */}
      {showSections.certifications && (
        <div className="space-y-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-700">Certifications</h2>

          {(manualForm.certifications || []).map((cert, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-md p-4 relative group"
            >
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Name</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    value={cert.name || ""}
                    onChange={(e) => handleCertificationChange(index, "name", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Issuer</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    value={cert.issuer || ""}
                    onChange={(e) => handleCertificationChange(index, "issuer", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Date</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    value={cert.date || ""}
                    onChange={(e) => handleCertificationChange(index, "date", e.target.value)}
                    placeholder="MM/YYYY"
                  />
                </div>
              </div>
              <button
                className="text-red-500 text-sm"
                onClick={() => handleRemoveItem("certifications", index)}
              >
                Delete
              </button>
            </div>
          ))}

          {/* Add New Certification Form */}
          <div className="border-t border-gray-300 pt-4">
            <h3 className="font-medium mb-3">Add New Certification</h3>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                  value={newCertification.name}
                  onChange={(e) => setNewCertification({...newCertification, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Issuer</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                  value={newCertification.issuer}
                  onChange={(e) => setNewCertification({...newCertification, issuer: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Date</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                  value={newCertification.date}
                  onChange={(e) => setNewCertification({...newCertification, date: e.target.value})}
                  placeholder="MM/YYYY"
                />
              </div>
            </div>
            <button
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition text-sm"
              onClick={handleAddCertification}
              disabled={!newCertification.name || !newCertification.issuer}
            >
              Add Certification
            </button>
          </div>
        </div>
      )}


      {/* new sections */}
      {/* ===== Section Toggle Buttons ===== */}
      <div className="flex flex-wrap gap-3 my-4">
        <button
          onClick={() =>
            setShowSections((prev) => ({
              ...prev,
              internships: !prev.internships,
            }))
          }
          className={`px-4 py-2 rounded-md text-sm ${
            showSections.internships
              ? "bg-blue-600 text-white"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {showSections.internships
            ? "▲ Hide Internships"
            : "+ Add Internships"}
        </button>

        <button
          onClick={() =>
            setShowSections((prev) => ({
              ...prev,
              achievements: !prev.achievements,
            }))
          }
          className={`px-4 py-2 rounded-md text-sm ${
            showSections.achievements
              ? "bg-green-600 text-white"
              : "bg-green-100 text-green-800"
          }`}
        >
          {showSections.achievements
            ? "▲ Hide Achievements"
            : "+ Add Achievements"}
        </button>

        <button
          onClick={() =>
            setShowSections((prev) => ({
              ...prev,
              certifications: !prev.certifications,
            }))
          }
          className={`px-4 py-2 rounded-md text-sm ${
            showSections.certifications
              ? "bg-purple-600 text-white"
              : "bg-purple-100 text-purple-800"
          }`}
        >
          {showSections.certifications
            ? "▲ Hide Certifications"
            : "+ Add Certifications"}
        </button>
      </div>
    </section>
  );
}
