import os
import uuid
import re
import requests
import json
import csv
import threading
from flask import Blueprint, Flask, request, jsonify, current_app, send_file
from flask_cors import CORS
from PyPDF2 import PdfReader
import docx
from pymongo import MongoClient
from datetime import datetime
from io import StringIO
import logging 
import time
from app import client

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

uploaded_resumes_dir = 'uploaded_resumes'
os.makedirs(uploaded_resumes_dir, exist_ok=True)

# Use the global client to get the database
db = client.get_database()

jd_collection = db['jobDescriptions']
resumes_collection = db['resumeUploads']

OLLAMA_BASE_URL= os.getenv("OLLAMA_BASE_URL")

filter_bp = Blueprint('filter', __name__)


# --------- Enhanced Domain Mapping System ---------
DOMAIN_SYNONYMS = {
    # Computer Science
    "B.Tech CSE": [
        "B.Tech Computer Science", "B.Tech Computer Science Engineering", "B.Tech CSE",
        "B.E. Computer Science", "B.E. CSE", "B.E. Computer Science Engineering",
        "Bachelor of Technology in Computer Science", "Bachelor of Engineering in Computer Science",
        "B.Tech in Computer Science", "B.E. in Computer Science", "B.Tech CS", "B.E. CS",
        "Computer Science Engineering", "CSE", "Computer Science", "CS",
        "B.Tech Computer Engineering","B.Tech in Computer Engineering", "B.E. Computer Engineering","B.E. in Computer Engineering", "B.E IT","B.E  in IT", "B.Tech IT","B.Tech in IT", "B.Tech Information Technology","B.Tech in Information Technology" , "B.E Information Technology","B.E  in Information Technology", "B.Tech Information Tech", "B.E Information Tech",
         "Bachelor of Technology in Information Technology", "Bachelor of Engineering in Information Technology", "MCA", "Master of Computer Applications", "M.Sc Computer Science", "M.S. Computer Science",
            "MSc Computer Science", "MCA Computer Science", "MCA IT", "MCA Information Technology", "MCA Information Tech", "bachelor of Computer Applications", "BCA", "BCA Computer Science", "BCA IT", "BCA Information Technology", "BCA Information Tech"
    ],
    "M.Tech CSE": [
        "M.Tech Computer Science", "M.Tech Computer Science Engineering", "M.Tech CSE","M.Tech  in IT", "M.Tech Information Technology","M.Tech in Information Technology", "M.Tech IT",
        "M.E. Computer Science", "M.E. CSE", "M.E. Computer Science Engineering", "M.E. in IT", "M.E. Information Technology","M.E. in Information Technology", "M.E. IT",
        "Master of Technology in Computer Science", "Master of Engineering in Computer Science",
        "M.Tech in Computer Science", "M.E. in Computer Science", "M.Tech CS", "M.E. CS",
        "MS Computer Science", "M.S. Computer Science", "MSc Computer Science"
    ],
    # Mechanical Engineering
    "B.Tech Mechanical": [
        "B.Tech Mechanical Engineering", "B.E. Mechanical", "B.E. Mechanical Engineering",
        "Bachelor of Technology in Mechanical Engineering", "Bachelor of Engineering in Mechanical",
        "Mechanical Engineering", "B.Tech ME", "B.E. ME"
    ],
    "M.Tech Mechanical": [
        "M.Tech Mechanical Engineering", "M.E. Mechanical", "M.E. Mechanical Engineering",
        "Master of Technology in Mechanical Engineering", "Master of Engineering in Mechanical"
    ],
    # Civil Engineering
    "B.Tech Civil": [
        "B.Tech Civil Engineering", "B.E. Civil", "B.E. Civil Engineering",
        "Bachelor of Technology in Civil Engineering", "Bachelor of Engineering in Civil",
        "Civil Engineering", "B.Tech CE", "B.E. CE"
    ],
    "M.Tech Civil": [
        "M.Tech Civil Engineering", "M.E. Civil", "M.E. Civil Engineering",
        "Master of Technology in Civil Engineering", "Master of Engineering in Civil"
    ],
    # Electrical Engineering
    "B.Tech Electrical": [
        "B.Tech Electrical Engineering", "B.E. Electrical", "B.E. Electrical Engineering",
        "Bachelor of Technology in Electrical Engineering", "Bachelor of Engineering in Electrical",
        "Electrical Engineering", "B.Tech EE", "B.E. EE"
    ],
    "M.Tech Electrical": [
        "M.Tech Electrical Engineering", "M.E. Electrical", "M.E. Electrical Engineering",
        "Master of Technology in Electrical Engineering", "Master of Engineering in Electrical"
    ],

     "Bio-tech": [
        # Bachelor's level
        "B.Tech Biotechnology", "B.Tech Bio-technology", "B.Tech Biotech",
        "B.E. Biotechnology", "B.E. Bio-technology", "B.E. Biotech",
        "Bachelor of Technology in Biotechnology", "Bachelor of Engineering in Biotechnology",
        "B.Tech in Biotechnology", "B.E. in Biotechnology",
        "B.Sc Biotechnology", "B.Sc Bio-technology", "B.Sc Biotech",
        "Bachelor of Science in Biotechnology", "B.Sc in Biotechnology",
        "B.Tech Industrial Biotechnology", "B.E. Industrial Biotechnology",
        # Master's level
        "M.Tech Biotechnology", "M.Tech Bio-technology", "M.Tech Biotech",
        "M.E. Biotechnology", "M.E. Bio-technology", "M.E. Biotech", 
        "Master of Technology in Biotechnology", "Master of Engineering in Biotechnology",
        "M.Sc Biotechnology", "M.Sc Bio-technology", "M.Sc Biotech",
        "Master of Science in Biotechnology", "M.Sc in Biotechnology",
        # General terms
        "Biotechnology", "Biotech", "Bio-technology", "Industrial Biotechnology",
        "Genetic Engineering", "Molecular Biology", "Biochemical Engineering",
        "B.Tech Biochemical Engineering", "B.E. Biochemical Engineering"
    ],
    
    # Food Technology - Comprehensive coverage
    "Food-tech": [
        # Bachelor's level
        "B.Tech Food Technology", "B.Tech Food-tech", "B.Tech Food Engineering",
        "B.E. Food Technology", "B.E. Food-tech", "B.E. Food Engineering",
        "Bachelor of Technology in Food Technology", "Bachelor of Engineering in Food Technology",
        "B.Tech in Food Technology", "B.E. in Food Technology",
        "B.Sc Food Technology", "B.Sc Food Science", "B.Sc Food Science and Technology",
        "Bachelor of Science in Food Technology", "B.Sc in Food Technology",
        "B.Tech Food Processing", "B.E. Food Processing",
        # Master's level
        "M.Tech Food Technology", "M.Tech Food-tech", "M.Tech Food Engineering",
        "M.E. Food Technology", "M.E. Food-tech", "M.E. Food Engineering",
        "Master of Technology in Food Technology", "Master of Engineering in Food Technology",
        "M.Sc Food Technology", "M.Sc Food Science", "M.Sc Food Science and Technology",
        "Master of Science in Food Technology", "M.Sc in Food Technology",                                                                   
        # General terms
        "Food Technology", "Food-tech", "Food Engineering", "Food Science",
        "Food Processing", "Food Science and Technology", "Dairy Technology",
        "B.Tech Dairy Technology", "B.Sc Dairy Science"
    ],
    # Bio-informatics
    "B.Tech Bio-informatics": [
        "B.Tech Bioinformatics", "B.Tech Biomedical Informatics", "B.E. Bioinformatics",
        "B.E. Bio-informatics", "Bachelor of Technology in Bioinformatics",
        "Bioinformatics Engineering", "B.Tech BI", "B.E. BI"
    ],
    "M.Tech Bio-informatics": [
        "M.Tech Bioinformatics", "M.Tech Biomedical Informatics", "M.E. Bioinformatics",
        "M.E. Bio-informatics", "Master of Technology in Bioinformatics"
    ],  
    # Other domains
    "MBA": [
        "Master of Business Administration", "MBA Finance", "MBA Marketing", "MBA HR",
        "Post Graduate Diploma in Management", "PGDM", "Executive MBA"
    ],
    "BBA": [
        "Bachelor of Business Administration", "BBA Finance", "BBA Marketing", "BBA HR"
    ],
    "B.COM": [
        "Bachelor of Commerce", "B.Com", "B.Com Finance", "B.Com Accounting"
    ],
    "BA-LLB": [
        "Bachelor of Arts and Bachelor of Laws", "BA LLB", "B.A. LL.B.",
        "Integrated Law Course", "5 Year Law Program"
    ],
    "B-Pharma": [
        "Bachelor of Pharmacy", "B.Pharm", "B Pharm", "Pharmacy"
    ],
    "M-Pharma": [
        "Master of Pharmacy", "M.Pharm", "M Pharm", "Post Graduate in Pharmacy"
    ],
    "Agriculture": [
        "B.Sc Agriculture", "B.Tech Agriculture", "B.E. Agriculture",
        "Bachelor of Science in Agriculture", "Agriculture Science"
    ],
    "Ph.D.": [
        "Doctor of Philosophy", "PhD", "Ph D", "Doctorate"
    ]
}

def normalize_domain(domain_name):
    """Convert any domain name to its standardized form"""
    if not domain_name:
        return None
    
    domain_name = domain_name.strip().lower()
    
    for standard_domain, synonyms in DOMAIN_SYNONYMS.items():
        # Check if the domain matches any synonym
        all_variations = [standard_domain.lower()] + [syn.lower() for syn in synonyms]
        if domain_name in all_variations:
            return standard_domain
    
    # If no exact match, try partial matching
    for standard_domain, synonyms in DOMAIN_SYNONYMS.items():
        all_variations = [standard_domain.lower()] + [syn.lower() for syn in synonyms]
        for variation in all_variations:
            if domain_name in variation or variation in domain_name:
                return standard_domain
    
    return None

def extract_domains_from_text(text):
    """Extract and normalize domains from any text"""
    found_domains = set()
    text_lower = text.lower()
    
    for standard_domain, synonyms in DOMAIN_SYNONYMS.items():
        # Check standard domain
        if standard_domain.lower() in text_lower:
            found_domains.add(standard_domain)
            continue
            
        # Check all synonyms
        for synonym in synonyms:
            if synonym.lower() in text_lower:
                found_domains.add(standard_domain)
                break
    
    return list(found_domains)

# --------- Utility Functions ---------
def extract_text_from_file(file_path):
    """Extracts text from a PDF or DOCX file."""
    text = ""
    file_extension = os.path.splitext(file_path)[1].lower()

    if file_extension == '.pdf':
        try:
            with open(file_path, 'rb') as file:
                reader = PdfReader(file)
                for page in reader.pages:
                    text += page.extract_text() or ""
        except Exception as e:
            print(f"Error reading PDF file {file_path}: {e}")
            return None

    elif file_extension == '.docx':
        try:
            doc = docx.Document(file_path)
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
        except Exception as e:
            print(f"Error reading DOCX file {file_path}: {e}")
            return None

    return text

def safe_json_parse(raw_text: str):
    """Try to safely extract and load JSON from raw model response using markers."""
    try:
        start_marker = "###JSON_START###"
        end_marker = "###JSON_END###"

        if start_marker in raw_text and end_marker in raw_text:
            start_idx = raw_text.find(start_marker) + len(start_marker)
            end_idx = raw_text.find(end_marker, start_idx)
            if end_idx == -1:
                json_str = raw_text[start_idx:].strip()
            else:
                json_str = raw_text[start_idx:end_idx].strip()
        else:
            json_match = re.search(r"\{[\s\S]*\}", raw_text)
            if not json_match:
                return None
            json_str = json_match.group(0).strip()

        # Fix missing values after colon
        json_str = re.sub(r'("[^"]+"):\s*(,|\}|\]|\n)', r'\1: ""\2', json_str)

        # Remove trailing commas
        json_str = re.sub(r",\s*}", "}", json_str)
        json_str = re.sub(r",\s*]", "]", json_str)

        parsed = json.loads(json_str)
        return parsed

    except Exception as e:
        print("❌ Error parsing JSON:", e)
        return None

def normalize_extracted_data(data, info_type):
    """Normalize extracted data, especially education domains"""
    if info_type == "resume" and "education" in data:
        for edu in data["education"]:
            if "domain" in edu and edu["domain"]:
                # Normalize the domain to standard form
                normalized_domain = normalize_domain(edu["domain"])
                if normalized_domain:
                    edu["domain"] = normalized_domain
                else:
                    # If domain can't be normalized, try to extract from the entire education entry
                    education_text = f"{edu.get('degree', '')} {edu.get('domain', '')} {edu.get('institution', '')}"
                    extracted_domains = extract_domains_from_text(education_text)
                    if extracted_domains:
                        edu["domain"] = extracted_domains[0]  # Take the first match
    
    elif info_type == "job description" and "domain" in data:
        normalized_domains = []
        for domain in data["domain"]:
            normalized = normalize_domain(domain)
            if normalized and normalized not in normalized_domains:
                normalized_domains.append(normalized)
        data["domain"] = normalized_domains
    
    return data

def call_ollama_with_retry(payload, max_retries=3):
    """Call Ollama with retries and backoff"""
    for attempt in range(max_retries):
        try:
            response = requests.post(OLLAMA_BASE_URL, json=payload)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logging.error(f"❌ Ollama call failed (attempt {attempt+1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)  # Exponential backoff: 1s, 2s, 4s
            else:
                raise e

def extract_info_with_model(text, info_type):
    """Extract structured info using model server with enhanced domain handling."""
    if info_type == "job description":
        prompt = """
You are an expert HR analyst specialized in extracting structured information from job descriptions. 
Extract the following information accurately and return ONLY valid JSON.

CRITICAL INSTRUCTIONS:
- Return ONLY the raw JSON object, nothing else
- Enclose output between ###JSON_START### and ###JSON_END###
- For "experience", choose: "fresher", "experienced", or "both"
- For "years", extract specific numbers or ranges like "2", "3-5", "5+", "8"
- For "domain", extract ALL relevant educational domains - use ANY educational terms mentioned, we will normalize them later
- For "jobRole", extract the primary job title/role
- For "location", extract city, country, or mention "Remote" if specified

EDUCATIONAL DOMAIN EXTRACTION GUIDELINES:
- Extract ANY educational qualifications mentioned, regardless of exact wording
- Examples: "Computer Science", "CSE", "B.Tech in CS", "B.E. Computer Science", "MCA", "MBA Finance"
- Include ALL domains mentioned, we have a robust normalization system

EXTRACTION GUIDELINES:
- "experience": If JD mentions "fresher", "entry-level", "0-2 years" -> "fresher"
- "experience": If JD mentions "experienced", "senior", "mid-level", "X+ years" -> "experienced"  
- "experience": If both types mentioned or unclear -> "both"
- "years": Extract numbers like "3 years" -> "3", "5-8 years" -> "5-8", "8+ years" -> "8+"
- "domain": Extract ALL educational requirements mentioned
- "jobRole": Extract the main position title like "Software Engineer", "Data Analyst"
- "location": Extract city names, country, or "Remote"/"Hybrid"

Return JSON in this exact format:

###JSON_START###
{
  "experience": "",
  "years": "",
  "domain": [],
  "jobRole": "",
  "location": ""
}
###JSON_END###
"""
    elif info_type == "resume":
        prompt = """
You are an expert resume parser specialized in extracting structured information from resumes.
Extract the following information accurately and return ONLY valid JSON.

CRITICAL INSTRUCTIONS:
- Return ONLY the raw JSON object, nothing else
- Enclose output between ###JSON_START### and ###JSON_END###
- Extract ALL available information, leave fields empty if not found
- For arrays, include ALL items found in the resume
- For education domain, extract the field of study as mentioned - we will normalize it later

EXTRACTION GUIDELINES:

NAME:
- Extract full name from header/contact section
- Look for patterns like "John Doe", "Doe, John"

CONTACT INFO:
- Email: Extract all email addresses
- Phone: Extract all phone numbers in international or local format

SKILLS:
- Extract ALL technical, soft, and professional skills
- Include programming languages, tools, methodologies, certifications
- Look for skills sections, bullet points, project descriptions

EXPERIENCE:
- For each job: extract role/title, company name, and duration
- Duration format: "Jan 2020 - Present", "2020-2022", "2 years"
- Include ALL employment history entries

EDUCATION:
- For each degree: extract degree name, field of study (domain), institution, graduation year
- Extract the domain EXACTLY as mentioned: "Computer Science", "CSE", "CS", "Computer Engineering"
- Include ALL educational qualifications

TOTAL EXPERIENCE:
- Calculate total years of professional experience
- Sum all work experiences or use explicitly mentioned total
- Format: "5 years", "2.5", "8+"

CONCLUSION:
- Write a 2-3 sentence professional summary of the candidate
- Highlight key qualifications, experience level, and main skills
- Be objective and professional

Return JSON in this exact format:

###JSON_START###
{
  "name": "",
  "email": "",
  "phone": [],
  "skills": [],
  "experience": [
    {
      "role": "",
      "company": "",
      "duration": ""
    }
  ],
  "total_experience": "<string>",
  "education": [
    {
      "degree": "",
      "domain": "",
      "institution": "",
      "year": ""
    }
  ],
  "conclusion": ""
}
###JSON_END###
"""
    else:
        return {"error": "Unknown info_type"}

    full_prompt = f"{prompt}\n\n---\n\n{text}"

    payload = {
        "model_name": "mistral:7b-instruct",
        "prompt": full_prompt,
        "actual_data": full_prompt,
        "max_tokens": 50000,
        "num_ctx": 20480
    }

    try:
        # Delay before call
        logging.info(f"Pausing 5s before extract_info_with_model for {info_type}")
        time.sleep(5)
        
        response_data = call_ollama_with_retry(payload)
        raw_text = response_data.get("response", "").strip()
        logging.info(f"Raw Ollama response for extract ({info_type}): {raw_text[:500]}...")  # Log truncated for brevity
        
        parsed_json = safe_json_parse(raw_text)
        
        if parsed_json:
            # Normalize the extracted data
            parsed_json = normalize_extracted_data(parsed_json, info_type)
            return parsed_json

    except Exception as e:
        logging.error(f"❌ Error in extract_info_with_model: {e}")

    # Fallback with normalization
    if info_type == "job description":
        fallback_data = {"experience": "", "years": "", "domain": [], "jobRole": "", "location": ""}
    elif info_type == "resume":
        fallback_data = {"name": "", "email": "", "phone": "", "skills": [], "experience": [], "total_experience": "", "education": [], "conclusion": ""}
    else:
        fallback_data = {}
    
    return normalize_extracted_data(fallback_data, info_type)

def check_domain_match(jd_domains, candidate_domains):
    """Check if candidate's domains match any of JD's required domains"""
    if not jd_domains:
        return True  # No domain requirement specified
    
    if not candidate_domains:
        return False  # Candidate has no domains, JD requires some
    
    # Extract domains from candidate's education
    candidate_standard_domains = set()
    for domain in candidate_domains:
        normalized = normalize_domain(domain)
        if normalized:
            candidate_standard_domains.add(normalized)
    
    # Check if any candidate domain matches any JD domain
    for jd_domain in jd_domains:
        normalized_jd = normalize_domain(jd_domain)
        if normalized_jd in candidate_standard_domains:
            return True
    
    return False

def compare_resume_with_jd(resume_data, jd_data, filters):
    """Use the model to compare resume with JD and calculate score with enhanced domain matching"""
    
    jd_domains = jd_data.get('domain', [])
    candidate_domains = [edu.get('domain', '') for edu in resume_data.get('education', []) if edu.get('domain')]
    
    domain_match = check_domain_match(jd_domains, candidate_domains)
    
    comparison_prompt = f"""
You are an expert HR analyst and recruitment specialist with 15+ years of experience. Your task is to objectively evaluate a candidate's resume against a job description and provide a precise matching score.

IMPORTANT DOMAIN MATCHING INFORMATION:
- JD Required Domains: {jd_domains}
- Candidate's Domains: {candidate_domains}
- Domain Match Status: {'MATCH' if domain_match else 'NO MATCH'}

CRITICAL EVALUATION FRAMEWORK:
- Be STRICT and OBJECTIVE in your assessment
- Score based on ACTUAL MATCH, not potential
- Consider BOTH JD requirements AND applied filters
- Consider that educational domains have been normalized (e.g., "B.E. Computer Science" = "B.Tech CSE")
- Deduct points for missing requirements in the BREAKDOWN only, ensuring SCORE equals the sum of BREAKDOWN values
- Reward exact matches more than partial matches

JOB DESCRIPTION ANALYSIS:
{{
  "Position": "{jd_data.get('jobRole', 'Not specified')}",
  "Experience Required": "{jd_data.get('years', 'Not specified')} years",
  "Candidate Level": "{jd_data.get('experience', 'Not specified')}",
  "Required Education": {jd_domains},
  "Location": "{jd_data.get('location', 'Not specified')}"
}}

ACTIVE FILTERS FOR THIS SEARCH:
{{
  "Experience Filter": "{filters.get('experience', 'Not specified')}",
  "Years Filter": "{filters.get('years', 'Not specified')}",
  "Education Domains": {filters.get('domain', [])},
  "Job Role Preference": "{filters.get('jobRole', 'Not specified')}",
  "Location Preference": "{filters.get('location', 'Not specified')}"
}}

CANDIDATE PROFILE:
{{
  "Name": "{resume_data.get('name', 'Not provided')}",
  "Total Experience": "{resume_data.get('total_experience', 'Not specified')}",
  "Education": {resume_data.get('education', [])},
  "Skills": {resume_data.get('skills', [])},
  "Work History": {resume_data.get('experience', [])}
}}

DETAILED SCORING RUBRIC (100 POINTS TOTAL):

1. EDUCATION MATCH (35 POINTS):
   - 30-35: Domain match found ({'Yes' if domain_match else 'No'}) with required education level
   - 20-29: Related domain or higher qualification
   - 10-19: Partial match or different but relevant field
   - 0-9: No relevant education or missing education

2. EXPERIENCE MATCH (30 POINTS):
   - 25-30: Meets or exceeds required years with relevant experience
   - 15-24: Close to required years with some relevant experience
   - 5-14: Significant under-experience or irrelevant experience
   - 0-4: No experience or completely unrelated field

3. SKILLS ALIGNMENT (15 POINTS):
   - 12-15: Strong skills match with most required technologies
   - 8-11: Moderate skills overlap with some gaps
   - 4-7: Basic skills match with significant gaps
   - 0-3: Minimal or no relevant skills

4. ROLE RELEVANCE (15 POINTS):
   - 12-15: Direct previous experience in same/similar role
   - 8-11: Transferable skills from related roles
   - 4-7: Some relevant experience but different focus
   - 0-3: Completely different career path

5. FILTER COMPLIANCE (5 POINTS):
   - 5: Meets all active filter criteria
   - 3-4: Meets most filter criteria
   - 1-2: Meets some filter criteria
   - 0: Does not meet key filter criteria

EVALUATION RULES:
- If JD requires specific years and candidate has less: DEDUCT 15+ points from EXPERIENCE_MATCH
- If education domain doesn't match required: DEDUCT 20+ points from EDUCATION_MATCH
- If experience level filter doesn't match: DEDUCT 10+ points from EXPERIENCE_MATCH
- If location filter specified and doesn't match: DEDUCT 5+ points from FILTER_COMPLIANCE
- For fresher roles: Focus more on education and skills than experience
- For experienced roles: Weight experience and role relevance higher
- ENSURE SCORE equals the sum of BREAKDOWN values

SPECIFIC CONSIDERATIONS FOR THIS EVALUATION:
- Required Experience: {jd_data.get('years', 'Not specified')} years
- Candidate's Experience: {resume_data.get('total_experience', 'Not specified')}
- Education Match Status: {'MATCH' if domain_match else 'NO MATCH'}
- Skills Relevance: Assess alignment between JD requirements and candidate's {resume_data.get('skills', [])}

Return your evaluation in EXACTLY this JSON format. Do not include any other text.

###JSON_START###
{{
  "score": 0,
  "breakdown": {{
    "education_match": 0,
    "experience_match": 0,
    "skills_match": 0,
    "role_relevance": 0,
    "filter_compliance": 0
  }},
  "strengths": [],
  "weaknesses": [],
  "recommendation": "",
  "detailed_analysis": {{
    "education_analysis": "",
    "experience_analysis": "",
    "skills_analysis": "",
    "overall_fit_analysis": ""
  }}
}}
###JSON_END###

Now, analyze this candidate objectively and provide your scoring.
"""
    payload = {
        "model_name": "mistral:7b-instruct",
        "prompt": comparison_prompt,
        "actual_data": comparison_prompt,
        "max_tokens": 6000,
        "num_ctx": 20480
    }

    try:
        logging.info("Pausing 5s before compare_resume_with_jd")
        time.sleep(5)
        
        response_data = call_ollama_with_retry(payload)
        raw_text = response_data.get("response", "").strip()
        logging.info(f"Raw Ollama response for comparison: {raw_text[:500]}...")  # Log truncated
        
        comparison_result = safe_json_parse(raw_text)
        
        if comparison_result and 'score' in comparison_result:
            breakdown_sum = sum(comparison_result['breakdown'].values())
            reported_score = comparison_result['score']
            logging.info(f"Reported score: {reported_score}, Calculated sum: {breakdown_sum}, Breakdown: {comparison_result['breakdown']}")
            if reported_score != breakdown_sum:
                logging.warning(f"Score mismatch detected! Overriding reported score {reported_score} with calculated sum {breakdown_sum}")
                comparison_result['score'] = breakdown_sum
            return comparison_result
        else:
            base_score = 25 if domain_match else 5
            return {
                "score": base_score,
                "breakdown": {
                    "education_match": 15 if domain_match else 0,
                    "experience_match": 5,
                    "skills_match": 3,
                    "role_relevance": 2,
                    "filter_compliance": 0
                },
                "strengths": ["Domain match found"] if domain_match else ["Basic qualifications"],
                "weaknesses": ["AI evaluation failed, using basic scoring"],
                "recommendation": "Needs manual review - AI evaluation incomplete"
            }

    except Exception as e:
        logging.error(f"❌ Error in compare_resume_with_jd: {e}")
        base_score = 25 if domain_match else 5
        return {
            "score": base_score,
            "breakdown": {
                "education_match": 15 if domain_match else 0,
                "experience_match": 5,
                "skills_match": 3,
                "role_relevance": 2,
                "filter_compliance": 0
            },
            "strengths": ["Domain match found"] if domain_match else [],
            "weaknesses": ["Error in AI evaluation"],
            "recommendation": "Evaluation error - needs manual review"
        }


def process_pending_resumes(jd_id, pending_ids):
    jd_data = jd_collection.find_one({"_id": jd_id})
    if not jd_data:
        logging.error(f"❌ JD not found for id: {jd_id}")
        return

    # Process in smaller batches if large
    batch_size = 10
    for i in range(0, len(pending_ids), batch_size):
        batch_ids = pending_ids[i:i+batch_size]
        for file_id in batch_ids:
            resume = resumes_collection.find_one({"_id": file_id})
            if not resume:
                continue

            file_path = resume['file_path']
            text = extract_text_from_file(file_path)
            if not text:
                resumes_collection.update_one({"_id": file_id}, {"$set": {"status": "error"}})
                try:
                    os.remove(file_path)
                except Exception as e:
                    logging.warning(f"⚠️ Could not delete temp file {file_path}: {e}")
                continue

            # Add delay before data extraction to prevent model overload
            logging.info(f"Pausing for 5 seconds before extracting data for resume {resume['filename']}...")
            time.sleep(5)  # Increased delay

            resume_data = extract_info_with_model(text, "resume")
            
            comparison_result = compare_resume_with_jd(
                resume_data, 
                jd_data['extracted_data'], 
                jd_data.get('filters', {})
            )
            
            update = {
                "extracted_data": resume_data,
                "comparison_result": comparison_result,
                "score": comparison_result.get('score', 0),
                "status": "processed",
                "processed_at": datetime.now()
            }

            resumes_collection.update_one({"_id": file_id}, {"$set": update})
            
            try:
                os.remove(file_path)
            except Exception as e:
                logging.warning(f"⚠️ Could not delete temp file {file_path}: {e}")
            
            logging.info(f"✅ Resume {resume['filename']} processed with score: {comparison_result.get('score', 0)}")

# --------- API Routes (Keep the same as before) ---------
@filter_bp.route('/save-jd', methods=['POST'])
def save_jd():
    """Endpoint to save the job description and return an ID."""
    try:
        if request.is_json:
            data = request.get_json()
        else:
            data = request.form.to_dict()

        if not data and request.data:
            data = {'job_description': request.data.decode('utf-8')}

        job_description = data.get('job_description') if isinstance(data, dict) else data

        if not job_description:
            return jsonify({'error': 'Job description is required.'}), 400

        extracted_data = extract_info_with_model(job_description, "job description")

        jd_document = {
            "_id": str(uuid.uuid4()),
            "original_text": job_description,
            "extracted_data": extracted_data,
            "filters": extracted_data,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }

        jd_collection.insert_one(jd_document)
        jd_id = jd_document["_id"]
        logging.info(f"✅ Job description saved to MongoDB with ID: {jd_id}")

        return jsonify({
            'message': 'Job description received and processed successfully!',
            'jd_id': jd_id,
            'extracted_data': extracted_data
        }), 200

    except Exception as e:
        logging.error(f"❌ Error in save_jd: {e}")
        return jsonify({'error': 'Failed to process request.'}), 500

@filter_bp.route('/save-filters', methods=['POST'])
def save_filters():
    """Endpoint to save filter criteria for a specific JD."""
    try:
        data = request.get_json() if request.is_json else request.form.to_dict()

        jd_id = data.get('jd_id')
        filters = data.get('filters')

        if not jd_id:
            return jsonify({'error': 'JD ID is required.'}), 400
        if not filters:
            return jsonify({'error': 'Filters data is required.'}), 400

        result = jd_collection.update_one(
            {'_id': jd_id},
            {
                '$set': {
                    'filters': filters,
                    'updated_at': datetime.now()
                }
            }
        )

        if result.modified_count == 0:
            return jsonify({'error': 'JD not found or no changes made.'}), 404

        return jsonify({'message': 'Filters saved successfully!', 'jd_id': jd_id}), 200

    except Exception as e:
        logging.error(f"❌ Error in save_filters: {e}")
        return jsonify({'error': 'Failed to save filters.'}), 500
    

@filter_bp.route('/get-jd/<jd_id>', methods=['GET'])
def get_jd(jd_id):
    """Get JD data including extracted filters"""
    try:
        jd_data = jd_collection.find_one({"_id": jd_id})
        if not jd_data:
            return jsonify({'error': 'JD not found'}), 404
            
        return jsonify({
            'jd_id': jd_id,
            'original_text': jd_data.get('original_text', ''),
            'extracted_data': jd_data.get('extracted_data', {}),
            'filters': jd_data.get('filters', {}),
            'created_at': jd_data.get('created_at', '').isoformat() if jd_data.get('created_at') else ''
        }), 200
        
    except Exception as e:
        logging.error(f"❌ Error in get-jd: {e}")
        return jsonify({'error': 'Failed to get JD data'}), 500
    

@filter_bp.route('/process-resumes', methods=['POST'])
def process_resumes():
    """Endpoint to process uploaded resumes and extract information with AI-powered scoring."""
    try:
        jd_id = request.form.get('jd_id')
        if not jd_id:
            return jsonify({'error': 'JD ID is required.'}), 400

        if 'files' not in request.files:
            return jsonify({'error': 'No files uploaded.'}), 400

        files = request.files.getlist('files')
        if not files or all(file.filename == '' for file in files):
            return jsonify({'error': 'No valid files uploaded.'}), 400

        # Get JD data for comparison
        jd_data = jd_collection.find_one({"_id": jd_id})
        if not jd_data:
            return jsonify({'error': 'JD not found.'}), 404

        pending_ids = []
        for file in files:
            if file and (file.filename.endswith('.pdf') or file.filename.endswith('.docx')):
                file_id = str(uuid.uuid4())
                file_extension = os.path.splitext(file.filename)[1].lower()
                file_path = os.path.join(uploaded_resumes_dir, f"{file_id}{file_extension}")
                file.save(file_path)

                resume_document = {
                    "_id": file_id,
                    "jd_id": jd_id,
                    "filename": file.filename,
                    "file_path": file_path,
                    "status": "pending",
                    "processed_at": None
                }

                resumes_collection.insert_one(resume_document)
                pending_ids.append(file_id)

        threading.Thread(target=process_pending_resumes, args=(jd_id, pending_ids)).start()

        return jsonify({
            'message': 'Processing started in background',
            'total_uploaded': len(pending_ids)
        }), 202

    except Exception as e:
        logging.error(f"❌ Error in process_resumes: {e}")
        return jsonify({'error': 'Failed to process resumes.'}), 500

@filter_bp.route('/get-results/<jd_id>', methods=['GET'])
def get_results(jd_id):
    try:
        resumes = list(resumes_collection.find({"jd_id": jd_id, "status": "processed"}).sort("score", -1))
        
        processed_resumes = []
        for r in resumes:
            processed_resumes.append({
                "filename": r["filename"],
                "data": r["extracted_data"],
                "score": r["score"],
                "comparison_details": r["comparison_result"],
            })

        total_uploaded = resumes_collection.count_documents({"jd_id": jd_id})
        processed_count = len(processed_resumes)
        pending_count = resumes_collection.count_documents({"jd_id": jd_id, "status": "pending"})

        return jsonify({
            'processed_resumes': processed_resumes,
            'total_uploaded': total_uploaded,
            'processed_count': processed_count,
            'pending_count': pending_count
        }), 200

    except Exception as e:
        logging.error(f"❌ Error in get_results: {e}")
        return jsonify({'error': 'Failed to get results.'}), 500

@filter_bp.route("/get-past-jds", methods=["GET"])
def get_past_jds():
    try:
        jds = list(jd_collection.find().sort("created_at", -1))

        result = []
        for jd in jds:
            result.append({
                "jd_id": str(jd.get("_id")),
                "job_description": jd.get("original_text", ""),
                "uploaded_at": jd.get("created_at", datetime.utcnow()).isoformat()
            })

        return jsonify({"status": "success", "jds": result}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@filter_bp.route("/download-results/<jd_id>", methods=["GET"])
def download_results(jd_id):
    """Download results as CSV - only processed resumes with valid data"""
    try:
        # Fetch only processed resumes, matching the /get-results behavior
        resumes = list(resumes_collection.find({"jd_id": jd_id, "status": "processed"}).sort("score", -1))
        
        if not resumes:
            return jsonify({"error": "No processed resumes found for this JD"}), 404
        
        output = StringIO()
        writer = csv.writer(output, quoting=csv.QUOTE_ALL)  # Quote all fields to handle internal commas
        
        writer.writerow([
            'Name', 'Email', 'Contact No', 'Score', 'Education Qualification', 
            'Experience', 'Skills', 'Total Experience', 'Conclusion'
        ])
        
        for resume in resumes:
            data = resume.get('extracted_data', {})
            # Ensure data exists and is properly structured before writing
            if not data or not isinstance(data, dict):
                logging.warning(f"Skipping resume {resume.get('_id')} due to invalid extracted_data: {data}")
                continue  # Skip if extracted_data is missing or invalid
            
            # Validate and log skills data
            skills = data.get('skills', [])
            if not isinstance(skills, list):
                logging.warning(f"Invalid skills format for resume {resume.get('_id')}: {skills}")
                skills = []
            logging.info(f"Skills data for resume {resume.get('_id')}: {skills}")
            
            # Use ' | ' separator to avoid confusion with commas
            education_str = ' | '.join([f"{edu.get('degree', '')} in {edu.get('domain', '')}" 
                                        for edu in data.get('education', []) if edu])
            experience_str = ' | '.join([f"{exp.get('role', '')} at {exp.get('company', '')}" 
                                         for exp in data.get('experience', []) if exp])
            skills_str = ' | '.join(skills)  # Ensure skills is joined correctly
            
            writer.writerow([
                data.get('name', 'N/A'),
                data.get('email', 'N/A'),
                data.get('phone', 'N/A'),
                resume.get('score', 0),
                education_str,
                experience_str,
                skills_str,
                data.get('total_experience', 'N/A'),
                data.get('conclusion', 'N/A')
            ])
        
        output.seek(0)
        
        # Fixed: Use Response directly instead of app.response_class
        from flask import Response
        response = Response(
            response=output.getvalue().encode('utf-8'),
            mimetype='text/csv',
            headers={'Content-Disposition': f'attachment;filename=results_{jd_id}.csv'}
        )
        
        return response
        
    except Exception as e:
        logging.error(f"❌ Error in download_results: {e}")
        return jsonify({"error": str(e)}), 500
