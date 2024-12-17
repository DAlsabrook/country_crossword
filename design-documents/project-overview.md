# Project Overview

## Project Name
Country Crossword

## Description
This project is a crossword puzzle application where users can solve crosswords based on country names and hints. Each crossword is unique on every page load. Our page dynamically loads data from the database and generates a crossword puzzle based on the words it gets via our /getCountries end point.

## Features
- Generate crossword puzzles with country names from the database.
- Provide hints for each country.
- Validate user guesses.
- Display confetti when the puzzle is solved correctly.

# Tools and Technologies

## Frontend
- React
- CSS

## Backend
- Firebase Functions
- Express
- Firestore
- Winston (logger)

## Other
- Swagger for API documentation
- UML for database schema

# Development Timeline

## Phase 1: Design (1 day)
- Create design documents
- Plan the project structure and general idea

## Phase 2: Setup (1 day)
- Set up the development environment and bring in possible dependancies
- Initialize the project repository

## Phase 3: Backend Development (3 days)
- Implement API endpoints
- Set up Firestore database and figure out dataa schema

## Phase 4: Frontend Development (4 days)
- Develop an algorithm to repeatedly create a crossword puzzle with given words
- Implement UI components
- Integrate with backend APIs

## Phase 5: Testing and Deployment (2 days)
- Write unit tests
- Firebase hosting with google console and gitHub Actions
- Deploy the application
