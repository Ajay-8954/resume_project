import React from 'react';
import { forwardRef } from 'react';
import './Template7.css';
import useResumeStore from '../../store/useResumeStore';

const Template7 = forwardRef(({ data = {} }, ref) => {
    const {toggle}= useResumeStore();
  const {
    Name,
    jobTitle,
    email,
    phone,
    location,
    linkedin,
    github,
    summary,
    objective,
    experience = [],
    internships = [],
    education = [],
    skills = [],
    projects = [],
    achievements = [],
    certifications = [],
    interests = [],
    languages = []
  } = data;

  const contactItems = [];
  if (email) contactItems.push(email);
  if (phone) contactItems.push(phone);
  if (location) contactItems.push(location);
  if (linkedin) contactItems.push(linkedin);
  if (github) contactItems.push(github);

  return (
    <div className="template7-container" ref={ref}>
      <div className="template7-resume">
        {/* Header Section */}
        <div className="template7-header">
          <h1 className="template7-name">{Name}</h1>
          {/* <h2 className="template7-job-title">{jobTitle}</h2> */}
          <p className="template7-contact">{contactItems.join(' | ')}</p>
        </div>

        {/* Profile/Summary/Objective Section */}
        { toggle==="experienced" && summary && (
          <div className="template7-section">
            <h3 className="template7-section-title">PROFESSIONAL SUMMARY</h3>
            <p className="template7-section-content">
              {summary}
            </p>
          </div>
        )}

        {toggle==="fresher" && objective && (
          <div className="template7-section">
            <h3 className="template7-section-title">CAREER OBJECTIVE</h3>
            <p className="template7-section-content">
              {objective}
            </p>
          </div>
        )}

        {/* Education Section */}
        {education.length > 0 && (
          <div className="template7-section">
            <h3 className="template7-section-title">EDUCATION</h3>
            {education.map((edu, index) => (
              <div key={index} className="template7-education-item">
                <div className="template7-education-details">
                  <h4>{edu.degree}</h4>
                  <p>{edu.school}{edu.location && `, ${edu.location}`}</p>
                  {edu.cgpa && <p>CGPA: {edu.cgpa}</p>}
                </div>
                <span className="template7-education-year">
                  {edu.startDate} - {edu.endDate}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Skills Section */}
        {skills.length > 0 && (
          <div className="template7-section">
            <h3 className="template7-section-title">SKILLS</h3>
            <div className="template7-skills-grid">
              {skills.map((skill, index) => (
                <div key={index} className="template7-skill-item">
                  <span>{skill}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience Section */}
        {experience.length > 0 && (
          <div className="template7-section">
            <h3 className="template7-section-title">EXPERIENCE</h3>
            {experience.map((exp, index) => (
              <div key={index} className="template7-experience-item">
                <div className="template7-experience-header">
                  <div className="template7-experience-details">
                    <h4>{exp.jobTitle}</h4>
                    <p>{exp.company}{exp.location && `, ${exp.location}`}</p>
                  </div>
                  <span className="template7-experience-duration">
                    {exp.startDate} - {exp.endDate}
                  </span>
                </div>
                {exp.description && (
                  <ul className="template7-description-list">
                    {Array.isArray(exp.description)
                      ? exp.description.map(
                          (point, idx) => point && <li key={idx}>{point}</li>
                        )
                      : (exp.description || "")
                          .split("\n")
                          .filter(Boolean)
                          .map((point, idx) => (
                            <li key={idx}>
                              {point.replace(/^\s*•\s*/, "").trim()}
                            </li>
                          ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Internships Section */}
        {internships.length > 0 && (
          <div className="template7-section">
            <h3 className="template7-section-title">INTERNSHIPS</h3>
            {internships.map((internship, index) => (
              <div key={index} className="template7-experience-item">
                <div className="template7-experience-header">
                  <div className="template7-experience-details">
                    <h4>{internship.role}</h4>
                    <p>{internship.company}{internship.location && `, ${internship.location}`}</p>
                  </div>
                  <span className="template7-experience-duration">
                    {internship.startDate} - {internship.endDate}
                  </span>
                </div>
                {internship.description && (
                  <ul className="template7-description-list">
                    {Array.isArray(internship.description)
                      ? internship.description.map(
                          (point, idx) => point && <li key={idx}>{point}</li>
                        )
                      : (internship.description || "")
                          .split("\n")
                          .filter(Boolean)
                          .map((point, idx) => (
                            <li key={idx}>
                              {point.replace(/^\s*•\s*/, "").trim()}
                            </li>
                          ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Projects Section */}
        {projects.length > 0 && (
          <div className="template7-section">
            <h3 className="template7-section-title">PROJECTS</h3>
            {projects.map((project, index) => (
              <div key={index} className="template7-project-item">
                <div className="template7-project-header">
                  <div className="template7-project-title-container">
                    <h4 className="template7-project-title">{project.title}</h4>
                  </div>
                  <span className="template7-project-duration">
                    {project.startDate} - {project.endDate}
                  </span>
                </div>
                {project.description && (
                  <ul className="template7-description-list">
                    {Array.isArray(project.description)
                      ? project.description.map(
                          (point, idx) => point && <li key={idx}>{point}</li>
                        )
                      : (project.description || "")
                          .split("\n")
                          .filter(Boolean)
                          .map((point, idx) => (
                            <li key={idx}>
                              {point.replace(/^\s*•\s*/, "").trim()}
                            </li>
                          ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Certifications Section */}
        {certifications.length > 0 && (
          <div className="template7-section">
            <h3 className="template7-section-title">CERTIFICATIONS</h3>
            {certifications.map((cert, index) => (
              <div key={index} className="template7-certification-item">
                <div className="template7-certification-header">
                  <div className="template7-certification-details">
                    <h4>{cert.name}</h4>
                    <p>{cert.issuer}</p>
                  </div>
                  <span className="template7-certification-date">{cert.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Languages Section */}
        {languages.length > 0 && (
          <div className="template7-section">
            <h3 className="template7-section-title">LANGUAGES</h3>
            <div className="template7-languages-grid">
              {languages.map((language, index) => (
                <div key={index} className="template7-language-item">
                  <span>{language}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interests Section */}
        {interests.length > 0 && (
          <div className="template7-section">
            <h3 className="template7-section-title">INTERESTS</h3>
            <p className="template7-interests">
              {interests.join(', ')}
            </p>
          </div>
        )}

        {/* Leadership, Achievements and Extracurriculars Section */}
        {achievements.length > 0 && (
          <div className="template7-achievements-section">
            <h3 className="template7-section-title">LEADERSHIP, ACHIEVEMENTS AND EXTRACURRICULARS</h3>
            <div className="template7-achievements-content">
              {achievements.map((achievement, index) => (
                <div key={index} className="template7-achievement-item">
                  <h4 className="template7-achievement-title">{achievement.title}</h4>
                  {achievement.description && (
                    <div className="template7-achievement-description">
                      {Array.isArray(achievement.description)
                        ? achievement.description.map(
                            (point, idx) => point && <li key={idx}>{point}</li>
                          )
                        : (achievement.description || "")
                            .split("\n")
                            .filter(Boolean)
                            .map((point, idx) => (
                              <li key={idx}>
                                {point.replace(/^\s*•\s*/, "").trim()}
                              </li>
                            ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default Template7;