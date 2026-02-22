# TaskFlow Auth Service

A robust authentication service built with **NestJS**, following **Clean Architecture** principles.

## 🚀 Technologies

- **Runtime:** [Bun](https://bun.sh/)
- **Framework:** [NestJS](https://nestjs.com/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **Security:** [Bcrypt](https://www.npmjs.com/package/bcrypt) & [JWT](https://jwt.io/)
- **Documentation:** [Swagger/OpenAPI](https://swagger.io/)

## 🏗️ Architecture

The project follows **Clean Architecture** to ensure separation of concerns, scalability, and ease of testing.

- **Domain Layer:** Contains entities, repository interfaces, and domain exceptions. It has no dependencies on external frameworks.
- **Application Layer:** Contains use cases, DTOs, and port interfaces. It implements the business logic.
- **Infrastructure Layer:** Contains concrete implementations of repositories and services (e.g., Prisma repositories, Bcrypt hasher).
- **Presentation Layer:** Contains controllers that handle HTTP requests and map them to use cases.

## 🛠️ Project Structure

```text
apps/
  auth/           # Main authentication microservice
libs/
  common/         # Shared utilities, filters, and middleware
  database/       # Prisma service and database configuration
prisma/           # Database schema and migrations
```

## ⚙️ Setup

### Prerequisites

- [Bun](https://bun.sh/docs/installation) installed.
- [Docker](https://www.docker.com/) installed (for the database).

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   bun install
   ```

### Database Setup

1. Start the PostgreSQL container:
   ```bash
   docker-compose up -d
   ```
2. Run migrations:
   ```bash
   bun x prisma migrate dev
   ```

### Running the Application

```bash
# Development mode
bun run start:dev

# Production mode
bun run build
bun run start:prod
```

## 📚 API Documentation

Once the application is running, you can access the Swagger UI at:
`http://localhost:3000/api`

## 🧪 Testing

```bash
# Unit tests
bun run test

# End-to-end tests
bun run test:e2e
```

## 📄 License

This project is [MIT licensed](LICENSE).
