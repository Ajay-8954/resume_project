import React, { forwardRef } from "react";
import useResumeStore from "../../store/useResumeStore";
import "./Microsoft.css";

const SectionTitle = ({ children }) => (
  <div className="section-title">
    <span></span>
    <h2>{children}</h2>
    <span></span>
  </div>
);

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const options = { year: "numeric", month: "short" };
  const date = new Date(dateStr);
  return isNaN(date) ? dateStr : date.toLocaleDateString("en-US", options);
};

const Microsoft = forwardRef(({ data = {} }, ref) => {
  const { toggle } = useResumeStore();
  const {
    Name = "GABRIELLA TORRES",
    email = "example@example.com",
    phone = "(555) 555-5555",
    location = "Inglewood, CA 90306",
    objective = "",
    summary = "Empathetic nurse practitioner focused on providing quality care...",
    experience = [],
    education = [],
    skills = [],
    internships = [],
    certifications = [],
    projects = [],
    linkedin,
    github,
    languages,
    interests,
    achievements,
  } = data || {};

  const workItems = toggle === "experienced" ? experience : internships;
  const workTitle = toggle === "experienced" ? "Work History" : "Internships";

  return (
    <div ref={ref} className="resume-container">
      <header className="resume-header">
        <h1>{Name}</h1>
        <p>
          <span>♦</span>
          <span className="info">{phone}</span>
          <span>♦</span>
          <span className="info">{email}</span>
          <span>♦</span>
          {/* new class added */}
          <span className="info-location">{location}</span>
        </p>
      </header>

      {toggle === "fresher" && objective && (
        <section>
          <SectionTitle>Career Objective</SectionTitle>
          <p className="section-text">{objective}</p>
        </section>
      )}

      {toggle === "experienced" && summary && (
        <section>
          <SectionTitle>Professional Summary</SectionTitle>
          <p className="section-text">{summary}</p>
        </section>
      )}

      {education.length > 0 && (
        <section>
          <SectionTitle>Education</SectionTitle>
          {education.map((edu, idx) => (
            <div key={idx} className="education-item">
              <div className="education-row">
                <p>{edu.degree}</p>
                <span className="date-right">
                  {formatDate(edu.startDate)} - {formatDate(edu.endDate) || "Present"}
                </span>
              </div>
              <p className="section-text info-capital">{edu.school}</p>
              {edu.cgpa && <span className="section-text">CGPA: {edu.cgpa}</span>}
            </div>
          ))}
        </section>
      )}

      {skills.length > 0 && (
        <section>
          <SectionTitle>Skills</SectionTitle>
          <div className="skills-grid info-skill">
            {(() => {
              const mid = Math.ceil(skills.length / 2);
              const col1 = skills.slice(0, mid);
              const col2 = skills.slice(mid);
              return (
                <>
                  <ul>{col1.map((skill, idx) => <li key={idx}>{skill}</li>)}</ul>
                  <ul>{col2.map((skill, idx) => <li key={idx}>{skill}</li>)}</ul>
                </>
              );
            })()}
          </div>
        </section>
      )}

   {experience.length > 0 && (
        <section>
          <SectionTitle>Work History</SectionTitle>
          {experience.map((item, idx) => (
            <div className="work-item" key={idx}>
              <div className="work-row">
                <div className="info-internship">
                  <h3 >{item.jobTitle}</h3>
                  <p className="section-text">{item.company}</p>
                </div>
                <div className="date-right">
                  {formatDate(item.startDate)} - {formatDate(item.endDate) || "Present"}
                </div>
              </div>
              <ul className="work-list">
                {(Array.isArray(item.description)
                  ? item.description
                  : (item.description || "").split("\n")
                ).filter(Boolean).map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {internships.length > 0 && (
        <section>
          <SectionTitle>Internships</SectionTitle>
          {internships.map((item, idx) => (
            <div className="work-item" key={idx}>
              <div className="work-row">
                <div className="info-internship">
                  <h3>{item.role}</h3>
                  <p className="section-text">{item.company}</p>
                </div>
                <div className="date-right">
                  {formatDate(item.startDate)} - {formatDate(item.endDate) || "Present"}
                </div>
              </div>
              <ul className="work-list">
                {(Array.isArray(item.description)
                  ? item.description
                  : (item.description || "").split("\n")
                ).filter(Boolean).map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}


      {projects.length > 0 && (
        <section>
          <SectionTitle>Projects</SectionTitle>
          {projects.map((proj, idx) => (
            <div className="project-item" key={idx}>
              <div className="project-row">
                <h3 className="info-project">{proj.title}</h3>
                <div className="date-right">
                  {formatDate(proj.startDate)} - {formatDate(proj.endDate)}
                </div>
              </div>
              <p className="project-tech">{proj.tech}</p>
              <ul className="project-points"> {/* Added project-points class */}
                {(Array.isArray(proj.description)
                  ? proj.description
                  : (proj.description || "").split("\n")
                ).filter(Boolean).map((point, i) => <li key={i}>{point}</li>)}
              </ul>
            </div>
          ))}
        </section>
      )}

      {achievements?.length > 0 && (
        <section>
          <SectionTitle>Achievements</SectionTitle>
          {achievements.map((ach, idx) => (
            <div key={idx} className="achievement-item">
              <div className="work-row">
                <h3>{ach.title}</h3>
                <span className="date-right">{formatDate(ach.Date)}</span>
              </div>
              <ul className="achievement-item ul"> {/* Added class */}
                {(ach.description || "")
                  .split("\n")
                  .map(line => line.trim())
                  .filter(Boolean)
                  .map((point, i) => <li key={i}>{point}</li>)}
              </ul>
            </div>
          ))}
        </section>
      )}

      {certifications.length > 0 && (
        <section>
          <SectionTitle>Certifications</SectionTitle>
          <ul className="certification-list">
            {certifications.map((cert, idx) => (
              <li key={idx} className="certification-item">
                <p>{cert.name}</p>
                <span className="date-right">{formatDate(cert.date)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {interests?.length > 0 && (
        <section>
          <SectionTitle>Interests</SectionTitle>
          <ul className="list-style">{interests.map((interest, idx) => <li key={idx} className="info-interest">{interest}</li>)}</ul> {/* Added list-style class */}
        </section>
      )}

      {languages?.length > 0 && (
        <section>
          <SectionTitle>Languages</SectionTitle>
          <ul className="list-style ">{languages.map((lang, idx) => <li key={idx} className="info-languages">{lang}</li>)}</ul> {/* Added list-style class */}
        </section>
      )}
    </div>
  );
});

export default Microsoft;