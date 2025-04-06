# Kids Sync App

A Spring Boot application for managing kids' activities and schedules with WhatsApp integration.

## Features

- User authentication with JWT
- Event management with recurrence support
- Automated reminders via WhatsApp
- MongoDB integration for data persistence
- Docker support for easy deployment

## Tech Stack

- Java 17
- Spring Boot 3.2.3
- Spring Security with JWT
- MongoDB
- Docker
- Maven

## Prerequisites

- Java 17 or higher
- Maven
- Docker and Docker Compose
- MongoDB (provided via Docker)

## Getting Started

### Environment Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/arrayindex/kids-sync-app.git
   cd kids-sync-app
   ```

2. Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with your configuration:
   ```
   MONGODB_URI=mongodb://localhost:27017/kids_sync
   JWT_SECRET=your_jwt_secret_here
   ```

### Running the Application

1. Start MongoDB using Docker:
   ```bash
   docker-compose up -d
   ```

2. Build and run the application:
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

The application will be available at `http://localhost:8080`

## API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "password123",
    "whatsappNumber": "+1234567890"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "password123"
}
```

### Event Endpoints

All event endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

#### Create Event
```
POST /api/events
Content-Type: application/json

{
    "name": "Event Name",
    "dateTime": "2024-03-25T10:00:00",
    "notes": "Event notes",
    "recurrence": "NONE" // Options: NONE, DAILY, WEEKLY, MONTHLY
}
```

#### Get All Events
```
GET /api/events
```

#### Get Event by ID
```
GET /api/events/{event_id}
```

#### Update Event
```
PUT /api/events/{event_id}
Content-Type: application/json

{
    "name": "Updated Event",
    "dateTime": "2024-03-25T11:00:00",
    "notes": "Updated notes",
    "recurrence": "WEEKLY",
    "recurrenceEndDate": "2024-04-25T11:00:00"
}
```

#### Delete Event
```
DELETE /api/events/{event_id}
```

#### Get Upcoming Events
```
GET /api/events/upcoming
```

## Reminder System

The application includes an automated reminder system that:
- Schedules reminders 15 minutes before each event
- Processes due reminders every minute
- Automatically cancels reminders when events are updated or deleted
- Supports recurring events with different patterns (daily, weekly, monthly)

## Development

### Project Structure
```
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/arrayindex/kids_sync_app/
│   │   │       ├── config/         # Security and JWT configuration
│   │   │       ├── controller/     # REST controllers
│   │   │       ├── model/          # Data models
│   │   │       ├── repository/     # MongoDB repositories
│   │   │       ├── service/        # Business logic
│   │   │       └── KidsyncApplication.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/                       # Test files
├── pom.xml                         # Maven dependencies
└── .env                           # Environment variables
```

### Running Tests
```bash
./mvnw test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Anurag Saxena - [@arrayindex](https://github.com/arrayindex)

Project Link: [https://github.com/arrayindex/kids-sync-app](https://github.com/arrayindex/kids-sync-app) 