import os
import docx
from io import BytesIO
from flask import Blueprint, request, jsonify, send_file, current_app
from app.utils.file_utils import find_and_replace_in_doc, extract_json_from_response
from app.utils.ai_helpers import client


optimize_bp = Blueprint('optimize', __name__)

@optimize_bp.route("/optimize_resume", methods=["POST"])
def optimize_resume_route():
    """Optimize resume based on user answers to questions"""
    data = request.get_json()
    jd_text = data.get('jd_text')
    answers = data.get('answers')
    file_id = data.get('file_id')
    
    if not all([jd_text, answers, file_id]):
        return jsonify({"error": "JD, answers, and file_id are required."}), 400
  
    file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], file_id)
  
    if not os.path.exists(file_path):
        return jsonify({"error": "Original resume file not found."}), 404
        
    if not file_path.lower().endswith('.docx'):
        return jsonify({"error": "Optimization is for .docx only."}), 400
    
    original_doc = docx.Document(file_path)
    original_resume_text = "\n".join(p.text for p in original_doc.paragraphs)
    
    formatted_answers = []
    for q, a in answers.items():
        if a.strip():
            formatted_answers.append(f"Q: {q}\nA: {a}\n")
    
    prompt = f"""
    You are a top-tier professional resume writer. Analyze this resume and job description, along with the candidate's answers to craft targeted, high-impact improvements that significantly boost the resume’s ATS compatibility and hiring appeal.
    Create SPECIFIC, IMPACTFUL changes that will maximize the resume's ATS score.
    
    Guidelines:
    1. Focus on adding quantifiable metrics from answers
    2. Prioritize changes that address keyword gaps
    3. Make language more achievement-oriented
    4. Suggest 8-12 high-impact changes ans maximize ATS keyword alignment.
    5. For each change:
       - 'find' must be EXACT text from original
       - 'replace' must incorporate metrics/answers 
       - Changes should be verifiable improvements orignal sturture, font size preserve as it is. 
    6. After optimization Ats score should be increase  greater then old score
    
    Example Change:
    {{
      "find": "Managed social media accounts",
      "replace": "Grew LinkedIn following from 500 to 5,000+ in 6 months through targeted content strategy"
    }}
    
    Job Description:
    {jd_text}
    
    Candidate Answers:
    {"".join(formatted_answers)}
    
    Original Resume:
    {original_resume_text}
    
    Return JSON with "changes" array following this exact format:
    {{
      "changes": [
        {{"find": "exact text to replace", "replace": "improved version"}},
        ...
      ]
    }}
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        
        response_text = response.choices[0].message.content
        changes = extract_json_from_response(response_text).get("changes", [])
        
        modified_doc = docx.Document(file_path)
        changes_applied = 0
        
        # First pass: exact matches
        for change in changes:
            find_text = change.get('find', '').strip()
            replace_text = change.get('replace', '').strip()
            
            if find_text and replace_text and find_text in original_resume_text:
                for paragraph in modified_doc.paragraphs:
                    if find_text in paragraph.text:
                        paragraph.text = paragraph.text.replace(find_text, replace_text)
                        changes_applied += 1
                        break
        
        # Second pass: fuzzy matches if few changes applied
        if changes_applied < 3:
            modified_doc = find_and_replace_in_doc(modified_doc, changes)
            changes_applied = len(changes)
        
        # Save optimized document
        doc_io = BytesIO()
        modified_doc.save(doc_io)
        doc_io.seek(0)
        
        return send_file(
            doc_io,
            as_attachment=True,
            download_name='Optimized_Resume.docx',
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
    except Exception as e:
        return jsonify({"error": f"Optimization failed: {str(e)}"}), 500