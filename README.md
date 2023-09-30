# Blog_API_Handling

This Node.js Express project demonstrates how to fetch data from an external API, analyze it, and implement memoization using the lodash library.

## Files 
- sever.js: Implementation of code where memoizing functionality is added for the sats routes.
- index.js: Implementation of code without memoizing instead data is fethed via middleware

## Prerequisites

Before running the project, make sure you have the following installed:

- Node.js and npm: [Download here](https://nodejs.org/)

## Getting Started

1. Clone the repository to your local machine:

   ```bash
   git clone https://github.com/your-username/express-data-analysis-project.git
   ```

2. Navigate to the project directory:

   ```bash
   cd express-data-analysis-project
   ```

3. Install project dependencies:

   ```bash
   npm install
   ```

4. Start the server:

   ```bash
   npm start
   ```

The server will start, and you can access the API endpoints as described below.

## API Endpoints

### 1. Analyze Data

- **Endpoint**: `/api/blog-stats`
- **Method**: GET
- **Description**: Returns analyzed data from the external API. The results are memoized and cached for a specified duration to optimize performance.
- **Cache Timeout**: Data is cached for 10 minutes.

Example Request:

```http
GET http://localhost:3000/api/analysis
```

### 2.Query

- **Endpoint**: `/api/blog-search?query=''`
- **Method**: GET
- **Description**: Performs a query on the data from the external API.



## Memoization

Memoization is implemented using the lodash library to cache and optimize data analysis and query results. Cached data is returned within the specified cache timeout to reduce unnecessary computations.
