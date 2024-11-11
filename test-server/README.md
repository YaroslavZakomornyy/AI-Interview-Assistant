# Welcome to the backend of this project
Since Github Wiki is a paid feature for private repos, this file will contain docs on the API

## Endpoints Overview

### Authentication WIP
```
POST /auth/register
POST /auth/login
```

### User Management WIP
```
GET /users/{userId}
PUT /users/{userId}
DELETE /users/{userId}
```

### Resume Management

Upload file:
```
POST api/v1/resumes/
```
Download file:
```
GET api/v1/files/{fileId}
```
Get file metadata:
```
GET api/v1/resumes/{fileId}/meta
```
Get metadata of all user-owned files:
```
GET api/v1/files
```
Delete file:
```
DELETE api/v1/resumes/{fileId}
```

### Interview Sessions

POST /interviews
GET /interviews/{interviewId}
PATCH /interviews/{interviewId}
POST /interviews/{interviewId}/responses
GET /interviews/{interviewId}/transcript

### Feedback
GET /interviews/{interviewId}/feedback
GET /resumes/{resumeId}/critique
