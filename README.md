# GitHub OAuth Authentication Routes

These endpoints allow you to authenticate users via GitHub OAuth and retrieve their GitHub profile information.

## Endpoints

### 1. Exchange GitHub Authorization Code for Access Token

**GET /auth/github/token**  

**Purpose:**  
Exchanges a GitHub authorization code for an access token.

**Query Parameters:**
- `code` (required): The authorization code received from GitHub's OAuth redirect.

**Success Response (200):**
```json
{
  "access_token": "gho_xxxxxxxxxxxxxxxxxxxx",
  "token_type": "bearer",
  "scope": "user:email"
}
```

### 2. Get User Data
**GET /auth/github/user**

**Purpose:**
Retrieves the authenticated user's GitHub profile information.

**Headers:**
`Authorization` (required): Bearer token from the previous endpoint.
Format: `Bearer your_access_token_here`

**Success Response (200):**
```json
{
  "id": 12345678,
  "login": "username",
  "name": "User Name",
  "email": "user@example.com",
  "avatar_url": "https://avatars.githubusercontent.com/u/12345678",
  "html_url": "https://github.com/username"
}

