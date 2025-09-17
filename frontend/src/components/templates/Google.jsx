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
    jobTitle = "Product Manager",
    email = "jennifer@jobscan.co",
    phone = "(123) 456-7890",
    location="",
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
    <div
      ref={ref}
      className="resume-t2 "
    
    >
      {/* Header */}
      <div className="header-t2 text-center pb-3">
        <h1 className="font-bold text-[24px]">{Name}</h1>
        <div className="contact-info-t2 mt-1 space-x-4 text-[10px]">
          <span className="mr-2">
            <strong>Phone:</strong> {phone}
          </span>
          <span className="mr-2">
            <strong>Email:</strong> {email}  
          </span>
          {linkedin && (
            <a href={linkedin} className="mr-2 text-blue-500 hover:underline">
              LinkedIn
            </a>
          )}
          {github && (
            <a href={github} className="mr-2 text-blue-500 hover:underline">
              Github
            </a>
          )}

             <span className="mr-2 info-location">
            <strong>Location:</strong> {location}
          </span>
        </div>
      </div>

      {/* Summary/Objective */}
      {toggle === "experienced" && summary && (
        <section className="section-t2 mt-3">
          <h2 className="section-title-t2 font-semibold border-b text-[13px]">
            PROFESSIONAL SUMMARY
          </h2>
          <p className="details-t2 mt-1 text-justify text-[11px]">{summary}</p>
        </section>
      )}

      {toggle === "fresher" && objective && (
        <section className="section-t2 mt-3">
          <h2 className="section-title-t2 font-semibold border-b text-[13px]">
            CAREER OBJECTIVE
          </h2>
          <p className="details-t2 mt-1 text-justify text-[11px]">
            {objective}
          </p>
        </section>
      )}


          {/* Skills */}
      {skills.length > 0 && (
        <section className="section-t2 skills-section mt-3">
          <h2 className="section-title-t2 font-semibold border-b text-[13px]">
            SKILLS
          </h2>
          <ul className="grid grid-cols-2 gap-1 list-disc list-inside pl-5">
            {skills.map((skill, idx) => (
              <li key={idx} className="text-[10px] info-skill">{skill}</li>
            ))}
          </ul>
        </section>
      )}


           {/* Experience */}
      {experience.length > 0 && (
        <section className="section-t2 mt-3">
          <h2 className="section-title-t2 font-semibold border-b text-[13px]">
            EXPERIENCE
          </h2>
          {experience.map((item, idx) => (
            <div key={idx} className="item-t2 mt-1">
              <div className="flex justify-between items-baseline">
                <div>
                  <p className="font-semibold text-[11px] info-internship">
                    {item.company} - {item.jobTitle} , {item.location}
                  </p>
                </div>
                <p className="text-gray-700 text-[10px]">
                  {formatDate(item.startDate)} - {formatDate(item.endDate)}
                </p>
              </div>
              <ul className="list-disc list-inside ml-4 mt-1 text-gray-800 leading-tight">
                {Array.isArray(item.description)
                  ? item.description.map((point, i) => (
                      <li key={i} className="text-[10px]">{point}</li>
                    ))
                  : (item.description || "")
                      .split("\n")
                      .filter(Boolean)
                      .map((point, i) => (
                        <li key={i} className="text-[10px]">{point.replace(/^\s*•\s*/, "").trim()}</li>
                      ))}
              </ul>
            </div>
          ))}
        </section>
      )}


      {/* Education */}
      {education.length > 0 && (
        <section className="section-t2 mt-3">
          <h2 className="section-title-t2 font-semibold border-b text-[13px]">
            EDUCATION
          </h2>
          {education.map((edu, idx) => (
            <div key={idx} className="item-t2 mt-1">
              <div className="flex justify-between items-baseline">
                <div>
                  <p className="font-semibold text-[11px] info-capital">{edu.school}</p>
                  <p className="text-[10px]">{edu.degree} , {edu.location}</p>
                </div>
                <p className="text-gray-700 text-[10px]">
                  {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                </p>
              </div>
              {edu.cgpa && <p className="text-gray-700 text-[10px]">CGPA: {edu.cgpa}</p>}
            </div>
          ))}
        </section>
      )}

    

      {/* Internship */}
      {internships.length > 0 && (
        <section className="section-t2 mt-3">
          <h2 className="section-title-t2 font-semibold border-b text-[13px]">
            INTERNSHIP
          </h2>
          {internships.map((item, idx) => (
            <div key={idx} className="item-t2 mt-1">
              <div className="flex justify-between items-baseline">
                <div>
                  <p className="font-semibold text-[11px] info-internship">
                    {item.company} - {item.jobTitle || item.role} , {item.location}
                  </p>
                </div>
                <p className="text-gray-700 text-[10px]">
                  {formatDate(item.startDate)} - {formatDate(item.endDate)}
                </p>
              </div>
              <ul className="list-disc list-inside ml-4 mt-1 text-gray-800 leading-tight">
                {Array.isArray(item.description)
                  ? item.description.map((point, i) => (
                      <li key={i} className="text-[10px]">{point}</li>
                    ))
                  : (item.description || "")
                      .split("\n")
                      .filter(Boolean)
                      .map((point, i) => (
                        <li key={i} className="text-[10px]">{point.replace(/^\s*•\s*/, "").trim()}</li>
                      ))}
              </ul>
            </div>
          ))}
        </section>
      )}




      {/* Projects */}
      {projects.length > 0 && (
        <section className="section-t2 mt-3">
          <h2 className="section-title-t2 font-semibold border-b text-[13px]">
            PROJECTS
          </h2>
          {projects.map((proj, idx) => (
            <div key={idx} className="item-t2 mt-1">
              <div className="flex justify-between items-baseline">
                <div>
                  <p className="font-semibold text-[11px] info-project">
                    {proj.title} - {proj.tech}
                  </p>
                </div>
                <p className="text-gray-700 text-[10px]">
                  {formatDate(proj.startDate)} - {formatDate(proj.endDate)}
                </p>
              </div>
              <ul className="list-disc list-inside ml-4 mt-1 leading-tight">
                {(Array.isArray(proj.description)
                  ? proj.description
                  : (proj.description || "")
                      .split("\n")
                      .map((line) => line.trim())
                      .map((point) => point.replace(/^[-•]\s*/, ""))
                      .filter(Boolean)
                ).map((point, i) => (
                  <li key={i} className="break-words text-wrap leading-tight text-[10px]">
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}


      {/* Other sections */}
      {achievements.length > 0 && (
        <section className="section-t2 mt-3">
          <h2 className="section-title-t2 font-semibold border-b text-[13px]">
            ACHIEVEMENTS
          </h2>
          {achievements.map((ach, idx) => (
            <div key={idx} className="item-t2 mt-1 text-[11px]">
              <div className="flex justify-between items-baseline">
                <p className="font-semibold">{ach.title}</p>
                <p className="text-gray-700">{formatDate(ach.Date)}</p>
              </div>
              <ul className="list-disc list-inside ml-4 mt-1 leading-tight">
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

      {certifications.length > 0 && (
        <section className="section-t2 mt-3">
          <h2 className="section-title-t2 font-semibold border-b text-[13px]">
            CERTIFICATIONS
          </h2>
          {certifications.map((cert, idx) => (
            <div key={idx} className="item-t2 mt-1 text-[11px]">
              <div className="flex justify-between items-baseline">
                <p className="font-semibold">
                  {cert.name} - {cert.issuer}
                </p>
                <p className="text-gray-700">{formatDate(cert.Date)}</p>
              </div>
            </div>
          ))}
        </section>
      )}


       {languages.length > 0 && (
        <section className="section-t2 mt-3">
          <h2 className="section-title-t2 font-semibold border-b text-[13px]">
            LANGUAGES
          </h2>
          <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5">
            {languages.map((lang, idx) => (
              <li key={idx} className="text-[10px] info-language">{lang}</li>
            ))}
          </ul>
        </section>
      )}


          {interests.length > 0 && (
        <section className="section-t2 mt-3">
          <h2 className="section-title-t2 font-semibold border-b text-[13px]">
            INTERESTS
          </h2>
          <ul className="list-disc list-inside ml-4 mt-1 text-[11px] space-y-0.5 info-interest">
            {interests.map((interest, idx) => (
              <li key={idx} >{interest}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
});

export default Google;