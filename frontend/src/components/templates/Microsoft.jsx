import React, { forwardRef } from "react";

// Helper component for the styled section titles
const SectionTitle = ({ children }) => (
  <div className="flex items-center my-6">
    <span className="flex-grow border-t border-blue-400"></span>
    <h2 className="text-center mx-4 text-sm font-bold uppercase text-blue-600 tracking-widest">
      {children}
    </h2>
    <span className="flex-grow border-t border-blue-400"></span>
  </div>
);

const Microsoft = forwardRef(({ data = {} }, ref) => {
  // Destructured data props
  const {
    Name = "GABRIELLA TORRES",
    jobTitle,
    email = "example@example.com",
    phone = "(555) 555-5555",
    location = "Inglewood, CA 90306",
    summary = "Empathetic nurse practitioner focused on providing quality care and maintaining direct lines of communication with patients and the health care team. Calm, understanding professional bringing solid experience in health environments by diagnosing, evaluating and treating acute and chronic medical conditions through physical examinations and testing. Exceptional critical thinking and decision-making skills.",
    experience = [],
    education = [],
    skills = [],
    internships = [],
    certifications = [],
    projects = [],
    // Unused variables
    linkedin,
    github,
    languages,
    interests,
    achievements,
  } = data;

  const workItems = experience.length > 0 ? experience : internships;
  const workTitle = experience.length > 0 ? "Work History" : "Internship";

  return (
    <div ref={ref} className="bg-white p-10 font-sans text-gray-800 w-full max-w-4xl mx-auto">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-600 uppercase tracking-wide">
          {Name}
        </h1>
        <p className="text-xs md:text-sm mt-2 text-gray-600">
          <span>{location}</span>
          <span className="mx-2">♦</span>
          <span>H: {phone}</span>
          <span className="mx-2">♦</span>
          <span>C: {phone}</span>
          <span className="mx-2">♦</span>
          <span>{email}</span>
        </p>
      </header>

      {/* Professional Summary */}
      {summary && (
        <section>
          <SectionTitle>Professional Summary</SectionTitle>
          <p className="text-sm text-justify">{summary}</p>
        </section>
      )}

      {/* Work History / Internship */}
      {(experience.length > 0 || internships.length > 0) && (
        <section>
          <SectionTitle>{workTitle}</SectionTitle>
          {workItems.map((item, idx) => (
            <div className="mb-5" key={idx}>
              <div className="flex justify-between items-baseline mb-1">
                <div className="flex-1">
                  <h3 className="font-bold text-base">{item.jobTitle}</h3>
                  <p className="text-sm text-gray-700">{item.company}</p>
                </div>
                <div className="text-sm text-gray-600 whitespace-nowrap pl-4">
                  <span>{item.startDate} - {item.endDate}</span>
                </div>
              </div>
              <ul className="list-disc pl-5 mt-1 text-sm text-gray-700 space-y-1">
                {item.description && typeof item.description === 'string'
                  ? item.description.split('\n').map((point, i) => (
                      point && <li key={i}>{point}</li>
                    ))
                  : Array.isArray(item.description)
                  ? item.description.map((point, i) => <li key={i}>{point}</li>)
                  : <li>{item.description}</li>
                }
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section>
          <SectionTitle>Skills</SectionTitle>
          <div className="grid grid-cols-2 gap-x-12 text-sm text-gray-700">
            {(() => {
              const mid = Math.ceil(skills.length / 2);
              const col1 = skills.slice(0, mid);
              const col2 = skills.slice(mid);
              return (
                <>
                  <ul className="list-disc list-inside space-y-1">
                    {col1.map((skill, idx) => <li key={idx}>{skill}</li>)}
                  </ul>
                  <ul className="list-disc list-inside space-y-1">
                    {col2.map((skill, idx) => <li key={idx}>{skill}</li>)}
                  </ul>
                </>
              );
            })()}
          </div>
        </section>
      )}
      
      {/* Projects Section */}
      {projects.length > 0 && (
        <section>
          <SectionTitle>Projects</SectionTitle>
          {projects.map((proj, idx) => (
            <div className="mb-5" key={idx}>
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-base">{proj.title}</h3>
                <div className="text-sm text-gray-600 whitespace-nowrap pl-4">
                  <span>{proj.startDate} - {proj.endDate}</span>
                </div>
              </div>
              <p className="text-sm italic text-gray-600 mb-1">{proj.tech}</p>
              <ul className="list-disc pl-5 mt-1 text-sm text-gray-700 space-y-1">
                {/* FIX APPLIED HERE: Using optional chaining (?.) to prevent error */}
                {proj.points?.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section>
          <SectionTitle>Education</SectionTitle>
          <div className="space-y-3">
            {education.map((edu, idx) => (
              <div key={idx}>
                <p className="font-bold text-base">{edu.degree}</p>
                <p className="text-sm text-gray-700">{edu.school}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <section>
          <SectionTitle>Certifications</SectionTitle>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            {certifications.map((cert, idx) => (
              <li key={idx}>
                {cert.name} ({cert.date})
              </li>
            ))}
          </ul>
        </section>
      )}

    </div>
  );
});

export default Microsoft;