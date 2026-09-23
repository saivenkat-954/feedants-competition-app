# Feedants Competition App

A full-stack competition details and registration application built with React Native, Node.js, Express, and MongoDB.

The application provides a dynamic competition experience with registration, participant capacity tracking, competition lifecycle management, submission handling, and backend validation.

## Features

- Dynamic competition details from MongoDB
- Competition title, category, tags, prizes, entry fee and participant capacity
- Real-time registration countdown
- Registration lifecycle management
- User registration with duplicate-registration protection
- Remaining participant/spot calculation
- Judge and previous winner information
- Important competition dates
- Rewards and judging information
- Submission lifecycle handling
- Submission status tracking
- File selection using Expo Document Picker
- Backend validation for registration and submission
- MongoDB persistence
- REST API architecture
- Responsive React Native UI
- Environment-based configuration

## Tech Stack

### Frontend

- React Native
- Expo
- TypeScript
- Axios
- Expo Document Picker

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Helmet
- CORS
- Morgan

## Project Structure

```text
feedants-competition-app/
│
├── mobile/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── services/
│   │   │   └── api.ts
│   │   └── utils/
│   │       ├── competitionStatus.ts
│   │       └── countdown.ts
│   ├── assets/
│   ├── app.json
│   ├── package.json
│   └── .env.example
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   ├── competitionController.js
│   │   │   └── submissionController.js
│   │   ├── models/
│   │   │   ├── Competition.js
│   │   │   ├── Registration.js
│   │   │   └── Submission.js
│   │   ├── routes/
│   │   │   ├── competitionRoutes.js
│   │   │   └── submissionRoutes.js
│   │   ├── app.js
│   │   └── seed.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── .gitignore
Competition Lifecycle

The competition follows a time-based lifecycle:

UPCOMING
    ↓
REGISTRATION_OPEN
    ↓
REGISTRATION_CLOSED
    ↓
SUBMISSION_OPEN
    ↓
SUBMISSION_CLOSED
    ↓
RESULTS

The frontend calculates the current lifecycle from the competition dates instead of relying only on a static UI state.

Countdown values are recalculated dynamically so the displayed timer changes continuously.

Registration Flow

When a participant registers:

The frontend sends the user ID to the backend.
The backend validates the competition.
Registration dates are checked.
Existing registration is checked.
Participant capacity is checked.
The registration is stored in MongoDB.
The participant count is incremented.
The frontend updates the registered state.

Registration records use a unique compound index:

competition + userId

This prevents the same participant from being registered more than once for the same competition.

Submission Flow

During the submission window:

User
 ↓
Upload Submission
 ↓
Select File
 ↓
Frontend validation
 ↓
Backend validation
 ↓
Registration verification
 ↓
Duplicate submission verification
 ↓
Submission stored in MongoDB

Only registered participants can submit an entry.

A unique compound index on:

competition + userId

ensures that a participant cannot create multiple submissions for the same competition.

MongoDB Models
Competition

Stores:

Competition information
Category
Tags
Prize pool
Entry fee
Participant capacity
Registration dates
Submission dates
Result date
Judge information
Rewards
Previous winners
Description
Judging parameters
Rules
Competition status
Registration

Stores:

Competition reference
User ID
Registration status
Registration timestamp
Submission

Stores:

Competition reference
User ID
Submitted file name
File reference/URI
Submission status
Submission timestamp
API Endpoints
Health Check
GET /api/health
Get Competition
GET /api/competitions/:id
Register
POST /api/competitions/:id/register

Request body:

{
  "userId": "user_002"
}
Registration Status
GET /api/competitions/:id/registration-status?userId=user_002
Submit Entry
POST /api/competitions/:id/submit

Request body:

{
  "userId": "user_002",
  "fileName": "dance-entry.mp4",
  "fileUrl": "file-uri"
}
Submission Status
GET /api/competitions/:id/submission-status?userId=user_002
Environment Configuration
Mobile

Create:

mobile/.env

using:

EXPO_PUBLIC_COMPETITION_ID=your_competition_id
Server

Create:

server/.env

using:

PORT=5000
MONGODB_URI=your_mongodb_connection_string

Environment files containing credentials are intentionally excluded from Git.

Installation
Clone the repository
git clone https://github.com/saivenkat-954/feedants-competition-app.git
cd feedants-competition-app
Backend
cd server
npm install

Create the .env file and configure MongoDB.

Start the server:

npm run dev

The API runs on:

http://localhost:5000
Seed Competition Data

From the server directory:

node src/seed.js
Frontend

Open another terminal:

cd mobile
npm install

Create the mobile .env file.

Start Expo:

npx expo start

For a clean Expo start:

npx expo start -c
Important Development Note

The mobile API currently uses:

http://localhost:5000/api

When running the application on a physical device, localhost refers to the device itself rather than the development computer.

For physical-device testing, the API base URL should therefore be changed to the development machine's local network IP address.

For example:

http://192.168.x.x:5000/api
Technical Decisions
Dynamic lifecycle calculation

Competition state is calculated from registration, submission and result dates.

This avoids hardcoding UI states and allows the same screen to transition automatically as time progresses.

Separate registration and submission models

Registration and submission represent different business operations, so they are persisted independently.

This makes the data model easier to extend with future features such as:

Submission reviews
Judging
Withdrawal
Submission history
Participant analytics
Unique database constraints

Registration and submission collections use compound uniqueness based on:

competition + userId

This adds database-level protection against duplicate records.

Backend validation

Important business rules are enforced by the backend rather than relying only on frontend state.

Examples include:

Registration window validation
Submission window validation
Registration requirement
Capacity validation
Duplicate registration protection
Duplicate submission protection
Trade-offs
File storage

The current submission implementation stores the selected file reference/URI rather than implementing a production cloud-storage pipeline.

This keeps the assignment implementation focused on the required competition and submission workflow.

For production, files should be uploaded to a dedicated object-storage service and the resulting secure URL should be stored in MongoDB.

Authentication

The current implementation uses a user ID for demonstrating registration and submission flows.

A production application should replace this with authenticated users and protected API endpoints.

Payment

The entry fee is displayed as part of the competition details.

A complete production payment flow would require payment gateway integration, transaction verification, webhook handling and payment reconciliation.

Production Improvements

Future production improvements could include:

JWT/session-based authentication
Cloud file storage
Secure signed upload URLs
Payment gateway integration
Submission moderation
Judge dashboards
Automated judging workflows
Notifications and reminders
Rate limiting
Request validation with a schema validation library
API documentation
Automated tests
CI/CD
Centralized logging
Monitoring and error tracking
Database indexing and query optimization
Horizontal backend scaling
Redis-based caching where appropriate
Data Consistency

Registration uses backend checks and database constraints to reduce duplicate registrations.

The participant count is updated together with the registration operation so that registration state and participant capacity remain consistent.

Submission creation also uses a unique database constraint to prevent duplicate submissions for the same participant and competition.

Security Considerations

The backend includes:

Helmet security middleware
CORS configuration
Environment variables for sensitive configuration
Backend validation
MongoDB uniqueness constraints
Registration and submission lifecycle checks

Sensitive .env files are excluded from version control.

Current Demo Competition

The seeded competition is:

Feedants Classical Dance

Category:

Dance

The seeded data includes:

Prize pool
Entry fee
Participant capacity
Judge information
Previous winners
Rewards
Registration period
Submission period
Result date
Assignment Demonstration

The application demonstrates:

Dynamic competition details
Registration
Participant tracking
Lifecycle-aware countdown
Registration validation
Duplicate registration prevention
Submission workflow
Duplicate submission prevention
MongoDB persistence
REST API integration
React Native UI implementation
Author

Poorna Chandra Sai Venkat Bommidi

GitHub:

https://github.com/saivenkat-954
