import { useNavigate } from "react-router-dom";
import Microsoft from "./templates/Microsoft";
import Google from "./templates/Google";
import Meta from "./templates/Meta";

// Dummy data
const dummyData = {
  "Name": "John A. Smith",
  "jobTitle": "Senior Software Engineer",
  "email": "john.smith@example.com",
  "phone": "(555) 123-4567",
  "location": "San Francisco, CA",
  "linkedin": "https://linkedin.com/in/johnsmith",
  "github": "https://github.com/johnsmith",
  "summary": "Results-driven software engineer with 5+ years of experience in full-stack development. Specialized in JavaScript frameworks and cloud architecture. Passionate about building scalable web applications and mentoring junior developers.",
  "experience": [
    {
      "jobTitle": "Senior Software Engineer",
      "company": "TechCorp Inc.",
      "startDate": "Jan 2020",
      "endDate": "Present",
      "description": "Lead a team of 5 developers to build and maintain the company's flagship SaaS product. Implemented microservices architecture that improved system performance by 40%."
    },
    {
      "jobTitle": "Software Developer",
      "company": "Digital Solutions LLC",
      "startDate": "Jun 2017",
      "endDate": "Dec 2019",
      "description": "Developed and maintained web applications using React and Node.js. Reduced page load times by 30% through performance optimization."
    }
  ],
  "internship": [
    {
      "jobTitle": "Software Engineering Intern",
      "company": "Innovatech",
      "startDate": "May 2016",
      "endDate": "Aug 2016",
      "description": "Assisted in developing internal tools and participated in code reviews. Gained experience with Agile methodologies."
    }
  ],
  "education": [
    {
      "degree": "B.S. in Computer Science",
      "school": "University of California, Berkeley",
      "startDate": "2013",
      "endDate": "2017"
    }
  ],
  "skills": [
    "JavaScript",
    "React",
    "Node.js",
    "Python",
    "AWS",
    "Docker",
    "SQL",
    "Git"
  ],
  "languages": [
    "English (Fluent)",
    "Spanish (Intermediate)"
  ],
  "interests": [
    "Open Source Contributions",
    "Machine Learning",
    "Hiking",
    "Photography"
  ],
  "achievements": [
    {
      "title": "Employee of the Year 2021",
      "points": [
        "Recognized for outstanding contributions to the company's core product",
        "Led initiative that reduced customer support tickets by 25%"
      ]
    },
    {
      "title": "Hackathon Winner",
      "points": [
        "Won first place in company-wide hackathon for developing a productivity tool",
        "Solution was later integrated into the main product"
      ]
    }
  ],
  "projects": [
    {
      "title": "E-commerce Platform",
      "startDate": "Mar 2021",
      "endDate": "Aug 2021",
      "tech": "React, Node.js, MongoDB, Stripe API",
      "points": [
        "Built a full-featured online store with cart functionality and payment processing",
        "Implemented JWT authentication for secure user accounts",
        "Optimized database queries reducing load times by 35%"
      ]
    },
    {
      "title": "Task Management App",
      "startDate": "Jan 2020",
      "endDate": "Feb 2020",
      "tech": "Vue.js, Firebase",
      "points": [
        "Developed a collaborative task management application with real-time updates",
        "Integrated Google Calendar API for deadline tracking",
        "Open-sourced project with 500+ GitHub stars"
      ]
    }
  ]
}
;

const templates = [
  {
    id: "microsoft",
    name: "Microsoft",
    description: "Clean, corporate style",
    PreviewComponent: Microsoft,
  },
  {
    id: "google",
    name: "Google",
    description: "Modern and minimalistic",
    PreviewComponent: Google,
  },
  {
    id: "meta",
    name: "Meta",
    description: "Elegant, serif font style",
    PreviewComponent: Meta,
  },
];

export default function TemplateSelection() {
  const navigate = useNavigate();

  const handleSelect = (id) => {
    navigate(`/builder/${id}`);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-white via-blue-50 to-blue-100">
      {/* Left side scrollable vertical template list */}
      <div className="w-[240px] overflow-y-auto h-screen border-0 border-blue-100 bg-white  p-4">
        <h1 className=" font-bold text-center text-blue-800 mb-6">
          Choose Resume Template
        </h1>

        <div className="">
          {templates.map(({ id, name, description, PreviewComponent }) => (
            <div
              key={id}
              onClick={() => handleSelect(id)}
              className="bg-white border border-blue-100 rounded-xl shadow-sm p-3 cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all duration-200 group"
              title={`Click to build with the ${name} template`}
            >
              <div className="text-center mb-2">
                <h3 className="text-md font-semibold text-blue-800">{name}</h3>
                <p className="text-xs text-gray-500">{description}</p>
              </div>

              <div className="h-[170px] overflow-hidden bg-white rounded-md border border-gray-200 shadow-inner p-2">
                <div className="transform scale-[0.21] origin-top-left pointer-events-none w-[650px]">
                  <PreviewComponent data={dummyData} />
                </div>
              </div>

              <div className="mt-2 text-center text-blue-600 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Click to select this template
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right side space (you can show builder or placeholder later) */}
      {/* <div className="flex-1 p-10">
        <div className="text-2xl font-semibold text-gray-600 text-center">
          Select a template from the left to start building your resume
        </div>
      </div> */}
    </div>
  );
}
