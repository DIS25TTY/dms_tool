# README #

This is a Express project with javascript.


### Project Naming Conventions 
- variables, properties, functions, files and folders - lowerCamelCase
- classes - UpperCamelCase 
- constants - UPPERCASE 

## Getting Started

### Steps before running in local environment

- Make sure the git origin is set to se-dms-service repository
- Pull the latest code from the master branch.
- Have the latest env updated for dev environment.

To run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:5000/graphiql](http://localhost:5000/graphiql) with your browser to see the result.

### Steps involved in Master and Bug fixes

- Do not hardcode env based values anywhere in the code
- Always Checkout to a new branch from master/release `git checkout -b feature/xyz origin/master`
- Rebase your branch with the master branch before raising ang PR `git rebase master`
- Never raise direct PR from Master to Staging or from Master to Master. The PR will not merged
- Do not push directly to Master branch
- Write a testcase file for each change / new feature you add; Without testcases the deployment build will not go through
- Always add documentation and comments to complex functionalities to make code readable
- Do not install packages that are heavy or has vulnerabilities

### Project folder structure

- configs folder - contains env and formatter configuration
    - index file - routes with specific Environment variables
    - config file
- db folder
    - prisma file - Client
- graphql folder - contains graphql configuration and index file
    - resolvers - schema resolvers for query and mutation 
    - schema - schema files with query and mutation
    - graphqlServer - Apollo server configuration
- middlewares folder - contains middlewares
- services folder
    - health - code and logic coverage (called by resolvers)
- utils folder
    - helper - common function
- app.js
- server.js
