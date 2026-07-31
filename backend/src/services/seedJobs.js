import pool from '../db/connection.js'

const seedJobs = [
  // Backend roles
  { title: 'Backend Engineer', company: 'Razorpay', description: 'Build scalable APIs using Node.js, Express, PostgreSQL. Experience with Redis caching, Docker, and microservices architecture required. Familiarity with AWS and CI/CD pipelines preferred.', role_category: 'backend', url: 'https://razorpay.com/jobs/1' },
  { title: 'Node.js Developer', company: 'Zepto', description: 'Develop RESTful APIs with Node.js and Express. Work with MongoDB, Redis, and Kafka. Knowledge of JWT authentication and rate limiting required.', role_category: 'backend', url: 'https://zepto.com/jobs/1' },
  { title: 'Software Engineer Backend', company: 'CRED', description: 'Design and implement backend services using Java Spring Boot and PostgreSQL. Experience with microservices, Docker, Kubernetes, and message queues like RabbitMQ.', role_category: 'backend', url: 'https://cred.club/jobs/1' },
  { title: 'Backend Developer', company: 'Swiggy', description: 'Build high-performance backend systems in Python Django and Node.js. Strong knowledge of SQL, Redis, and system design. Experience with AWS Lambda and S3.', role_category: 'backend', url: 'https://swiggy.com/jobs/1' },
  { title: 'API Engineer', company: 'PhonePe', description: 'Develop and maintain REST APIs using Node.js and Express. PostgreSQL, MongoDB, and Redis experience required. Knowledge of OAuth2 and JWT.', role_category: 'backend', url: 'https://phonepe.com/jobs/1' },
  { title: 'Software Development Engineer', company: 'Flipkart', description: 'Work on large-scale distributed systems using Java, Spring Boot, and Kafka. Strong DSA skills required. Experience with MySQL, Redis, and Docker.', role_category: 'backend', url: 'https://flipkart.com/jobs/1' },
  { title: 'Backend Engineer', company: 'Meesho', description: 'Build microservices using Python FastAPI and PostgreSQL. Knowledge of Docker, Kubernetes, and AWS required. Experience with Celery and Redis for async tasks.', role_category: 'backend', url: 'https://meesho.com/jobs/1' },
  { title: 'SDE-2 Backend', company: 'Myntra', description: 'Develop scalable backend services with Java and Spring Boot. Strong knowledge of MySQL, Redis caching, and REST API design. AWS and CI/CD experience required.', role_category: 'backend', url: 'https://myntra.com/jobs/1' },
  { title: 'Node.js Backend Developer', company: 'Groww', description: 'Build financial APIs using Node.js, Express, and PostgreSQL. Experience with JWT, bcrypt, and secure coding practices. Knowledge of Redis and Docker.', role_category: 'backend', url: 'https://groww.in/jobs/1' },
  { title: 'Platform Engineer', company: 'Dunzo', description: 'Design backend infrastructure with Node.js and MongoDB. Experience with Docker, Kubernetes, and message queues. Strong knowledge of system design and scalability.', role_category: 'backend', url: 'https://dunzo.com/jobs/1' },

  // Frontend roles
  { title: 'Frontend Engineer', company: 'Razorpay', description: 'Build responsive web applications using React.js and TypeScript. Experience with Redux, React Query, and REST API integration. Knowledge of Webpack, CSS-in-JS, and performance optimization.', role_category: 'frontend', url: 'https://razorpay.com/jobs/2' },
  { title: 'React Developer', company: 'Paytm', description: 'Develop user interfaces with React.js, Redux, and TypeScript. Strong knowledge of HTML, CSS, JavaScript ES6+. Experience with Jest testing and Webpack configuration.', role_category: 'frontend', url: 'https://paytm.com/jobs/1' },
  { title: 'UI Engineer', company: 'Zomato', description: 'Create pixel-perfect UIs using React.js and Tailwind CSS. Experience with Next.js, TypeScript, and GraphQL. Knowledge of web performance and accessibility standards.', role_category: 'frontend', url: 'https://zomato.com/jobs/1' },
  { title: 'Frontend Developer', company: 'Ola', description: 'Build mobile-responsive web apps with React.js and Redux. Experience with REST APIs, TypeScript, and CSS animations. Knowledge of PWA and web performance metrics.', role_category: 'frontend', url: 'https://ola.com/jobs/1' },
  { title: 'React.js Developer', company: 'Nykaa', description: 'Develop e-commerce frontend using React.js, Next.js, and TypeScript. Experience with GraphQL, Redux Toolkit, and Jest. Knowledge of SEO optimization and web vitals.', role_category: 'frontend', url: 'https://nykaa.com/jobs/1' },
  { title: 'SDE Frontend', company: 'Flipkart', description: 'Build high-performance UIs with React.js and TypeScript. Strong knowledge of JavaScript, CSS, and browser APIs. Experience with performance profiling and code splitting.', role_category: 'frontend', url: 'https://flipkart.com/jobs/2' },
  { title: 'Frontend Engineer', company: 'CRED', description: 'Create beautiful UIs with React.js, TypeScript, and styled-components. Experience with Redux, React Query, and REST API integration. Knowledge of animation libraries.', role_category: 'frontend', url: 'https://cred.club/jobs/2' },
  { title: 'UI Developer', company: 'MakeMyTrip', description: 'Build travel booking interfaces with React.js and Redux. Experience with TypeScript, GraphQL, and responsive design. Knowledge of web accessibility and performance.', role_category: 'frontend', url: 'https://makemytrip.com/jobs/1' },

  // Fullstack roles
  { title: 'Full Stack Engineer', company: 'Swiggy', description: 'Build end-to-end features using React.js frontend and Node.js backend. Experience with PostgreSQL, Redis, Docker, and AWS. Strong knowledge of REST APIs and system design.', role_category: 'fullstack', url: 'https://swiggy.com/jobs/2' },
  { title: 'Full Stack Developer', company: 'Urban Company', description: 'Develop full-stack applications with React.js and Node.js. Experience with MongoDB, PostgreSQL, and Redis. Knowledge of Docker, AWS, and CI/CD pipelines.', role_category: 'fullstack', url: 'https://urbancompany.com/jobs/1' },
  { title: 'SDE Full Stack', company: 'Zepto', description: 'Build features across React.js frontend and Python Django backend. Experience with PostgreSQL, Redis, and Docker. Knowledge of REST APIs, GraphQL, and system design.', role_category: 'fullstack', url: 'https://zepto.com/jobs/2' },
  { title: 'Full Stack Engineer', company: 'BrowserStack', description: 'Develop full-stack features with React.js and Ruby on Rails. Experience with PostgreSQL, Redis, and AWS. Strong knowledge of testing with Jest and RSpec.', role_category: 'fullstack', url: 'https://browserstack.com/jobs/1' },
  { title: 'Product Engineer', company: 'Postman', description: 'Build full-stack features using React.js and Node.js. Experience with MongoDB, PostgreSQL, Docker, and AWS. Knowledge of REST APIs, GraphQL, and microservices.', role_category: 'fullstack', url: 'https://postman.com/jobs/1' },

  // Data engineering roles
  { title: 'Data Engineer', company: 'Flipkart', description: 'Build data pipelines using Python, Apache Spark, and Kafka. Experience with Hadoop, Hive, and AWS S3. Strong knowledge of SQL, ETL processes, and data warehousing.', role_category: 'data', url: 'https://flipkart.com/jobs/3' },
  { title: 'Data Engineer', company: 'Swiggy', description: 'Design and maintain data pipelines with Python and Apache Airflow. Experience with PostgreSQL, Redshift, and Kafka. Knowledge of dbt, Spark, and data modeling.', role_category: 'data', url: 'https://swiggy.com/jobs/3' },
  { title: 'Analytics Engineer', company: 'Razorpay', description: 'Build data infrastructure using Python, dbt, and Redshift. Experience with Airflow, Kafka, and Spark. Strong SQL skills and knowledge of data warehousing patterns.', role_category: 'data', url: 'https://razorpay.com/jobs/3' },
  { title: 'Data Pipeline Engineer', company: 'Meesho', description: 'Develop ETL pipelines with Python and Apache Spark. Experience with Kafka, Airflow, and AWS Glue. Strong knowledge of SQL, data modeling, and performance optimization.', role_category: 'data', url: 'https://meesho.com/jobs/2' },

  // ML/AI roles
  { title: 'Machine Learning Engineer', company: 'Flipkart', description: 'Build ML models for recommendation and search using Python, TensorFlow, and PyTorch. Experience with scikit-learn, pandas, and feature engineering. Knowledge of MLflow and model deployment.', role_category: 'ml', url: 'https://flipkart.com/jobs/4' },
  { title: 'ML Engineer', company: 'Swiggy', description: 'Develop recommendation systems using Python, PyTorch, and scikit-learn. Experience with NLP, computer vision, and model serving with FastAPI. Knowledge of MLflow and Docker.', role_category: 'ml', url: 'https://swiggy.com/jobs/4' },
  { title: 'AI Engineer', company: 'Sarvam AI', description: 'Build LLM-powered products using Python, LangChain, and Hugging Face Transformers. Experience with fine-tuning, RAG pipelines, and vector databases like Pinecone. Knowledge of FastAPI and Docker.', role_category: 'ml', url: 'https://sarvam.ai/jobs/1' },
  { title: 'NLP Engineer', company: 'Jio', description: 'Develop NLP models using Python, spaCy, and Hugging Face. Experience with BERT, text classification, and named entity recognition. Knowledge of FastAPI, Docker, and model optimization.', role_category: 'ml', url: 'https://jio.com/jobs/1' },
  { title: 'Deep Learning Engineer', company: 'Ola Electric', description: 'Build computer vision models using Python, PyTorch, and OpenCV. Experience with CNNs, object detection, and model optimization. Knowledge of CUDA, TensorRT, and deployment.', role_category: 'ml', url: 'https://olaelectric.com/jobs/1' },

  // DevOps roles
  { title: 'DevOps Engineer', company: 'Razorpay', description: 'Manage cloud infrastructure on AWS using Terraform and Kubernetes. Experience with Docker, CI/CD pipelines, and Jenkins. Knowledge of monitoring with Prometheus and Grafana.', role_category: 'devops', url: 'https://razorpay.com/jobs/4' },
  { title: 'Site Reliability Engineer', company: 'Swiggy', description: 'Maintain high-availability systems using Kubernetes, Docker, and AWS. Experience with Terraform, Ansible, and CI/CD. Strong knowledge of monitoring, alerting, and incident response.', role_category: 'devops', url: 'https://swiggy.com/jobs/5' },
  { title: 'Cloud Engineer', company: 'Infosys', description: 'Build cloud infrastructure on AWS and GCP using Terraform. Experience with Kubernetes, Docker, and Jenkins CI/CD. Knowledge of monitoring with CloudWatch and Grafana.', role_category: 'devops', url: 'https://infosys.com/jobs/1' },
  { title: 'Platform Engineer', company: 'PhonePe', description: 'Design and maintain Kubernetes clusters on AWS. Experience with Terraform, Helm, and Docker. Strong knowledge of CI/CD, monitoring with Prometheus, and security best practices.', role_category: 'devops', url: 'https://phonepe.com/jobs/2' },

  // More backend
  { title: 'Go Developer', company: 'Juspay', description: 'Build high-performance payment APIs using Go and PostgreSQL. Experience with Redis, Kafka, and Docker. Strong knowledge of concurrency, system design, and REST APIs.', role_category: 'backend', url: 'https://juspay.in/jobs/1' },
  { title: 'Python Backend Developer', company: 'Hasura', description: 'Build GraphQL APIs using Python FastAPI and PostgreSQL. Experience with Docker, Kubernetes, and AWS. Knowledge of GraphQL, Redis, and microservices architecture.', role_category: 'backend', url: 'https://hasura.io/jobs/1' },
  { title: 'Software Engineer', company: 'Freshworks', description: 'Develop SaaS features using Ruby on Rails and React.js. Experience with PostgreSQL, Redis, and AWS. Strong knowledge of REST APIs, system design, and testing.', role_category: 'fullstack', url: 'https://freshworks.com/jobs/1' },
  { title: 'Backend Engineer', company: 'Chargebee', description: 'Build subscription billing APIs with Java Spring Boot and MySQL. Experience with Redis, Kafka, and AWS. Knowledge of payment integrations and financial systems.', role_category: 'backend', url: 'https://chargebee.com/jobs/1' },
  { title: 'SDE-1', company: 'Amazon', description: 'Build distributed systems using Java and AWS services. Strong DSA skills required. Experience with DynamoDB, S3, Lambda, and microservices. Knowledge of system design and scalability.', role_category: 'backend', url: 'https://amazon.com/jobs/1' },
  { title: 'Software Engineer', company: 'Google', description: 'Develop large-scale systems in C++ and Python. Strong DSA and system design skills required. Experience with distributed systems, Kubernetes, and cloud infrastructure.', role_category: 'backend', url: 'https://google.com/jobs/1' },
  { title: 'SDE', company: 'Microsoft', description: 'Build cloud products using C#, .NET, and Azure. Experience with microservices, Docker, and Kubernetes. Strong knowledge of REST APIs, system design, and distributed systems.', role_category: 'backend', url: 'https://microsoft.com/jobs/1' },
  { title: 'Software Engineer', company: 'Atlassian', description: 'Develop collaboration tools using Java, React.js, and PostgreSQL. Experience with AWS, Docker, and Kubernetes. Knowledge of REST APIs, GraphQL, and microservices.', role_category: 'fullstack', url: 'https://atlassian.com/jobs/1' },
  { title: 'Frontend Engineer', company: 'Notion', description: 'Build rich text editing features with React.js and TypeScript. Experience with WebSockets, IndexedDB, and performance optimization. Knowledge of collaborative editing algorithms.', role_category: 'frontend', url: 'https://notion.so/jobs/1' },
  { title: 'ML Engineer', company: 'Anthropic', description: 'Build and fine-tune large language models using Python and PyTorch. Experience with distributed training, RLHF, and model evaluation. Knowledge of transformer architectures and NLP.', role_category: 'ml', url: 'https://anthropic.com/jobs/1' },
  { title: 'Data Engineer', company: 'Zomato', description: 'Build real-time data pipelines using Python, Kafka, and Apache Flink. Experience with PostgreSQL, ClickHouse, and dbt. Strong SQL skills and knowledge of stream processing.', role_category: 'data', url: 'https://zomato.com/jobs/2' },
  { title: 'Backend Engineer', company: 'Notion', description: 'Build scalable APIs using Node.js, TypeScript, and PostgreSQL. Experience with Redis, WebSockets, and AWS. Knowledge of real-time collaboration and conflict resolution algorithms.', role_category: 'backend', url: 'https://notion.so/jobs/2' },
  { title: 'DevOps Engineer', company: 'Zomato', description: 'Manage Kubernetes infrastructure on GCP using Terraform. Experience with Docker, Helm, and ArgoCD. Knowledge of monitoring with Prometheus, Grafana, and incident management.', role_category: 'devops', url: 'https://zomato.com/jobs/3' }
]

export async function seedDatabase() {
  console.log('[Seed] Starting database seed...')
  let inserted = 0
  let skipped = 0

  for (const job of seedJobs) {
    try {
      await pool.query(
        `INSERT INTO jobs (title, company, description, url, role_category)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (url) DO NOTHING`,
        [job.title, job.company, job.description, job.url, job.role_category]
      )
      inserted++
    } catch (err) {
      skipped++
    }
  }

  console.log(`[Seed] Done — ${inserted} jobs inserted, ${skipped} skipped`)
  return { inserted, skipped }
}