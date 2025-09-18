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
import requests


# 27/07
# Define the upload folder for PDFs
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), "app", "pdfs")
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

OLLAMA_BASE_URL= os.getenv("OLLAMA_BASE_URL")

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
    field_type = data.get('fieldType')
    text = data.get('text', '')
    context = data.get('context', {})

    if not field_type or not text:
        return jsonify({"error": "Field type and text are required"}), 400

    # Define enhancement prompts for different field types
    prompts = {
        "experience": f"""Improve this work experience description for a resume:
        
Current description: {text}
        
Job Title: {context.get('jobTitle', '')}
Company: {context.get('company', '')}
        
Please:
1. Return ONLY the enhanced description, no introductory text
2. Use strong action verbs (e.g., "Developed", "Led", "Implemented")
3. Quantify achievements only if the input contains specific metrics
4. Use the bullet point character '•' for all bullet points
5. Keep it concise (2-3 bullet points)
6. Make it more professional and impactful
7. DO NOT ADD any text like "Here is the improved version" or "Enhanced description:"

Return only the enhanced description without any additional text.""",
        
        "project": f"""Enhance this project description for a resume:
        
Project: {context.get('title', '')}
Technologies: {context.get('tech', '')}
Current description: {text}
        
Please:
1. Return ONLY the enhanced description, no introductory text
2. Highlight technical challenges and solutions
3. Showcase specific contributions
4. Use bullet points if not already
5. Keep it professional and concise
6. Use the bullet point character '•' for all bullet points
7. Keep it concise (3-4 bullet points , 1 or 1.5 lines of sentences not more than that)
8. DO NOT ADD any text like "Here is the improved version" or "Enhanced description:"
        
Return only the enhanced description.""",
        
        "achievement": f"""IMPROVE THIS ACHIEVEMENT DESCRIPTION - RETURN ONLY THE ENHANCED TEXT, NO INTRODUCTORY TEXT AND NO TITLE AND NO HEADING:
        
Achievement: {context.get('title', '')}
Current description: {text}
        
Please:
1. Return ONLY the enhanced description, no introductory text
2. Make it more impactful
3. Quantify achievements only if the input contains specific metrics
4. Use the bullet point character '•' if using bullet points
5. Keep it concise (1-2 sentences or bullet points)
6. Use professional language
7. DO NOT ADD any text like "Here is the improved version" or "Enhanced description:"
        
Return only the enhanced description.""",
        
        "internship": f"""Enhance this internship description for a resume:
 
Current description: {text}
Role: {context.get('role', '')}
Company: {context.get('company', '')}
 
Please:
1. Return ONLY the enhanced description, no introductory text
2. Use action verbs to highlight contributions
3. Emphasize skills developed
4. Use the bullet point character '•' for all bullet points
5. Quantify achievements only if the input contains specific metrics
6. Keep it concise (2-3 bullet points)
7. Make it professional
8. DO NOT ADD any text like "Here is the improved version" or "Enhanced description:"
 
Return only the enhanced description.""",
 
        "default": f"""Improve this text for a professional resume:
 
{text}
 
Please:
1. Return ONLY the enhanced description, no introductory text
2. Make it more concise, professional, and impactful
3. Use the bullet point character '•' if using bullet points
4. Quantify achievements only if the input contains specific metrics
5. Preserve the original meaning
6 .DO NOT ADD any text like "Here is the improved version" or "Enhanced description:"
 
Return only the enhanced text.""",
    }

    prompt = prompts.get(field_type, prompts["default"])

    try:
        # Use your exact format for Ollama API call
        payload = {
            "model_name": "mistral:7b-instruct",
            "prompt": prompt,
            "actual_data": text,
            "temperature": 0.7,
            "top_p": 0.9,
            "max_tokens": 500,
            "top_k": 40,
            "repeat_penalty": 1.1,
            "num_ctx": 2048,
            "num_thread": 4,
            "stop": ["\n\n", "Human:"],
            "conversation_history": []
        }
        
        print(f"[DEBUG] Sending payload to Ollama: {json.dumps(payload, indent=2)}")
        
        response = requests.post(OLLAMA_BASE_URL, json=payload)
        
        print(f"[DEBUG] Ollama response status: {response.status_code}")
        print(f"[DEBUG] Ollama response text: {response.text}")

        if response.status_code != 200:
            return jsonify({"error": f"Ollama API error: {response.text}"}), 500
        
        result = response.json()
        print(f"[DEBUG] Ollama JSON response: {json.dumps(result, indent=2)}")
        
        # Try different response field names
        enhanced_text = result.get('response', '') or result.get('text', '') or result.get('output', '') or result.get('content', '')
        enhanced_text = enhanced_text.strip()

        print(f"[DEBUG] Extracted enhanced text: '{enhanced_text}'")

        # Post-process to replace common bullet characters with '•'
        enhanced_text = enhanced_text.replace('- ', '• ').replace('* ', '• ')
        return jsonify({"enhancedText": enhanced_text})
        
    except Exception as e:
        print(f"[ERROR] Exception occurred: {str(e)}")
        return jsonify({"error": str(e)}), 500



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
    
    # Create the system prompt and actual data
    system_prompt = """You are a professional resume writer. Generate a professional 3-4 line career objective.

Guidelines:
1. Return ONLY the career objective text, no introductory text
2. Focus on career goals and relevant skills
3. Use third-person perspective (avoid "I" or "my")
4. Keep it concise (40-60 words)
5. Sound professional but not generic
6. DO NOT ADD any text like "Here is", "Let me know", or explanatory phrases
7. DO NOT include quotation marks around the objective"""

    actual_data = f"Generate a career objective based on:\n{context}"

    try:
        # Use your custom format for Ollama API call
        payload = {
            "model_name": "mistral:7b-instruct",
            "prompt": system_prompt,
            "actual_data": actual_data,
            "temperature": 0.3,
            "top_p": 0.9,
            "max_tokens": 3000,
            "top_k": 40,
            "repeat_penalty": 1.1,
            "num_ctx": 2048,
            "num_thread": 4,
            "stop": ["\n\n", "Human:", "Here is", "Let me"],
            "conversation_history": []
        }
        
        print(f"[DEBUG] Sending objective payload to Ollama: {json.dumps(payload, indent=2)}")
        
        response = requests.post(OLLAMA_BASE_URL, json=payload)

        if response.status_code != 200:
            return jsonify({"error": f"Ollama API error: {response.text}"}), 500
        
        result = response.json()
        print(f"[DEBUG] Ollama objective response: {json.dumps(result, indent=2)}")
        
        # Extract the generated objective
        generated_text = result.get('response', '').strip()
        
        # Clean up any unwanted prefixes
        clean_text = generated_text
        for prefix in ["Here is", "Let me", "Objective:", "Career Objective:"]:
            if clean_text.startswith(prefix):
                clean_text = clean_text[len(prefix):].strip()
        
        return jsonify({"objective": clean_text})

    except Exception as e:
        print(f"[ERROR] Exception in generate-objective: {str(e)}")
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
        # Truncate to avoid overwhelming the context window
        max_input_chars = 12000  # Further reduced for safety
        truncated_text = raw_text[:max_input_chars]
        print(f"[DEBUG] Input text length: {len(truncated_text)} characters")

        prompt = f"""You are a precise JSON generator. Extract all resume information and return it as a JSON object in the *exact structure* below. Return ONLY the JSON object, with no additional text, explanations, or introductory phrases like "Here is". Do NOT include ```json markers unless specified. Ensure the output is valid JSON.

        IMPORTANT:
        - If the resume belongs to a **fresher** (i.e., no work experience section), place the summary text in both the **"objective"** and **"summary"** fields.
        - If the resume belongs to an **experienced candidate** (i.e., work experience section is present), place the summary text in both the **"summary"** and **"objective"** fields.
        - Map section headings even if synonyms are used. For example:
          - "Professional Summary", "About Me", or "Objective" → summary/objective
          - "Education", "Academic Background", or "Qualifications" → education
          - "Projects", "Project Experience", "Work Samples", or "Portfolio" → projects
          - "Awards", "Honors", "Achievements", or "Recognition" → achievements
          - "Experience", "Professional Experience", "Professional background", "Occupation History", "Career Experience", or "Work experience" → experience

        Output structure:
        {{
            "Name": "Full Name",
            "jobTitle": "Job Title",
            "email": "email@example.com",
            "phone": "123-456-7890",
            "location": "City, Country",
            "linkedin": "https://linkedin.com/...",
            "github": "https://github.com/...",
            "summary": "Professional summary...",
            "objective": "Career Objectives",
            "experience": [
                {{
                    "jobTitle": "Job Title",
                    "company": "Company Name",
                    "startDate": "Month Year",
                    "endDate": "Month Year",
                    "location": "working location",
                    "description": ["Point 1", "Point 2"]
                }}
            ],
            "internships": [
                {{
                    "role": "Job Title",
                    "company": "Company Name",
                    "startDate": "Month Year",
                    "endDate": "Month Year",
                    "location": "working location",
                    "description": ["Point 1", "Point 2"]
                }}
            ],
            "education": [
                {{
                    "degree": "Degree Name",
                    "school": "School Name",
                    "level": "type of education level",
                    "startDate": "Month Year",
                    "endDate": "Month Year",
                    "location": "working location",
                    "cgpa": "X.XX/10"
                }}
            ],
            "skills": ["Skill1", "Skill2"],
            "languages": ["Language1", "Language2"],
            "interests": ["Interest1", "Interest2"],
            "achievements": [
                {{
                    "title": "Achievement Title",
                    "description": "some description about the achievement"
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
                    "date": "Month Year"
                }}
            ]
        }}
        """
        
        # Use Ollama's STANDARD format (custom format doesn't work)
        payload = {
            "model_name": "mistral:7b-instruct",
            "prompt": prompt,
            "actual_data": truncated_text,
            "temperature": 0.2,  # Slightly increased for flexibility
            "top_p": 0.9,
            "max_tokens": 4000,  # Increased to handle larger JSON output
            "top_k": 40,
            "repeat_penalty": 1.1,
            "num_ctx": 8192,  # Increased context window
            "stop": ["\n\n", "Human:", "Here is"],
            "conversation_history": []
        }
        
        print(f"[DEBUG] Sending extract payload to Ollama: {json.dumps(payload, indent=2)}")
        
        response = requests.post(OLLAMA_BASE_URL, json=payload)

        print(f"[DEBUG] Ollama response status: {response.status_code}")
        print(f"[DEBUG] Ollama response text: {response.text}")

        if response.status_code != 200:
            return jsonify({
                "error": f"Ollama API error: {response.text}",
                "status_code": response.status_code
            }), 500
        
        result = response.json()
        print(f"[DEBUG] Ollama JSON response: {json.dumps(result, indent=2)}")
        
        # Extract the response - Ollama uses 'response' field
        ai_response = result.get('response', '')
        print(f"[DEBUG] Raw AI response: {ai_response}")
        
        if not ai_response:
            return jsonify({
                "error": "AI returned empty response",
                "ai_response": ai_response
            }), 500

        try:
            # Look for JSON object in the response
            json_start = ai_response.find('{')
            json_end = ai_response.rfind('}') + 1
            
            if json_start != -1 and json_end != -1:
                json_str = ai_response[json_start:json_end]
                # Clean the JSON string
                json_str = json_str.strip()
                json_str = json_str.replace('```json', '').replace('```', '').strip()
                
                parsed = json.loads(json_str)
            else:
                # Fallback: Check for JSON after common prefixes
                for prefix in ["Here is the resume information in the requested JSON format:", "Here is the JSON:", "```json"]:
                    if ai_response.startswith(prefix):
                        json_str = ai_response[len(prefix):].strip()
                        json_start = json_str.find('{')
                        json_end = json_str.rfind('}') + 1
                        if json_start != -1 and json_end != -1:
                            json_str = json_str[json_start:json_end].strip()
                            json_str = json_str.replace('```json', '').replace('```', '').strip()
                            parsed = json.loads(json_str)
                            break
                else:
                    return jsonify({
                        "error": "AI returned invalid JSON - no JSON object found",
                        "ai_response": ai_response
                    }), 500
                
            return jsonify(parsed)

        except json.JSONDecodeError as e:
            print(f"[ERROR] JSON decode error: {e}")
            print(f"[ERROR] JSON string that failed: {json_str}")
            return jsonify({
                "error": "AI returned invalid JSON",
                "ai_response": ai_response,
                "json_error": str(e)
            }), 500

    except requests.RequestException as e:
        print(f"[ERROR] Network error in extract: {str(e)}")
        return jsonify({
            "error": f"Network error: {str(e)}",
            "type": "network_error"
        }), 500
    except Exception as e:
        print(f"[ERROR] Exception in extract: {str(e)}")
        return jsonify({
            "error": str(e),
            "type": "server_error"
        }), 500

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

.resume-inner {
  padding: 10mm; 
  box-sizing: border-box;
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

/* education-item */
/* Add these styles to your existing CSS */
.education-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  width: 100%;
}

.education-left {
  flex: 1;
  min-width: 0; /* Prevents overflow */
}

.education-right {
  flex-shrink: 0; /* Prevents date from wrapping */
  margin-left: 1rem;
}

.degree {
  font-size: 0.8rem;
  font-weight: bold;
  margin: 0;
  white-space: normal;
}

.university {
  font-size: 0.75rem;
  color: #4a5568;
  margin: 0.1rem 0;
}

.gpa {
  font-size: 0.75rem;
  color: #4a5568;
  font-style: italic;
  margin: 0;
}

.dates {
  font-size: 0.75rem;
  color: #718096;
  white-space: nowrap;
  text-align: right;
}

/* Work Experience Section */
                                   
.work-item {
  margin-bottom: 1rem;
  page-break-inside: avoid;
}

.work-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.25rem;
}

.work-info {
  flex: 1;
  min-width: 0; /* Prevents text overflow */
}

.work-info h3 {
  font-size: 0.8rem;
  font-weight: bold;
  margin: 0 0 0.1rem 0;
  line-height: 1.3;
}

.work-info p {
  font-size: 0.75rem;
  color: #4a5568;
  margin: 0;
  line-height: 1.3;
}

.date-right {
  font-size: 0.75rem;
  color: #718096;
  white-space: nowrap;
  flex-shrink: 0;
  text-align: right;
  padding-top: 0.1rem; /* Minor alignment adjustment */
}

.work-list {
  font-size: 0.75rem;
  color: #4a5568;
  list-style: disc;
  padding-left: 1.25rem;
  margin-top: 0.25rem;
  margin-bottom: 0;
}

.work-list li {
  margin-bottom: 0.1rem;
  line-height: 1.3;
}

.skills-grid {
  display: flex; /* Use flex instead of grid for better PDF support */
  gap: 3rem; /* This creates the space between columns */
}

.skills-grid ul {
  flex: 1; /* Makes both columns equal width */
  list-style: none; /* Remove default bullets */
  padding-left: 1rem; /* Indent list items */
  margin: 0; /* Remove default margins */
}

.skills-grid li {
  font-size: 0.75rem;
  position: relative;
  padding-left: 1rem;
  margin-bottom: 0.25rem;
   color: #4a5568; 
}

.skills-grid li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: #4a5568;
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
                
            elif template_id == "template4":
                page.add_style_tag(content="""
                       .resume {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  width: 170mm;
  margin: 0 auto;
    min-height: 297mm;
  background-color: white;
  color: #333;
  box-sizing: border-box;
}

.resume-inner {
  padding: 10mm;  /* reliable in PDF */
  box-sizing: border-box;
}


/* Header */
.resume-headerr {
  text-align: left;
  margin-bottom: 20px;
}

.resume-headerr h1 {
  font-size: 29px;
  color:black;
  font-weight: bold;
}

.resume-headerr h2 {
  font-size: 15px;
  margin-bottom: 10px;
}

.contact-info {
  font-size: 12px;
  color: #555;
  margin-bottom: 20px;
}

.contact-info span {
  margin-right: 5px;
}

/* Summary */
.summary {
  margin-bottom: 20px;
  padding-top: 0;
  border-top: none;
}

.section-title {
  font-size: 14px;
  font-weight: bold;
  text-transform: uppercase;
   border-bottom: 1px solid black !important; 
  margin-bottom: 10px;
  color: #333;
}

.summary-text {
  font-size: 12px;
  line-height: 1.5;
}

/* Two-column layout */
.resume-body {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 30px;
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Skills */
.skills {
  padding-bottom: 10px;
}

.skills-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.skill-item {
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  background-color: #f0f0f0;
  /* text-decoration: underline; */
  /* line-height: 15px; */
  white-space: nowrap;
}

/* Education Section */
.education {
  margin-top: 20px;
}

.education-container {
  margin-bottom: 1.5rem;
}

.education-upper {
  margin-bottom: 0.3rem;
}

.education-lower {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.school-info {
  flex: 1;
}

.date-info {
  margin-left: 1rem;
  text-align: right;
}

.degree {
  font-size: 13px;
  font-weight: bold;
  margin: 0;
  color: #333;
}

.university {
  font-size: 12px;
  color: #4a5568;
  margin: 0 0 0.1rem 0;
}

.gpa {
  font-size: 0.75rem;
  color: #4a5568;
  font-style: italic;
  margin: 0;
}

.dates {
  font-size: 0.75rem;
  color: #718096;
  white-space: nowrap;
}

.info-capital {
  text-transform: capitalize;
}


/* Common item styling */
.project-item,
.experience-item,
.achievement-item,
.education-item {
  margin-bottom: 15px;
}

.project-item h4,
.experience-item h4,
.achievement-item h4,
.education-item h4 {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 5px;
}

.project-details,
.company,
.cert-details,
.school {
  font-size: 12px;
  font-style: italic;
  color: #777;
  margin-bottom: 5px;
}

.project-details a {
  color: #10c0d4;
  text-decoration: none;
}

.project-title{
  font-size: 14px;
}

.project-details a:hover {
  text-decoration: underline;
}


.certifications {
  margin-top: 20px;
}



.certifications .section-title {
  font-size: 14px;
  font-weight: bold;
  text-transform: uppercase;
  margin-bottom: 10px;
  color: #333;
}

.certification-item {
  margin-bottom: 15px;
}

.certification-item h4 {
  font-size: 13.5px;
  font-weight: bold;
  margin-bottom: 3px;
  color: #111;
}

.cert-details {
  font-size: 12px;
  color: #777;
  font-style: italic;
}


.cert-details .date {
  font-style: normal;
  color: #333;
}

ul {
  list-style-type: none;
  padding-left: 0;
  margin: 5px 0;
}

li {
  font-size: 12px;
  margin-bottom: 5px;
  position: relative;
  padding-left: 15px;
}

li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: #333;
  font-size: 12px;
}

/* Footer */
.interests {
  margin-top: 20px;
}

.interests-list {
  list-style: none;
  padding-left: 0;
  margin-top: 10px;
}

.interest-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
}



.interest-text {
  font-size: 12px;
  color: #333;
}

.languages {
  margin-top: 20px;
}

.languages-list {
  list-style: none;
  padding-left: 0;
  margin-top: 10px;
}

.language-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
}



.language-text {
  font-size: 12px;
  color: #333;
}

.capitalize{
  text-transform: capitalize;
}
             
                                   
                                   """)
                
            elif template_id == "template5":
                page.add_style_tag(content="""
                
                




.resume-container {
width: 170mm;
  margin: 0 auto;
    min-height: 297mm;
  background-color: white;
  color: #333;
  box-sizing: border-box;
}

.resume-inner {
  padding: 10mm;  /* reliable in PDF */
  box-sizing: border-box;
}
/* Header */
.resume-header {
  text-align: center;
  margin-bottom: 20px;
}

.resume-header h1 {
  font-size: 24px;
  font-weight: bold;
  color: #0072ce;
}

.resume-header h2 {
  font-size: 16px;
  font-weight: normal;
  margin-top: 4px;
}

.contact-info {
  font-size: 13px;
  margin-top: 8px;
  color: #444;
}

.contact-info span:not(:last-child)::after {
  content: "\2022";
  margin: 0 8px;
}

/* Section */
.resume-section {
  margin-top: 20px;
}

.section-title {
  font-size: 14px;
  font-weight: bold;
  text-transform: uppercase;
  margin-bottom: 10px;
  border-bottom: 1px solid #ccc;
  padding-bottom: 4px;
  color: #0072ce;

}

.summary-section {
  margin-top: 20px;
  margin-bottom: 14px;
  padding-bottom: 10px;
}

.section-title-centered {
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: #1e90ff; /* blue color */
  border-bottom: 1px solid #1e90ff;
  /* padding-bottom: 6px; */
  margin-bottom: 10px;
}


.summary-text {
  font-size: 12px;
  color: #333;
}


/* Achievements Grid */
.achievements{
    margin-bottom: 14px;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.achievement-box {
  font-size: 12px;
}

.achievement-title {
  font-size: 12px;
  font-weight: 600;
  color: #1e90ff;
  margin-bottom: 4px;
}

.achievement-desc {
  font-size: 12px;
  color: #333;
  line-height: 1.4;
}
/* Experience */
.experience-section {
  margin-bottom: 20px;
}

.experience-item {
  margin-bottom: 20px;
}

.experience-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 5px;
}

.left-info .company {
  font-weight: bold;
  font-size: 14px;
  color: #333;
}

.left-info .job-title {
  font-size: 13px;
  font-weight: 500;
  color: #1e90ff;
}

.right-info {
  text-align: right;
  font-size: 12px;
  color: #444;
}

.experience-details {
  list-style-type: disc;
  margin-top: 5px;
}

.experience-details li {
  font-size: 13px;
  margin-bottom: 5px;
  line-height: 1.5;
    list-style-type: none;
}


/* Education */
.education-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.education-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.edu-left {
  max-width: 70%;
}

.edu-school {
  font-size: 13px;
  font-weight: 600;
  color: #000;
  /* margin-bottom: 2px; */
}

.template5-edu-degree {
  font-size: 13px;
   margin: 0; /* Remove default margins */
  line-height: 0.9; /* Consistent line height */
}

.edu-right {
  text-align: right;
  font-size: 12px;
  color: #555;
  display: flex;
  flex-direction: column;
  align-items: flex-end; /* Right-align the content */
}

.edu-location {
  margin-bottom: 2px;
}

.template5-edu-dates {
    font-size: 13px;
  margin: 0;
   line-height: 1.5;
}

/* skill section */
.skills-section {
  margin-bottom: 20px;
}

.skills-inline {
  font-size: 13px;
  color: #333;
  line-height: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 5px; /* space between skill groups */
}

.dot-separator {
  font-weight: bold;
  color: #333; /* darker dot */
  margin: 0 6px;
}


/* languages */
.language-section {
  margin-top: 20px;
}

.language-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3 columns */
  gap: 0 10rem;
}

.language-item {
 
  padding: 0.2rem 1rem;

  font-size: 13px;
  color: #1f2937; /* text-gray-800 */
  text-align: center;
  font-weight: 500;
}


/* interest section */

/* Interest Section */
.interest-section {
  margin-top: 20px;
}

.interest-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
}


.interest-item {
  display: flex;
  align-items: flex-start;
  padding: 0 8px;
  color: #1f2937;
  font-size: 13px;
  line-height: 1;
}

.bullet-dot {
  width: 3px;
  height: 3px;
  margin-right: 6px;
  margin-top: 6px;
  background-color: #007bff;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}


/* Certification Section */
.certification-section {
  margin-top: 20px;
  margin-bottom: 14px;
}

.certification-list {
  display: flex;
  flex-direction: column;
  padding: 0 8px;
}

.certification-item {
  font-size: 12px;
  color: #333;
  line-height: 1;
}
 """)
                
            elif template_id == "template6":
                page.add_style_tag(content="""

body{
  margin:0;
  padding:0;
}

.resume-inner {
  padding: 7mm;  /* reliable in PDF */
  box-sizing: border-box;
}


.template6-resume {
    width: 170mm;
  min-height: 297mm;
  margin: 0 auto;
  font-family: Arial, sans-serif;
  color: #333;
    box-sizing: border-box;
}

/* HEADER */
.template6-header {
  background-color: #e94b35;
  color: white;
  text-align: center;
    padding: 20px;
}

.template6-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  text-transform: uppercase;
}

.template6-contact-info {
  font-size: 12px;
  margin-top: 8px;
}

.template6-contact-info span {
  margin: 0 6px;
}

/* SECTION LAYOUT */

.template6-summary-section {
  display: flex;
  align-items: flex-start;  
  border-bottom: 1px solid #ddd;
  padding: 15px 0;
}

.template6-summary-left {
  width: 40mm;
  font-weight: bold;
  color: #e94b35;
  font-size: 13px;
  text-transform: uppercase;
}

.template6-summary-right {
  flex:1;
}

.template6-summary-right p {
  margin: 0;
  line-height: 1;
  text-align: justify;
  font-size: 13px;
}

.template6-section {
  display: flex;
  align-items: flex-start;  
  border-bottom: 1px solid #ddd;
  padding: 15px 0;
}

.template6-section:last-child {
  border-bottom: none;
}

.template6-left {
  width: 40mm;        
  min-width: 40mm;
  font-weight: bold;
  color: #e94b35;
  font-size: 13px;
  text-transform: uppercase;  
}



.template6-right {
  flex:1;
  font-size: 13px;
  
}

/* EXPERIENCE */
.template6-projects .template6-experience {
  margin-bottom: 15px;
}

.template6-job-header {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  font-weight: bold;
}

.template6-date {
  font-weight: normal;
  font-size:10px;
}

.template6-projects .template6-company {
  font-style: italic;
  font-size: 13px;
  margin-bottom: 6px;
}

.template6-experience ul {
  margin: 0;
}

.template6-experience li {
  font-size: 12px;
  margin-bottom: 4px;
}

/* SKILLS */
.template6-skills-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  font-size: 12px;
}

.template6-skill-item {
  margin-bottom: 4px;
}

/* EDUCATION */
.template6-education-degree {
  font-weight: bold;
  font-size: 13px;
}

.template6-school {
  font-style: italic;
  font-size: 12px;
}


/* certificaton section style  */
/* CERTIFICATIONS */
.template6-certification {
  font-size: 13px;
  margin-bottom: 6px;
}

.template6-certification:last-child {
  margin-bottom: 0;
}

/* achievement section */
/* ACHIEVEMENTS */
.template6-achievement {
  margin-bottom: 10px;
  font-size: 13px;
}

.template6-achievement-title {
  font-weight: bold;
  margin-bottom: 3px;
}

.template6-achievement-desc {
  font-size: 12px;
  color: #555;
  margin-left: 10px;
}


    """)

            pdf_options = {
    "path": output_path,
    "format": "A4",
    "print_background": True,
    "margin": {
        "top": "0mm",    # Increased from 0 to 10mm
        "right": "0mm",  # Added right margin
        "bottom": "0mm", # Added bottom margin
        "left": "0mm"    # Added left margin
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


