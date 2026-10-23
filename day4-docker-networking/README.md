# Day 11/90 — Docker Networking and Persistent Storage

## Project Overview

This project explores Docker networking and persistent storage
through a containerized Nginx web application.

## Objectives

- Create a user-defined Docker bridge network.
- Enable container-to-container communication.
- Understand Docker DNS resolution.
- Create and manage Docker volumes.
- Demonstrate persistent application data.
- Compare Docker volumes and bind mounts.

## Technologies

- Docker
- Nginx
- Alpine Linux
- Ubuntu
- Git and GitHub

## Project Architecture

Ubuntu Host
    |
    |-- Docker Network: winter-network
    |       |
    |       |-- winter-web
    |       |-- winter-client
    |       |-- winter-bind-web
    |
    |-- Docker Volume: winter-web-data
    |
    |-- Host Directory: website/

## Docker Networking

Created a custom bridge network:

docker network create winter-network

Containers on this network can communicate using their names.

## Persistent Storage

Created a Docker volume:

docker volume create winter-web-data

Mounted the volume into an Nginx container to store website files.

## Bind Mounts

Mounted a local Ubuntu directory into another Nginx container.

This allowed changes to the website files to appear without
rebuilding the Docker image.

## Verification

Tests to complete:

- [ ] Container-to-container communication
- [ ] Docker DNS resolution
- [ ] Website accessibility
- [ ] Volume persistence after container recreation
- [ ] Live updates through bind mounts

## Troubleshooting

Encountered the error:

cp: can't stat '/source/index.html': No such file or directory

Resolved it by verifying the host file location and correcting
the bind mount source path.

## Key Lessons

1. User-defined bridge networks support container name resolution.
2. Docker volumes preserve data independently of containers.
3. Bind mounts allow containers to access host files.
4. Containers can communicate without publishing ports to the host.
5. Docker inspection commands help diagnose networking and storage issues.

## Conclusion

This project demonstrates fundamental Docker networking and
storage concepts used in containerized application environments.
