# E-commerce Website 

## Prerequisites

Make sure you have the following installed:

- Node.js
- MongoDB

### Installing Node.js
1. Visit [nodejs.org](nodejs.org) to download and install Node.js.
2. Verify Installation:
Open your terminal and check the installed versions of Node.js and npm:
```
node -v
npm -v
```

### Installing MongoDB
1. Download MongoDB Compass for your operating system from the official MongoDB website. Sign up or log in to MongoDB Atlas.
2. After logging in, create a new shared cluster and name it accordingly.
3. Within the cluster, create a new database for your project.
4. Navigate to "Database Access" under "Security" and create a new user with appropriate permissions.
5. Go to "Network Access" and whitelist your IP address (e.g., 0.0.0.0) to allow access from your machine.
6. Click on "Connect" and choose "Connect with MongoDB Compass".
Copy the connection string and add it to your project's .env file, replacing username and password placeholders.
7. Open MongoDB Compass, paste the connection string, and establish a connection to your cluster.

## Setting Up the Repo
1. Clone the repository:
   ```bash
   git clone https://github.com/cs4218/cs4218-2420-ecom-project-team19.git
   cd [REPOSITORY_NAME]
   ```

2. Install server dependencies in the root directory of the project:
   ```bash
   npm install
   ```

3. Install client dependencies in the client directory of the project:
   ```bash
   cd client
   npm install
   cd ..
   ```

4. Create a `.env` file in the root directory with the neccessary variables.

## Running the Application

### Development Mode

To run both the server and client in development mode:
```bash
npm run dev
```

### Running Server Only
```bash
npm run server
```

### Running Client Only
```bash
npm run client
```

## Running the Tests


### Running All Tests
```bash
npm test
```

### Running Frontend Tests Only
```bash
npm run test:frontend
```

### Running Backend Tests Only
```bash
npm run test:backend
```

## Code Quality
This project uses SonarQube.
```bash
npm run sonarqube
```
Ensure that SonarQube is installed and running in your environment.

Credits to the teaching team for the above instructions. For detailed instructions, you may refer to [this website](https://cs4218.github.io/user-guide/contents/topic1b.html).

## CI
[CI Workflow](https://github.com/gremmyz/cs4218-2420-ecom-project-team19/actions/workflows/node.js.yml)

[CI Example Run
](https://github.com/cs4218/cs4218-2420-ecom-project-team19/actions/runs/13234547715/job/36937036013)
