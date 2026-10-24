# Day 12/90 — Docker Compose: Building a Multi-Container Application

## DevOps Winter Arc | Week 2, Day 5

### Project Overview

This project focuses on building and managing a multi-container application using **Docker Compose**.

The objective is to understand how multiple services can be configured, connected, deployed, and managed through a single YAML configuration file.

The application consists of three services:

- **Nginx:** Serves the frontend and acts as a reverse proxy.
- **Node.js:** Provides backend API endpoints.
- **PostgreSQL:** Stores application data.

Docker Compose manages the application services, networking, and persistent storage.

This project builds on previous practical exercises involving Dockerfiles, Docker networking, and Docker volumes.

---

## 1. Project Objectives

The main objectives are to:

1. Understand Docker Compose and its role in container orchestration.
2. Create a multi-container application.
3. Write and configure a `compose.yaml` file.
4. Build a custom Docker image for a Node.js application.
5. Configure Nginx as a reverse proxy.
6. Integrate PostgreSQL with the backend application.
7. Configure communication between containers.
8. Manage application settings using environment variables.
9. Implement persistent database storage using Docker volumes.
10. Explore health checks and service dependencies.
11. Practise troubleshooting containerized applications.
12. Understand how Docker Compose simplifies application deployment.

---

## 2. Technologies Used

| Technology | Purpose |
|---|---|
| Ubuntu Linux | Development environment |
| Docker | Containerization |
| Docker Compose | Multi-container application management |
| Nginx | Frontend web server and reverse proxy |
| Node.js | Backend application runtime |
| Express.js | Backend API framework |
| PostgreSQL | Relational database |
| Docker Networks | Container communication |
| Docker Volumes | Persistent database storage |
| Git | Version control |
| GitHub | Source code repository |

---

## 3. Project Architecture

The application follows a three-tier architecture.

```text
                    USER
                      |
                      |
               localhost:3095
                      |
                      v
             +------------------+
             |                  |
             |  NGINX FRONTEND  |
             |                  |
             |     Port 80      |
             +------------------+
                      |
                      |
                /api/ requests
                      |
                      v
             +------------------+
             |                  |
             |  NODE.JS BACKEND |
             |                  |
             |    Port 3000     |
             +------------------+
                      |
                      |
                SQL Queries
                      |
                      v
             +------------------+
             |                  |
             |    POSTGRESQL    |
             |                  |
             |    Port 5432     |
             +------------------+
                      |
                      v
             +------------------+
             |                  |
             |   DOCKER VOLUME  |
             |                  |
             |  postgres-data   |
             +------------------+
```

### Application Flow

1. A user accesses the application through Nginx.
2. Nginx serves the frontend HTML page.
3. Requests beginning with `/api/` are forwarded to the Node.js backend.
4. The backend communicates with PostgreSQL when database operations are required.
5. PostgreSQL stores its data in a Docker-managed volume.

This architecture separates the application's presentation, business logic, and data layers.

---

## 4. Project Directory Structure

```text
day5-docker-compose/
│
├── compose.yaml
├── .env
├── .env.example
├── .gitignore
├── README.md
│
├── frontend/
│   ├── index.html
│   └── nginx.conf
│
└── backend/
    ├── Dockerfile
    ├── package.json
    └── server.js
```

### File Descriptions

**compose.yaml**

Defines the application services, networks, volumes, environment variables, and service dependencies.

**backend/Dockerfile**

Contains the instructions for building the Node.js application image.

**backend/server.js**

Implements the backend API and PostgreSQL database interactions.

**backend/package.json**

Defines the Node.js application dependencies and startup command.

**frontend/index.html**

Contains the application's frontend interface.

**frontend/nginx.conf**

Configures Nginx to serve the website and forward API requests.

**.env**

Stores local environment variables, including database credentials.

This file must not be committed to GitHub.

**.env.example**

Provides an example of the environment variables required to run the application.

---

## 5. Docker Compose Configuration

Docker Compose allows multiple containers to be defined and managed using a single YAML file.

The project uses three services:

```yaml
services:
  frontend:
    image: nginx:alpine
    ports:
      - "127.0.0.1:3095:80"
    depends_on:
      backend:
        condition: service_started
    networks:
      - frontend-network

  backend:
    build:
      context: ./backend
    depends_on:
      database:
        condition: service_healthy
    networks:
      - frontend-network
      - backend-network

  database:
    image: postgres:16-alpine
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - backend-network

networks:
  frontend-network:
  backend-network:
    internal: true

volumes:
  postgres-data:
```

This excerpt illustrates the service relationships. The complete `compose.yaml` also defines environment variables, frontend file mounts, and the database health check.

### Key Concepts

**Services**

Each service represents a containerized application component.

**Networks**

Docker Compose creates networks that allow connected services to communicate.

**Volumes**

Named volumes provide persistent storage independently of container lifecycles.

**Dependencies**

The `depends_on` configuration controls service startup ordering and can wait for a dependency's health check.

---

## 6. Backend Application

The backend was designed using Node.js and Express.

It exposes three API endpoints.

| Endpoint | Method | Description |
|---|---|---|
| `/api/` | GET | Returns application information |
| `/api/health` | GET | Checks database connectivity |
| `/api/visits` | GET | Records a visit and returns the total count |

### Application Endpoint

```bash
curl http://localhost:3095/api/
```

Expected response:

```json
{
  "message": "Welcome to DevOps Winter Arc!",
  "day": "Day 12/90",
  "topic": "Docker Compose"
}
```

### Database Health Check

```bash
curl http://localhost:3095/api/health
```

Expected response when PostgreSQL is available:

```json
{
  "status": "healthy",
  "database": "connected"
}
```

### Database Operations

```bash
curl http://localhost:3095/api/visits
```

Example response:

```json
{
  "visits": 1
}
```

Each successful request creates a database record and returns the updated count.

---

## 7. Docker Networking

The project uses two Docker networks.

### Frontend Network

Connects:

- Nginx
- Node.js backend

This network enables Nginx to communicate with the backend.

### Backend Network

Connects:

- Node.js backend
- PostgreSQL database

This network is configured as an internal network.

### Service Discovery

Docker Compose provides service-name resolution for containers connected to the same network.

For example, Nginx forwards API requests to:

```nginx
proxy_pass http://backend:3000;
```

The backend connects to PostgreSQL using:

```text
DB_HOST=database
```

This eliminates the need to hardcode container IP addresses.

### Security Consideration

The PostgreSQL service does not publish its database port to the Ubuntu host.

Database communication occurs through the Docker network.

---

## 8. Environment Variables

Environment variables are used to configure database access.

Example `.env` file:

```env
DB_USER=winteruser
DB_PASSWORD=replace_with_a_strong_password
DB_NAME=winterdb
```

The backend uses these variables to connect to PostgreSQL.

### Security Practices

- Avoid hardcoding credentials in application source code.
- Exclude `.env` from version control.
- Provide `.env.example` for documentation.
- Use unique passwords.
- Use dedicated secret-management solutions for production environments.

**Note:** A local `.env` file is suitable for this learning project but is not a complete production secrets-management solution.

---

## 9. Deployment Instructions

### Prerequisites

Ensure the following are available:

- Ubuntu Linux or another Docker-supported operating system.
- Docker Engine.
- Docker Compose v2.
- Git.
- Sufficient disk space for container images and volumes.

### Step 1: Navigate to the Project

```bash
cd ~/winter-arc-week2/day5-docker-compose
```

### Step 2: Configure Environment Variables

Copy the example file:

```bash
cp .env.example .env
```

Edit the credentials:

```bash
nano .env
```

### Step 3: Validate Docker Compose

```bash
sudo docker compose config --quiet
```

This checks the Compose configuration for errors.

### Step 4: Build and Start the Application

```bash
sudo docker compose up -d --build
```

This command builds the backend image and starts the application services.

### Step 5: Verify Running Services

```bash
sudo docker compose ps
```

The following services should be running:

```text
frontend
backend
database
```

### Step 6: View Application Logs

```bash
sudo docker compose logs --tail=30
```

To inspect an individual service:

```bash
sudo docker compose logs backend
```

---

## 10. Application Testing

The following tests are used to validate the deployment.

### Test 1: Frontend Availability

```bash
curl http://localhost:3095
```

Expected result:

The application's HTML page is returned.

### Test 2: Backend API

```bash
curl http://localhost:3095/api/
```

Expected result:

The backend returns application information in JSON format.

### Test 3: Database Connectivity

```bash
curl http://localhost:3095/api/health
```

Expected result:

```json
{
  "status": "healthy",
  "database": "connected"
}
```

### Test 4: Database Persistence

Create database records:

```bash
curl http://localhost:3095/api/visits
```

Run the command several times and record the visit count.

Stop and remove the application containers:

```bash
sudo docker compose down
```

Restart the application:

```bash
sudo docker compose up -d
```

Check the visit count again:

```bash
curl http://localhost:3095/api/visits
```

If the volume is working correctly, the count should continue from its previous value.

**Important:** Do not use `docker compose down -v` during this test because it removes the project's named volumes.

### Verification Checklist

- [ ] Frontend loads successfully.
- [ ] Backend API responds.
- [ ] PostgreSQL health check passes.
- [ ] Visit records are stored.
- [ ] Database records persist after container recreation.
- [ ] Services communicate through Docker networks.
- [ ] Application logs show no unresolved errors.

---

## 11. Container Management

Docker Compose provides commands for managing the application.

### Start Services

```bash
sudo docker compose up -d
```

### Stop Services

```bash
sudo docker compose stop
```

### Restart Services

```bash
sudo docker compose restart
```

### View Running Services

```bash
sudo docker compose ps
```

### View Logs

```bash
sudo docker compose logs -f
```

### Stop and Remove Application Containers

```bash
sudo docker compose down
```

Named volumes are preserved unless explicitly removed.

---

## 12. Troubleshooting

Docker Compose provides tools for identifying and resolving application issues.

### Problem 1: A Container Fails to Start

Inspect service status:

```bash
sudo docker compose ps -a
```

Check logs:

```bash
sudo docker compose logs backend
```

### Problem 2: Backend Cannot Connect to PostgreSQL

Inspect database logs:

```bash
sudo docker compose logs database
```

Verify the database service is healthy:

```bash
sudo docker compose ps
```

Check the configured database hostname and credentials.

### Problem 3: Nginx Returns HTTP 502

A `502 Bad Gateway` response may indicate that Nginx cannot communicate with the backend.

Inspect backend logs:

```bash
sudo docker compose logs backend
```

Check whether the backend service is running:

```bash
sudo docker compose ps backend
```

### Problem 4: Port Already Allocated

Check whether port 3095 is already in use:

```bash
sudo ss -tlnp | grep ':3095'
```

If necessary, configure a different available host port.

### Problem 5: Database Data Is Missing

Inspect Docker volumes:

```bash
sudo docker volume ls
```

Check whether the PostgreSQL volume still exists.

Avoid removing named volumes when persistent data must be retained.

---

## 13. Lessons Learned

### 1. Multi-Container Application Management

Docker Compose simplifies the process of managing applications that require multiple services.

### 2. Declarative Configuration

A Compose file defines the desired application configuration, making deployments easier to reproduce.

### 3. Container Networking

Docker networks enable service-to-service communication without relying on hardcoded IP addresses.

### 4. Persistent Storage

Docker volumes separate persistent application data from container lifecycles.

### 5. Reverse Proxy Configuration

Nginx can serve frontend content and route API requests to backend services.

### 6. Service Dependencies

Health checks and dependency conditions help coordinate application startup.

### 7. Troubleshooting

Container logs, service status, and network inspection commands are essential for diagnosing deployment issues.

---

## 14. Docker Compose vs Individual Docker Commands

| Feature | Docker Commands | Docker Compose |
|---|---|---|
| Container creation | Individual commands | Declarative configuration |
| Multi-container setup | Manual coordination | Single Compose project |
| Networking | Manually configured | Defined in YAML |
| Volumes | Manually configured | Defined in YAML |
| Environment variables | Passed individually | Configured per service |
| Deployment | Multiple commands | `docker compose up` |
| Reproducibility | Depends on scripts and documentation | Configuration stored in version control |

Docker Compose is particularly useful for local development, testing, and applications deployed on a single Docker host.

---

## 15. Future Improvements

Potential improvements include:

- Adding automated API tests.
- Implementing a backend health check.
- Creating a multi-stage Dockerfile.
- Using Docker secrets or an external secrets manager.
- Adding resource limits.
- Improving application logging.
- Introducing database migrations.
- Integrating GitHub Actions for automated builds and testing.
- Publishing application images to a container registry.

---

## 16. Conclusion

Day 12 of the DevOps Winter Arc focuses on understanding how multiple containerized services work together.

By combining Nginx, Node.js, PostgreSQL, Docker networking, and persistent storage, this project demonstrates the fundamentals of deploying a multi-container application.

The project also introduces important DevOps practices, including declarative configuration, service discovery, environment management, application monitoring, and troubleshooting.

These concepts provide a foundation for more advanced container orchestration and deployment workflows.

---

## DevOps Winter Arc Progress

**Day:** 12/90  
**Week:** 2  
**Topic:** Docker Compose — Multi-Container Applications

**Next Topic:** Day 13/90 — Docker Security Best Practices

**Learning Philosophy:**

Learn → Build → Troubleshoot → Repeat.
