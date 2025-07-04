from io import BytesIO
import os
import pdfkit
from flask import Blueprint, request, jsonify, send_file
from app.utils.file_utils import extract_text_builder
from app.utils.ai_helpers import client
# from app.routes.auth_routes import token_required
from app.utils.auth_utils import token_required  # Import the decorator
from app.models.resume import Resume
from bson import ObjectId

import json


# 27/07






path_wkhtmltopdf = r'C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe'
config = pdfkit.configuration(wkhtmltopdf=path_wkhtmltopdf)

resume_bp = Blueprint('resume', __name__)







@resume_bp.route('/save', methods=['POST'])
@token_required
def save_resume(current_user):
    data = request.get_json()
    print("[DEBUG] Incoming Data:", data)
    print("[DEBUG] Current User:", current_user)
    title = data.get('title')
    content = data.get('content')

    if not title or not content:
        return jsonify({'error': 'Title and content are required'}), 400

    result = Resume.create_resume(current_user["_id"], title, content)

    return jsonify({
        "message": "Resume saved successfully",
        "resume_id": str(result.inserted_id)
    }), 201











@resume_bp.route("/test-mongo", methods=["GET"])
def test_mongo():
    try:
        db.test_collection.insert_one({"message": "Hello from Flask"})
        return {"status": "Inserted successfully"}
    except Exception as e:
        return {"error": str(e)}, 500





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
        Map section headings even if synonyms are used. For example:
        - "Professional Summary", "About Me", or "Objective" → summary
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



@resume_bp.route('/download_pdf', methods=['POST'])
def download_pdf():
    try:
        data = request.get_json()
        html_content = data.get('html')
        template = data.get('template', 'google')

        if not html_content:
            return jsonify({"error": "HTML content required"}), 400

        template_styles = {
            'google': """
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
            }

            .summary-detail {
              font-size: 13px;
            }

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

            @media print {
              body, html {
                width: 210mm;
                height: 297mm;
              }
              
              .resume-t2 {
                box-shadow: none;
                margin: 0;
                padding: 15mm;
                width: 100%;
                height: 100%;
              }
              
              .no-print {
                display: none;
              }
            }
            """,

            'meta': """
            body { font-family: Arial, sans-serif; }
            .meta-container { word-wrap: break-word; }
            """,

            'microsoft': """
            body { font-family: Arial, sans-serif; }
            .microsoft-container {
                max-width: 210mm;
                min-height: 297mm;
                margin: 0 auto;
                padding: 20mm;
                background: white;
            }
            """
        }

        styles = template_styles.get(template, "")

        full_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                {styles}
            </style>
        </head>
        <body>
            {html_content}
        </body>
        </html>
        """

        pdf_bytes = pdfkit.from_string(full_html, False, configuration=config)

        return send_file(
            BytesIO(pdf_bytes),
            mimetype='application/pdf',
            as_attachment=True,
            download_name='resume.pdf'
        )

    except Exception as e:
        return jsonify({"error": "PDF generation failed", "message": str(e)}), 500