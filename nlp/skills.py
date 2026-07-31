# Master list of tech skills for the custom EntityRuler
# spaCy's base model misses most of these, so we define them manually

TECH_SKILLS = [
    # Languages
    "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "Rust",
    "Ruby", "Swift", "Kotlin", "Scala", "PHP", "MATLAB", "Bash", "Shell",

    # Frontend
    "React", "React.js", "Next.js", "Vue", "Vue.js", "Angular", "Svelte",
    "Redux", "Redux Toolkit", "React Query", "GraphQL", "HTML", "CSS",
    "Tailwind", "Tailwind CSS", "Bootstrap", "Webpack", "Vite", "Jest",
    "TypeScript", "styled-components", "Material UI", "Chakra UI",

    # Backend
    "Node.js", "Express", "Express.js", "Fastify", "Django", "Flask",
    "FastAPI", "Spring Boot", "Spring", "Rails", "Ruby on Rails",
    "ASP.NET", ".NET", "Laravel", "NestJS", "Hapi",

    # Databases
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "DynamoDB",
    "Cassandra", "Elasticsearch", "Neo4j", "ClickHouse", "Redshift",
    "BigQuery", "Firestore", "Supabase", "PlanetScale",

    # ORM / Query
    "Prisma", "Sequelize", "TypeORM", "Mongoose", "SQLAlchemy",
    "Hibernate", "dbt", "Knex",

    # Cloud
    "AWS", "GCP", "Azure", "S3", "EC2", "Lambda", "CloudWatch",
    "Cloud Functions", "Firebase", "Vercel", "Netlify", "Render", "Railway",

    # DevOps
    "Docker", "Kubernetes", "Terraform", "Ansible", "Jenkins", "GitHub Actions",
    "CI/CD", "Helm", "ArgoCD", "Prometheus", "Grafana", "Nginx", "Linux",

    # Message Queues
    "Kafka", "RabbitMQ", "SQS", "Celery", "Bull", "BullMQ", "NATS",

    # ML/AI
    "TensorFlow", "PyTorch", "scikit-learn", "Keras", "Hugging Face",
    "LangChain", "spaCy", "NLTK", "OpenCV", "Pandas", "NumPy", "Matplotlib",
    "XGBoost", "LightGBM", "MLflow", "Airflow", "Spark", "PySpark",
    "BERT", "GPT", "LLM", "RAG", "Pinecone", "FAISS", "CUDA", "TensorRT",

    # Data
    "Apache Spark", "Apache Flink", "Apache Airflow", "Hadoop", "Hive",
    "Kafka", "dbt", "Redshift", "BigQuery", "ETL", "data pipeline",
    "data warehouse", "data modeling", "stream processing",

    # API / Protocols
    "REST", "REST API", "GraphQL", "gRPC", "WebSockets", "OAuth2",
    "JWT", "OpenAPI", "Swagger",

    # Testing
    "Jest", "Pytest", "Mocha", "Cypress", "Selenium", "JUnit",
    "RSpec", "Postman", "unit testing", "integration testing",

    # Concepts
    "microservices", "system design", "DSA", "data structures",
    "algorithms", "distributed systems", "concurrency", "multithreading",
    "caching", "load balancing", "rate limiting", "authentication",
    "authorization", "encryption", "bcrypt", "hashing",

    # Tools
    "Git", "GitHub", "GitLab", "Jira", "Linux", "VS Code",
    "Jupyter", "Postman", "Figma", "Notion"
]

# Map lowercase versions for case-insensitive matching
SKILLS_LOWER = {skill.lower(): skill for skill in TECH_SKILLS}