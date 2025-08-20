# from flask import Flask, request, jsonify, send_file
# from flask_cors import CORS
# import os
# import fitz
# import docx
# from io import BytesIO
# from openai import OpenAI
# from werkzeug.utils import secure_filename
# import json
# from dotenv import load_dotenv
# import uuid
# from thefuzz import fuzz
# import random
# import re

# # --- Configuration ---
# load_dotenv()
# app = Flask(__name__)
# CORS(app)
# api_key = os.getenv("OPENAI_API_KEY")
# if not api_key:
#     raise ValueError("OPENAI_API_KEY environment variable not set.")
# client = OpenAI(api_key=api_key)

# UPLOAD_FOLDER = 'uploads'
# if not os.path.exists(UPLOAD_FOLDER):
#     os.makedirs(UPLOAD_FOLDER)
# app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER




# # /ajay-code

# def extract_text_builder(file, filename):
#     filename = filename.lower()
#     if filename.endswith(".pdf"):
#         doc = fitz.open(stream=file.read(), filetype="pdf")
#         return " ".join(page.get_text() for page in doc)
#     elif filename.endswith(".docx"):
#         return "\n".join(para.text for para in docx.Document(file).paragraphs)
#     elif filename.endswith(".txt"):
#         return file.read().decode("utf-8", errors="ignore")
#     return ""




# @app.route("/extract", methods=["POST"])
# def extract_resume():
#     if 'resume' not in request.files:
#         return jsonify({"error": "No resume file provided"}), 400

#     file = request.files["resume"]
    
#     try:
#         raw_text = extract_text_builder(file, file.filename)
#         truncated_text = raw_text[:1000000]

#         prompt = f"""Extract all resume information and return it as JSON in the *exact structure* below.

#         👉 IMPORTANT:
#         Map section headings even if synonyms are used. For example:
#         - "Professional Summary", "About Me", or "Objective" → summary
#         - "Education", "Academic Background", or "Qualifications" → education
#         - "Projects", "Project Experience", "Work Samples", or "Portfolio" → projects
#         - "Awards", "Honors", "Achievements", or "Recognition" → achievements

#         Format your output like this:

#         {{
#             "Name": "Full Name",
#             "jobTitle": "Job Title",
#             "email": "email@example.com",
#             "phone": "123-456-7890",
#             "location": "City, Country",
#             "linkedin": "https://linkedin.com/...",
#             "github": "https://github.com/...",
#             "summary": "Professional summary...",
#             "experience": [
#                 {{
#                     "jobTitle": "Job Title",
#                     "company": "Company Name",
#                     "startDate": "Month Year",
#                     "endDate": "Month Year",
#                     "description": "Job description..."
#                 }}
#             ],
#             "education": [
#                 {{
#                     "degree": "Degree Name",
#                     "school": "School Name",
#                     "startDate": "Year",
#                     "endDate": "Year"
#                 }}
#             ],
#             "skills": ["Skill1", "Skill2"],
#             "languages": ["Language1", "Language2"],
#             "interests": ["Interest1", "Interest2"],
#             "achievements": [
#                 {{
#                     "title": "Achievement Title",
#                     "startDate": "Month Year",
#                     "endDate": "Month Year",
#                     "tech": "Tools/Tech Stack",
#                     "points": ["Point 1", "Point 2"]
#                 }}
#             ],
#             "projects": [
#                 {{
#                     "title": "Project Title",
#                     "startDate": "Month Year",
#                     "endDate": "Month Year",
#                     "tech": "Tools/Tech Stack",
#                     "points": ["Point 1", "Point 2"]
#                 }}
#             ]
#     }}"""  # Your existing prompt
        
#         response = client.chat.completions.create(
#             model="gpt-4",
#             messages=[{"role": "user", "content": f"{prompt}\n\nResume Text:\n{truncated_text}"}],
#             temperature=0.3,
#             max_tokens=2000
#         )
        
#         result = response.choices[0].message.content
        
#         try:
#             parsed = json.loads(result)
#         except json.JSONDecodeError:
#             return jsonify({
#                 "error": "AI returned invalid JSON",
#                 "ai_response": result
#             }), 500
            
#         return jsonify(parsed)

#     except Exception as e:
#         return jsonify({
#             "error": str(e),
#             "type": "server_error"
#         }), 500







# @app.route('/enhance-summary', methods=['POST'])
# def enhance_summary():
#     data = request.json
#     text = data.get('text', '')
#     job_title = data.get('jobTitle', '')
#     skills = data.get('skills', [])

#     prompt = f"""Enhance this professional summary according to industry standards:
    
#     Current summary: {text}
    
#     Job Title: {job_title}
#     Key Skills: {', '.join(skills)}
    
#     Please:
#     1. Keep it concise (3-4 sentences max)
#     2. Include relevant keywords naturally
#     3. Use professional language
#     4. Highlight achievements if mentioned
#     5. Maintain third-person perspective
    
#     Return only the enhanced summary without additional commentary."""  # Your existing prompt

#     try:
#         response = client.chat.completions.create(
#             model="gpt-3.5-turbo",
#             messages=[{"role": "user", "content": prompt}],
#             temperature=0.7,
#             max_tokens=200
#         )
        
#         enhanced_text = response.choices[0].message.content.strip()
#         return jsonify({"enhancedText": enhanced_text})
        
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500




# @app.route('/generate_feedback_from_jd', methods=['POST'])
# def generate_feedback_from_jd():
#     try:
#         data = request.get_json()
#         jd = data.get('jd')
#         resume_text = data.get('resume_text')

#         if not jd or not resume_text:
#             return jsonify({"error": "JD or resume text missing"}), 400

#         prompt = f"""You are an expert Career Coach and ATS (Applicant Tracking System) evaluator.

# Your task is to compare a *Job Description (JD)* and a *Resume*. Based on this comparison, analyze and return insights that help the candidate improve alignment for better hiring outcomes.

# Generate and return your response strictly in the following JSON format:

# {{
#   "ats_score": number (0-100),
#   "feedback": "string",
#   "strengths": ["string", "string", ...],
#   "weaknesses": ["string", "string", ...],
#   "matching_skills": ["string", "string", ...],
#   "missing_skills": ["string", "string", ...],
#   "improvement_tips": ["string", "string", ...],
#   "questions": ["string", "string", "string", ...]
# }}

# JD:
# \"\"\"{jd}\"\"\"

# Resume:
# \"\"\"{resume_text}\"\"\"

# Respond only in valid JSON format.
# """

#         response = client.chat.completions.create(
#             model="gpt-4o",
#             messages=[{"role": "user", "content": prompt}],
#             temperature=0.3,
#             max_tokens=1000
#         )

#         # Get raw response from GPT
#         result = response.choices[0].message.content.strip()

#         # Remove markdown formatting (e.g., ```json ... ```)
#         if result.startswith("```"):
#             result = result.strip("`").strip()
#             if result.lower().startswith("json"):
#                 result = result[4:].strip()

#         # Attempt to parse as JSON
#         try:
#             parsed_result = json.loads(result)
#         except json.JSONDecodeError:
#             # Fallback using ast.literal_eval if GPT returns Python-style dict
#             parsed_result = ast.literal_eval(result)

#         # Normalize questions if it's a string
#         questions = parsed_result.get("questions", [])
#         if isinstance(questions, str):
#             questions = [q.strip() for q in re.split(r'[\n\-•]', questions) if q.strip()]

#         return jsonify({
#             "ats_score": parsed_result.get("ats_score", 0),
#             "feedback": parsed_result.get("feedback", "No feedback generated."),
#             "strengths": parsed_result.get("strengths", []),
#             "weaknesses": parsed_result.get("weaknesses", []),
#             "matching_skills": parsed_result.get("matching_skills", []),
#             "missing_skills": parsed_result.get("missing_skills", []),
#             "improvement_tips": parsed_result.get("improvement_tips", []),
#             "questions": questions
#         })

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500



# @app.route('/api/fix-resume', methods=['POST'])
# def fix_resume():
#     data = request.get_json()
#     jd = data.get('jd')
#     answers = data.get('answerss', {})
#     resume = data.get('resume')

#     if not jd or not resume:
#         return jsonify({"error": "JD and Resume are required"}), 400

#     # Format answers
#     formatted_answers = "\n".join(
#         f"Q{i+1}: {q}\nA{i+1}: {a}" 
#         for i, (q, a) in enumerate(answers.items())
#     ) if answers else "No answers provided"

#     prompt = f"""You are an expert resume writer. Rewrite this resume to match the job description:
    
# Job Description:
# {jd}

# Original Resume:
# {resume}

# Candidate's Additional Answers:
# {formatted_answers}

# Return ONLY valid JSON in this exact format (no other text or explanation):
# {{
#     "Name": "Full Name",
#     "jobTitle": "Job Title",
#     "summary": "Professional summary...",
#     "experience": [{{"jobTitle": "...", "company": "...", "description": "..."}}],
#     "education": [{{"degree": "...", "school": "..."}}],
#     "skills": ["...", "..."],
#     "projects": [{{"title": "...", "description": "..."}}]
# }}"""

#     try:
#         response = client.chat.completions.create(
#             model="gpt-4",  # or "gpt-4-turbo" if available
#             messages=[
#                 {"role": "system", "content": "You output perfect JSON formatted resumes. Never add any explanatory text."},
#                 {"role": "user", "content": prompt}
#             ],
#             temperature=0.3,  # Lower temperature for more consistent results
#             max_tokens=2000
#         )

#         # Extract and clean the JSON response
#         ai_response = response.choices[0].message.content
#         json_str = ai_response[ai_response.find('{'):ai_response.rfind('}')+1]
#         parsed = json.loads(json_str)
        
#         return jsonify({"fixed_resume": parsed})
        
#     except json.JSONDecodeError:
#         return jsonify({"error": "Failed to parse AI response as JSON"}), 500
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


# # Ajay code end













# # --- Helper Functions ---
# def extract_text(file_storage):
#     """Extract text from PDF or DOCX files"""
#     filename = secure_filename(file_storage.filename)
#     file_storage.seek(0)
#     if filename.lower().endswith(".pdf"):
#         try:
#             with fitz.open(stream=file_storage.read(), filetype="pdf") as doc:
#                 return " ".join(page.get_text() for page in doc)
#         except Exception as e:
#             return f"Error: {e}"
#     elif filename.lower().endswith(".docx"):
#         try:
#             return "\n".join(p.text for p in docx.Document(file_storage).paragraphs)
#         except Exception as e:
#             return f"Error: {e}"
#     return ""

# def find_and_replace_in_doc(doc, changes):
#     """Find and replace text in DOCX with fuzzy matching"""
#     all_paragraphs = doc.paragraphs
#     for change in changes:
#         find_text = change.get('find', '').strip().lstrip('•*-').strip()
#         replace_text = change.get('replace', '').strip()
#         if not find_text or not replace_text:
#             continue
            
#         best_match_paragraph, highest_score = None, 0
#         for p in all_paragraphs:
#             paragraph_text_cleaned = p.text.strip().lstrip('•*-').strip()
#             if not paragraph_text_cleaned:
#                 continue
#             score = fuzz.ratio(find_text, paragraph_text_cleaned)
#             if score > highest_score:
#                 highest_score, best_match_paragraph = score, p
                
#         if best_match_paragraph and highest_score > 85:
#             p = best_match_paragraph
#             p.clear()
#             p.add_run(replace_text)
#     return doc

# def extract_json_from_response(response_text):
#     """Extract JSON from GPT response which might contain markdown"""
#     try:
#         return json.loads(response_text)
#     except json.JSONDecodeError:
#         try:
#             if '```json' in response_text:
#                 json_str = response_text.split('```json')[1].split('```')[0]
#                 return json.loads(json_str)
#             elif '```' in response_text:
#                 json_str = response_text.split('```')[1].split('```')[0]
#                 return json.loads(json_str)
#             else:
#                 json_str = response_text[response_text.find('{'):response_text.rfind('}')+1]
#                 return json.loads(json_str)
#         except Exception as e:
#             raise ValueError(f"Could not extract JSON from response: {e}")

# def normalize_scores(analysis_dict):
#     """Ensure scores have appropriate variation while maintaining consistency"""
#     base_score = analysis_dict['overall_score']
#     for category in analysis_dict['analysis_breakdown'].values():
#         # Add controlled variation while keeping scores realistic
#         variation = random.randint(-10, 10)
#         category['score'] = max(0, min(100, base_score + variation))
        
#         # Ensure details align with the category score
#         for detail in category['details']:
#             if 'passed' in detail:
#                 detail['passed'] = random.random() < (category['score']/100 * 0.9)  # 90% of score as probability
#     return analysis_dict

# def calculate_overall_score(analysis_dict):
#     """Calculate weighted overall score based on category weights"""
#     weights = {
#         'tailoring': 0.30,
#         'content': 0.25,
#         'format': 0.15,
#         'sections': 0.15,
#         'style': 0.15
#     }
    
#     weighted_sum = 0
#     for category, data in analysis_dict['analysis_breakdown'].items():
#         weighted_sum += data['score'] * weights.get(category, 0)
    
#     return min(100, max(0, round(weighted_sum)))

# # --- Endpoints ---
# @app.route('/analyze_resume', methods=['POST'])
# def analyze_resume_route():
#     """Analyze resume with or without job description"""
#     if 'resume_file' not in request.files:
#         return jsonify({"error": "Resume file is required."}), 400
        
#     resume_file = request.files['resume_file']
#     jd_text = request.form.get('jd_text', None)
#     resume_text = extract_text(resume_file)
    
#     if not resume_text or "Error:" in resume_text:
#         return jsonify({"error": f"Could not extract text: {resume_text}"}), 400
        
#     # Save original file for later optimization
#     resume_file.seek(0)
#     filename = secure_filename(resume_file.filename)
#     file_id = f"{uuid.uuid4()}{os.path.splitext(filename)[1]}"
#     resume_file.save(os.path.join(app.config['UPLOAD_FOLDER'], file_id))
    
#     # Define expected JSON structure
#     json_structure = """{
#       "overall_score": <number>, 
#       "summary": "<string>",
#       "analysis_breakdown": {
#         "tailoring": {
#           "score": <number>, 
#           "feedback": "<string>", 
#           "details": [
#             {"criterion": "Hard Skills Match", "passed": <boolean>, "comment": "<string>"}, 
#             {"criterion": "Soft Skills Match", "passed": <boolean>, "comment": "<string>"}
#           ]
#         },
#         "format": {
#           "score": <number>, 
#           "feedback": "<string>", 
#           "details": [
#             {"criterion": "File Format & Size", "passed": <boolean>, "comment": "<string>"},
#             {"criterion": "Resume Length", "passed": <boolean>, "comment": "<string>"},
#             {"criterion": "Concise Bullet Points", "passed": <boolean>, "comment": "<string>"}
#           ]
#         },
#         "content": {
#           "score": <number>, 
#           "feedback": "<string>", 
#           "details": [
#             {"criterion": "ATS Parse Rate", "passed": <boolean>, "comment": "<string>"},
#             {"criterion": "Quantified Impact", "passed": <boolean>, "comment": "<string>"},
#             {"criterion": "Language Repetition", "passed": <boolean>, "comment": "<string>"},
#             {"criterion": "Spelling & Grammar", "passed": <boolean>, "comment": "<string>"}
#           ]
#         },
#         "sections": {
#           "score": <number>, 
#           "feedback": "<string>", 
#           "details": [
#             {"criterion": "Contact Information", "passed": <boolean>, "comment": "<string>"},
#             {"criterion": "Essential Sections", "passed": <boolean>, "comment": "<string>"},
#             {"criterion": "Personality Statement", "passed": <boolean>, "comment": "<string>"}
#           ]
#         },
#         "style": {
#           "score": <number>, 
#           "feedback": "<string>", 
#           "details": [
#             {"criterion": "Design Consistency", "passed": <boolean>, "comment": "<string>"},
#             {"criterion": "Professional Email", "passed": <boolean>, "comment": "<string>"},
#             {"criterion": "Active Voice", "passed": <boolean>, "comment": "<string>"},
#             {"criterion": "Avoids Buzzwords & Clichés", "passed": <boolean>, "comment": "<string>"}
#           ]
#         }
#       }
#     }"""

#     if jd_text:
#         prompt = f"""You are a hyper-critical AI Resume Screener. Analyze this resume STRICTLY against the Job Description below.
#         Provide a DETAILED, NUANCED evaluation with scores that accurately reflect the resume's quality and match to the JD.

#         Evaluation Guidelines:
#         1. Be extremely critical - most resumes should score between 40-70 initially
#         2. Scores should vary significantly based on actual resume content
#         3. Deduct points for common mistakes (generic wording, lack of metrics, etc.)
#         4. Reward specific, quantifiable achievements
#         5. Consider the resume's industry standards

#         Scoring Distribution:
#         - Tailoring: 30% weight (match to JD requirements)
#         - Format: 15% weight (structure and readability)
#         - Content: 25% weight (substance and quality)
#         - Sections: 15% weight (completeness)
#         - Style: 15% weight (professionalism)

#         Return your analysis in this EXACT JSON format:
#         {json_structure}

#         Job Description:
#         {jd_text}

#         Resume Text:
#         {resume_text[:15000]}"""
#     else:
#         prompt = f"""You are an expert Resume Analyst. Provide a detailed assessment of this resume's standalone quality.
#         Be objective and critical, with scores reflecting true strengths/weaknesses.

#         Evaluation Criteria:
#         1. Professional presentation (format, structure)
#         2. Content quality (specificity, achievements)
#         3. Industry-standard sections
#         4. Readability and style
#         5. Avoidance of common pitfalls

#         Most resumes should score between 50-85 initially, with exceptional ones scoring higher.

#         Return your analysis in this EXACT JSON format:
#         {json_structure}

#         Resume Text:
#         {resume_text[:15000]}"""
    
#     try:
#         temperature = 0.7 if jd_text else 0.5
#         response = client.chat.completions.create(
#             model="gpt-4",
#             messages=[{"role": "user", "content": prompt}],
#             temperature=temperature
#         )
        
#         response_text = response.choices[0].message.content
#         result_dict = extract_json_from_response(response_text)
#         result_dict = normalize_scores(result_dict)
        
#         # Calculate weighted overall score
#         result_dict['overall_score'] = calculate_overall_score(result_dict)
        
#         result_dict['parsed_resume_text'] = resume_text
#         result_dict['file_id'] = file_id 
#         return jsonify(result_dict)
#     except Exception as e:
#         return jsonify({"error": f"AI analysis failed: {str(e)}"}), 500

# @app.route('/get_keyword_gaps', methods=['POST'])
# def get_keyword_gaps():
#     """Identify missing and matched keywords between resume and JD"""
#     data = request.get_json()
#     jd_text = data.get('jd_text')
#     resume_text = data.get('resume_text')
    
#     if not jd_text or not resume_text:
#         return jsonify({"error": "JD and Resume text required."}), 400

#     prompt = f"""
#     Analyze this resume against the Job Description with EXTREME precision.
#     Identify the most critical missing and matched keywords that impact ATS scoring.

#     Keyword Selection Guidelines:
#     1. Prioritize hard skills over soft skills
#     2. Include specific technologies/tools
#     3. Identify missing qualifications
#     4. Highlight present qualifications that match perfectly

#     Return a detailed JSON analysis with:
#     - missing_keywords: array of 5-10 critical missing terms
#     - present_keywords: array of 5-10 perfectly matched terms
#     - missing_qualifications: array of missing requirements
#     - matched_qualifications: array of matched requirements

#     Example Output:
#     {{
#       "missing_keywords": ["Python", "AWS", "Project Management"],
#       "present_keywords": ["Java", "SQL", "Team Leadership"],
#       "missing_qualifications": ["5+ years experience", "Cloud certification"],
#       "matched_qualifications": ["Bachelor's Degree", "Agile experience"]
#     }}

#     Job Description:
#     {jd_text}
    
#     Resume Text:
#     {resume_text}
#     """
    
#     try:
#         response = client.chat.completions.create(
#             model="gpt-4",
#             messages=[{"role": "user", "content": prompt}],
#             temperature=0.3
#         )
#         response_text = response.choices[0].message.content
#         result_dict = extract_json_from_response(response_text)
#         return jsonify(result_dict)
#     except Exception as e:
#         return jsonify({"error": f"Keyword analysis failed: {str(e)}"}), 500

# @app.route('/generate_questions', methods=['POST'])
# def generate_questions_route():
#     """Generate questions to fill resume gaps"""
#     data = request.get_json()
#     jd_text = data.get('jd_text')
#     resume_text = data.get('resume_text')
    
#     if not jd_text or not resume_text:
#         return jsonify({"error": "JD and Resume text required."}), 400
        
#     prompt = f"""
#     Based on the resume and JD, find the most critical gaps. Generate 5-7 direct questions to fix them.
#     Each question should be specific and designed to extract information that would help improve the resume.
    
#     Return your response in JSON format with a single "questions" key containing an array of questions.
    
#     Important Guidelines:
#     1. Only return valid JSON
#     2. Questions should be actionable and specific
#     3. Focus on extracting quantifiable achievements and missing skills
#     4. Prioritize questions that will impact ATS scoring
    
#     Example Output:
#     {{
#       "questions": [
#         "What specific metrics can you provide for your achievements in your last role?",
#         "Can you describe any experience with Python that wasn't mentioned in the resume?",
#         "What project management methodologies are you familiar with?",
#         "What certifications do you have that weren't listed?",
#         "Can you quantify your impact in your previous roles with specific numbers?"
#       ]
#     }}
    
#     Job Description:
#     {jd_text}
    
#     Resume Text:
#     {resume_text}
#     """
    
#     try:
#         response = client.chat.completions.create(
#             model="gpt-4",
#             messages=[{"role": "user", "content": prompt}],
#             temperature=0.5
#         )
#         response_text = response.choices[0].message.content
#         result_dict = extract_json_from_response(response_text)
#         return jsonify(result_dict)
#     except Exception as e:
#         return jsonify({"error": f"Failed to generate questions: {str(e)}"}), 500

# @app.route('/optimize_resume', methods=['POST'])
# def optimize_resume_route():
#     """Optimize resume based on user answers to questions"""
#     data = request.get_json()
#     jd_text = data.get('jd_text')
#     answers = data.get('answers')
#     file_id = data.get('file_id')
    
#     if not all([jd_text, answers, file_id]):
#         return jsonify({"error": "JD, answers, and file_id are required."}), 400
        
#     file_path = os.path.join(app.config['UPLOAD_FOLDER'], file_id)
#     if not os.path.exists(file_path):
#         return jsonify({"error": "Original resume file not found."}), 404
        
#     if not file_path.lower().endswith('.docx'):
#         return jsonify({"error": "Optimization is for .docx only."}), 400
    
#     original_doc = docx.Document(file_path)
#     original_resume_text = "\n".join(p.text for p in original_doc.paragraphs)
    
#     formatted_answers = []
#     for q, a in answers.items():
#         if a.strip():
#             formatted_answers.append(f"Q: {q}\nA: {a}\n")
    
#     prompt = f"""
#     You are a professional resume writer. Analyze this resume and job description, along with the candidate's answers.
#     Create SPECIFIC, IMPACTFUL changes that will maximize the resume's ATS score.
    
#     Guidelines:
#     1. Focus on adding quantifiable metrics from answers
#     2. Prioritize changes that address keyword gaps
#     3. Make language more achievement-oriented
#     4. Suggest 8-12 high-impact changes
#     5. For each change:
#        - 'find' must be EXACT text from original
#        - 'replace' must incorporate metrics/answers
#        - Changes should be verifiable improvements
    
#     Example Change:
#     {{
#       "find": "Managed social media accounts",
#       "replace": "Grew LinkedIn following from 500 to 5,000+ in 6 months through targeted content strategy"
#     }}
    
#     Job Description:
#     {jd_text}
    
#     Candidate Answers:
#     {"".join(formatted_answers)}
    
#     Original Resume:
#     {original_resume_text}
    
#     Return JSON with "changes" array following this exact format:
#     {{
#       "changes": [
#         {{"find": "exact text to replace", "replace": "improved version"}},
#         ...
#       ]
#     }}
#     """
    
#     try:
#         response = client.chat.completions.create(
#             model="gpt-4",
#             messages=[{"role": "user", "content": prompt}],
#             temperature=0.7
#         )
        
#         response_text = response.choices[0].message.content
#         changes = extract_json_from_response(response_text).get("changes", [])
        
#         modified_doc = docx.Document(file_path)
#         changes_applied = 0
        
#         # First pass: exact matches
#         for change in changes:
#             find_text = change.get('find', '').strip()
#             replace_text = change.get('replace', '').strip()
            
#             if find_text and replace_text and find_text in original_resume_text:
#                 for paragraph in modified_doc.paragraphs:
#                     if find_text in paragraph.text:
#                         paragraph.text = paragraph.text.replace(find_text, replace_text)
#                         changes_applied += 1
#                         break
        
#         # Second pass: fuzzy matches if few changes applied
#         if changes_applied < 3:
#             modified_doc = find_and_replace_in_doc(modified_doc, changes)
#             changes_applied = len(changes)
        
#         # Save optimized document
#         doc_io = BytesIO()
#         modified_doc.save(doc_io)
#         doc_io.seek(0)
        
#         return send_file(
#             doc_io,
#             as_attachment=True,
#             download_name='Optimized_Resume.docx',
#             mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
#         )
#     except Exception as e:
#         return jsonify({"error": f"Optimization failed: {str(e)}"}), 500

# if __name__ == "__main__":
#     app.run(debug=True, port=5000)