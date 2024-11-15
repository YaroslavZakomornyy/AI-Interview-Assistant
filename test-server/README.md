# Overview
This is the API that powers our platform

# Endpoints
# File Management

## Upload a file
Upload a file to the server. Allowed types: .pdf

- **URL:** `/api/v1/files`
- **Method:** `POST`
- **Headers:**
  - `x-user-id`: `<userId>` required
- **Body:** `multipart/form-data`
  - `file`: The file to upload. Supported formats: `.pdf`. Size limit: 1MB.

### Request Parameters
|Parameter|Type|Description|Requirement|
|---|---|---|---|
|`file`|`multipart/form-data`|A file to upload. Supported formats: `.pdf`. Size limit: 1MB.|Required|

### Example Request

```
axios.post('localhost:3000/api/v1/files', formData, {
  headers: {
    'x-user-id': '<userId>',
    ...formData.getHeaders() // Sets Content-Type to multipart/form-data
  }
})
```

### Response Parameters
|Parameter|Type|Description|
|---|---|---|
|`fileId`|`string`| An ID of the uploaded file.|

### Example Response
```
{
  fileId: "12345678"
}
```

### Response status codes
|Status Code | Error | Description|
|---|---|---|
|201|`Created`|File successfully uploaded.|
|400|`Bad Request`|Invalid or missing parameters.|
|401|`Unauthorized`|Missing or invalid authentication token.|
|413|`Payload Too Large`|The provided content is too large.|
|500|`Server Error`|An error occured on the server.|


## Get files metadata
Returns metadata of all files owned by user.

- **URL:** `/api/v1/files/meta`
- **Method:** `GET`
- **Headers:**
  - `x-user-id`: `<userId>` required

### Request Parameters
|Parameter|Type|Description|Requirement|
|---|---|---|---|
|`type`|`string`|Type of the requested file. Can be `resume` or `transcript`.|Optional|

### Example Request

```
axios.get('localhost:3000/api/v1/files/meta?type=resume', {
  headers: {
    'x-user-id': '<userId>'
  }
})
```

### Response Parameters
|Parameter|Type|Description|
|---|---|---|
|`fileName`|`string`| Name of the file.|
|`type`|`string`| Type of the file.|
|`fileId`|`string`| ID of the file.|
|`uploadedAt`|`string`| Timestamp of the time the file was uploaded.|

### Example Response
```
[
  {
    "fileName": "file.pdf",
    "type": "resume",
    "fileId": "5fe303ba-317d-4819-b57e-1425e2eb5532",
    "uploadedAt": "2024-11-14T19:45:35.726Z"
  },
  {
    "fileName": "file.pdf",
    "type": "resume",
    "fileId": "00054939-76b0-417f-9a64-c6df2976b3aa",
    "uploadedAt": "2024-11-14T19:36:37.717Z"
  },
]
```

### Response status codes
|Status Code | Status | Description|
|---|---|---|
|200|`OK`|Data received successfully.|
|401|`Unauthorized`|Missing or invalid authentication token.|
|500|`Server Error`|An error occured on the server.|



## Download file
Returns the requested file.

- **URL:** `/api/v1/files/{fileId}`
- **Method:** `GET`
- **Headers:**
  - `x-user-id`: `<userId>` required

### Request Parameters
|Parameter|Type|Description|Requirement|
|---|---|---|---|
|`fileId`|`string`|Id of the file to download|Required|

### Example Request

```
axios.get('localhost:3000/api/v1/files/5fe303ba-317d-4819-b57e-1425e2eb5532', {
  headers: {
    'x-user-id': '<userId>'
  }
})
```

### Response Parameters
|Parameter|Type|Description|
|---|---|---|
|`file`|`multipart/form-data`| The requested file |


### Response status codes
|Status Code | Status | Description|
|---|---|---|
|200|`OK`|Data received successfully.|
|401|`Unauthorized`|Missing or invalid authentication token.|
|404|`Not Found`|File not found.|
|500|`Server Error`|An error occured on the server.|
