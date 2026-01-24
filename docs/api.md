# Feedback Pulse API Documentation

Base URL: `https://feedbackpulse.onrender.com`
## Authentication

All protected endpoints require a JWT token in the Authorization header:
Authorization: Bearer <token>

## Auth Endpoints

### POST /api/auth/signup

Creates a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "clxxxxxxxxxxxxxx",
      "email": "user@example.com"
    }
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "A user with this email already exists"
}
```

---

### POST /api/auth/login

Authenticates a user and returns a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "clxxxxxxxxxxxxxx",
      "email": "user@example.com"
    }
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

---

### GET /api/auth/me

Returns the current authenticated user's information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clxxxxxxxxxxxxxx",
    "email": "user@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## Project Endpoints

### POST /api/projects

Creates a new project for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "My Website"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "clxxxxxxxxxxxxxx",
    "name": "My Website",
    "projectKey": "fp_aBcDeFgHiJ",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "feedbackCount": 0,
    "embedSnippet": "<script src=\"https://feedbackpulse.onrender.com/widget.js?key=fp_aBcDeFgHiJ\" async></script>"
  }
}
```

---

### GET /api/projects

Lists all projects for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clxxxxxxxxxxxxxx",
      "name": "My Website",
      "projectKey": "fp_aBcDeFgHiJ",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "feedbackCount": 15
    }
  ]
}
```

---

### GET /api/projects/:projectId

Gets a single project by ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clxxxxxxxxxxxxxx",
    "name": "My Website",
    "projectKey": "fp_aBcDeFgHiJ",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "feedbackCount": 15,
    "widgetIcon": "chat",
    "widgetText": "Feedback",
    "widgetPrimary": "#2563EB",
    "widgetTextColor": "#FFFFFF",
    "widgetBackground": "#FFFFFF",
    "widgetPosition": "bottom-right",
    "customIconUrl": null,
    "allowedDomains": null,
    "embedSnippet": "<script src=\"https://feedbackpulse.onrender.com/widget.js?key=fp_aBcDeFgHiJ\" async></script>"
  }
}
```

---

### PUT /api/projects/:projectId

Updates a project's settings (widget appearance, domains, webhooks).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body (all fields optional):**
```json
{
  "name": "Updated Website Name",
  "widgetIcon": "star",
  "widgetText": "Send Feedback",
  "widgetPrimary": "#10B981",
  "widgetTextColor": "#FFFFFF",
  "widgetBackground": "#1F2937",
  "widgetPosition": "bottom-left",
  "allowedDomains": "example.com, myapp.netlify.app",
  "customIconUrl": "https://yoursite.com/icon.png",
  "webhookUrl": "https://your-server.com/webhook",
  "webhookEnabled": true
}
```

**Widget Icon Options:** `chat`, `mail`, `question`, `star`, `settings`, `thumbsUp`, `envelope`, `info`

**Widget Position Options:** `top-left`, `top-right`, `bottom-left`, `bottom-right`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clxxxxxxxxxxxxxx",
    "name": "Updated Website Name",
    "projectKey": "fp_aBcDeFgHiJ",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "feedbackCount": 15,
    "widgetIcon": "star",
    "widgetText": "Send Feedback",
    "widgetPrimary": "#10B981",
    "widgetTextColor": "#FFFFFF",
    "widgetBackground": "#1F2937",
    "widgetPosition": "bottom-left",
    "customIconUrl": "https://yoursite.com/icon.png",
    "allowedDomains": "example.com, myapp.netlify.app",
    "embedSnippet": "<script src=\"https://feedbackpulse.onrender.com/widget.js?key=fp_aBcDeFgHiJ&icon=star&...\" async></script>"
  }
}
```

---

### POST /api/projects/:projectId/regenerate-key

Regenerates the project's API key. **Warning:** This will invalidate the old key immediately.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Project key regenerated successfully. Please update your embed snippet.",
  "data": {
    "id": "clxxxxxxxxxxxxxx",
    "name": "My Website",
    "projectKey": "fp_NewKeyHere",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "feedbackCount": 15,
    "embedSnippet": "<script src=\"https://feedbackpulse.onrender.com/widget.js?key=fp_NewKeyHere\" async></script>"
  }
}
```

---

## Feedback Endpoints

### GET /api/projects/:projectId/feedback

Gets paginated feedback for a project with optional filtering.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type   | Default | Description                              |
|-----------|--------|---------|------------------------------------------|
| page      | number | 1       | Page number                              |
| limit     | number | 10      | Items per page (max 100)                 |
| type      | string | All     | Filter by type: All, Bug, Feature, Other |

**Example Request:**
```
GET /api/projects/clxxxxxx/feedback?page=1&limit=10&type=Bug
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clxxxxxxxxxxxxxx",
      "type": "Bug",
      "message": "The login button does not work on mobile",
      "sentiment": "negative",
      "createdAt": "2024-01-15T12:00:00.000Z",
      "labels": [
        {
          "id": "clxxxxxxxxxxxxxx",
          "label": "mobile",
          "createdAt": "2024-01-15T12:05:00.000Z"
        }
      ]
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 25,
  "totalPages": 3
}
```

---

### POST /api/public/report

Submits feedback from the widget. This is a **public endpoint** that doesn't require authentication.

**Request Body:**
```json
{
  "projectKey": "fp_aBcDeFgHiJ",
  "type": "Bug",
  "message": "The login button does not work on mobile"
}
```

**Type Options:** `Bug`, `Feature`, `Other`

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "clxxxxxxxxxxxxxx",
    "type": "Bug",
    "message": "The login button does not work on mobile",
    "sentiment": null,
    "createdAt": "2024-01-15T12:00:00.000Z",
    "labels": []
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Invalid project key"
}
```

---

## Label Endpoints

### POST /api/feedback/:feedbackId/labels

Adds a label to a feedback item.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "label": "urgent"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "clxxxxxxxxxxxxxx",
    "label": "urgent",
    "createdAt": "2024-01-15T12:10:00.000Z"
  }
}
```

---

### DELETE /api/feedback/:feedbackId/labels/:labelId

Removes a label from a feedback item.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Label removed successfully"
}
```

---

### GET /api/feedback/:feedbackId/labels

Gets all labels for a feedback item.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clxxxxxxxxxxxxxx",
      "label": "urgent",
      "createdAt": "2024-01-15T12:10:00.000Z"
    },
    {
      "id": "clxxxxxxxxxxxxxx",
      "label": "mobile",
      "createdAt": "2024-01-15T12:05:00.000Z"
    }
  ]
}
```

---

## Sentiment Analysis Endpoint

### POST /api/feedback/:feedbackId/sentiment

Analyzes the sentiment of a feedback message using Gemini AI.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "feedbackId": "clxxxxxxxxxxxxxx",
    "sentiment": "negative",
    "feedback": {
      "id": "clxxxxxxxxxxxxxx",
      "type": "Bug",
      "message": "The login button does not work on mobile",
      "sentiment": "negative",
      "createdAt": "2024-01-15T12:00:00.000Z",
      "labels": []
    }
  }
}
```

**Sentiment Values:** `positive`, `neutral`, `negative`

---

### DELETE /api/feedback/:feedbackId

Deletes a feedback item. User must own the project that the feedback belongs to.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Feedback deleted successfully"
}
```

---

### DELETE /api/projects/:projectId

Deletes a project and all associated feedback. User must own the project.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

---

### DELETE /api/projects/:projectId/feedback/all

Deletes all feedback for a project. User must own the project.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "deleted": true,
    "count": 42
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Project not found"
}
```

---

## Webhook Endpoints

Webhooks allow you to receive real-time notifications when new feedback is submitted.

### GET /api/projects/:projectId/webhook

Gets the webhook configuration for a project.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "webhookUrl": "https://your-server.com/webhook",
    "webhookEnabled": true,
    "webhookSecret": "whsec_xxxxxxxxxxxxx"
  }
}
```

---

### PUT /api/projects/:projectId/webhook

Updates the webhook configuration for a project.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "webhookUrl": "https://your-server.com/webhook",
  "webhookEnabled": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "webhookUrl": "https://your-server.com/webhook",
    "webhookEnabled": true,
    "webhookSecret": "whsec_xxxxxxxxxxxxx"
  }
}
```

---

### POST /api/projects/:projectId/webhook/regenerate-secret

Regenerates the webhook secret for signature verification.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "webhookSecret": "whsec_newSecretHere"
  }
}
```

---

### POST /api/projects/:projectId/webhook/test

Sends a test webhook payload to verify your endpoint is working.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Test webhook sent successfully"
}
```

### Webhook Payload

When feedback is submitted, your webhook endpoint will receive a POST request with the following payload:

```json
{
  "event": "feedback.created",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "data": {
    "id": "clxxxxxxxxxxxxxx",
    "type": "Bug",
    "message": "The login button does not work on mobile",
    "projectId": "clxxxxxxxxxxxxxx",
    "createdAt": "2024-01-15T12:00:00.000Z"
  }
}
```

### Webhook Signature Verification

All webhooks include an `X-Webhook-Signature` header containing an HMAC-SHA256 signature. Verify it using your webhook secret:

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  return signature === expectedSignature;
}
```

---

## Widget Endpoint

### GET /widget.js?key=PROJECT_KEY

Serves the JavaScript widget file for embedding on external websites.

**Query Parameters:**
| Parameter | Type   | Required | Description         |
|-----------|--------|----------|---------------------|
| key       | string | Yes      | The project key     |

**Response:**
- Content-Type: `application/javascript`
- Returns the widget JavaScript code if the project key is valid
- Returns an error console.log if the key is invalid

---

## Health Check

### GET /health

Returns the server health status.

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development"
}
```

---

## Error Responses

All endpoints may return the following error formats:

**Validation Error (400):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

**Authentication Error (401):**
```json
{
  "success": false,
  "error": "Authentication required. Please provide a valid token."
}
```

**Not Found Error (404):**
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**Server Error (500):**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## CORS Configuration

- **Public Routes** (`/widget.js`, `/api/public/*`): Allow all origins for cross-domain widget usage
- **Protected Routes** (`/api/auth/*`, `/api/projects/*`, `/api/feedback/*`): Restricted to frontend origin defined in `FRONTEND_URL` environment variable
