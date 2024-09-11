# Library Management System - V2

Library Management System - V2 is a multi-user web application that facilitates the management of e-books in an online library. This system allows a librarian to manage sections and e-books, grant or revoke access to users, and track user activities. Users can browse the library, request e-books, and provide feedback on them. The project is built using SQLite for data storage, Flask for APIs, and VueJS for the frontend.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Roles](#roles)
- [Database Models](#database-models)
- [Core Functionalities](#core-functionalities)
- [Backend Jobs](#backend-jobs)
- [Optional Functionalities](#optional-functionalities)
- [Installation](#installation)
- [Usage](#usage)
- [License](#license)

## Features

- **Librarian Role**: Manage e-books and sections, grant/revoke access, monitor user activities.
- **User Role**: Browse e-books, request up to 5 e-books at a time, provide feedback and rate e-books.
- **Automated Job Scheduling**: Daily reminders for pending returns, monthly activity reports.
- **Caching**: Improved performance using Redis for caching.
- **Responsive Design**: Unified UI for both mobile and desktop.

## Technologies Used

- **Backend**: Flask (API framework)
- **Frontend**: VueJS
- **Database**: SQLite (No other database allowed)
- **Caching**: Redis
- **Task Queue & Jobs**: Celery (for batch jobs)
- **Styling**: Bootstrap (HTML generation and styling)
- **Authentication**: Flask Security / JWT for role-based access control

## Roles

### Librarian
- Can create and manage sections and e-books.
- Can grant/revoke access to e-books.
- Can monitor user activities and track e-book requests.

### General User
- Can browse sections and request e-books.
- Can request up to 5 e-books at a time.
- Can provide feedback and rate e-books.

## Database Models

The app utilizes the following models:

### `User`
- Stores information about both librarians and general users.
- **Fields**: `id`, `username`, `email`, `password`, `roles`.

### `Role`
- Defines the roles of users, such as librarian or general user.

### `Section`
- Represents a section of the library (e.g., Science, Arts).
- **Fields**: `id`, `name`, `date_created`, `description`.

### `Book`
- Stores information about an e-book.
- **Fields**: `id`, `title`, `author`, `content`, `pdf_path`, `date_created`.

### `BookRequest`
- Tracks e-book requests by users.
- **Fields**: `id`, `user_id`, `book_id`, `created_at`, `updated_at`, `status`.

### `RatingFeedback`
- Stores feedback and ratings given by users for e-books.
- **Fields**: `id`, `book_id`, `user_id`, `rating`, `feedback`.

## Core Functionalities

1. **Authentication and Role-Based Access Control (RBAC)**
   - Supports librarian and user login with Flask Security or JWT.
   - Only one librarian can be assigned by default.

2. **Librarian Dashboard**
   - Displays statistics like active users, grant requests, issued/revoked e-books, etc.

3. **Section Management**
   - Create, update, and delete sections.

4. **E-Book Management**
   - Create, update, and delete e-books in the library.

5. **Search Functionality**
   - Users can search for e-books based on sections, authors, and titles.

6. **User Functionality**
   - Users can request e-books and rate/review them.

## Backend Jobs

1. **Scheduled Job - Daily Reminders**
   - Send daily reminders via Google Chat Webhooks to users whose return date is approaching.

2. **Scheduled Job - Monthly Activity Report**
   - Generate a monthly report of issued, returned, and rated e-books, and send it via email.

