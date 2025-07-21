import React, { useRef, forwardRef } from "react";
import useResumeStore from "../../store/useResumeStore";
import "./Meta.css";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const options = { year: "numeric", month: "short" }; // e.g., Jan 2023
  const date = new Date(dateStr);
  return isNaN(date) ? dateStr : date.toLocaleDateString("en-US", options);
};

const Meta = forwardRef(({ data = {} }, ref) => {

   const { toggle } = useResumeStore();

  const {
    Name,
    jobTitle,
    email,
    phone,
    location,
    linkedin,
    github,
    summary,
    objective="",
    experience,
    internships,
    education,
    skills,
    languages,
    interests,
    achievements,
    certifications,
    projects,
  } = data || {};


    const workItems = toggle === "experienced" ? experience : internships;
  const workTitle = toggle === "experienced" ? "WORK EXPERIENCE" : "INTERNSHIPS";


  return (
    <div ref={ref} className="meta-container">
      {/* Header */}
      <header className="meta-header">
        <h1 className="meta-name">{Name}</h1>
        <div className="meta-contact">
          {phone && <span>{phone}</span>} |&nbsp;
          {email && <span>{email}</span>} |&nbsp;
          {location && <span>{location}</span>}
        </div>
        <div className="meta-links">
          {linkedin && (
            <a href={linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          )}
          {github && (
            <a href={github} target="_blank" rel="noreferrer">
              GitHub
            </a>
          )}
        </div>
      </header>
      <hr />

      {/* Professional Summary */}
     {/* Objective or Summary */}
      {toggle === "fresher" && objective && (
        <section className="meta-section">
          <h2 className="meta-section-heading">CAREER OBJECTIVE</h2>
          <p className="meta-text">{objective}</p>
        </section>
      )}
      {toggle === "experienced" && summary && (
        <section className="meta-section">
          <h2 className="meta-section-heading">PROFESSIONAL SUMMARY</h2>
          <p className="meta-text">{summary}</p>
        </section>
      )}


      {/* Education */}
      {education?.length > 0 && (
        <section className="meta-section">
          <h2 className="meta-section-heading">EDUCATION</h2>
          {education.map((edu, i) => (
            <div key={i} className="meta-item">
              <div className="meta-flex">
                <strong>
                  {edu.degree} - {edu.school}
                </strong>
                <strong className="meta-dates">
                  {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                </strong>
              </div>
              {edu.cgpa && <div className="meta-cgpa">CGPA: {edu.cgpa}</div>}
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {skills?.length > 0 && (
        <section className="meta-section">
          <h2 className="meta-section-heading">SKILLS</h2>
          <div className="meta-list">{skills.join(" | ")}</div>
        </section>
      )}

      {/* Internships */}
      {(experience?.length > 0 ? experience : internships)?.length > 0 && (
        <section className="meta-section">
          <h2 className="meta-section-heading">
            {experience?.length > 0 ? "WORK EXPERIENCE" : "INTERNSHIP"}
          </h2>
          {(experience?.length > 0 ? experience : internships).map(
            (item, i) => (
              <div key={i} className="meta-item">
                <div className="meta-flex">
                  <strong>
                    <i>{item.jobTitle || item.role}</i> - {item.company}
                  </strong>
                  <strong className="meta-dates">
                    {formatDate(item.startDate)} - {formatDate(item.endDate)}
                  </strong>
                </div>
                <ul className="meta-bullets">
                  {(item.description || "")
                    .split("\n")
                    .map((point) => point.trim())
                    .filter(Boolean)
                    .map((point, j) => (
                      <li key={j}>{point}</li>
                    ))}
                </ul>
              </div>
            )
          )}
        </section>
      )}

      {/* Projects */}
      {projects?.length > 0 && (
        <section className="meta-section">
          <h2 className="meta-section-heading">PROJECTS</h2>
          {projects.map((proj, i) => (
            <div key={i} className="meta-item">
              <div className="meta-flex">
                <strong>{proj.title}</strong>
                <strong className="meta-dates">
                  {formatDate(proj.startDate)} - {formatDate(proj.endDate)}
                </strong>
              </div>
              <ul className="meta-bullets">
                {Array.isArray(proj.description)
                  ? proj.description.map((point, i) => <li key={i}>{point}</li>)
                  : (proj.description || "")
                      .split("\n")
                      .filter(Boolean)
                      .map((point, i) => (
                        <li
                          key={i}
                          className="break-words text-wrap leading-snug"
                        >
                          {point}
                        </li>
                      ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {achievements?.length > 0 && (
        <section className="meta-section">
          <h2 className="meta-section-heading">ACHIEVEMENTS</h2>
          {achievements.map((ach, i) => (
            <div key={i} className="meta-item">
              <strong>{ach.title}</strong>
              <ul className="meta-bullets">
                {(ach.description || "")
                  .split("\n")
                  .map((point, j) => point.trim())
                  .filter(Boolean)
                  .map((point, j) => (
                    <li key={j}>{point}</li>
                  ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {certifications?.length > 0 && (
        <section className="meta-section">
          <h2 className="meta-section-heading">CERTIFICATIONS</h2>
          <ul className="meta-bullets">
            {certifications.map((cert, i) => (
              <li key={i}>
                {cert.name} — {cert.issuer} ({formatDate(cert.Date)})
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Interests */}
      {interests?.length > 0 && (
        <section className="meta-section">
          <h2 className="meta-section-heading">INTERESTS AND HOBBIES</h2>
          <ul className="meta-bullets">
            {interests.map((interest, i) => (
              <li key={i}>{interest}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
});

export default Meta;
