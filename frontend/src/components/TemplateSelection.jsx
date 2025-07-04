import { useNavigate } from "react-router-dom";
import Microsoft from "./templates/Microsoft";
import Google from "./templates/Google";
import Meta from "./templates/Meta";

// Dummy data
const dummyData = {
  Name: "Ajay Kumar",
  Email: "ajay@example.com",
  phoneNo: "+91 9876543210",
  linkedinProfileUrl: "https://linkedin.com/in/ajaykumar",
  githubProfileUrl: "https://github.com/ajaykumar",
  location: "Delhi, India",
  summary:
    "Full-stack developer with 2+ years of experience in building scalable web applications and APIs. Proficient in MERN stack and cloud deployment.",

  Skills:
    "JavaScript, React, Node.js, Express.js, MongoDB, Git, Docker, HTML, CSS",

  workExp: `• Software Developer at ABC Corp (2022 - Present)\n  Worked on building scalable REST APIs using Node.js and Express.\n• Frontend Intern at XYZ Pvt Ltd (2021 - 2022)\n  Developed interactive UI components using React and Tailwind.`,

  Projects: `• Resume Builder Application using React & Express.\n• E-commerce Website with Admin Panel and Payment Integration.\n• Real-time Chat Application with Socket.io and Node.js.`,

  Education: "B.Tech in Computer Science, NIT Delhi (2017 - 2021)",

  Achievements: `• Top 5 Finalist - National Hackathon 2023.\n• Solved 300+ DSA problems on LeetCode.\n• Google Cloud Certified Associate.\n• Published research paper on Machine Learning at IEEE Conference.`,

  Languages: "English, Hindi",

  Interests: "Coding, Blogging, Playing Chess",
};

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

              <div className="h-[260px] overflow-hidden bg-white rounded-md border border-gray-200 shadow-inner p-2">
                <div className="transform scale-[0.22] origin-top-left pointer-events-none w-[900px]">
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
