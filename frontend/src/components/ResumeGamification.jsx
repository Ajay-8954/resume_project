import React, { useState, useEffect } from "react";
import { Trophy, Star, Award, Target, Zap, CheckCircle } from "lucide-react";

export default function ResumeGamification({ resumeData }) {
  const [userLevel, setUserLevel] = useState(1);
  const [experiencePoints, setExperiencePoints] = useState(0);
  const [achievements, setAchievements] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);

  // Calculate resume completeness score
  const calculateResumeScore = () => {
    let score = 0;
    let totalPossible = 0;

    // Personal details (20%)
    if (resumeData.Name) score += 10;
    if (resumeData.email) score += 5;
    if (resumeData.phone) score += 5;
    totalPossible += 20;

    // Professional summary/objective (10%)
    if (resumeData.summary || resumeData.objective) score += 10;
    totalPossible += 10;

    // Experience section (20%)
    if (resumeData.experience && resumeData.experience.length > 0) {
      score += 10;
      if (resumeData.experience.length >= 2) score += 10;
    }
    totalPossible += 20;

    // Education section (15%)
    if (resumeData.education && resumeData.education.length > 0) {
      score += 15;
    }
    totalPossible += 15;

    // Skills section (15%)
    if (resumeData.skills && resumeData.skills.length >= 5) {
      score += 15;
    } else if (resumeData.skills && resumeData.skills.length > 0) {
      score += 5;
    }
    totalPossible += 15;

    // Projects section (10%)
    if (resumeData.projects && resumeData.projects.length > 0) {
      score += 10;
    }
    totalPossible += 10;

    // Additional sections (10%)
    if (
      (resumeData.certifications && resumeData.certifications.length > 0) ||
      (resumeData.achievements && resumeData.achievements.length > 0) ||
      (resumeData.languages && resumeData.languages.length > 0)
    ) {
      score += 10;
    }
    totalPossible += 10;

    return Math.round((score / totalPossible) * 100);
  };

  // Check for achievements
  useEffect(() => {
    const newAchievements = [];
    const resumeScore = calculateResumeScore();

    // Score-based achievements
    if (resumeScore >= 20 && !achievements.includes("starter")) {
      newAchievements.push("starter");
    }
    if (resumeScore >= 50 && !achievements.includes("halfway")) {
      newAchievements.push("halfway");
    }
    if (resumeScore >= 80 && !achievements.includes("almost_there")) {
      newAchievements.push("almost_there");
    }
    if (resumeScore >= 95 && !achievements.includes("perfectionist")) {
      newAchievements.push("perfectionist");
    }

    // Section-based achievements
    if (resumeData.skills && resumeData.skills.length >= 5 && !achievements.includes("skill_master")) {
      newAchievements.push("skill_master");
    }
    if (resumeData.experience && resumeData.experience.length >= 3 && !achievements.includes("experienced")) {
      newAchievements.push("experienced");
    }
    if (resumeData.projects && resumeData.projects.length >= 2 && !achievements.includes("project_pro")) {
      newAchievements.push("project_pro");
    }
    if (resumeData.languages && resumeData.languages.length >= 2 && !achievements.includes("polyglot")) {
      newAchievements.push("polyglot");
    }

    // Update achievements and show celebration if new ones are unlocked
    if (newAchievements.length > 0) {
      setAchievements([...achievements, ...newAchievements]);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }

    // Calculate XP based on resume score and achievements
    const newXP = resumeScore + (achievements.length * 10);
    setExperiencePoints(newXP);
    
    // Calculate level based on XP (100 XP per level)
    setUserLevel(Math.floor(newXP / 100) + 1);
  }, [resumeData, achievements]);

  // Suggested tasks for improvement
  const improvementTasks = [
    { id: 1, name: "Add a professional summary", xp: 15, completed: !!resumeData.summary },
    { id: 2, name: "Include at least 3 skills", xp: 10, completed: resumeData.skills && resumeData.skills.length >= 3 },
    { id: 3, name: "Add your work experience", xp: 20, completed: resumeData.experience && resumeData.experience.length > 0 },
    { id: 4, name: "Include education history", xp: 15, completed: resumeData.education && resumeData.education.length > 0 },
    { id: 5, name: "Add at least one project", xp: 15, completed: resumeData.projects && resumeData.projects.length > 0 },
    { id: 6, name: "Include contact information", xp: 10, completed: !!(resumeData.email && resumeData.phone) },
    { id: 7, name: "Add languages you speak", xp: 10, completed: resumeData.languages && resumeData.languages.length > 0 },
    { id: 8, name: "Include certifications", xp: 10, completed: resumeData.certifications && resumeData.certifications.length > 0 },
  ];

  // Celebration animation component
  const Celebration = () => (
    <div className="celebration">
      <div className="confetti"></div>
      <div className="confetti"></div>
      <div className="confetti"></div>
      <div className="confetti"></div>
      <div className="confetti"></div>
      <div className="confetti"></div>
      <div className="confetti"></div>
      <div className="confetti"></div>
      <div className="confetti"></div>
      <div className="confetti"></div>
      <div className="celebration-content">
        <Trophy size={48} className="trophy" />
        <h3>Achievement Unlocked!</h3>
      </div>
    </div>
  );

  return (
    <div className="gamification-panel">
      <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
        <Trophy className="text-yellow-500" /> Resume Builder Game
      </h2>
      
      {showCelebration && <Celebration />}
      
      <div className="level-progress mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Level {userLevel}</span>
          <span className="text-sm text-gray-500">{experiencePoints} XP</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${(experiencePoints % 100)}%` }}
          ></div>
        </div>
      </div>
      
      <div className="resume-score mb-6">
        <div className="score-circle">
          <span className="score-text">{calculateResumeScore()}%</span>
          <span className="score-label">Complete</span>
        </div>
        <p className="text-center text-sm text-gray-600 mt-2">
          Keep adding content to improve your resume score!
        </p>
      </div>
      
      <div className="tasks-section mb-6">
        <h3 className="flex items-center gap-2 text-lg font-medium mb-3">
          <Target size={18} /> Tasks for Improvement
        </h3>
        <div className="tasks-list">
          {improvementTasks.map(task => (
            <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
              <div className="task-checkbox">
                {task.completed ? (
                  <CheckCircle className="text-green-500" size={18} />
                ) : (
                  <div className="empty-circle"></div>
                )}
              </div>
              <span className="task-text">{task.name}</span>
              <span className="task-xp">+{task.xp} XP</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="achievements-section">
        <h3 className="flex items-center gap-2 text-lg font-medium mb-3">
          <Award size={18} /> Achievements
        </h3>
        <div className="achievements-grid">
          <div className={`achievement ${achievements.includes("starter") ? 'unlocked' : 'locked'}`}>
            <div className="achievement-icon">
              <Star size={24} />
            </div>
            <span className="achievement-name">Starter</span>
            <span className="achievement-desc">Reach 20% completion</span>
          </div>
          
          <div className={`achievement ${achievements.includes("halfway") ? 'unlocked' : 'locked'}`}>
            <div className="achievement-icon">
              <Zap size={24} />
            </div>
            <span className="achievement-name">Halfway There</span>
            <span className="achievement-desc">Reach 50% completion</span>
          </div>
          
          <div className={`achievement ${achievements.includes("skill_master") ? 'unlocked' : 'locked'}`}>
            <div className="achievement-icon">
              <Award size={24} />
            </div>
            <span className="achievement-name">Skill Master</span>
            <span className="achievement-desc">Add 5+ skills</span>
          </div>
          
          <div className={`achievement ${achievements.includes("perfectionist") ? 'unlocked' : 'locked'}`}>
            <div className="achievement-icon">
              <Trophy size={24} />
            </div>
            <span className="achievement-name">Perfectionist</span>
            <span className="achievement-desc">Reach 95% completion</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .gamification-panel {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          margin: 20px 0;
          position: relative;
          overflow: hidden;
        }
        
        .level-progress {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
        }
        
        .resume-score {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .score-circle {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: #4f46e5;
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          position: relative;
        }
        
        .score-text {
          font-size: 24px;
          font-weight: bold;
        }
        
        .score-label {
          font-size: 12px;
          opacity: 0.9;
        }
        
        .tasks-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .task-item {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          background: #f8f9fa;
          border-radius: 6px;
        }
        
        .task-item.completed {
          background: #f0f9f0;
        }
        
        .task-checkbox {
          margin-right: 10px;
        }
        
        .empty-circle {
          width: 18px;
          height: 18px;
          border: 2px solid #ddd;
          border-radius: 50%;
        }
        
        .task-text {
          flex: 1;
          font-size: 14px;
        }
        
        .task-item.completed .task-text {
          text-decoration: line-through;
          color: #888;
        }
        
        .task-xp {
          font-size: 12px;
          font-weight: bold;
          color: #4f46e5;
        }
        
        .achievements-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        
        .achievement {
          padding: 12px;
          border-radius: 8px;
          text-align: center;
          background: #f8f9fa;
        }
        
        .achievement.unlocked {
          background: #fff8e1;
          border: 1px solid #ffd54f;
        }
        
        .achievement.locked {
          opacity: 0.6;
        }
        
        .achievement-icon {
          margin-bottom: 8px;
        }
        
        .achievement-name {
          display: block;
          font-weight: bold;
          font-size: 14px;
        }
        
        .achievement-desc {
          font-size: 12px;
          color: #666;
        }
        
        .celebration {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255,255,255,0.9);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10;
          animation: fadeIn 0.3s ease;
        }
        
        .celebration-content {
          text-align: center;
          animation: bounce 0.5s ease infinite alternate;
        }
        
        .celebration-content h3 {
          margin-top: 10px;
          color: #4f46e5;
        }
        
        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          background: #ffd54f;
          opacity: 0.8;
          border-radius: 0;
        }
        
        .confetti:nth-child(1) {
          top: 10%;
          left: 20%;
          background: #ffd54f;
          animation: fall 1s ease-in infinite;
        }
        
        .confetti:nth-child(2) {
          top: 15%;
          left: 40%;
          background: #4f46e5;
          animation: fall 1.2s ease-in infinite;
        }
        
        .confetti:nth-child(3) {
          top: 5%;
          left: 60%;
          background: #ef4444;
          animation: fall 0.8s ease-in infinite;
        }
        
        .confetti:nth-child(4) {
          top: 20%;
          left: 80%;
          background: #10b981;
          animation: fall 1.1s ease-in infinite;
        }
        
        .confetti:nth-child(5) {
          top: 15%;
          left: 10%;
          background: #8b5cf6;
          animation: fall 0.9s ease-in infinite;
        }
        
        .confetti:nth-child(6) {
          top: 25%;
          left: 30%;
          background: #f97316;
          animation: fall 1.3s ease-in infinite;
        }
        
        .confetti:nth-child(7) {
          top: 10%;
          left: 70%;
          background: #06b6d4;
          animation: fall 1s ease-in infinite;
        }
        
        .confetti:nth-child(8) {
          top: 5%;
          left: 50%;
          background: #ec4899;
          animation: fall 1.4s ease-in infinite;
        }
        
        .confetti:nth-child(9) {
          top: 20%;
          left: 90%;
          background: #84cc16;
          animation: fall 0.7s ease-in infinite;
        }
        
        .confetti:nth-child(10) {
          top: 30%;
          left: 5%;
          background: #f43f5e;
          animation: fall 1.2s ease-in infinite;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes bounce {
          from { transform: translateY(0); }
          to { transform: translateY(-10px); }
        }
        
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100px) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}