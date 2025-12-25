import { useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [file, setFile] = useState(null)
  const [jd, setJd] = useState("")
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeView, setActiveView] = useState(null) // 'match' or 'hr'

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0])
      setAnalysis(null)
      setError(null)
      setActiveView(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    const formData = new FormData()
    formData.append('file', file)
    if (jd) formData.append('job_description', jd)

    const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    try {
      const response = await axios.post(`${apiUrl}/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setAnalysis(response.data.analysis)
    } catch (err) {
      setError('Analysis failed. check API key or Backend.')
    } finally {
      setLoading(false)
    }
  }

  const closeModal = () => setActiveView(null)

  return (
    <div className="app-container">
      <header className="header">
        <h1>Resume<span className="accent">Analyzer</span></h1>
        <p>AI-powered Resume Screening</p>
      </header>

      <div className="main-content">
        
        {!analysis && (
          <div className="upload-wrapper" style={{ width: '100%', maxWidth: '1000px' }}>

            <div className="cards-row" style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>

              <div className="card" style={{ flex: '1', minWidth: '320px', display: 'flex', flexDirection: 'column' }}>
                <h3>1. Job Description</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Paste the JD here to compare against your resume.
                </p>
                <textarea
                  className="jd-input"
                  placeholder="Paste text here..."
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                  style={{
                    flex: 1,
                    minHeight: '200px',
                    marginBottom: 0,
                    resize: 'none',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                />
              </div>

              <div className="card" style={{ flex: '1', minWidth: '320px', display: 'flex', flexDirection: 'column' }}>
                <h3>2. Upload Resume</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Supported formats: PDF, DOCX
                </p>
                <div className="file-input-wrapper" style={{
                  border: '2px dashed var(--accent-color)',
                  borderRadius: '8px',
                  flex: 1,
                  minHeight: '200px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 0,
                  background: 'rgba(56, 189, 248, 0.05)',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}>
                  <input type="file" accept=".pdf,.docx" onChange={handleFileChange} id="file-upload" className="file-input" />
                  <label htmlFor="file-upload" className="file-label" style={{ border: 'none', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {file ? (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📄</div>
                        <div style={{ fontWeight: 'bold', color: 'white' }}>{file.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#4ade80' }}>Ready to analyze</div>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.8 }}>📤</div>
                        <div style={{ fontWeight: '600' }}>Click to Upload Resume</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '5px' }}>Drag & drop or browse</div>
                      </div>
                    )}
                  </label>
                </div>
              </div>

            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                onClick={handleUpload}
                disabled={!file || loading}
                className="analyze-btn"
                style={{
                  maxWidth: '400px',
                  padding: '1.2rem 3rem',
                  fontSize: '1.3rem',
                  boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)'
                }}
              >
                {loading ? (
                  <span><span className="spinner">↻</span> Analyzing...</span>
                ) : (
                  " Analyze Profile"
                )}
              </button>
              {error && <p className="error-msg" style={{ marginTop: '1rem', background: 'rgba(239, 68, 68, 0.2)', padding: '0.5rem', borderRadius: '6px' }}>{error}</p>}
            </div>

          </div>
        )}

        
        {analysis && (
          <div className="options-view fade-in">
            <h2 className="success-msg">Analysis Complete!</h2>
            <div className="options-container">
              <div className="option-card match-card" onClick={() => setActiveView('match')}>
                <div className="icon">📊</div>
                <h2>Match Percentage</h2>
                <p>View Compatibility Score & Verdict</p>
              </div>

              <div className="option-card hr-card" onClick={() => setActiveView('hr')}>
                <div className="icon"></div>
                <h2>HR Review</h2>
                <p>View Strengths & Weaknesses</p>
              </div>
            </div>

            <button
              onClick={() => { setAnalysis(null); setFile(null); setJd(""); }}
              className="reset-btn"
            >
              Analyze Another Resume
            </button>
          </div>
        )}

      
        {activeView && analysis && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <button className="close-btn" onClick={closeModal}>&times;</button>

              {activeView === 'match' && (
                <div className="modal-body center-text">
                  <h2>ATS Match Score</h2>
                  <div className="big-score" style={{ color: analysis.match_percentage > 70 ? '#4ade80' : '#f87171' }}>
                    {analysis.match_percentage}%
                  </div>

                  <div className="verdict-tag">
                    {analysis.final_verdict}
                  </div>

                  {analysis.missing_keywords?.length > 0 && (
                    <div className="missing-section">
                      <h4>Missing Keywords:</h4>
                      <div className="skills-cloud missing">
                        {analysis.missing_keywords.map((s, i) => <span key={i} className="skill-tag missing">{s}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeView === 'hr' && (
                <div className="modal-body">
                  <h2 className="modal-title">HR Review</h2>
                  <div className="hr-text">
                    {analysis.hr_review}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
