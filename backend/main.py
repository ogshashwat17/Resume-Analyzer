from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import io
from utils import extract_text_from_pdf, extract_text_from_docx, analyze_resume_text

app = FastAPI(title="Resume Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Resume Analyzer API is running"}

@app.post("/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    job_description: str = Form(None)
):
    filename = file.filename.lower()
    content = await file.read()
    file_stream = io.BytesIO(content)
    text = ""
    try:
        if filename.endswith(".pdf"):
            text = extract_text_from_pdf(file_stream)
        elif filename.endswith(".docx"):
            text = extract_text_from_docx(file_stream)
        else:
            raise HTTPException(status_code=400, detail="Unsupported format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    return {
        "filename": file.filename,
        "analysis": analyze_resume_text(text, job_description)
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
