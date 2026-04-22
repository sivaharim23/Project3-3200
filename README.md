# Project3-3200
HouseTab is a shared expense tracking system for roommates. Project 3 extends 
the existing SQLite and MongoDB implementations to include a Redis in-memory 
key-value store for real-time data access.

## Team Members
- Sivahari Mohanraj
- Hasith Kadiyala
## Project Structure
- `requirements.pdf` — Project requirements document with Redis additions
- `uml.png` — UML Conceptual Class Diagram (reused from Project 1)
- `redis_design.md` — Redis data structures and CRUD commands
- `redis_script.js` — Node script implementing all Redis data structures
- `README.md` — This file

## Redis Data Structures Used
- **Set** — Track currently logged-in users
- **Hash** — Store unpaid balances per household
- **List** — Maintain a recent expenses feed per household
- **Sorted Set** — Household spending leaderboard ranked by total paid

## How to Run

### Prerequisites
- Node.js installed
- Docker installed and running

## Video Demonstration
[Paste your YouTube link here]

## Tools Used
- Redis
- Docker
- Node.js
- VSCode
- GitHub

## AI Disclosure
- AI was used to help debug a connection error in the Node.js Redis script
- AI was used to suggest the key naming pattern for the Redis data structures