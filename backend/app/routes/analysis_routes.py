from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from flask import current_app
from app.utils.ai_helpers import client
import json
import re
import ast
import hashlib
import os
import uuid
import requests

from app.utils.file_utils import extract_text, extract_json_from_response
from app.utils.scoring import calculate_overall_score


OLLAMA_BASE_URL= os.getenv("OLLAMA_BASE_URL")

analysis_bp = Blueprint('analysis', __name__)


def normalize_text(text):
    if not text:
        return ""
    # Improved normalization for better keyword matching
    text = text.lower().strip()
    # Remove extra whitespace and normalize punctuation
    text = re.sub(r'[^\w\s+#.-]', ' ', text)
    text = ' '.join(text.split())
    return text

def extract_keywords_from_text(text):
    """Extract meaningful keywords from text for better matching"""
    if not text:
        return set()
    
    # Normalize text
    normalized = normalize_text(text)
    
    # Split into words and phrases
    words = normalized.split()
    keywords = set()
    
    # Add individual words (filter out common words)
    common_words = {'and', 'or', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'}
    for word in words:
        if len(word) > 2 and word not in common_words:
            keywords.add(word)
    
    # Add bigrams for compound skills
    for i in range(len(words) - 1):
        if words[i] not in common_words and words[i+1] not in common_words:
            bigram = f"{words[i]} {words[i+1]}"
            keywords.add(bigram)
    
    return keywords

# A helper function to hash file content
def hash_file(file_storage):
    hasher = hashlib.sha256()
    file_storage.seek(0)
    buf = file_storage.read(65536)
    while len(buf) > 0:
        hasher.update(buf)
        buf = file_storage.read(65536)
    file_storage.seek(0)
    return hasher.hexdigest()

# A helper function to hash text
def hash_text(text):
    return hashlib.sha256(text.encode('utf-8')).hexdigest()


@analysis_bp.route("/analyze_resume", methods=["POST"])
def analyze_resume_route():
    """Analyze resume with or without job description"""
    if 'resume_file' not in request.files:
        return jsonify({"error": "Resume file is required."}), 400
        
    resume_file = request.files['resume_file']
    jd_text = request.form.get('jd_text', '')
    
    old_score_from_form = request.form.get('old_score', type=int)

    db = current_app.db
    analyses_collection = db.analyses
    
    current_resume_hash = hash_file(resume_file)
    normalized_jd = normalize_text(jd_text)
    jd_hash = hash_text(normalized_jd)
    
    existing_record = analyses_collection.find_one({
        "resume_hash": current_resume_hash, 
        "jd_hash": jd_hash
    })

    if existing_record:
        analysis_to_return = existing_record['latest_analysis'].copy()
        analysis_to_return['parsed_resume_text'] = extract_text(resume_file)
        analysis_to_return['file_id'] = existing_record.get('file_id') 
        return jsonify(analysis_to_return)

    else:
        json_structure = """{"overall_score": 0, "summary": "<string>", "analysis_breakdown": {"tailoring": { "score": <number>, "feedback": "<string>", "details": [{"criterion": "Hard Skills Match", "passed": <boolean>, "comment": "<string>"}, {"criterion": "Soft Skills Match", "passed": <boolean>, "comment": "<string>"}] }, "format": { "score": <number>, "feedback": "<string>", "details": [{"criterion": "File Format & Size", "passed": <boolean>, "comment": "<string>"}, {"criterion": "Resume Length", "passed": <boolean>, "comment": "<string>"}, 
        {"criterion": "Concise Bullet Points", "passed": <boolean>, "comment": "<string>"}] }, "content": { "score": <number>, "feedback": "<string>", "details": [{"criterion": "ATS Parse Rate", "passed": <boolean>, "comment": "<string>"}, {"criterion": "Quantified Impact", "passed": <boolean>, "comment": "<string>"}, {"criterion": "Language Repetition", "passed": <boolean>, "comment": "<string>"}, {"criterion": "Spelling & Grammar", "passed": <boolean>, "comment": "<string>"}] }, "sections": { "score": <number>, "feedback": "<string>",
          "details": [{"criterion": "Contact Information", "passed": <boolean>, "comment": "<string>"}, {"criterion": "Essential Sections", "passed": <boolean>, "comment": "<string>"}, {"criterion": "Personality Statement", "passed": <boolean>, "comment": "<string>"}, {"criterion": "EXPERIENCE", "passed": <boolean>, "comment": "<string>"}] }, "style": { "score": <number>, "feedback": "<string>", "details": [{"criterion": "Design Consistency", "passed": <boolean>, "comment": "<string>"}, {"criterion": "Professional Email", "passed": <boolean>, "comment": "<string>"}, 
          {"criterion": "Active Voice", "passed": <boolean>, "comment": "<string>"}, {"criterion": "Avoids Buzzwords & Clichés", "passed": <boolean>, "comment": "<string>"}] }}}"""
        
        resume_text = extract_text(resume_file)
        
        # Improved prompt with better JSON formatting instructions
        base_prompt = f"""
IMPORTANT: You MUST return ONLY valid JSON in the exact format specified below. Do NOT include any additional text, explanations, or analysis outside of the JSON structure.

You are an expert ATS (Applicant Tracking System) Resume Analyzer. You must provide ACCURATE, CONSISTENT analysis that matches exactly with the content you analyze.

CRITICAL REQUIREMENTS:
1. Your scores MUST directly reflect the actual content analysis
2. Your feedback MUST be consistent with the scores you assign
3. Be precise in keyword and skill matching
4. Analyze the complete resume content, not just sections
5. You MUST return ONLY valid JSON, no additional text before or after

ANALYSIS FRAMEWORK:

**PART 1: JD-DEPENDENT ANALYSIS (Primary Focus)**

1. **Tailoring Score (35% weight)** - MOST CRITICAL:
   - Extract ALL key requirements from JD: hard skills, software, certifications, experience level, qualifications
   - Count how many of these requirements are ACTUALLY present in the resume
   - Calculate percentage match: (Requirements met / Total requirements) × 100
   - Score Guidelines:
     * 90-100: 90%+ requirements met with strong evidence
     * 70-89: 70-89% requirements met with good evidence  
     * 50-69: 50-69% requirements met with basic evidence
     * 30-49: 30-49% requirements met with weak evidence
     * 0-29: <30% requirements met
   - List SPECIFIC missing requirements in feedback

2. **Content Score (20% weight)**:
   - Evaluate if resume content provides RELEVANT evidence for JD requirements
   - Check for quantified achievements related to the role
   - Score based on relevance and depth of experience shown

**PART 2: UNIVERSAL RESUME QUALITY (Secondary Focus)**

3. **Format Score (15% weight)**:
   - ATS compatibility: single column, standard fonts, clear sections
   - Professional layout without graphics/tables that break ATS parsing

4. **Sections Score (15% weight)**:
   - Must have: Contact info, Professional summary/objective, Work experience, Skills, Education
   - Bonus: Relevant certifications, projects, achievements

5. **Style Score (15% weight)**:
   - Professional language, active voice, no grammatical errors
   - Consistent formatting and appropriate length

SCORING ACCURACY RULES:
- Each score MUST reflect actual analysis findings
- Feedback MUST explain why each score was assigned
- Be honest about gaps - don't inflate scores
- Ensure overall score calculation matches category scores

Return analysis in this exact JSON format and NOTHING ELSE:
{json_structure}

Job Description:
{jd_text}

Resume Content:
{resume_text[:15000]}

IMPORTANT: Analyze the COMPLETE resume content. Your analysis and scores must be factually accurate and consistent.
"""

        if old_score_from_form is not None:
            prompt = f"""
This is a RE-EVALUATION. Previous score was {old_score_from_form}/100.
Focus on improvements made, especially in tailoring and content alignment.

{base_prompt}
"""
        elif jd_text:
            prompt = base_prompt
        else:
            return jsonify({"error": "Job description is required for analysis"}), 400
        
        try:
            payload = {
                "model_name": "mistral:7b-instruct",
                "prompt": prompt,
                "actual_data": resume_text[:15000],
                "temperature": 0.1,
                "top_p": 0.9,
                "max_tokens": 5000,
                "top_k": 40,
                "repeat_penalty": 1.1,
                "num_ctx": 5000,
                "stop": ["\n\n", "Human:", "```", "Here is", "Analysis:"],
                "conversation_history": []
            }
            
            response = requests.post(
                OLLAMA_BASE_URL, 
                json=payload
            )

            if response.status_code != 200:
                current_app.logger.error(f"Ollama API error: {response.status_code} - {response.text}")
                return jsonify({"error": f"Ollama API error: {response.text}"}), 500
                
            result = response.json()
            
            # Check if the response contains the expected structure
            if not result.get("success", False):
                return jsonify({"error": f"Ollama API returned unsuccessful response: {result.get('message', 'Unknown error')}"}), 500
                
            response_text = result.get("response", "")

            # Enhanced JSON extraction with better error handling
            current_app.logger.info(f"Raw AI response: {response_text[:500]}...")  # Log first 500 chars for debugging
            
            # Clean the response text
            cleaned_text = response_text.strip()
            
            # Remove markdown code blocks if present
            if cleaned_text.startswith('```json'):
                cleaned_text = cleaned_text[7:]
            if cleaned_text.startswith('```'):
                cleaned_text = cleaned_text[3:]
            if cleaned_text.endswith('```'):
                cleaned_text = cleaned_text[:-3]
            cleaned_text = cleaned_text.strip()
            
            # Try to parse the JSON
            try:
                result_dict = json.loads(cleaned_text)
            except json.JSONDecodeError as e:
                current_app.logger.error(f"JSON parsing failed. Cleaned response: {cleaned_text[:500]}")
                current_app.logger.error(f"JSON decode error: {str(e)}")
                
                # Fallback: Try to find JSON object in the text
                json_match = re.search(r'\{.*\}', cleaned_text, re.DOTALL)
                if json_match:
                    try:
                        result_dict = json.loads(json_match.group())
                        current_app.logger.info("Successfully extracted JSON using regex fallback")
                    except json.JSONDecodeError:
                        # If JSON parsing still fails, return a more helpful error
                        return jsonify({
                            "error": "AI returned invalid JSON format", 
                            "raw_response_preview": cleaned_text[:200] + "...",
                            "hint": "The AI might be analyzing the resume content instead of returning JSON. Check your prompt formatting."
                        }), 500
                else:
                    # If no JSON found, the AI is probably returning resume analysis instead of JSON
                    return jsonify({
                        "error": "AI returned resume analysis instead of JSON format", 
                        "raw_response_preview": cleaned_text[:200] + "...",
                        "hint": "The prompt may need stronger instructions to return only JSON."
                    }), 500

            # Validate the structure
            if not isinstance(result_dict, dict) or 'analysis_breakdown' not in result_dict:
                current_app.logger.error(f"Invalid JSON structure: {result_dict}")
                return jsonify({"error": "AI returned incomplete analysis structure"}), 500

            # Calculate overall score from category scores with proper weighting
            result_dict['overall_score'] = calculate_overall_score(result_dict)
            new_score = result_dict['overall_score']
            
            resume_file.seek(0)
            filename = secure_filename(resume_file.filename)
            file_id = f"{uuid.uuid4()}{os.path.splitext(filename)[1]}"
            resume_file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], file_id))

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
            
        except requests.exceptions.Timeout:
            return jsonify({"error": "Ollama API request timed out"}), 500
        except requests.exceptions.RequestException as e:
            current_app.logger.error(f"Ollama API connection error: {str(e)}")
            return jsonify({"error": f"Connection error: {str(e)}"}), 500
        except Exception as e:
            current_app.logger.error(f"AI analysis failed: {str(e)}", exc_info=True)
            return jsonify({"error": f"AI analysis failed: {str(e)}"}), 500


@analysis_bp.route("/get_keyword_gaps", methods=["POST"])
def get_keyword_gaps():
    """Identify missing and matched keywords between resume and JD with improved accuracy"""
    data = request.get_json()
    jd_text = data.get('jd_text')
    resume_text = data.get('resume_text')
    
    if not jd_text or not resume_text:
        return jsonify({"error": "JD and Resume text required."}), 400

    # Pre-process texts for better matching
    resume_keywords = extract_keywords_from_text(resume_text)
    jd_keywords = extract_keywords_from_text(jd_text)

    prompt = f"""
You are an expert ATS keyword analyzer. Perform ACCURATE keyword matching between the resume and job description.

ANALYSIS RULES:
1. Use EXACT matching - if a skill/keyword appears in both texts, it's MATCHED
2. Consider variations (e.g., "JavaScript" and "JS", "Machine Learning" and "ML")
3. Prioritize technical skills, tools, certifications, and specific qualifications
4. Do NOT list a keyword as missing if it exists in the resume (even in different form)

STEP-BY-STEP PROCESS:
1. Extract all important keywords from JD
2. Check each keyword against the resume content
3. Classify as PRESENT (found in resume) or MISSING (not found in resume)
4. Extract matching qualifications and missing requirements

Be extremely accurate - your analysis directly impacts ATS scoring.

Return ONLY valid JSON in this format:
{{
  "missing_keywords": ["keyword1", "keyword2", ...],
  "present_keywords": ["keyword1", "keyword2", ...],
  "missing_qualifications": ["qualification1", "qualification2", ...],
  "matched_qualifications": ["qualification1", "qualification2", ...]
}}

Job Description:
{jd_text}

Resume Text:
{resume_text}

CRITICAL: Double-check your matching. If a skill appears in both texts, it MUST be in present_keywords, NOT missing_keywords.
"""
    
    try:
  # Prepare payload with your specified parameters
        payload = {
            "model_name": "mistral:7b-instruct",
            "prompt": prompt,
            "actual_data": f"Job Description:\n{jd_text}\n\nResume Text:\n{resume_text}",
            "temperature": 0.1,
            "top_p": 0.9,
            "max_tokens": 4000,
            "top_k": 40,
            "repeat_penalty": 1.1,
            "num_ctx": 4000,
            "num_thread": 4,
            "stop": ["\n\n", "Human:"],
            "conversation_history": []
        }

        response = requests.post(
            OLLAMA_BASE_URL, 
            json=payload
        )

        if response.status_code != 200:
            current_app.logger.error(f"Ollama API error: {response.status_code} - {response.text}")
            return jsonify({"error": f"Ollama API error: {response.text}"}), 500
            
        result = response.json()
        
        # Check if the response contains the expected structure
        if not result.get("success", False):
            return jsonify({"error": f"Ollama API returned unsuccessful response: {result.get('message', 'Unknown error')}"}), 500
            
        response_text = result.get("response", "")

        # Extract JSON from response
        try:
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            if json_start != -1 and json_end != -1:
                json_str = response_text[json_start:json_end]
                result_dict = json.loads(json_str)
            else:
                result_dict = json.loads(response_text)
        except json.JSONDecodeError as e:
            return jsonify({"error": f"AI returned invalid JSON: {str(e)}"}), 500

        
        # Post-process to ensure accuracy - cross-check with our keyword extraction
        if 'missing_keywords' in result_dict and 'present_keywords' in result_dict:
            # Verify matching using our pre-processed keywords
            verified_missing = []
            verified_present = []
            
            for keyword in result_dict.get('missing_keywords', []):
                keyword_lower = normalize_text(keyword)
                # Check if keyword actually exists in resume
                found_in_resume = any(keyword_lower in resume_kw for resume_kw in resume_keywords)
                if not found_in_resume:
                    verified_missing.append(keyword)
                else:
                    verified_present.append(keyword)
            
            for keyword in result_dict.get('present_keywords', []):
                keyword_lower = normalize_text(keyword)
                found_in_resume = any(keyword_lower in resume_kw for resume_kw in resume_keywords)
                if found_in_resume and keyword not in verified_present:
                    verified_present.append(keyword)
            
            result_dict['missing_keywords'] = verified_missing
            result_dict['present_keywords'] = verified_present
        
        return jsonify(result_dict)
    except requests.exceptions.Timeout:
        return jsonify({"error": "Ollama API request timed out"}), 500
    except requests.exceptions.RequestException as e:
        current_app.logger.error(f"Ollama API connection error: {str(e)}")
        return jsonify({"error": f"Connection error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Keyword analysis failed: {str(e)}"}), 500

@analysis_bp.route("/generate_questions", methods=["POST"])
def generate_questions_route():
    """Generate targeted questions to fill resume gaps"""
    data = request.get_json()
    jd_text = data.get('jd_text')
    resume_text = data.get('resume_text')
    
    if not jd_text or not resume_text:
        return jsonify({"error": "JD and Resume text required."}), 400
        
    prompt = f"""
Analyze the gaps between this resume and job description. Generate 5-8 strategic questions that will help extract information to significantly improve the ATS score.

QUESTION CRITERIA:
1. Target the BIGGEST gaps first (missing skills, experience, qualifications)
2. Focus on quantifiable achievements and metrics
3. Address missing technical skills or certifications
4. Help uncover relevant experience that may not be clearly stated
5. Questions should lead to score improvement of 10+ points

QUESTION TYPES TO INCLUDE:
- Quantification questions (metrics, numbers, results)
- Missing skill verification questions
- Experience depth questions
- Certification/qualification questions
- Achievement highlighting questions

Return ONLY valid JSON:
{{
  "questions": [
  {{
      "question": "What specific metrics or numbers can you provide for your achievements in [relevant area]?",
      "example": "Increased sales by 25% in Q3 2023, reducing customer churn by 15%"
    }},
    {{
      "question": "Do you have experience with [missing skill] that wasn't mentioned in your resume?",
      "example": "3 years experience with Python data analysis using Pandas and NumPy"
    }},
    "...
  ]
}}

Job Description:
{jd_text}

Resume Text:
{resume_text}
"""
    try:
        payload = {
            "model_name": "mistral:7b-instruct",
            "prompt": prompt,
            "actual_data": f"Job Description:\n{jd_text}\n\nResume Text:\n{resume_text}",
            "temperature": 0.2,
            "top_p": 0.9,
            "max_tokens": 5000,
            "top_k": 40,
            "repeat_penalty": 1.1,
            "num_ctx": 3500,
            "num_thread": 4,
            "stop": ["\n\n", "Human:"],
            "conversation_history": []
        }

        response = requests.post(
            OLLAMA_BASE_URL, 
            json=payload
        )

        if response.status_code != 200:
            return jsonify({"error": f"Ollama API error: {response.text}"}), 500
            
        result = response.json()
        
        # Check if the response contains the expected structure
        if not result.get("success", False):
            return jsonify({"error": f"Ollama API returned unsuccessful response: {result.get('message', 'Unknown error')}"}), 500
            
        response_text = result.get("response", "")

        # Extract JSON from response
        try:
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            if json_start != -1 and json_end != -1:
                json_str = response_text[json_start:json_end]
                result_dict = json.loads(json_str)
            else:
                result_dict = json.loads(response_text)
        except json.JSONDecodeError as e:
            return jsonify({"error": f"AI returned invalid JSON: {str(e)}"}), 500

        return jsonify(result_dict)
    except requests.exceptions.Timeout:
        return jsonify({"error": "Ollama API request timed out"}), 500
    except requests.exceptions.RequestException as e:
        current_app.logger.error(f"Ollama API connection error: {str(e)}")
        return jsonify({"error": f"Connection error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Failed to generate questions: {str(e)}"}), 500

@analysis_bp.route("/extract-text", methods=["POST"])
def extract_text_route():
    """Extract structured resume data from pasted text"""
    data = request.get_json()
    pasted_text = data.get('text')
    
    if not pasted_text:
        return jsonify({"error": "Pasted text is required."}), 400

    json_structure = """{
        "Name": "<string>",
        "jobTitle": "<string>",
        "email": "<string>",
        "phone": "<string>",
        "location": "<string>",
        "linkedin": "<string>",
        "github": "<string>",
        "summary": "<string>",
        "objective": "<string>",
        "experience": [
            {
                "jobTitle": "<string>",
                "company": "<string>",
                "startDate": "<string>",
                "endDate": "<string>",
                "location": "<string>",
                "description": ["<string>", "<string>"]
            }
        ],
        "internships": [
            {
                "role": "<string>",
                "company": "<string>",
                "startDate": "<string>",
                "endDate": "<string>",
                "location": "<string>",
                "description": ["<string>", "<string>"]
            }
        ],
        "education": [
            {
                "degree": "<string>",
                "school": "<string>",
                "level": "<string>",
                "startDate": "<string>",
                "endDate": "<string>",
                "location": "<string>",
                "cgpa": "<string>"
            }
        ],
        "skills": ["<string>", "<string>"],
        "languages": ["<string>", "<string>"],
        "interests": ["<string>", "<string>"],
        "achievements": [
            {
                "title": "<string>",
                "description": "<string>"
            }
        ],
        "projects": [
            {
                "title": "<string>",
                "startDate": "<string>",
                "endDate": "<string>",
                "tech": "<string>",
                "description": ["<string>", "<string>"]
            }
        ],
        "certifications": [
            {
                "name": "<string>",
                "issuer": "<string>",
                "date": "<string>"
            }
        ]
    }"""
    
    prompt = f"""
IMPORTANT: You MUST return ONLY valid JSON in the exact format specified below. Do NOT include any additional text, explanations, or analysis outside of the JSON structure.

You are an expert Resume Extractor. Extract all relevant information from the provided text and structure it precisely as per the JSON format.

EXTRACTION RULES:
1. Extract information accurately from the text only - do not invent or assume any data
2. For dates: Use format "MMM YYYY" (e.g., "Jan 2023"). Use "Present" for ongoing items
3. For descriptions: Split into an array of bullet points or key phrases
4. For achievements: Description is a single string, not array
5. If a field is not present, use empty string "" for strings, or empty array [] for lists
6. Education level: Infer from degree (e.g., "Undergraduation" for Bachelor's, "High School" for secondary)
7. Skills/languages/interests: List as arrays of strings
8. Experience/Internships/Projects: Use arrays of objects, with descriptions as arrays

Return ONLY the JSON object matching this exact structure:
{json_structure}

Pasted Profile Text:
{pasted_text}
"""
    
    try:
        payload = {
            "model_name": "mistral:7b-instruct",
            "prompt": prompt,
            "actual_data": pasted_text,
            "temperature": 0.1,
            "top_p": 0.9,
            "max_tokens": 5000,
            "top_k": 40,
            "repeat_penalty": 1.1,
            "num_ctx": 5000,
            "stop": ["\n\n", "Human:", "```"],
            "conversation_history": []
        }
        
        response = requests.post(
            OLLAMA_BASE_URL, 
            json=payload
        )

        if response.status_code != 200:
            current_app.logger.error(f"Ollama API error: {response.status_code} - {response.text}")
            return jsonify({"error": f"Ollama API error: {response.text}"}), 500
            
        result = response.json()
        
        if not result.get("success", False):
            return jsonify({"error": f"Ollama API returned unsuccessful response: {result.get('message', 'Unknown error')}"}), 500
            
        response_text = result.get("response", "").strip()
        
        # Clean and extract JSON
        # Clean and extract JSON
        if response_text.startswith('```json'):
           response_text = response_text[7:]
        if response_text.startswith('```'):
           response_text = response_text[3:]
        if response_text.endswith('```'):
         response_text = response_text[:-3]
        response_text = response_text.strip()
        
        try:
            result_dict = json.loads(response_text)
        except json.JSONDecodeError as e:
            current_app.logger.error(f"JSON parsing failed. Cleaned response: {response_text[:500]}")
            current_app.logger.error(f"JSON decode error: {str(e)}")
            
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                try:
                    result_dict = json.loads(json_match.group())
                except json.JSONDecodeError:
                    return jsonify({
                        "error": "AI returned invalid JSON format", 
                        "raw_response": response_text[:200] + "..."
                    }), 500
            else:
                return jsonify({
                    "error": "AI returned non-JSON response", 
                    "raw_response": response_text[:200] + "..."
                }), 500

        return jsonify(result_dict)
        
    except requests.exceptions.Timeout:
        return jsonify({"error": "Ollama API request timed out"}), 500
    except requests.exceptions.RequestException as e:
        current_app.logger.error(f"Ollama API connection error: {str(e)}")
        return jsonify({"error": f"Connection error: {str(e)}"}), 500
    except Exception as e:
        current_app.logger.error(f"Extraction failed: {str(e)}", exc_info=True)
        return jsonify({"error": f"Extraction failed: {str(e)}"}), 500