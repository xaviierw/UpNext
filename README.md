# UpNext

Purpose of UpNext

UpNext is a centralized event discovery and management platform designed to improve student engagement at Temasek Polytechnic. It addresses common issues such as fragmented event information, low event visibility, and missed opportunities by providing a single platform where students can easily discover, track, and register for campus events.

The system also supports event organisers by streamlining event creation, participant management, and notifications, while incorporating personalization and gamification features to encourage sustained student participation.

Create .env in /server directory

Environment Variables
- PORT=4000

- MONGO_URI=your_mongodb_uri

- JWT_SECRET=your_secret

- VITE_API_URL=your_local_api/aws_elb_api

- EMAIL_USER=if_you_want_email_notification_to_users

- EMAIL_PASS=1234 5678 9101 1121 (not actual password, please get it from Google or any other email provider)

- Run Locally
- npm install
- run - /react-mv-website/npm run dev
- run - /server/node index.js

Server runs on:
- http://localhost:4000

- File is deployment ready for AWS S3 + ELB setup. S3 running static website and ELB running backend utils logic.

- Summary
- This file acts as the central bootstrap for the UpNext backend, wiring together all services, routes, and infrastructure required for the application to run.
