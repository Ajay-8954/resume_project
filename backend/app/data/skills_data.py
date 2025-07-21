# # skills_data.py

# SKILLS_DATABASE = {
#     "software": [
#         "React", "Redux", "Node.js", "Python", "Django", "Flask", "JavaScript", "TypeScript",
#         "HTML", "CSS", "Git", "REST APIs", "GraphQL", "SQL", "MongoDB", "Docker",
#         "AWS", "Java", "C++", "C", "Express.js", "Next.js", "NestJS"
#     ],
#     "data": [
#         "Python", "R", "SQL", "Pandas", "NumPy", "Matplotlib", "TensorFlow", "PyTorch",
#         "Machine Learning", "Data Analysis", "Data Visualization", "Big Data", "Hadoop",
#         "Spark", "Statistics", "Scikit-learn", "Power BI", "Tableau", "Excel", "Jupyter"
#     ],
#     "design": [
#         "Figma", "Adobe XD", "Sketch", "Photoshop", "Illustrator", "UI Design", "UX Design",
#         "User Research", "Wireframing", "Prototyping", "Typography", "Color Theory", "InDesign",
#         "Canva", "Brand Identity"
#     ],
#     "devops": [
#         "Docker", "Kubernetes", "AWS", "Azure", "CI/CD", "Jenkins", "Ansible", "Terraform",
#         "Linux", "Monitoring", "Prometheus", "Grafana", "Bash", "Nginx", "Cloudflare"
#     ],
#     "mobile": [
#         "React Native", "Flutter", "Swift", "Kotlin", "Java", "Android Studio", "iOS Development",
#         "Dart", "Xcode", "Firebase", "Mobile UI/UX", "App Store Optimization"
#     ],
#     "ai": [
#         "Machine Learning", "Deep Learning", "Neural Networks", "NLP", "Computer Vision",
#         "TensorFlow", "PyTorch", "Keras", "Scikit-learn", "OpenCV", "Transformers",
#         "LLMs", "Prompt Engineering", "ChatGPT API", "Speech Recognition", "AI Ethics"
#     ],
#     "database": [
#         "MySQL", "PostgreSQL", "MongoDB", "Oracle", "SQLite", "NoSQL", "Redis",
#         "Elasticsearch", "Cassandra", "Firebase Realtime DB", "Supabase", "DynamoDB"
#     ],
#     "testing": [
#         "Unit Testing", "Jest", "Mocha", "Selenium", "Cypress", "Postman", "JUnit",
#         "TestNG", "Manual Testing", "Automation Testing", "Load Testing", "Performance Testing"
#     ],
#     "cloud": [
#         "AWS", "Azure", "GCP", "CloudFormation", "Serverless", "Lambda", "Cloud Functions",
#         "Firebase", "DigitalOcean", "Heroku", "Vercel", "Netlify"
#     ],
#     "management": [
#         "Leadership", "Team Management", "Conflict Resolution", "Operations Management",
#         "Strategic Planning", "Resource Allocation", "Performance Evaluation",
#         "Change Management", "Budgeting", "People Management", "Stakeholder Management","Product Management","Sales"
#     ],
#     "marketing": [
#         "Digital Marketing", "Content Marketing", "SEO", "SEM", "Market Research",
#         "Email Marketing", "Social Media Marketing", "Google Analytics", "Campaign Management",
#         "Influencer Marketing", "Customer Retention", "Branding", "A/B Testing", "Marketing Automation"
#     ],
#     "product-management": [
#         "Product Strategy", "Agile", "Scrum", "User Research", "Product Roadmap", "MVP Planning",
#         "Stakeholder Management", "Data-Driven Decision Making", "Wireframing", "JIRA",
#         "User Story Writing", "Feature Prioritization", "Product Analytics", "Notion", "Confluence"
#     ],
#     "project-management": [
#         "Project Planning", "Project Scheduling", "Gantt Charts", "Agile Methodologies",
#         "Scrum", "Kanban", "Asana", "Trello", "ClickUp", "Risk Management", "Budget Management","Product Management",
#         "Stakeholder Communication", "Resource Allocation"
#     ],
#     "finance": [
#         "Financial Analysis", "Accounting", "Excel", "Budgeting", "Forecasting", "Cash Flow Management",
#         "Profit and Loss Management", "QuickBooks", "Investment Analysis", "Valuation", "Financial Modeling"
#     ],
#     "hr": [
#         "Recruitment", "Talent Acquisition", "HRIS", "Payroll", "Employee Engagement",
#         "Onboarding", "Exit Management", "Policy Development", "Compliance", "Training & Development"
#     ],
#     "sales": [
#         "B2B Sales", "B2C Sales", "Lead Generation", "CRM", "Cold Calling", "Negotiation",
#         "Upselling", "Customer Relationship Management", "Salesforce", "HubSpot", "Pipeline Management", "sales"
#     ],
#     "business-analysis": [
#         "Business Process Modeling", "Requirement Gathering", "SWOT Analysis", "Market Research",
#         "Stakeholder Analysis", "User Stories", "Data Analysis", "Business Intelligence",
#         "Wireframing", "Gap Analysis", "Use Cases", "JIRA", "UML"
#     ],
#     "entrepreneurship": [
#         "Startup Strategy", "Pitch Deck", "Investor Relations", "Business Planning", "Fundraising",
#         "Go-to-Market Strategy", "Growth Hacking", "Lean Canvas", "Customer Discovery", "MVP Building"
#     ]
# }

ALL_SKILLS = [
    # --- Programming Languages ---
    "Python", "Java", "C++", "C", "C#", "JavaScript", "TypeScript", "Go", "Rust", "Ruby", "Kotlin", "Swift", "R", "MATLAB", "Scala", "Perl", "Shell", "Bash",

    # --- Web Development ---
    "HTML", "CSS", "SASS", "Bootstrap", "Tailwind CSS", "React", "Next.js", "Angular", "Vue.js", "jQuery", "Django", "Flask", "Express.js", "PHP", "ASP.NET",

    # --- Mobile Development ---
    "React Native", "Flutter", "SwiftUI", "Xamarin", "Ionic", "Android SDK", "iOS Development",

    # --- Data Science & Machine Learning ---
    "Pandas", "NumPy", "Scikit-learn", "Matplotlib", "Seaborn", "TensorFlow", "Keras", "PyTorch", "OpenCV", "NLP", "Computer Vision", "XGBoost", "LightGBM", "StatsModels",

    # --- AI/ML Concepts ---
    "Machine Learning", "Deep Learning", "Data Analysis", "Model Deployment", "Recommendation Systems", "Time Series Analysis",

    # --- DevOps & Cloud ---
    "Docker", "Kubernetes", "Jenkins", "CI/CD", "AWS", "Azure", "GCP", "Terraform", "Ansible", "Nginx", "Linux",

    # --- Database & Backend ---
    "MySQL", "PostgreSQL", "MongoDB", "SQLite", "Oracle", "Firebase", "Redis", "ElasticSearch",
    "Node.js", "Express", "Flask", "Django REST", "GraphQL", "gRPC", "RESTful API",

    # --- Testing ---
    "JUnit", "Selenium", "PyTest", "Cypress", "Mocha", "Jest", "Postman",

    # --- Cybersecurity ---
    "Burp Suite", "Wireshark", "Metasploit", "Nmap", "Ethical Hacking", "Penetration Testing", "OWASP",

    # --- Tools & Platforms ---
    "Git", "GitHub", "GitLab", "Bitbucket", "VS Code", "JIRA", "Figma", "Postman", "Notion", "Slack", "Trello",

    # --- Soft Skills / CS Concepts ---
    "Agile", "Scrum", "System Design", "DSA", "Communication", "Leadership", "Problem Solving", "Debugging", "Version Control", "Object-Oriented Programming",

    # --- Visualization & Business Tools ---
    "Power BI", "Tableau", "Excel", "Google Sheets", "Looker", "BigQuery",

    # --- Management & Business ---
    "Project Management", "Product Management", "Operations Management", "Team Management", "Strategic Planning", "Risk Management", "Time Management", "Stakeholder Management",

    # --- Sales ---
    "Sales Strategy", "CRM", "Lead Generation", "Cold Calling", "Salesforce", "Customer Acquisition", "Upselling", "Sales Analytics", "Client Relationship Management",

    # --- Marketing ---
    "Digital Marketing", "Content Marketing", "SEO", "SEM", "Email Marketing", "Marketing Analytics", "Google Ads", "Facebook Ads", "Social Media Marketing", "Market Research", "Brand Management",

    # --- Finance & Accounting ---
    "Financial Analysis", "Accounting", "Budgeting", "Bookkeeping", "Forecasting", "Excel Modeling", "QuickBooks", "Tally", "Investment Analysis", "Cost Management",

    # --- Human Resources (HR) ---
    "Recruitment", "Talent Acquisition", "Employee Engagement", "HR Policies", "Onboarding", "Payroll Management", "Conflict Resolution", "Performance Management",

    # --- Communication & Admin ---
    "Business Communication", "Presentation Skills", "Client Handling", "Email Writing", "Report Writing", "Customer Service", "Documentation"
]
