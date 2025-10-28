import React, { forwardRef } from "react";
import useResumeStore from "../../store/useResumeStore";
import "./Google.css";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const options = { year: "numeric", month: "short" };
  const date = new Date(dateStr);
  return isNaN(date) ? dateStr : date.toLocaleDateString("en-US", options);
};

const Google = forwardRef(({ data = {} }, ref) => {
  const { toggle } = useResumeStore();

  const {
    Name = "Jennifer Jobscan",
    email = "jennifer@jobscan.co",
    phone = "(123) 456-7890",
    location = "",
    linkedin,
    github,
    summary = "",
    objective = "",
    experience = [],
    internships = [],
    education = [],
    skills = [],
    languages = [],
    projects = [],
    certifications = [],
    interests = [],
    achievements = [],
  } = data || {};

  return (
    <div ref={ref} className="resume-t2">
      {/* Header */}
      <header className="header-t2">
        <h1>{Name}</h1>
        <div className="contact-info-t2">
          <span>
            <strong>Phone:</strong> {phone}
          </span>
          <span>
            <strong>Email:</strong> {email}
          </span>
          {linkedin && <a href={linkedin}>LinkedIn</a>}
          {github && <a href={github}>Github</a>}
          <span className="info-location">
            <strong>Location:</strong> {location}
          </span>
        </div>
      </header>

      {/* Summary/Objective */}
      {toggle === "experienced" && summary && (
        <section className="section-t2">
          <h2 className="section-title-t2">PROFESSIONAL SUMMARY</h2>
          <p className="details-t2">{summary}</p>
        </section>
      )}

      {toggle === "fresher" && objective && (
        <section className="section-t2">
          <h2 className="section-title-t2">CAREER OBJECTIVE</h2>
          <p className="details-t2">{objective}</p>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section className="section-t2 skills-section">
          <h2 className="section-title-t2">SKILLS</h2>
          <ul>
            {skills.map((skill, idx) => (
              <li key={idx} className="info-skill">{skill}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="section-t2">
          <h2 className="section-title-t2">EXPERIENCE</h2>
          {experience.map((item, idx) => (
            <div key={idx} className="item-t2">
              <div className="item-header">
                <div>
                  <p className="info-internship">
                    {item.company} - {item.jobTitle}, {item.location}
                  </p>
                </div>
                <p className="date-range">
                  {formatDate(item.startDate)} - {formatDate(item.endDate)}
                </p>
              </div>
              <ul>
                {Array.isArray(item.description)
                  ? item.description.map((point, i) => <li key={i}>{point}</li>)
                  : (item.description || "")
                      .split("\n")
                      .filter(Boolean)
                      .map((point, i) => (
                        <li key={i}>{point.replace(/^\s*•\s*/, "").trim()}</li>
                      ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="section-t2">
          <h2 className="section-title-t2">EDUCATION</h2>
          {education.map((edu, idx) => (
            <div key={idx} className="item-t2">
              <div className="item-header">
                <div>
                  <p className="info-capital">{edu.school}</p>
                  <p>{edu.degree}, {edu.location}</p>
                </div>
                <p className="date-range">
                  {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                </p>
              </div>
              {edu.cgpa && <p>CGPA: {edu.cgpa}</p>}
            </div>
          ))}
        </section>
      )}

      {/* Internships */}
      {internships.length > 0 && (
        <section className="section-t2">
          <h2 className="section-title-t2">INTERNSHIP</h2>
          {internships.map((item, idx) => (
            <div key={idx} className="item-t2">
              <div className="item-header">
                <div>
                  <p className="info-internship">
                    {item.company} - {item.jobTitle || item.role}, {item.location}
                  </p>
                </div>
                <p className="date-range">
                  {formatDate(item.startDate)} - {formatDate(item.endDate)}
                </p>
              </div>
              <ul>
                {Array.isArray(item.description)
                  ? item.description.map((point, i) => <li key={i}>{point}</li>)
                  : (item.description || "")
                      .split("\n")
                      .filter(Boolean)
                      .map((point, i) => (
                        <li key={i}>{point.replace(/^\s*•\s*/, "").trim()}</li>
                      ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="section-t2">
          <h2 className="section-title-t2">PROJECTS</h2>
          {projects.map((proj, idx) => (
            <div key={idx} className="item-t2">
              <div className="item-header">
                <div>
                  <p className="info-project">
                    {proj.title} - {proj.tech}
                  </p>
                </div>
                <p className="date-range">
                  {formatDate(proj.startDate)} - {formatDate(proj.endDate)}
                </p>
              </div>
              <ul>
                {(Array.isArray(proj.description)
                  ? proj.description
                  : (proj.description || "")
                      .split("\n")
                      .map((line) => line.trim())
                      .map((point) => point.replace(/^[-•]\s*/, ""))
                      .filter(Boolean)
                ).map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <section className="section-t2">
          <h2 className="section-title-t2">ACHIEVEMENTS</h2>
          {achievements.map((ach, idx) => (
            <div key={idx} className="item-t2">
              <div className="item-header">
                <p>{ach.title}</p>
                <p className="date-range">{formatDate(ach.Date)}</p>
              </div>
              <ul>
                {Array.isArray(ach.description)
                  ? ach.description.map((point, i) => <li key={i}>{point}</li>)
                  : (ach.description || "")
                      .split("\n")
                      .filter(Boolean)
                      .map((point, i) => <li key={i}>{point.replace(/^\s*•\s*/, "").trim()}</li>)}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <section className="section-t2">
          <h2 className="section-title-t2">CERTIFICATIONS</h2>
          {certifications.map((cert, idx) => (
            <div key={idx} className="item-t2">
              <div className="item-header">
                <p>
                  {cert.name} - {cert.issuer}
                </p>
                <p className="date-range">{formatDate(cert.Date)}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <section className="section-t2">
          <h2 className="section-title-t2">LANGUAGES</h2>
          <ul>
            {languages.map((lang, idx) => (
              <li key={idx} className="info-language">{lang}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Interests */}
      {interests.length > 0 && (
        <section className="section-t2">
          <h2 className="section-title-t2">INTERESTS</h2>
          <ul className="info-interest">
            {interests.map((interest, idx) => (
              <li key={idx}>{interest}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
});

export default Google;