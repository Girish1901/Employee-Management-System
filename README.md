# Employee Management System

Simple Spring Boot backend with a Vite React frontend for managing employees.

## Project structure

- `Backend/EmployeManagementSystem` - Java Spring Boot backend (Maven)
- `frontend/employee-app` - React frontend (Vite)

## Prerequisites

- Java 17+ (or compatible JDK)
- Maven (optional; the project includes the Maven wrapper)
- Node.js 16+ and npm or yarn

## Run backend (development)

Windows (from repository root):

```powershell
cd Backend/EmployeManagementSystem
.\mvnw.cmd spring-boot:run
```

Unix/macOS:

```bash
cd Backend/EmployeManagementSystem
./mvnw spring-boot:run
```

Or build and run the jar:

```bash
cd Backend/EmployeManagementSystem
.\mvnw.cmd clean package
java -jar target/*.jar
```

## Run frontend (development)

```bash
cd frontend/employee-app
npm install
npm run dev
```

## Tests

Run backend tests:

```bash
cd Backend/EmployeManagementSystem
.\mvnw.cmd test
```

## Next steps

- Commit the README and push to your GitHub remote. See commands below.
