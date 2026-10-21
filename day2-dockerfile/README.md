Day 09/90 — Dockerfile Deep Dive
90-Day DevOps Winter Arc | Week 2, Day 2
Project Overview
This project demonstrates how to package a small Node.js HTTP API into a reusable Docker image, configure it with environment variables, inspect image layers, and understand Docker build caching. It also includes a practical comparison of CMD and ENTRYPOINT.
Status: Learning project. Run the verification commands and record your actual results before marking tasks complete.

Learning Objectives
- Write and explain a Dockerfile using FROM, WORKDIR, ARG, ENV, COPY, RUN, EXPOSE, USER, and CMD.
- Build and run a Node.js application in a Docker container.
- Change runtime configuration without rebuilding the image.
- Use .dockerignore to reduce build context and avoid copying sensitive files.
- Demonstrate layer caching by rebuilding after source and dependency changes.
- Compare CMD with ENTRYPOINT.
- Inspect logs, container state, published ports, and the running user.
Architecture
Client / curl on Ubuntu VM
        |
        | http://127.0.0.1:3090
        v
Docker host port 3090
        |
        | published to container port 3000
        v
+----------------------------------+
| Docker container: winter-arc-api  |
| Node.js HTTP server               |
| GET /        -> app information   |
| GET /health  -> health response   |
| Other paths -> HTTP 404           |
+----------------------------------+
The application listens on 0.0.0.0:3000 inside the container, while Docker publishes it on 127.0.0.1:3090 on the host. Binding the published port to loopback keeps the demo local to the VM.
Repository Structure
winter-arc-week2/
└── day2-dockerfile/
    ├── server.js
    ├── package.json
    ├── package-lock.json
    ├── Dockerfile
    ├── Dockerfile.entrypoint
    ├── .dockerignore
    ├── .env.example
    └── README.md
Application Code
server.js
const http = require("http");

const PORT = Number(process.env.PORT || 3000);
const GREETING = process.env.GREETING || "Hello from Docker!";
const APP_ENV = process.env.APP_ENV || "development";

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");

  if (req.url === "/health") {
    res.writeHead(200);
    return res.end(JSON.stringify({
      status: "healthy",
      service: "winter-arc-api"
    }));
  }

  if (req.url === "/") {
    res.writeHead(200);
    return res.end(JSON.stringify({
      message: GREETING,
      environment: APP_ENV,
      version: process.env.APP_VERSION || "1.0.0"
    }));
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: "Not Found" }));
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Application running on port ${PORT}`);
});
package.json
{
  "name": "winter-arc-docker-api",
  "version": "1.0.0",
  "description": "Week 2 Day 2 Dockerfile project",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "license": "MIT"
}
Generate package-lock.json with npm install --package-lock-only (or with a temporary Node container if npm is not installed locally). This application uses Node.js built-in modules and has no external runtime dependencies.
Dockerfile
FROM node:22-alpine

WORKDIR /app

ARG APP_VERSION=1.0.0

ENV PORT=3000 \
    APP_ENV=development \
    APP_VERSION=${APP_VERSION}

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY server.js ./

EXPOSE 3000
USER node
CMD ["node", "server.js"]
Dockerfile Instruction Reference
Instruction	What it does	Why it matters
FROM	Selects a base image	Supplies the Node.js runtime
WORKDIR	Sets the working directory	Keeps application files under /app
ARG	Declares a build-time argument	Allows the build version to be supplied
ENV	Sets runtime environment variables	Configures the application
COPY	Copies files from the build context	Adds dependency metadata and source
RUN	Executes commands while building	Installs dependencies from the lockfile
EXPOSE	Documents a container port	Does not publish it to the host
USER	Selects the runtime user	Avoids running the app as root
CMD	Defines the default start command	Starts the Node.js server


For a real production release, consider pinning the base image to a tested digest and regularly updating it for security fixes.
.dockerignore
node_modules
npm-debug.log
.git
.gitignore
.env
.env.*
!.env.example
*.log
README.md
screenshots/
This reduces unnecessary build context and helps prevent accidental inclusion of local configuration or secrets. Do not place secrets in Dockerfile ARG or ENV values.
Prerequisites
- Ubuntu VM with a functioning Docker Engine.
- Enough free disk space for the Node.js image and build cache.
- Git for source control.
- curl for testing.
Verify:
docker --version
docker info
docker system df
df -h
If docker.service cannot be found, verify that Docker Engine is installed and configured before attempting to build images.
Build the Image
From day2-dockerfile/:
# Generate lockfile if needed
npm install --package-lock-only

# Build the image
docker build -t winter-arc-api:v1 --build-arg APP_VERSION=1.0.0 .

# Inspect images and image metadata
docker images winter-arc-api
docker image inspect winter-arc-api:v1
If you do not have npm on the host, you can generate the lockfile with:
docker run --rm -v "$PWD":/app -w /app node:22-alpine npm install --package-lock-only
Run and Test
Check that host port 3090 is available, then run:
sudo ss -tlnp | grep ':3090' || true

docker run -d \
  --name winter-arc-api \
  -p 127.0.0.1:3090:3000 \
  winter-arc-api:v1

docker ps
docker logs winter-arc-api
Home endpoint
curl -i http://127.0.0.1:3090/
Expected HTTP 200 response body:
{"message":"Hello from Docker!","environment":"development","version":"1.0.0"}
Health endpoint
curl -i http://127.0.0.1:3090/health
Expected HTTP 200 response body:
{"status":"healthy","service":"winter-arc-api"}
Unknown route
curl -i http://127.0.0.1:3090/unknown
Expected: HTTP 404 with {"error":"Not Found"}.
Verify the runtime user
docker exec winter-arc-api id
Expected: a non-zero UID, because the Dockerfile specifies USER node.
Runtime Environment Variables
Remove the test container and start a new one with overrides:
docker rm -f winter-arc-api

docker run -d \
  --name winter-arc-api \
  -p 127.0.0.1:3090:3000 \
  -e GREETING="Welcome to my DevOps Winter Arc!" \
  -e APP_ENV=production \
  winter-arc-api:v1

curl http://127.0.0.1:3090/
The greeting and environment should change without rebuilding the image.
Using an environment file
Create .env.example:
PORT=3000
APP_ENV=staging
GREETING=Hello from the staging environment
cp .env.example .env
docker rm -f winter-arc-api

docker run -d \
  --name winter-arc-api \
  -p 127.0.0.1:3090:3000 \
  --env-file .env \
  winter-arc-api:v1

curl http://127.0.0.1:3090/
Keep .env out of Git with a repository-level .gitignore rule. Do not store actual secrets in this learning exercise.
Docker Layer Caching Experiment
The Dockerfile copies package.json and package-lock.json before server.js. This allows Docker to reuse the dependency installation layer when only application code changes.
1. Build once:
   docker build --progress=plain -t winter-arc-api:v1 .
2. Change only the default greeting in server.js, then rebuild:
   docker build --progress=plain -t winter-arc-api:v2 .
3. Inspect the build output for CACHED on the dependency installation step.
4. Change the version in package.json, regenerate package-lock.json, and rebuild:
   npm install --package-lock-only
   docker build --progress=plain -t winter-arc-api:v3 .
5. Compare the build logs. Changing dependency metadata normally invalidates the relevant cached COPY and RUN steps.
Record your actual observations:
Experiment	Expected observation	Actual observation
First build	Dependency step executes	Pending
Source-only change	Dependency step can be cached	Pending
Dependency metadata change	Dependency step rebuilds	Pending


Inspect layers with:
docker history winter-arc-api:v2
CMD vs ENTRYPOINT Experiment
Create Dockerfile.entrypoint:
FROM alpine:3.20
ENTRYPOINT ["echo", "Hello"]
CMD ["World"]
Build and run:
docker build -f Dockerfile.entrypoint -t winter-arc-greeter:v1 .
docker run --rm winter-arc-greeter:v1
docker run --rm winter-arc-greeter:v1 DevOps
Expected output:
Hello World
Hello DevOps
Key distinction: ENTRYPOINT sets the executable; CMD supplies defaults that can be overridden by arguments after the image name.
Troubleshooting
Symptom	Investigation	Possible explanation
docker.service not found	docker --version, systemctl list-unit-files, package checks	Docker Engine may be missing or managed differently
Docker permission denied	docker info, socket/group inspection	User may lack access to Docker daemon
Host port already allocated	sudo ss -tlnp | grep ':3090', docker ps	Another process/container is using the port
Container exits immediately	docker ps -a, docker logs winter-arc-api	Application startup failure
curl connection refused	docker ps, docker logs, inspect port mapping	Container not running or incorrect port
HTTP 404	Test / and /health; inspect routes	Requested path is not implemented
Updated code not visible	Inspect image tag and container	Old container is still running an earlier image
Build fails at npm ci	Check lockfile and package metadata	Missing or inconsistent package-lock.json


Incident Log
Observed issue: Unit docker.service could not be found.

Context: Encountered during initial Week 2 Docker environment checks.

Investigation: Pending confirmation of installed Docker CLI/Engine packages and service management.

Root cause: Not yet verified.

Resolution: Not yet verified.

Verification evidence: Add actual output from docker info and docker run --rm hello-world after resolving the issue.
Completion Checklist
- [ ] Docker Engine verified and working
- [ ] server.js, package.json, and lockfile created
- [ ] Docker image builds successfully
- [ ] / returns HTTP 200
- [ ] /health returns HTTP 200
- [ ] Unknown path returns HTTP 404
- [ ] Runtime environment variable overrides tested
- [ ] .env.example documented; real .env excluded from Git
- [ ] Build cache behaviour recorded
- [ ] CMD and ENTRYPOINT experiment completed
- [ ] Container confirmed to run as non-root
- [ ] Changes committed and pushed to GitHub
Interview Questions
1. What is the purpose of a Dockerfile?
2. How do RUN, CMD, and ENTRYPOINT differ?
3. What is the difference between ARG and ENV?
4. Does EXPOSE publish a port?
5. Why copy dependency files before source code?
6. What is the purpose of .dockerignore?
7. Why run applications as a non-root user?
8. How would you troubleshoot a container that exits immediately?
Lessons Learned
- A Dockerfile makes an application's runtime environment reproducible.
- Image build-time instructions differ from container runtime configuration.
- Dependency-first ordering can speed up repeated builds through caching.
- Container health should be tested through real HTTP requests, not assumed from docker ps alone.
- Docker logs, container inspection, and port checks are core troubleshooting tools.
- Running as a non-root user is a useful security baseline, though not a complete security strategy.
Learning workflow: Learn → Build → Test → Break → Troubleshoot → Document → Repeat.
Git Workflow
From the repository root:
cd ~/winter-arc-week2
git add day2-dockerfile/
git commit -m "docs: document Day 2 Dockerfile deep dive"
git push origin main
