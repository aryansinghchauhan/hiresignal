from flask import Flask, request, jsonify
from flask_cors import CORS
import spacy
from spacy.pipeline import EntityRuler
import pdfplumber
import io
import os
from dotenv import load_dotenv
from skills import TECH_SKILLS, SKILLS_LOWER

load_dotenv()

app = Flask(__name__)
CORS(app)

# ─── Load spaCy model + add custom skill entity ruler ───────────────────────
print("[NLP] Loading spaCy model...")
nlp = spacy.load("en_core_web_sm")

# Add EntityRuler BEFORE the NER component so our rules take priority
ruler = nlp.add_pipe("entity_ruler", before="ner")

# Create patterns for every skill in our list
patterns = []
for skill in TECH_SKILLS:
    patterns.append({
        "label": "TECH_SKILL",
        "pattern": skill
    })
    # Also add lowercase version
    patterns.append({
        "label": "TECH_SKILL",
        "pattern": skill.lower()
    })

ruler.add_patterns(patterns)
print(f"[NLP] Loaded {len(TECH_SKILLS)} skill patterns")


# ─── Helper: extract skills from text ───────────────────────────────────────
def extract_skills_from_text(text):
    if not text:
        return []

    doc = nlp(text)

    found_skills = set()

    # Method 1: EntityRuler matches
    for ent in doc.ents:
        if ent.label_ == "TECH_SKILL":
            # Normalize to canonical form
            canonical = SKILLS_LOWER.get(ent.text.lower(), ent.text)
            found_skills.add(canonical)

    # Method 2: Simple substring matching as fallback
    text_lower = text.lower()
    for skill_lower, skill_canonical in SKILLS_LOWER.items():
        if skill_lower in text_lower:
            found_skills.add(skill_canonical)

    return sorted(list(found_skills))


# ─── Routes ─────────────────────────────────────────────────────────────────

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "ok",
        "service": "HireSignal NLP",
        "skills_loaded": len(TECH_SKILLS)
    })


@app.route('/extract-skills', methods=['POST'])
def extract_skills():
    """
    Accepts a job description text and returns extracted skills.
    Body: { "text": "...", "role_category": "backend" }
    """
    data = request.get_json()

    if not data or 'text' not in data:
        return jsonify({"error": "Missing 'text' field"}), 400

    text = data['text']
    role_category = data.get('role_category', 'unknown')

    skills = extract_skills_from_text(text)

    return jsonify({
        "role_category": role_category,
        "skills": skills,
        "count": len(skills)
    })


@app.route('/extract-resume', methods=['POST'])
def extract_resume():
    """
    Accepts a PDF file upload and returns extracted skills.
    Used for resume gap analysis.
    """
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']

    if not file.filename.endswith('.pdf'):
        return jsonify({"error": "Only PDF files are supported"}), 400

    try:
        # Read PDF and extract text
        pdf_bytes = file.read()
        text = ""

        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"

        if not text.strip():
            return jsonify({"error": "Could not extract text from PDF"}), 400

        skills = extract_skills_from_text(text)

        return jsonify({
            "skills": skills,
            "count": len(skills),
            "text_length": len(text)
        })

    except Exception as e:
        return jsonify({"error": f"PDF processing failed: {str(e)}"}), 500


@app.route('/batch-extract', methods=['POST'])
def batch_extract():
    """
    Accepts multiple job descriptions and extracts skills from all.
    Body: { "jobs": [{ "id": 1, "text": "...", "role_category": "backend" }] }
    """
    data = request.get_json()

    if not data or 'jobs' not in data:
        return jsonify({"error": "Missing 'jobs' field"}), 400

    results = []
    for job in data['jobs']:
        skills = extract_skills_from_text(job.get('text', ''))
        results.append({
            "id": job.get('id'),
            "role_category": job.get('role_category'),
            "skills": skills,
            "count": len(skills)
        })

    return jsonify({
        "processed": len(results),
        "results": results
    })


if __name__ == '__main__':
    port = int(os.getenv('PORT', 8000))
    print(f"[NLP] Starting Flask server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)