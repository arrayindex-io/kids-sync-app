# Kids Sync App

A Spring Boot application for managing children's schedules and activities with WhatsApp integration for reminders.

## About

Developed by [Anurag Saxena](https://www.arrayindex.com) at [ArrayIndex Canada Inc.](https://www.arrayindex.com)

## Features

- User authentication with JWT
- Event management for children's activities
- WhatsApp integration for reminders
- MongoDB for data persistence
- Docker support for easy deployment

## Tech Stack

- Java 21
- Spring Boot 3.2.3
- Spring Security with JWT
- MongoDB 6.0
- Maven
- Docker

## Prerequisites

- Java 21 or higher
- Maven 3.6 or higher
- Docker and Docker Compose
- MongoDB 6.0 (or use Docker)

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/arrayindex-io/kids-sync-app.git
   cd kids-sync-app
   ```

2. Start MongoDB using Docker:
   ```bash
   docker-compose up -d
   ```

3. Set up environment variables:
   - Copy the example environment file: `cp backend/.env.example backend/.env`
   - Edit the `.env` file with your actual configuration values
   - **IMPORTANT**: Never commit the `.env` file to version control

4. Build and run the application:
   ```bash
   cd backend
   mvn spring-boot:run
   ```

The application will be available at `http://localhost:8080`

## Environment Variables

The application uses environment variables for configuration. These are stored in a `.env` file in the backend directory. A sample file `.env.example` is provided as a template.

Key environment variables:
- `JWT_SECRET`: Secret key for JWT token generation
- `MONGODB_URI`: MongoDB connection string
- `EMAIL_*`: Email configuration for reminders
- `WHATSAPP_*`: WhatsApp API configuration

## Security Notes

- All sensitive information is stored in environment variables
- The `.env` file is excluded from version control
- JWT secrets and API keys should be kept secure and never committed to the repository
- For production deployments, use a secure secrets management solution

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### Events (Coming Soon)
- `GET /api/events` - Get all events
- `POST /api/events` - Create a new event
- `PUT /api/events/{id}` - Update an event
- `DELETE /api/events/{id}` - Delete an event

## Development

### Project Structure
```
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── arrayindex/
│   │   │           └── kids_sync_app/
│   │   │               ├── config/
│   │   │               ├── controller/
│   │   │               ├── model/
│   │   │               ├── repository/
│   │   │               └── service/
│   │   └── resources/
│   └── test/
└── pom.xml
```

## Contact

For any queries or support, please visit [www.arrayindex.com](https://www.arrayindex.com)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 