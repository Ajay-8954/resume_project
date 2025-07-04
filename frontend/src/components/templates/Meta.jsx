import React, { useRef, forwardRef } from "react";
import "./Meta.css";

const Meta = forwardRef(({ data = {} },ref) => {
  const {
    Name,
    jobTitle,
    email,
    phone,
    location,
    linkedin,
    github,
    summary,
    experience,
    internships,
    education,
    skills,
    languages,
    interests,
    achievements,
    projects,
  } = data;

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
      {summary && (
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
                <strong>{edu.degree} - {edu.school}</strong>
                <strong className="meta-dates">{edu.startDate} - {edu.endDate}</strong>
              </div>
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
      {internships?.length > 0 && (
        <section className="meta-section">
          <h2 className="meta-section-heading">INTERNSHIP</h2>
          {internships.map((intern, i) => (
            <div key={i} className="meta-item">
              <div className="meta-flex">
                <strong><i>{intern.role}</i> - {intern.company}</strong>
                <strong className="meta-dates">{intern.startDate} - {intern.endDate}</strong>
              </div>
              <p className="meta-text">{intern.description}</p>
            </div>
          ))}
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
                <strong className="meta-dates">{proj.startDate} - {proj.endDate}</strong>
              </div>
              <ul className="meta-bullets">
                {proj.points.map((point, j) => (
                  <li key={j}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Achievements */}
      {achievements?.length > 0 && (
        <section className="meta-section">
          <h2 className="meta-section-heading">ACHIEVEMENTS</h2>
          {achievements.map((ach, i) => (
            <div key={i} className="meta-item">
              <strong>{ach.title}</strong>
              <ul className="meta-bullets">
                {ach.points.map((point, j) => (
                  <li key={j}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
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
