# Welcome to the backend of this project
Since Github Wiki is a paid feature for private repos, this file will contain docs on the API

# Endpoints Overview

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

### File Management

Upload a file:
```
POST /api/v1/files
```
Download a file:
```
GET /api/v1/files/{fileId}
```
Get file metadata:
```
GET /api/v1/files/{fileId}/meta
```
Get metadata of all user-owned files:
```
GET /api/v1/files/meta
```
Delete file:
```
DELETE /api/v1/resumes/{fileId}
```

### Interview Sessions

Start an interview session:
```
POST /api/v1/interviews
```
Get interview session details:
```
GET /api/v1/interviews/{interviewId}
```

<!--PATCH /interviews/{interviewId}-->
Send a message and receive a reply:
```
POST /api/v1/interviews/{interviewId}/message
```

### Feedback

Get feedback on a resume:
```
GET /api/v1/feedback/resumes/{fileId}
```

# File Management

## Upload File
Upload a file to the server. Allowed types: .pdf

### Authentication
Required

### URL
POST `/api/v1/files`

### Request Form
|Parameter|Type|Description|Requirement|
|---|---|---|---|
|file|file|A file to upload|Required|


### Response Parameters
|Parameter|Type|Description|
|---|---|---|
|fileId|string|An ID of uploaded file|


## Download File
Download a file from the server. Will return 404 if not authorized

### Authentication
Required

### URL
GET `/api/v1/files/{fileId}`

### Request Data
|Parameter|Type|Description|Requirement|
|---|---|---|---|
|fileId|string|An id of a requested file|Required|


### Response
|Parameter|Type|Description|
|---|---|---|
|---|---|---|
