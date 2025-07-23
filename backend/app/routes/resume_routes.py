from io import BytesIO
import os
import pdfkit
from flask import Blueprint, request, jsonify, send_file, current_app
from app.utils.file_utils import extract_text_builder
from app.utils.ai_helpers import client
# from app.routes.auth_routes import token_required
from app.utils.auth_utils import token_required  # Import the decorator
from app.models.resume import Resume
from bson import ObjectId
from flask_cors import CORS  # ✅ Make sure this is imported
from app.data.skills_data import ALL_SKILLS
from app.data.interests import INTERESTS
from app.data.languages import LANGUAGES
from playwright.sync_api import sync_playwright
from app.data.domain_mapping import DOMAIN_KEYWORDS  # <-- import here
import json


# 27/07
# Define the upload folder for PDFs
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), "app", "pdfs")
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

path_wkhtmltopdf = r'C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe'
config = pdfkit.configuration(wkhtmltopdf=path_wkhtmltopdf)

options = {
    'enable-local-file-access': None,
    'page-size': 'A4',
    'dpi': 300,
    'zoom': 1.3,  # Makes text clearer and larger
    'encoding': "UTF-8",
    'no-outline': None,
    'print-media-type': None,
}




resume_bp = Blueprint('resume', __name__)

CORS(resume_bp, origins=["http://localhost:5173"], methods=["GET", "POST", "PUT", "DELETE"], supports_credentials=True)


@resume_bp.route("/suggest-interests", methods=["POST"])
def suggest_interests():
    data = request.json
    prefix = data.get("prefix", "").lower()
    existing_interests = set(i.lower() for i in data.get("interests", []))

    suggestions = [
        interest for interest in INTERESTS
        if interest.lower().startswith(prefix) and interest.lower() not in existing_interests
    ]

    return jsonify({"suggestions": sorted(suggestions)[:15]})

@resume_bp.route("/suggest-languages", methods=["POST"])
def suggest_languages():
    data = request.json
    prefix = data.get("prefix", "").lower()
    existing_languages = set(l.lower() for l in data.get("languages", []))

    suggestions = [
        language for language in LANGUAGES
        if language.lower().startswith(prefix) and language.lower() not in existing_languages
    ]

    return jsonify({"suggestions": sorted(suggestions)[:15]})

@resume_bp.route('/update/<resume_id>', methods=['PUT'])
@token_required
def update_resume(current_user, resume_id):
    try:
        data = request.get_json()
        title = data.get('title')
        content = data.get('content')
        template = data.get('template')

        if not title or not content or not template:
            return jsonify({'error': 'Missing data'}), 400

        result = Resume.update_resume(resume_id, title, content, template)

        if result.matched_count == 0:
            return jsonify({'error': 'Resume not found'}), 404

        return jsonify({'message': 'Resume updated successfully'}), 200

    except Exception as e:
        print("Update failed:", e)
        return jsonify({'error': str(e)}), 500

@resume_bp.route('/update-title/<resume_id>', methods=['PUT'])
@token_required
def update_resume_title(current_user, resume_id):
    try:
        data = request.get_json()
        title = data.get('title')

        if not title:
            return jsonify({'error': 'Title is required'}), 400

        result = Resume.update_resume_title(resume_id, title)

        if result.matched_count == 0:
            return jsonify({'error': 'Resume not found'}), 404

        return jsonify({'message': 'Title updated successfully'}), 200

    except Exception as e:
        print("Update title failed:", e)
        return jsonify({'error': str(e)}), 500


@resume_bp.route('/my-resumes', methods=['GET'])
@token_required
def get_user_resumes(current_user):
    user_id = current_user["_id"]

    # Get cursor from database and convert it to a list
    cursor = Resume.get_resumes_by_user(user_id)
    resumes = list(cursor)

    # Convert ObjectIds to strings for JSON response
    for resume in resumes:
        resume["_id"] = str(resume["_id"])
        resume["user_id"] = str(resume["user_id"])

    return jsonify({"resumes": resumes}), 200





@resume_bp.route('/save', methods=['POST'])
@token_required
def save_resume(current_user):
    data = request.get_json()
    print("[DEBUG] Incoming Data:", data)
    print("[DEBUG] Current User:", current_user)
    title = data.get('title')
    content = data.get('content')
    template = data.get('template') 

    if not title or not content:
        return jsonify({'error': 'Title and content are required'}), 400

    result = Resume.create_resume(current_user["_id"], title, content, template)

    # Include the saved resume's ID in the response with the expected format
    return jsonify({
        "message": "Resume saved successfully",
        "_id": str(result.inserted_id),  # or "resume_id" if that's what you use
        "title": title,
        "template": template
    }), 201




@resume_bp.route("/enhance-field", methods=["POST"])
def enhance_field():
    data = request.json
    field_type = data.get('fieldType')  # 'experience', 'project', 'achievement', etc.
    text = data.get('text', '')
    context = data.get('context', {})  # Additional context like job title, company, etc.

    if not field_type or not text:
        return jsonify({"error": "Field type and text are required"}), 400

    # Define enhancement prompts for different field types
    prompts = {
        "experience": f"""Improve this work experience description for a resume:
        
Current description: {text}
        
Job Title: {context.get('jobTitle', '')}
Company: {context.get('company', '')}
        
Please:
1. Use strong action verbs (e.g., "Developed", "Led", "Implemented")
2. Quantify achievements where possible
3. Keep it concise (2-3 bullet points)
4. Make it more professional and impactful
        
Return only the enhanced description without any additional text.""",
        
        "project": f"""Enhance this project description for a resume:
        
Project: {context.get('title', '')}
Technologies: {context.get('tech', '')}
Current description: {text}
        
Please:
1. Highlight technical challenges and solutions
2. Showcase specific contributions
3. Use bullet points if not already
4. Keep it professional and concise
        
Return only the enhanced description.""",
        
        "achievement": f"""Improve this achievement description:
        
Achievement: {context.get('title', '')}
Current description: {text}
        
Please:
1. Make it more impactful and measurable
2. Highlight the significance
3. Keep it concise (1-2 sentences)
4. Use professional language
        
Return only the enhanced description.""",
        
        "summary": f"""Enhance this professional summary:
        
Current summary: {text}
Job Title: {context.get('jobTitle', '')}
Skills: {', '.join(context.get('skills', []))}
        
Please:
1. Keep it concise (3-4 sentences)
2. Include relevant keywords
3. Highlight key achievements
4. Make it more compelling
        
Return only the enhanced summary.""",
        
        "default": f"""Improve this text for a professional resume:
        
{text}
        
Please make it more concise, professional and impactful while preserving the original meaning."""
    }

    # Select the appropriate prompt
    prompt = prompts.get(field_type, prompts["default"])

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=500
        )
        
        enhanced_text = response.choices[0].message.content.strip()
        return jsonify({"enhancedText": enhanced_text})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# def detect_domain(domain_text):
#     domain_text = domain_text.lower()
#     for domain_key, keywords in DOMAIN_KEYWORDS.items():
#         if any(keyword in domain_text for keyword in keywords):
#             print("✅ Detected domain:", domain_key)
#             return domain_key
#     print("⚠️ Defaulted to software")
#     return "software"
@resume_bp.route('/generate-objective', methods=['POST'])
def generate_objective():
    data = request.json

    # Safely extract data with proper fallbacks
    education = data.get('education', [{}])[0] if data.get('education') else {}
    projects = data.get('projects', [{}])[0] if data.get('projects') else {}
    internships = data.get('internships', [{}])[0] if data.get('internships') else {}

    # Build context description
    context_parts = []
    
    # Education (always include at least generic info)
    education_desc = f"Education: {education.get('degree', 'a degree')}"
    if education.get('school'):
        education_desc += f" from {education['school']}"
    context_parts.append(education_desc)
    
    # Projects (only if exists)
    if projects:
        project_desc = "Projects:"
        if projects.get('title'):
            project_desc += f" {projects['title']}"
        if projects.get('tech'):
            project_desc += f" using {projects['tech']}"
        if project_desc != "Projects:":  # Only add if we have actual data
            context_parts.append(project_desc)
    
    # Internships (only if exists)
    if internships:
        internship_desc = "Internships:"
        if internships.get('role'):
            internship_desc += f" {internships['role']}"
        if internships.get('company'):
            internship_desc += f" at {internships['company']}"
        if internship_desc != "Internships:":  # Only add if we have actual data
            context_parts.append(internship_desc)

    # Construct prompt
    context = "\n".join(f"- {part}" for part in context_parts) if context_parts else "No specific background provided"
    prompt = f"""
    Generate a professional 3-4 line career objective based on:
    {context}

    Guidelines:
    1. Focus on career goals and relevant skills
    2. Use third-person perspective (avoid "I" or "my")
    3. Keep it concise (40-60 words)
    4. Sound professional but not generic
    """

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a professional resume writer."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=150
        )
        generated_text = response.choices[0].message.content.strip()
        return jsonify({"objective": generated_text})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@resume_bp.route("/suggest-skills", methods=["POST"])
def suggest_skills():
    data = request.json
    prefix = data.get("prefix", "").lower()
    existing_skills = set(s.lower() for s in data.get("skills", []))

    suggestions = [
        skill for skill in ALL_SKILLS
        if skill.lower().startswith(prefix) and skill.lower() not in existing_skills
    ]

    return jsonify({"suggestions": sorted(suggestions)[:15]})

  
@resume_bp.route('/delete_resume/<resume_id>', methods=['DELETE'])
@token_required
def delete_resume(current_user, resume_id):
    try:
        result = Resume.delete_resume(resume_id)

        if result.deleted_count == 0:
            return jsonify({'error': 'Resume not found'}), 404

        return jsonify({'message': 'Resume deleted successfully'}), 200

    except Exception as e:
        print("Delete failed:", e)
        return jsonify({'error': str(e)}), 500


@resume_bp.route('/delete_resumes', methods=['DELETE'])
@token_required
def delete_all_resumes(current_user):
    try:
        
        user_id = str(current_user["_id"])  # or current_user.id depending on structure
        result = current_app.db.resumes.delete_many({"user_id": user_id})

        return jsonify({"message": f"{result.deleted_count} resume(s) deleted successfully"}), 200

    except Exception as e:
        print("Delete all resumes failed:", e)
        return jsonify({"error": str(e)}), 500




@resume_bp.route("/extract", methods=["POST"])
def extract_resume():
    if 'resume' not in request.files:
        return jsonify({"error": "No resume file provided"}), 400

    file = request.files["resume"]
    
    try:
        raw_text = extract_text_builder(file, file.filename)
        truncated_text = raw_text[:1000000]

        prompt = f"""Extract all resume information and return it as JSON in the *exact structure* below.

        👉 IMPORTANT:
        - If the resume belongs to a **fresher** (i.e. no work experience section), then place the summary text inside the **"objective"** field and leave **"summary"** blank.
        - If the resume belongs to an **experienced candidate** (i.e. work experience section is present), then place the summary text inside the **"summary"** field and leave **"objective"** blank.
        
        Map section headings even if synonyms are used. For example:
        - "Professional Summary", "About Me", or "Objective" → summary/objective as per above condition
        - "Education", "Academic Background", or "Qualifications" → education
        - "Projects", "Project Experience", "Work Samples", or "Portfolio" → projects
        - "Awards", "Honors", "Achievements", or "Recognition" → achievements

        Format your output like this:

        {{
            "Name": "Full Name",
            "jobTitle": "Job Title",
            "email": "email@example.com",
            "phone": "123-456-7890",
            "location": "City, Country",
            "linkedin": "https://linkedin.com/...",
            "github": "https://github.com/...",
            "summary": "Professional summary...",     <-- leave blank for fresher
            "objective": "Carrer Objectives",         <-- leave blank for experienced
            "experience": [
                {{
                    "jobTitle": "Job Title",
                    "company": "Company Name",
                    "startDate": "Month Year",
                    "endDate": "Month Year",
                    "description": "Job description..."
                }}
            ],
            "internship": [
                {{
                    "jobTitle": "Job Title",
                    "company": "Company Name",
                    "startDate": "Month Year",
                    "endDate": "Month Year",
                    "description": "Job description..."
                }}
            ],
            "education": [
                {{
                    "degree": "Degree Name",
                    "school": "School Name",
                    "level": "type of education level",
                    "startDate": "Year",
                    "endDate": "Year",
                    "cgpa": "X.XX/10"  
                }}
            ],
            "skills": ["Skill1", "Skill2"],
            "languages": ["Language1", "Language2"],
            "interests": ["Interest1", "Interest2"],
            "achievements": [
                {{
                    "title": "Achievement Title",
                    "description":" "
                }}
            ],
            "projects": [
                {{
                    "title": "Project Title",
                    "startDate": "Month Year",
                    "endDate": "Month Year",
                    "tech": "Tools/Tech Stack",
                    "description": ["Point 1", "Point 2"]
                }}
            ],
            
             "certifications": [
                {{
                    "name": "Certification name",
                    "issuer": "name of the issuer",
                    "Date": "Month Year",
                }}
            ]
    }}"""  # Your existing prompt
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": f"{prompt}\n\nResume Text:\n{truncated_text}"}],
            temperature=0.1,
            max_tokens=2000
        )
        
        result = response.choices[0].message.content
        
        try:
            parsed = json.loads(result)
        except json.JSONDecodeError:
            return jsonify({
                "error": "AI returned invalid JSON",
                "ai_response": result
            }), 500
            
        return jsonify(parsed)

    except Exception as e:
        return jsonify({
            "error": str(e),
            "type": "server_error"
        }), 500




@resume_bp.route("/api/fix-resume", methods=["POST"])
def fix_resume():
    data = request.get_json()
    jd = data.get('jd')
    answers = data.get('answerss', {})
    resume = data.get('resume')

    if not jd or not resume:
        return jsonify({"error": "JD and Resume are required"}), 400

    # Format answers
    formatted_answers = "\n".join(
        f"Q{i+1}: {q}\nA{i+1}: {a}" 
        for i, (q, a) in enumerate(answers.items())
    ) if answers else "No answers provided"

    prompt = f"""You are an expert resume writer. Rewrite this resume to match the job description:
    
Job Description:
{jd}

Original Resume:
{resume}

Candidate's Additional Answers:
{formatted_answers}

Return ONLY valid JSON in this exact format (no other text or explanation):
  {{
            "Name": "Full Name",
            "jobTitle": "Job Title",
            "email": "email@example.com",
            "phone": "123-456-7890",
            "location": "City, Country",
            "linkedin": "https://linkedin.com/...",
            "github": "https://github.com/...",
            "summary": "Professional summary...",
            "experience": [
                {{
                    "jobTitle": "Job Title",
                    "company": "Company Name",
                    "startDate": "Month Year",
                    "endDate": "Month Year",
                    "description": "Job description..."
                }}
            ],
            "internship": [
                {{
                    "jobTitle": "Job Title",
                    "company": "Company Name",
                    "startDate": "Month Year",
                    "endDate": "Month Year",
                    "description": "Job description..."
                }}
            ],
            "education": [
                {{
                    "degree": "Degree Name",
                    "school": "School Name",
                    "startDate": "Year",
                    "endDate": "Year"
                }}
            ],
            "skills": ["Skill1", "Skill2"],
            "languages": ["Language1", "Language2"],
            "interests": ["Interest1", "Interest2"],
            "achievements": [
                {{
                    "title": "Achievement Title",
                    "points": ["Point 1", "Point 2"]
                }}
            ],
            "projects": [
                {{
                    "title": "Project Title",
                    "startDate": "Month Year",
                    "endDate": "Month Year",
                    "tech": "Tools/Tech Stack",
                    "points": ["Point 1", "Point 2"]
                }}
            ]
    }}"""

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",  # or "gpt-4-turbo" if available
            messages=[
                {"role": "system", "content": "You output perfect JSON formatted resumes. Never add any explanatory text."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,  # Lower temperature for more consistent results
            max_tokens=2000
        )

        # Extract and clean the JSON response
        ai_response = response.choices[0].message.content
        json_str = ai_response[ai_response.find('{'):ai_response.rfind('}')+1]
        parsed = json.loads(json_str)
        
        return jsonify({"fixed_resume": parsed})
        
    except json.JSONDecodeError:
        return jsonify({"error": "Failed to parse AI response as JSON"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@resume_bp.route("/enhance-summary", methods=["POST"])
def enhance_summary():
    data = request.json
    text = data.get('text', '')
    job_title = data.get('jobTitle', '')
    skills = data.get('skills', [])

    prompt = f"""Enhance this professional summary according to industry standards:
    
    Current summary: {text}
    
    Job Title: {job_title}
    Key Skills: {', '.join(skills)}
    
    Please:
    1. Keep it concise (3-4 sentences max)
    2. Include relevant keywords naturally
    3. Use professional language
    4. Highlight achievements if mentioned
    5. Maintain third-person perspective
    
    Return only the enhanced summary without additional commentary."""  # Your existing prompt

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=200
        )
        
        enhanced_text = response.choices[0].message.content.strip()
        return jsonify({"enhancedText": enhanced_text})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@resume_bp.route('/download_pdf', methods=['POST'])
def download_pdf():
    try:
        data = request.get_json()
        html_content = data["html"]
        template_id = data["template"]
        output_path = os.path.join(UPLOAD_FOLDER, f"resume_{template_id}.pdf")
        print(f"Output path: {output_path}")  # Debug print
        print(f"HTML content length: {len(html_content)}")  # Debug length

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            # Set the HTML content and wait for network to stabilize
            page.set_content(html_content, wait_until="networkidle")
            
            # Manually add styles based on template
            if template_id == "google":
                page.add_style_tag(content="""
                    body { font-family: Arial, sans-serif; color: #333; }
  @page {
  size: A4;
  margin: 0;
    margin: 10mm;
}

body {
  margin: 0;
  padding: 0;
  background: white;
}

.resume-t2 {
  width: 100%;
  max-width: 170mm;
  min-height: 297mm;
  margin: 0 auto;
  background: #fff;
  padding: 10mm;
  box-sizing: border-box;
}

.header-t2 {
  text-align: center;
  border-bottom: 2px solid #000;
  padding-bottom: 8px;
  margin-bottom: 12px;
}

.header-t2 h1 {
  font-size: 24px;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: bold;
}

.contact-info-t2 {
  font-size: 10px;
  margin-top: 4px;
  color: #444;
}

.section-t2 {
  margin-bottom: 12px;
}

.section-title-t2 {
  font-size: 13px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 1px solid #ccc;
  padding-bottom: 4px;
  margin-bottom: 8px;
}

.details-t2 {
  color: #444;
  margin-top: 4px;
  font-size: 11px;
}

.item-t2 .font-semibold {
  font-size: 11px;
  font-weight: 600;
}

.item-t2 ul li,
.section-t2 ul li,
.item-t2 p:not(.font-semibold),
.item-t2 .text-gray-700 {
  font-size: 10px;
}

.item-t2 ul,
.section-t2 ul {
  padding-left: 20px;
  margin: 4px 0;
  list-style: disc;
}

.skills-section ul {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  padding-left: 20px;
}

.item-t2 .flex.justify-between {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
}

.info-location{
   text-transform: capitalize;
}

.info-capital{
  text-transform: capitalize;
}

.info-skill{
  text-transform: capitalize;
}

.info-language{
  text-transform : capitalize;
}

.info-interest{
  text-transform: capitalize;
}

.info-project{
  text-transform: capitalize;
}

.info-internship{
  text-transform: capitalize;
}


@media print {
  body, html {
    width: 210mm;
    height: 297mm;
  }

  .resume-t2 {
    box-shadow: none;
    margin: 0;
    padding: 10mm;
    width: 100%;
    height: 100%;
  }

  .no-print {
    display: none;
  }
}
}

                """)
            elif template_id == "meta":
                page.add_style_tag(content="""
                    body { font-family: 'Roboto', sans-serif; color: #1a202c;  }
                    .meta-container {
  font-family: Arial, sans-serif;
    width: 170mm;
  min-height: 297mm;
}

.meta-name {
  font-size: 24px;
  text-align: center;
}

.meta-contact,
.meta-links {
  font-size: 10px;
  text-align: center;
}

.meta-section {
  margin-top: 15px;
  margin-bottom: 15px;
}

.meta-section-heading {
  font-size: 13px;
  text-align: center;
  font-weight: bold;
}

.meta-list {
  font-size: 11px;
  text-align: justify;
}

.meta-item {
  font-size: 11px;
  margin-bottom: 10px;
}

.meta-text {
  font-size: 11px;
  text-align: justify;
}

.meta-bullets {
  font-size: 11px;
  text-align: justify;
  padding-left: 20px;
    list-style-type: disc; /* ✅ Add this */
}

.meta-dates {
  font-weight: bold;
}

.meta-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* new added */
.info-location{
    text-transform: capitalize;
}


.info-capital{
  text-transform: capitalize;
}

.info-skill{
  text-transform : capitalize;
}

.info-language{
  text-transform : capitalize;
}

.info-interest{
  text-transform: capitalize;
}

.info-project{
  text-transform: capitalize;
}

.info-internship{
  text-transform: capitalize;
}

                """)
            elif template_id == "microsoft":
                page.add_style_tag(content="""
           /* UPDATED EXTERNAL CSS (Microsoft.css) */

/* UPDATED EXTERNAL CSS (Microsoft.css) */

body {
  font-family: 'Segoe UI', sans-serif;
  color: #2f2f2f;
  margin: 0;
  padding: 0;
  background: white;
}

@page {
  size: A4;
  margin: 10mm;
}

.resume-container {
  width: 170mm;
  min-height: 297mm;
  background: white;
  padding: 2.5rem;
  color: #2d3748;
  margin: 0 auto;
}

.resume-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.info{
  margin-right: 11.5px;
}

.resume-header h1 {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2563eb;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.resume-header p {
  font-size: 0.75rem;
  color: #718096;
}

.section-title {
  display: flex;
  align-items: center;
  margin: 1rem 0;
}

.section-title span {
  flex-grow: 1;
  border-top: 1px solid #60a5fa;
}

.section-title h2 {
  margin: 0 1rem;
  font-size: 0.9rem;
  font-weight: bold;
  text-transform: uppercase;
  color: #2563eb;
  letter-spacing: 0.1em;
}

.section-text {
  font-size: 0.75rem;
}

.work-item,
.project-item,
.education-item,
.achievement-item,
.certification-item {
  margin-bottom: 1rem;
}

.work-item h3,
.project-item h3,
.education-item .degree,
.achievement-item h3,
.certification-item p {
  font-size: 0.8rem;
  font-weight: bold;
  margin: 0;
}

.work-item p,
.project-tech,
.education-item p {
  font-size: 0.75rem;
  color: #4a5568;
  margin: 0;
}

.date-right {
  font-size: 0.75rem;
  color: #718096;
  text-align: right;
  white-space: nowrap;
  flex-shrink: 0;
}

.education-row,
.project-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.project-tech {
  font-size: 0.75rem;
  font-style: italic;
  color: #4a5568;
  margin: 0.25rem 0;
}

.project-points,
.work-list,
.achievement-item ul {
  font-size: 0.75rem;
  color: #4a5568;
  list-style: disc;
  padding-left: 1.25rem;
  margin-top: 0.25rem;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 3rem;
  font-size: 0.75rem;
  color: #4a5568;
}

.skills-grid ul {
  list-style: disc;
  list-style-position: inside;
  margin: 0.25rem 0;
}

.list-disc {
  padding-left: 1.25rem;
}

.list-style {
  list-style: disc;
  list-style-position: inside;
  font-size: 0.75rem;
  color: #4a5568;
  margin: 0.25rem 0;
}

@media print {
  body,
  html {
    width: 210mm;
    height: 297mm;
  }

  .resume-container {
    width: 170mm;
    min-height: 297mm;
    box-shadow: none;
    padding: 2.5rem;
    margin: 0 auto;
    background: white;
  }

  section,
  .work-item,
  .project-item,
  .education-item,
  .achievement-item {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .section-title h2 {
    color: #2563eb !important;
  }
  
  .info-location{
   text-transform: capitalize;
}

.info-capital{
  text-transform: capitalize;
}

.info-skill{
  text-transform: capitalize;
}

.info-language{
  text-transform : capitalize;
}

.info-interest{
  text-transform: capitalize;
}

.info-project{
  text-transform: capitalize;
}

.info-internship{
  text-transform: capitalize;
}

}

        }

                """)

            pdf_options = {
    "path": output_path,
    "format": "A4",
    "print_background": True,
    "margin": {
        "top": "10mm",    # Increased from 0 to 10mm
        "right": "10mm",  # Added right margin
        "bottom": "10mm", # Added bottom margin
        "left": "10mm"    # Added left margin
    },
     # This ensures CSS @page rules are respected
}
            page.pdf(**pdf_options)
            browser.close()

        response = send_file(output_path, as_attachment=True, download_name="resume.pdf")
        def remove_file():
            if os.path.exists(output_path):
                os.remove(output_path)
        import threading
        threading.Timer(5.0, remove_file).start()
        return response

    except Exception as e:
        print(f"Error details: {str(e)}")
        return {"message": f"PDF generation failed: {str(e)}"}, 500


@resume_bp.route('/download_pdfee', methods=['POST'])
def download_pdfee():
    try:
        data = request.get_json()
        html_content = data.get('html')
        template = data.get('template', 'google')

        if not html_content:
            return jsonify({"error": "HTML content required"}), 400

        # Base styles - Applied to every template
        base_styles = """
        @page {
            size: A4;
            margin: 0;
        }

        body {
            margin: 0;
            padding: 0;
            background: white;
            font-family: Arial, sans-serif;
            line-height: 1.5;
            color: #333;
        }

        @media print {
            body, html {
                width: 210mm;
                height: 297mm;
            }

            .no-print {
                display: none;
            }
        }
        """

        # Template-specific styles
        template_styles = {
            'google': """
/* Utility classes */
.fs-24px { font-size: 24px; }
.fs-13px { font-size: 13px; }
.fs-11px { font-size: 11px; }
.text-justify { text-align: justify; }
.mt-1 { margin-top: 0.25rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-6 { margin-top: 1.5rem; }
.text-blue { color: #2563eb; }
.hover-underline:hover { text-decoration: underline; }
.mr-10px {
  margin-right: 15px;
}

/* Resume Layout */
.resume-t2 {
  width: 170mm;
  min-height: 297mm;
  margin: 0 auto;
  background: #fff;
  padding: 15mm;
  box-sizing: border-box;
}

.header-t2 {
  text-align: center;
  border-bottom: 2px solid #000;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.header-t2 h1 {
  font-size: 2.0rem;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.subtitle-t2 {
  font-size: 1.0rem;
  font-style: italic;
  margin: 5px 0;
}

.contact-info-t2 {
  font-size: 0.7rem;
  margin-top: 5px;
}

.section-t2 {
  margin-bottom: 15px;
}

.section-title-t2 {
  font-size: 1.1rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 1px solid #ccc;
  padding-bottom: 5px;
  margin-bottom: 10px;
}

.subsection-title-t2 {
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.section-t2.skills-section ul {
  display: grid;
  grid-template-rows: repeat(2, auto); /* Two rows */
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); /* Dynamic columns, min 100px per skill */
  gap: 0.5rem; /* Spacing between items */
  list-style: disc;
  list-style-position: inside;
  padding-left: 20px; /* Matches existing padding */
  margin: 4px 0; /* Matches existing margin */
  font-size: 11px; /* Matches .fs-11px */
}

.section-t2.skills-section ul li {
  margin-bottom: 2px; /* Matches .details-t2 li styling */
  line-height: 1.2; /* Matches .details-t2 li styling */
}


.item-t2 {
  margin-bottom: 15px;
}

.item-t2 h3 {
  margin: 0;
  font-size: 1.0rem;
}

.item-t2 p {
  margin: 2px 0;
  font-size: 0.8rem;
}

.details-t2 {
  font-style: italic;
  color: #444;
  margin-top: 5px;
  font-size: 13px;
}

.details-t2 ul {
  padding-left: 20px;
  margin: 5px 0;
}

.details-t2 li {
  margin-bottom: 3px;
}

.skills-container-t2 {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-tag-t2 {
  font-size: 13px;
  background: #f1f1f1;
  padding: 2px 8px;
  border: 1px solid #ddd;
}

.two-column-t2 {
  display: flex;
  justify-content: space-between;
}

.two-column-t2 > div {
  width: 48%;
}

            """,

            'meta': """
.meta-container {
  font-family: Arial, sans-serif;
}

.meta-name {
  font-size: 24px;
  text-align: center;
}

.meta-contact,
.meta-links {
  font-size: 10px;
  text-align: center;
}

.meta-section {
  margin-top: 15px;
  margin-bottom: 15px;
}

.meta-section-heading {
  font-size: 13px;
  text-align: center;
  font-weight: bold;
}

.meta-list {
  font-size: 11px;
  text-align: justify;
}

.meta-item {
  font-size: 11px;
  margin-bottom: 10px;
}

.meta-text {
  font-size: 11px;
  text-align: justify;
}

.meta-bullets {
  font-size: 11px;
  text-align: justify;
  padding-left: 20px;
}

.meta-dates {
  font-weight: bold;
}

.meta-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

            """,

            'microsoft': """
           /* General Container */
.resume-container {
  background: white;
  padding: 2.5rem;
  font-family: sans-serif;
  color: #2d3748;
  max-width: 64rem;
  margin: 0 auto;
}

/* Header */
.resume-header {
  text-align: center;
  margin-bottom: 1rem;
}

.resume-header h1 {
  font-size: 24px;
  font-weight: bold;
  color: #2563eb;
  text-transform: uppercase;
}

.resume-header p {
  font-size: 10px;
  color: #718096;
  margin-top: 0.5rem;
}

.resume-header span {
  margin: 0 0.5rem;
}

/* Section Titles */
.section-title {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 1rem 0;
    width: 100%;
}

.section-title h2 {
    margin: 0 1rem;
    font-size: 0.75rem;
    font-weight: bold;
    text-transform: uppercase;
    color: #2563EB; /* Tailwind blue-600 */
    letter-spacing: 0.1em;
    white-space: nowrap;
}

.section-title span {
    flex-grow: 1;
    border-top: 1px solid #60A5FA; /* Tailwind blue-400 */
}

.section-title {
    width: 100%;
    margin: 1rem 0;
    text-align: center;
    position: relative;
}

.section-title h2 {
    display: inline-block;
    margin: 0 1rem;
    font-size: 0.75rem;
    font-weight: bold;
    text-transform: uppercase;
    color: #2563EB;
    letter-spacing: 0.1em;
    white-space: nowrap;
    background: white;
    padding: 0 5px;
    position: relative;
    z-index: 2;
}

.section-title::before,
.section-title::after {
    content: "";
    display: block;
    border-top: 1px solid #60A5FA;
    position: absolute;
    top: 50%;
    width: 45%;
}

.section-title::before {
    left: 0;
}

.section-title::after {
    right: 0;
}


/* Summary */
.summary-text {
  font-size: 11px;
  text-align: justify;
}

/* Work/Internship */
.work-item {
  margin-bottom: 1.25rem;
}

.work-item h3 {
  font-size: 1rem;
  font-weight: bold;
}

.work-item p {
  font-size: 0.875rem;
  color: #4a5568;
}

.work-dates {
  font-size: 0.875rem;
  color: #718096;
  white-space: nowrap;
  padding-left: 1rem;
}

.work-list {
  list-style: disc;
  padding-left: 1.25rem;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #4a5568;
}

/* Skills Grid */
.skills-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 3rem;
  font-size: 0.875rem;
  color: #4a5568;
}

.skills-grid ul {
  list-style: disc;
  list-style-position: inside;
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
}

/* Projects */
.project-item {
  margin-bottom: 0.75rem;
  font-size: 11px;
}

.project-item h3 {
  font-size: 1rem;
  font-weight: bold;
}

.project-tech {
  font-style: italic;
  color: #718096;
  margin-bottom: 0.25rem;
}

.project-points {
  list-style: disc;
  padding-left: 1.25rem;
  color: #4a5568;
}

/* Education */
.education-item {
  font-size: 11px;
}

.education-item p {
  margin: 0.25rem 0;
}

.education-item .degree {
  font-weight: bold;
  font-size: 1rem;
}

/* Certifications, Languages, Interests, Achievements */
.list-style {
  list-style: disc;
  list-style-position: inside;
  font-size: 11px;
  color: #4a5568;
}

.achievement-item {
  margin-bottom: 0.75rem;
  font-size: 11px;
}

.achievement-item h3 {
  font-weight: bold;
  font-size: 1rem;
}


            """
        }

        selected_styles = template_styles.get(template, "")

        full_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                {base_styles}
                {selected_styles}
            </style>
        </head>
        <body>
            {html_content}
        </body>
        </html>
        """

        pdf_bytes = pdfkit.from_string(full_html, False, options=options,configuration=config)

        return send_file(
            BytesIO(pdf_bytes),
            mimetype='application/pdf',
            as_attachment=True,
            download_name='resume.pdf'
        )

    except Exception as e:
        return jsonify({"error": "PDF generation failed", "message": str(e)}), 500
