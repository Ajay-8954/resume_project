from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from flask import current_app
from app.utils.ai_helpers import client
import json
import re
import ast


from app.utils.file_utils import extract_text, extract_json_from_response
from app.utils.scoring import normalize_scores, calculate_overall_score
from app.utils.ai_helpers import client
import os
import uuid

analysis_bp = Blueprint('analysis', __name__)

@analysis_bp.route("/analyze_resume", methods=["POST"])
def analyze_resume_route():
    """Analyze resume with or without job description"""
    if 'resume_file' not in request.files:
        return jsonify({"error": "Resume file is required."}), 400
        
    resume_file = request.files['resume_file']
    jd_text = request.form.get('jd_text', None)
    resume_text = extract_text(resume_file)
    
    if not resume_text or "Error:" in resume_text:
        return jsonify({"error": f"Could not extract text: {resume_text}"}), 400
        
    # Save original file for later optimization
    resume_file.seek(0)
    filename = secure_filename(resume_file.filename)
    file_id = f"{uuid.uuid4()}{os.path.splitext(filename)[1]}"
    resume_file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], file_id))

    
    # Define expected JSON structure
    json_structure = """{
      "overall_score": <number>, 
      "summary": "<string>",
      "analysis_breakdown": {
        "tailoring": {
          "score": <number>, 
          "feedback": "<string>", 
          "details": [
            {"criterion": "Hard Skills Match", "passed": <boolean>, "comment": "<string>"}, 
            {"criterion": "Soft Skills Match", "passed": <boolean>, "comment": "<string>"}
          ]
        },
        "format": {
          "score": <number>, 
          "feedback": "<string>", 
          "details": [
            {"criterion": "File Format & Size", "passed": <boolean>, "comment": "<string>"},
            {"criterion": "Resume Length", "passed": <boolean>, "comment": "<string>"},
            {"criterion": "Concise Bullet Points", "passed": <boolean>, "comment": "<string>"}
          ]
        },
        "content": {
          "score": <number>, 
          "feedback": "<string>", 
          "details": [
            {"criterion": "ATS Parse Rate", "passed": <boolean>, "comment": "<string>"},
            {"criterion": "Quantified Impact", "passed": <boolean>, "comment": "<string>"},
            {"criterion": "Language Repetition", "passed": <boolean>, "comment": "<string>"},
            {"criterion": "Spelling & Grammar", "passed": <boolean>, "comment": "<string>"}
          ]
        },
        "sections": {
          "score": <number>, 
          "feedback": "<string>", 
          "details": [
            {"criterion": "Contact Information", "passed": <boolean>, "comment": "<string>"},
            {"criterion": "Essential Sections", "passed": <boolean>, "comment": "<string>"},
            {"criterion": "Personality Statement", "passed": <boolean>, "comment": "<string>"}
          ]
        },
        "style": {
          "score": <number>, 
          "feedback": "<string>", 
          "details": [
            {"criterion": "Design Consistency", "passed": <boolean>, "comment": "<string>"},
            {"criterion": "Professional Email", "passed": <boolean>, "comment": "<string>"},
            {"criterion": "Active Voice", "passed": <boolean>, "comment": "<string>"},
            {"criterion": "Avoids Buzzwords & Clichés", "passed": <boolean>, "comment": "<string>"}
          ]
        }
      }
    }"""

    if jd_text:
        prompt = f"""You are a hyper-critical AI Resume Screener. Analyze the following resume *strictly* against the provided Job Description.

Provide a DETAILED, NUANCED evaluation with scores that reflect the resume's actual quality and alignment with the JD. Avoid inflated or generic scoring. Prioritize honest, content-based feedback.

**Evaluation Guidelines:**
1. Be extremely critical. Most resumes should initially score between 40–70. Reward strong JD alignment; penalize poor matches.
2. If resume match with jd 20% then score between 50-55 else if resume  match with JD 50% then score between 55-60 else if match 80-100% then score between 60-70 else not match then score between 45-50 only.
3. Scores must vary significantly based on actual content and relevance to the JD.
4. Deduct for generic wording, missing skills, lack of measurable achievements, or weak structure.
5. Reward specific, quantifiable accomplishments and relevant experience.
6. Consider industry standards and resume professionalism.

**Scoring Breakdown:**
- Tailoring to JD: 35%
- Format & Structure: 15%
- Content Depth & Accuracy: 20%
- Section Completeness: 15%
- Style & Professionalism: 15%

        Return your analysis in this EXACT JSON format:
        {json_structure}

        Job Description:
        {jd_text}

        Resume Text:
        {resume_text[:15000]}"""
    else:
        prompt = f"""You are an expert Resume Analyst. Critically assess the standalone quality of this resume without comparing it to any specific job description.

Be objective, thorough, and honest. Highlight both strengths and weaknesses, and assign scores that reflect true content quality and presentation.

**Evaluation Criteria:**
1. Format & Structure (professional layout, consistency)
2. Content Quality (specificity, clarity, achievements)
3. Section Coverage (contact info, summary, skills, experience, education)
4. Readability & Tone (language, style, grammar)
5. Avoidance of Common Mistakes (generic phrases, vague wording, lack of metrics)
6. If resume match with jd 20% then score between 50-55 else if resume  match with JD 50% then score between 55-60 else if match 80-100% then score between 60-70 else not match then score between 45-50 only.

Most resumes should score between 50-80 initially. Only truly exceptional resumes should score above 85.

        Return your analysis in this EXACT JSON format:
        {json_structure}

        Resume Text:
        {resume_text[:15000]}"""
    
    try:
        temperature = 0.7 if jd_text else 0.5
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=temperature
        )
        
        response_text = response.choices[0].message.content
        result_dict = extract_json_from_response(response_text)
        result_dict = normalize_scores(result_dict)
        
        # Calculate weighted overall score
        result_dict['overall_score'] = calculate_overall_score(result_dict)
        
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
    3. Clearly identify missing qualifications or requirements from the JD
    4. Highlight present qualifications and keywords that perfectly align with the JD

    Return a detailed JSON analysis with:
    - missing_keywords: array of 5-10 critical missing terms
    - present_keywords: array of 5-10 perfectly matched terms
    - missing_qualifications: array of missing requirements
    - matched_qualifications: array of matched requirements

    Example Output:
    {{
      "missing_keywords": ["Python", "AWS", "Project Management","leadership",Time management],
      "present_keywords": ["Java", "SQL", "Team Leadership"],
      "missing_qualifications": ["1+ to 5+ years experience", "Cloud certification",Business analytics],
      "matched_qualifications": ["Bachelor's Degree", "Agile experience"]
    }}

    Job Description:
    {jd_text}
    
    Resume Text:
    {resume_text}
    """
    
    try:
        response = client.chat.completions.create(
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
Based on the resume and JD, find the most critical gaps. Generate 5-7 direct questions to fix them.
    Each question should be specific and designed to extract information that would help improve the resume.
    
    Return your response in JSON format with a single "questions" key containing an array of questions.
    
    Important Guidelines:
    1. Only return valid JSON
    2. Questions should be actionable and specific
    3. Focus on extracting quantifiable achievements and missing skills
    4. Prioritize questions that will impact ATS scoring
    
    Example Output:
    {{
      "questions": [
        "What specific metrics can you provide for your achievements in your last role?",
        "Can you describe any experience with Python that wasn't mentioned in the resume?",
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
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5
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
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
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