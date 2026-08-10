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


print("[NLP] Loading spaCy model...")
nlp = spacy.load("en_core_web_sm")


ruler = nlp.add_pipe("entity_ruler", before="ner")


patterns = []
for skill in TECH_SKILLS:
    patterns.append({
        "label": "TECH_SKILL",
        "pattern": skill
    })
    
    patterns.append({
        "label": "TECH_SKILL",
        "pattern": skill.lower()
    })

ruler.add_patterns(patterns)
print(f"[NLP] Loaded {len(TECH_SKILLS)} skill patterns")



def extract_skills_from_text(text):
    if not text:
        return []

    doc = nlp(text)

    found_skills = set()

    
    for ent in doc.ents:
        if ent.label_ == "TECH_SKILL":
            # Normalize to canonical form
            canonical = SKILLS_LOWER.get(ent.text.lower(), ent.text)
            found_skills.add(canonical)

    
    text_lower = text.lower()
    for skill_lower, skill_canonical in SKILLS_LOWER.items():
        if skill_lower in text_lower:
            found_skills.add(skill_canonical)

    return sorted(list(found_skills))




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

@app.route('/tfidf-rankings', methods=['POST'])
def tfidf_rankings():
    from sklearn.feature_extraction.text import TfidfVectorizer
    import numpy as np

    data = request.get_json()
    if not data or 'jobs' not in data:
        return jsonify({"error": "Missing 'jobs' field"}), 400

    jobs = data['jobs']
    role_docs = {}
    for job in jobs:
        role = job.get('role_category', 'unknown')
        skills = job.get('skills', [])
        skill_text = ' '.join([s.replace(' ', '_').replace('.', '_') for s in skills])
        if role not in role_docs:
            role_docs[role] = []
        role_docs[role].append(skill_text)

    if not role_docs:
        return jsonify({"error": "No jobs provided"}), 400

    all_docs = []
    doc_roles = []
    for role, docs in role_docs.items():
        for doc in docs:
            all_docs.append(doc)
            doc_roles.append(role)

    if len(all_docs) < 2:
        return jsonify({"error": "Need at least 2 jobs"}), 400

    vectorizer = TfidfVectorizer(
        analyzer='word',
        token_pattern=r'[^\s]+',
        max_features=200
    )

    try:
        tfidf_matrix = vectorizer.fit_transform(all_docs)
    except Exception as e:
        return jsonify({"error": f"TF-IDF failed: {str(e)}"}), 500

    feature_names = vectorizer.get_feature_names_out()
    rankings = {}

    for role in role_docs.keys():
        role_indices = [i for i, r in enumerate(doc_roles) if r == role]
        role_matrix = tfidf_matrix[role_indices]
        avg_scores = np.asarray(role_matrix.mean(axis=0)).flatten()
        top_indices = avg_scores.argsort()[::-1][:15]

        role_rankings = []
        for rank, idx in enumerate(top_indices):
            score = float(avg_scores[idx])
            if score > 0:
                skill = feature_names[idx].replace('_', ' ').replace(' js', '.js')
                role_rankings.append({
                    "rank": rank + 1,
                    "skill": skill,
                    "tfidf_score": round(score, 4)
                })
        rankings[role] = role_rankings

    return jsonify({"rankings": rankings})


@app.route('/cluster-jobs', methods=['POST'])
def cluster_jobs():
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.cluster import KMeans
    from sklearn.preprocessing import normalize
    import numpy as np

    data = request.get_json()
    if not data or 'jobs' not in data:
        return jsonify({"error": "Missing 'jobs' field"}), 400

    jobs = data['jobs']
    if len(jobs) < 6:
        return jsonify({"error": "Need at least 6 jobs"}), 400

    docs = []
    for job in jobs:
        skills = job.get('skills', [])
        doc = ' '.join([s.replace(' ', '_').replace('.', '_') for s in skills])
        docs.append(doc if doc else 'unknown')

    vectorizer = TfidfVectorizer(
        analyzer='word',
        token_pattern=r'[^\s]+',
        max_features=100
    )

    try:
        X = vectorizer.fit_transform(docs)
        X = normalize(X)
    except Exception as e:
        return jsonify({"error": f"Vectorization failed: {str(e)}"}), 500

    k = min(6, len(jobs))
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = kmeans.fit_predict(X)

    feature_names = vectorizer.get_feature_names_out()
    cluster_info = []

    for cluster_id in range(k):
        cluster_jobs_list = [jobs[i] for i, label in enumerate(labels) if label == cluster_id]
        role_counts = {}
        for job in cluster_jobs_list:
            role = job.get('role_category', 'unknown')
            role_counts[role] = role_counts.get(role, 0) + 1
        dominant_role = max(role_counts, key=role_counts.get) if role_counts else 'unknown'

        center = kmeans.cluster_centers_[cluster_id]
        top_indices = center.argsort()[::-1][:8]
        top_skills = [feature_names[i].replace('_', ' ') for i in top_indices if center[i] > 0]

        cluster_info.append({
            "cluster_id": cluster_id,
            "dominant_role": dominant_role,
            "job_count": len(cluster_jobs_list),
            "top_skills": top_skills,
            "role_distribution": role_counts
        })

    labeled_jobs = []
    for i, job in enumerate(jobs):
        labeled_jobs.append({
            "id": job.get('id'),
            "role_category": job.get('role_category'),
            "cluster_id": int(labels[i])
        })

    return jsonify({
        "k": k,
        "clusters": cluster_info,
        "job_clusters": labeled_jobs
    })


if __name__ == '__main__':
    port = int(os.getenv('PORT', 8000))
    print(f"[NLP] Starting Flask server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)