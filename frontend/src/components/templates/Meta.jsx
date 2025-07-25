import React, { useRef, forwardRef } from "react";
import useResumeStore from "../../store/useResumeStore";
import "./Meta.css";

// const formatDate = (dateStr) => {
//   if (!dateStr) return "";
//   const options = { year: "numeric", month: "short" }; // e.g., Jan 2023
//   const date = new Date(dateStr);
//   return isNaN(date) ? dateStr : date.toLocaleDateString("en-US", options);
// };

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
    objective = "",
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

  return (
    <div ref={ref} className="meta-container">
      {/* Header */}
      <header className="meta-header">
        <h1 className="meta-name">{Name}</h1>
        <div className="meta-contact">
          {phone && <span>{phone}</span>} | 
          {email && <span>{email}</span>} | 
          {location && <span className="info-location">{location}</span>}
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

        {skills?.length > 0 && (
        <section className="meta-section">
          <h2 className="meta-section-heading">SKILLS</h2>
          <div className="meta-list info-skill">{skills.join(" | ")}</div>
        </section>
      )}

    

    {/* Work Experience */}
  {experience?.length > 0 && (
  <section className="meta-section">
    <h2 className="meta-section-heading">WORK EXPERIENCE</h2>
    {experience.map((item, i) => (
      <div key={i} className="meta-item">
        <div className="meta-flex">
          <strong className="info-internship">
            <i>{item.jobTitle || item.role}</i> - {item.company} , {item.location}
          </strong>
          <strong className="meta-dates">
            {item.startDate} - {item.endDate}
          </strong>
        </div>
        <ul className="meta-bullets">
          {Array.isArray(item.description)
            ? item.description.map((point, j) => (
                <li key={j}>{point.trim()}</li>
              ))
            : (typeof item.description === "string" ? item.description : "")
                .split("\n")
                .map((point) => point.trim())
                .filter(Boolean)
                .map((point, j) => (
                  <li key={j}>{point.replace(/^\s*•\s*/, "").trim()}</li>
                ))}
        </ul>
      </div>
    ))}
  </section>
)}

        {/* Education */}
      {education?.length > 0 && (
        <section className="meta-section">
          <h2 className="meta-section-heading">EDUCATION</h2>
          {education.map((edu, i) => (
            <div key={i} className="meta-item">
              <div className="meta-flex">
                <strong className="info-capital">
                  {edu.degree} - {edu.school} , {edu.location}
                </strong>
                <strong className="meta-dates">
                  {edu.startDate} - {edu.endDate}
                </strong>
              </div>
              {edu.cgpa && <div className="meta-cgpa">CGPA: {edu.cgpa}</div>}
            </div>
          ))}
        </section>
      )}


      {/* Internships */}
      {internships?.length > 0 && (
        <section className="meta-section">
          <h2 className="meta-section-heading">INTERNSHIPS</h2>
          {internships.map((item, i) => (
            <div key={i} className="meta-item">
              <div className="meta-flex">
                <strong className="info-internship">
                  <i>{item.jobTitle || item.role}</i> - {item.company} , {item.location}
                </strong>
                <strong className="meta-dates">
                  {item.startDate} - {item.endDate}
                </strong>
              </div>
              <ul className="meta-bullets">
                {(item.description || "")
                  .split("\n")
                  .map((point) => point.trim())
                  .filter(Boolean)
                  .map((point, j) => (
                    <li key={j}>{point.replace(/^\s*•\s*/, "").trim()}</li>
                  ))}
              </ul>
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
                <strong className="info-project">{proj.title}</strong>
                <strong className="meta-dates">
                  {proj.startDate} - {proj.endDate}
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
                          {point.replace(/^\s*•\s*/, "").trim()}
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
                    <li key={j}>{point.replace(/^\s*•\s*/, "").trim()}</li>
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
                {cert.name} — {cert.issuer} ({cert.Date})
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
              <li key={i} className="info-language">{interest}</li>
            ))}
          </ul>
        </section>
      )}

       {languages?.length > 0 && (
        <section className="meta-section">
          <h2 className="meta-section-heading">LANGUAGES</h2>
          <ul className="meta-bullets info-language">
            {languages.map((lang, i) => (
              <li key={i}>{lang}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
});

export default Meta;