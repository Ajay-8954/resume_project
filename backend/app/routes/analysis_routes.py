from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from flask import current_app
from app.utils.ai_helpers import client
import json
import re
import ast
import hashlib  # <-- 1. ADD THIS IMPORT
import os
import uuid

from app.utils.file_utils import extract_text, extract_json_from_response
from app.utils.scoring import normalize_scores, calculate_overall_score

analysis_bp = Blueprint('analysis', __name__)


def normalize_text(text):
    if not text:
        return ""
    # Lowercase, remove leading/trailing whitespace, and collapse multiple spaces/newlines
    return ' '.join(text.lower().strip().split())

# --- 2. ADD THESE HELPER FUNCTIONS ---
# A helper function to hash file content
def hash_file(file_storage):
    hasher = hashlib.sha256()
    # Ensure we read from the beginning of the file
    file_storage.seek(0)
    buf = file_storage.read(65536)
    while len(buf) > 0:
        hasher.update(buf)
        buf = file_storage.read(65536)
    # Reset the file pointer again for other operations like save()
    file_storage.seek(0)
    return hasher.hexdigest()

# A helper function to hash text
def hash_text(text):
    return hashlib.sha256(text.encode('utf-8')).hexdigest()
# --- END OF HELPER FUNCTIONS ---




# In app/routes/analysis_routes.py

@analysis_bp.route("/analyze_resume", methods=["POST"])
def analyze_resume_route():
    """Analyze resume with or without job description"""
    if 'resume_file' not in request.files:
        return jsonify({"error": "Resume file is required."}), 400
        
    resume_file = request.files['resume_file']
    jd_text = request.form.get('jd_text', '')
    
    old_score_from_form = request.form.get('old_score', type=int)

    # --- FINAL, SIMPLIFIED LOGIC BLOCK ---
    db = current_app.db
    analyses_collection = db.analyses
    
    current_resume_hash = hash_file(resume_file)
    normalized_jd = normalize_text(jd_text)
    jd_hash = hash_text(normalized_jd)
    # jd_hash = hash_text(jd_text)
    
    # Check if THIS specific file has been analyzed and saved before.
    existing_record = analyses_collection.find_one({
        "resume_hash": current_resume_hash, 
        "jd_hash": jd_hash # Use the actual jd_text for matching
    })

    # --- PATH 1: The file has been scored before. Return the stored result instantly. ---
    if existing_record:
        # We don't need to call the AI again. We already have the answer.
        # Create a copy to avoid modifying the original dict from the DB
        analysis_to_return = existing_record['latest_analysis'].copy()
        analysis_to_return['parsed_resume_text'] = extract_text(resume_file)
        # Add file_id for consistency
        analysis_to_return['file_id'] = existing_record.get('file_id') 
        return jsonify(analysis_to_return)

    # --- PATH 2: This is a new file that has never been scored. We must call the AI. ---
    else:
        # --- ALL YOUR LOGIC IS NOW CORRECTLY PLACED INSIDE THIS 'ELSE' BLOCK ---
        
        # Minified and corrected JSON structure
        json_structure = """{"overall_score": <number>, "summary": "<string>", "analysis_breakdown": {"tailoring": { "score": <number>, "feedback": "<string>", "details": [{"criterion": "Hard Skills Match", "passed": <boolean>, "comment": "<string>"}, {"criterion": "Soft Skills Match", "passed": <boolean>, "comment": "<string>"}] }, "format": { "score": <number>, "feedback": "<string>", "details": [{"criterion": "File Format & Size", "passed": <boolean>, "comment": "<string>"}, {"criterion": "Resume Length", "passed": <boolean>, "comment": "<string>"}, 
        {"criterion": "Concise Bullet Points", "passed": <boolean>, "comment": "<string>"}] }, "content": { "score": <number>, "feedback": "<string>", "details": [{"criterion": "ATS Parse Rate", "passed": <boolean>, "comment": "<string>"}, {"criterion": "Quantified Impact", "passed": <boolean>, "comment": "<string>"}, {"criterion": "Language Repetition", "passed": <boolean>, "comment": "<string>"}, {"criterion": "Spelling & Grammar", "passed": <boolean>, "comment": "<string>"}] }, "sections": { "score": <number>, "feedback": "<string>",
          "details": [{"criterion": "Contact Information", "passed": <boolean>, "comment": "<string>"}, {"criterion": "Essential Sections", "passed": <boolean>, "comment": "<string>"}, {"criterion": "Personality Statement", "passed": <boolean>, "comment": "<string>"}, {"criterion": "EXPERIENCE", "passed": <boolean>, "comment": "<string>"}] }, "style": { "score": <number>, "feedback": "<string>", "details": [{"criterion": "Design Consistency", "passed": <boolean>, "comment": "<string>"}, {"criterion": "Professional Email", "passed": <boolean>, "comment": "<string>"}, 
          {"criterion": "Active Voice", "passed": <boolean>, "comment": "<string>"}, {"criterion": "Avoids Buzzwords & Clichés", "passed": <boolean>, "comment": "<string>"}] }}}"""
        resume_text = extract_text(resume_file)
        
        # --- FIX: THIS IS YOUR PROMPT BLOCK, BUT USING THE CORRECT VARIABLE 'old_score_from_form' ---
        if old_score_from_form is not None:
            prompt = f"""
            You are an expert AI Resume Screener performing a RE-EVALUATION.
            An earlier version of this resume scored {old_score_from_form}/100. This version has been optimized with new information.

            **Your Task:**
            Objectively evaluate the updated resume against the Job Description. Your new score should reflect the impact of the new changes.
            - **Focus on how the new information addresses gaps** in skills, experience, or quantifiable metrics that might have been missing before.
            - **Reward** the successful integration of keywords from the JD and specific achievements.
            - Provide a fair, new evaluation based on the resume's current, improved state.
            
            **Evaluation Guidelines:**
            1. Be extremely critical. Reward strong JD alignment, penalize poor matches.
            2. Scores must vary significantly based on actual content and relevance to the JD like(skill,experience,and other criteria).
            3. Deduct for generic wording, missing skills, lack of measurable achievements, or weak structure.
            4. Reward specific, quantifiable accomplishments and relevant experience, similar skills towards JD.
            5. Consider industry standards and resume professionalism.
            
**Scoring Breakdown:**
- Tailoring to JD:Hard skill and Soft skill (35%)
  Skill Match Score = (Matched Skills / Total Skills in JD) * 35
  Example:
    JD Skills: Java, Spring, Docker, Leadership, Communication (5 total)
    Resume Skills Found: Java, Spring, Leadership, Communication (4 matched)
    Skill Match Score = (4/5) * 35 = 28

- Format & Structure: 15%
Proper formatting like:
What to check:
1.No tables, no graphics
2.Standard fonts
3.Consistent spacing
4.Readable bullet points
5.No color overload

- Content Depth & Accuracy: 20%
1. Do they match JD expectations? (e.g., resume shows "Managed a team of 4 engineers" while JD requires team leadership)
2. Does the resume avoid vague/empty buzzwords?

- Section Completeness: 15%
Mandatory sections:
1. Header (Name + Contact)
2. Summary/Objective
3. Skills
4. Work Experience
5. Education

- Style & Professionalism: 15%
What to check:
1.Consistent formatting (dates, font sizes)
2. Use of professional language
3.Spelling/grammar
4. Proper alignment & margin
5. Consistent bullet format
            
            Return your analysis in this EXACT JSON format:
            {json_structure}

            Job Description:
            {jd_text}

            Resume Text:
            {resume_text[:15000]}"""
        elif jd_text:
            prompt = f"""You are an expert Resume Screener. Analyze the following resume *strictly* against the provided Job Description.

            Provide a DETAILED, NUANCED evaluation with scores that reflect the resume's actual quality and alignment with the JD. Avoid inflated or generic scoring. Prioritize honest, content-based feedback.
            
            **Evaluation Guidelines:**
            1. Be extremely critical. Reward strong JD alignment, penalize poor matches.
            2. Scores must vary significantly based on actual content and relevance to the JD like(skill,experience,and other criteria).
            3. Deduct for generic wording, missing skills, lack of measurable achievements, or weak structure.
            4. Reward specific, quantifiable accomplishments and relevant experience, similar skills towards JD.
            5. Consider industry standards and resume professionalism.
            
            **Scoring Breakdown:**
- Tailoring to JD:Hard skill and Soft skill (35%)
  Skill Match Score = (Matched Skills / Total Skills in JD) * 35
  Example:
    JD Skills: Java, Spring, Docker, Leadership, Communication (5 total)
    Resume Skills Found: Java, Spring, Leadership, Communication (4 matched)
    Skill Match Score = (4/5) * 35 = 28

- Format & Structure: 15%
Proper formatting like:
What to check:
1.No tables, no graphics
2.Standard fonts
3.Consistent spacing
4.Readable bullet points
5.No color overload

- Content Depth & Accuracy: 20%
1. Do they match JD expectations? (e.g., resume shows "Managed a team of 4 engineers" while JD requires team leadership)
2. Does the resume avoid vague/empty buzzwords?

- Section Completeness: 15%
Mandatory sections:
1. Header (Name + Contact)
2. Summary/Objective
3. Skills
4. Work Experience
5. Education

- Style & Professionalism: 15%
What to check:
1.Consistent formatting (dates, font sizes)
2. Use of professional language
3.Spelling/grammar
4. Proper alignment & margin
5. Consistent bullet format
            
            Return your analysis in this EXACT JSON format:
            {json_structure}

            Job Description:
            {jd_text}

            Resume Text:
            {resume_text[:15000]}"""
        else:
            return jsonify({"error": "Job description is required for analysis"}), 400
        
        try:
            # --- FIX: THIS IS YOUR TRY/EXCEPT BLOCK, NOW CORRECTLY INDENTED ---
            response = client.chat.completions.create(model="gpt-3.5-turbo", messages=[{"role": "user", "content": prompt}], temperature=0.3)
            result_dict = extract_json_from_response(response.choices[0].message.content)
            result_dict = normalize_scores(result_dict)
            result_dict['overall_score'] = calculate_overall_score(result_dict)
            new_score = result_dict['overall_score']
            
            resume_file.seek(0)
            filename = secure_filename(resume_file.filename)
            file_id = f"{uuid.uuid4()}{os.path.splitext(filename)[1]}"
            resume_file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], file_id))

            # --- Final DB Save Logic ---
            update_operation = {
                '$set': {
                    "resume_hash": current_resume_hash,
                    "jd_hash": jd_hash,
                    "latest_score": new_score,
                    "latest_analysis": result_dict,
                    "file_id": file_id
                },
                '$push': { "score_history": new_score }
            }
            
            # This is the "inheritance" logic.
            # We use $setOnInsert to guarantee it's only set when creating, not updating.
            initial_score_to_set = old_score_from_form if old_score_from_form is not None else new_score
            update_operation['$setOnInsert'] = {'initial_score': initial_score_to_set}
            
            analyses_collection.update_one(
                {"resume_hash": current_resume_hash, "jd_hash": jd_hash},
                update_operation,
                upsert=True
            )

            result_dict['parsed_resume_text'] = resume_text
            result_dict['file_id'] = file_id 
            return jsonify(result_dict)
        except Exception as e:
            return jsonify({"error": f"AI analysis failed: {str(e)}"}), 500




@analysis_bp.route("/get_keyword_gaps", methods=["POST"])
def get_keyword_gaps():
    """Identify missing and matched keywords between resume and JD"""
    data = request.get_json()
    jd_text = data.get('jd_text')
    resume_text = data.get('resume_text')
    
    if not jd_text or not resume_text:
        return jsonify({"error": "JD and Resume text required."}), 400

    prompt = f"""
Analyze this resume against the Job Description with EXTREME precision and ATS relevance.
    Identify the most critical missing and matched keywords and gaps that directly impact ATS scoring.

    Keyword Selection Guidelines:
    1. Prioritize hard skills over soft skills
    2. Include specific technologies/tools
    3. Clearly identify missing qualifications,skills,enxperience or requirements from the JD that does not present in resume.
    4. Highlight present qualifications and keywords that perfectly align with the JD

    Return a detailed JSON analysis with:
    - missing_keywords: array of 5-10 critical missing terms
    - present_keywords: array of 5-10 perfectly matched terms that common in both resume and JD
    - missing_qualifications: array of missing requirements
    - matched_qualifications: array of matched requirements that common in both resume and JD

    Example Output:
    {{
      "missing_keywords": ["Python", "AWS", "Project Management", "leadership", "Time management"],
      "present_keywords": ["Java", "SQL", "Team Leadership"],
      "missing_qualifications": ["1+ to 5+ years experience", "Cloud certification", "Business analytics"],
      "matched_qualifications": ["Bachelor's Degree", "Agile experience"]
    }}

    Job Description:
    {jd_text}
    
    Resume Text:
    {resume_text}
    """
    
    try:
        response = client.chat.completions.create(
            # model="gpt-4",
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )
        response_text = response.choices[0].message.content
        result_dict = extract_json_from_response(response_text)
        return jsonify(result_dict)
    except Exception as e:
        return jsonify({"error": f"Keyword analysis failed: {str(e)}"}), 500
    
    
    

@analysis_bp.route("/generate_questions", methods=["POST"])
def generate_questions_route():
    """Generate questions to fill resume gaps"""
    data = request.get_json()
    jd_text = data.get('jd_text')
    resume_text = data.get('resume_text')
    
    if not jd_text or not resume_text:
        return jsonify({"error": "JD and Resume text required."}), 400
        
    prompt = f"""
Based on the resume and JD, find the most critical gaps. Generate 5-10 direct questions to fix them.
    Each question should be specific and designed to extract information that would help improve the resume.
    
    Return your response in JSON format with a single "questions" key containing an array of questions.
    
    Important Guidelines:
    1. Only return valid JSON
    2. Questions should be actionable and specific that helps to improve resume score
    3. Focus on extracting quantifiable achievements and missing important skills and experience 
    4. Prioritize questions that will high impact on  ATS scoring 
    5. After optimization guarantee optimized score should be greater then 10% from old score
    
    Example Output:
    {{
      "questions": [
        "What specific metrics can you provide for your achievements in your last role?",
        "Can you describe any experience with Pytho or ['technology name'] that wasn't mentioned in the resume?",
        "What project management methodologies are you familiar with?",
        "What certifications do you have that weren't listed?",
        "Can you quantify your impact in your previous roles with specific numbers?"
      ]
    }}
    
    Job Description:
    {jd_text}
    
    Resume Text:
    {resume_text}
    """
    
    try:
        response = client.chat.completions.create(
            # model="gpt-4",
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2
        )
        response_text = response.choices[0].message.content
        result_dict = extract_json_from_response(response_text)
        return jsonify(result_dict)
    except Exception as e:
        return jsonify({"error": f"Failed to generate questions: {str(e)}"}), 500


@analysis_bp.route('/generate_feedback_from_jd', methods=['POST'])
def generate_feedback_from_jd():
    try:
        data = request.get_json()
        jd = data.get('jd')
        resume_text = data.get('resume_text')

        if not jd or not resume_text:
            return jsonify({"error": "JD or resume text missing"}), 400

        prompt = f"""You are an expert Career Coach and ATS (Applicant Tracking System) evaluator.

Your task is to compare a *Job Description (JD)* and a *Resume*. Based on this comparison, analyze and return insights that help the candidate improve alignment for better hiring outcomes. 

Generate and return your response strictly in the following JSON format:

{{
  "ats_score": number (0-100),
  "feedback": "string",
  "strengths": ["string", "string", ...],
  "weaknesses": ["string", "string", ...],
  "matching_skills": ["string", "string", ...],
  "missing_skills": ["string", "string", ...],
  "improvement_tips": ["string", "string", ...],
  "questions": ["string", "string", "string", ...]
}}

JD:
\"\"\"{jd}\"\"\"

Resume:
\"\"\"{resume_text}\"\"\"

Respond only in valid JSON format.
"""

        response = client.chat.completions.create(
            # model="gpt-4o",
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=1000
        )

        # Get raw response from GPT
        result = response.choices[0].message.content.strip()

        # Remove markdown formatting (e.g., ```json ... ```)
        if result.startswith("```"):
            result = result.strip("`").strip()
            if result.lower().startswith("json"):
                result = result[4:].strip()

        # Attempt to parse as JSON
        try:
            parsed_result = json.loads(result)
        except json.JSONDecodeError:
            # Fallback using ast.literal_eval if GPT returns Python-style dict
            parsed_result = ast.literal_eval(result)

        # Normalize questions if it's a string
        questions = parsed_result.get("questions", [])
        if isinstance(questions, str):
            questions = [q.strip() for q in re.split(r'[\n\-•]', questions) if q.strip()]

        return jsonify({
            "ats_score": parsed_result.get("ats_score", 0),
            "feedback": parsed_result.get("feedback", "No feedback generated."),
            "strengths": parsed_result.get("strengths", []),
            "weaknesses": parsed_result.get("weaknesses", []),
            "matching_skills": parsed_result.get("matching_skills", []),
            "missing_skills": parsed_result.get("missing_skills", []),
            "improvement_tips": parsed_result.get("improvement_tips", []),
            "questions": questions
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500