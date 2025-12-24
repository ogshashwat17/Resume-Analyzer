import re
import os
import json
from pypdf import PdfReader
import docx2txt
from typing import List, Dict
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

COMMON_SKILLS = [
    "python", "java", "c++", "c#", "javascript", "typescript", "react", "angular", "vue",
    "html", "css", "sql", "nosql", "mongodb", "postgresql", "docker", "kubernetes",
    "aws", "azure", "gcp", "git", "linux", "agile", "scrum", "machine learning",
    "deep learning", "data analysis", "communication", "leadership", "problem solving",
    "fastapi", "flask", "django"
]

def extract_text_from_pdf(file_file) -> str:
    reader = PdfReader(file_file)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    return text

def extract_text_from_docx(file_file) -> str:
    return docx2txt.process(file_file)

def extract_email(text: str) -> str:
    match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
    return match.group(0) if match else None

def extract_phone(text: str) -> str:
    match = re.search(r'(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}', text)
    return match.group(0) if match else None

def extract_skills(text: str) -> List[str]:
    text_lower = text.lower()
    return [skill for skill in COMMON_SKILLS if re.search(r'\b' + re.escape(skill) + r'\b', text_lower)]

def analyze_with_groq(resume_text: str, job_description: str) -> Dict:
    try:
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        
        # Combined prompt based on user's Streamlit code
        prompt = f"""
        Act as an experienced Technical HR and ATS Scanner.
        
        JOB DESCRIPTION:
        {job_description[:2000]}
        
        RESUME:
        {resume_text[:4000]}
        
        Perform two tasks:
        1. (HR Review): Evaluate the resume against the JD. Highlight strengths and weaknesses.
        2. (ATS Scanner): Calculate percentage match, identify missing keywords, and give a final verdict.
        
        Return a valid JSON object with these exact keys:
        - hr_review: (string, detailed strengths and weaknesses)
        - match_percentage: (number 0-100)
        - missing_keywords: (list of strings)
        - final_verdict: (string)
        - skills_found: (list of strings found)
        """
        
        completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0,
            response_format={"type": "json_object"}
        )
        return json.loads(completion.choices[0].message.content)
    except Exception as e:
        print(f"Groq Error: {e}")
        return {}

def analyze_resume_text(text: str, job_description: str = None) -> Dict:
    data = {
        "email": extract_email(text),
        "phone": extract_phone(text),
        "word_count": len(text.split()),
        "raw_text_preview": text[:500]
    }
    
    if job_description and os.getenv("GROQ_API_KEY"):
        ai_data = analyze_with_groq(text, job_description)
        if ai_data:
            data.update({
                "skills": ai_data.get("skills_found", []),
                "match_percentage": ai_data.get("match_percentage", 0),
                "missing_keywords": ai_data.get("missing_keywords", []),
                "hr_review": ai_data.get("hr_review", "Analysis failed."),
                "final_verdict": ai_data.get("final_verdict", ""),
                "type": "ai"
            })
            return data

    data["skills"] = extract_skills(text)
    data["type"] = "basic"
    return data
