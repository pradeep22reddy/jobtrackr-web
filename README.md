# JobTrackr

A full-stack job application tracker that helps users organize applications, monitor interview progress, and manage their job search in one private dashboard.

**Live Demo:** https://jobtrackr-web-three.vercel.app  
**Backend Repository:** https://github.com/pradeep22reddy/jobtrackr-api

## Features

- User registration and login
- JWT-based authentication
- Private user dashboards—each user can access only their own applications
- Create, view, update, and delete job applications
- Application status workflow:
  - Saved
  - Applied
  - Interview
  - Offer
  - Rejected
- Dashboard counts for job-search progress
- Status filter
- Responsive React user interface
- Cloud deployment

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, JavaScript, CSS |
| Backend | Java 25, Spring Boot, Spring Security |
| Authentication | JWT, BCrypt password hashing |
| Database | PostgreSQL, Spring Data JPA, Hibernate |
| API Testing | Postman |
| Deployment | Vercel, Render |
| Version Control | Git and GitHub |

## Architecture

```text
React frontend (Vercel)
        ↓ JWT authorization header
Spring Boot REST API (Render)
        ↓
PostgreSQL database (Render)
