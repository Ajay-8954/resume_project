import React, { forwardRef } from 'react';

// A helper component to render the section titles with the underline, keeping the main component clean.
const SectionTitle = ({ children }) => (
  <div className="mb-4">
    <h2 className="text-xl font-bold text-gray-800">{children}</h2>
    <div className="w-full h-px bg-gray-300 mt-1"></div>
  </div>
);

// The main resume component
const Google = forwardRef(({ data = {} }, ref) => {
  // Destructuring all properties from the provided data object
  const {
    Name = "Jennifer Jobscan",
    jobTitle = "Product Manager",
    email = "jennifer@jobscan.co",
    phone = "(123) 456-7890",
    location = "Seattle, WA, 90823",
    linkedin, // Linkedin and Github are optional
    github,
    summary = "Creative professional and collaborator with 15+ years experience devoted to product, 10+ as a Product Manager and Lead. In-depth knowledge of manufacturing processes, materials, applications, licensing with external partners and approval standards.",
    experience = [],
    internship = [],
    education = [],
    skills = [],
    languages = [],
    projects = [],
    certifications = [],
    // 'interests' and 'achievements' from your schema are unused in this visual template, but kept for data completeness
    interests,
    achievements,
  } = data;

  // Preserving the logic to choose between experience and internship
  const workItems = experience.length > 0 ? experience : internship;
  const workTitle = experience.length > 0 ? "Work Experience" : "Internship";

  return (
    <div ref={ref} className="bg-white p-10 font-sans text-gray-700 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row gap-10">
        
        {/* Left Column (Main Content) */}
        <div className="w-full md:w-2/3">
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800">{Name}</h1>
            {jobTitle && <p className="text-lg text-gray-600">{jobTitle}</p>}
          </header>

          {/* Summary */}
          {summary && (
            <section className="mb-8">
              <p className="text-sm">{summary}</p>
            </section>
          )}

          {/* Work Experience / Internship */}
          {workItems.length > 0 && (
            <section className="mb-6">
              <SectionTitle>{workTitle}</SectionTitle>
              {workItems.map((item, idx) => (
                <div key={idx} className="mb-5">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-base text-gray-800">{item.jobTitle}</h3>
                    <p className="text-xs text-gray-600 font-medium">
                      {item.startDate} - {item.endDate}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 italic">{item.company}</p>
                  {/* The template shows paragraphs, not bullets. We'll split the description by newlines. */}
                  {item.description?.split('\n').map((line, i) => (
                      line && <p key={i} className="text-sm mt-2">{line}</p>
                  ))}
                </div>
              ))}
            </section>
          )}
          
          {/* Projects Section (As requested) */}
          {projects.length > 0 && (
            <section className="mb-6">
              <SectionTitle>Projects</SectionTitle>
              {projects.map((proj, idx) => (
                <div key={idx} className="mb-5">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-base text-gray-800">{proj.title}</h3>
                     <p className="text-xs text-gray-600 font-medium">
                      {proj.startDate} - {proj.endDate}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 italic">{proj.tech}</p>
                  <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                      {proj.points?.map((point, i) => (
                          <li key={i}>{point}</li>
                      ))}
                  </ul>
                </div>
              ))}
            </section>
          )}

          {/* Core Skills */}
          {skills.length > 0 && (
            <section className="mb-6">
              <SectionTitle>Core Skills</SectionTitle>
              <p className="text-sm">{skills.join(', ')}</p>
            </section>
          )}

          {/* Education */}
          {education.length > 0 && (
            <section className="mb-6">
              <SectionTitle>Education</SectionTitle>
              {education.map((edu, idx) => (
                <div key={idx} className="flex justify-between items-baseline">
                  <div>
                    <h3 className="font-bold text-base text-gray-800">{edu.school}</h3>
                    <p className="text-sm">{edu.degree}</p>
                  </div>
                  <p className="text-xs text-gray-600 font-medium">
                    {edu.startDate} - {edu.endDate}
                  </p>
                </div>
              ))}
            </section>
          )}

          {/* Certifications (As requested) */}
          {certifications.length > 0 && (
            <section className="mb-6">
                <SectionTitle>Certifications</SectionTitle>
                <ul className="list-disc list-inside text-sm space-y-2">
                    {certifications.map((cert, idx) => (
                        <li key={idx}>
                            <span className="font-bold">{cert.name}</span> - <span className="italic">{cert.issuer}</span> ({cert.Date})
                        </li>
                    ))}
                </ul>
            </section>
          )}

          {/* Languages */}
          {languages.length > 0 && (
            <section>
              <SectionTitle>Languages</SectionTitle>
              <p className="text-sm">{languages.join(', ')}</p>
            </section>
          )}

        </div>

        {/* Right Column (Contact Info) */}
        <div className="w-full md:w-1/3 text-left md:text-right">
          <div className="text-sm space-y-1">
            {email && <p>{email}</p>}
            {linkedin && <p>{linkedin}</p>}
            {github && <p>{github}</p>}
            {phone && <p>{phone}</p>}
            {location && <p>{location}</p>}
          </div>
        </div>

      </div>
    </div>
  );
});

export default Google;