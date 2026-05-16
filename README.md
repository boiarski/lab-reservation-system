# Lab Reservation System

Fullstack application for managing laboratory equipment reservations in a controlled lab environment.

## Features

- User authentication with JWT
- Role-based access control (`user`, `helper`, `admin`)
- Equipment listing and availability view
- Equipment reservation system
- Conflict detection for overlapping reservations
- Long reservations requiring justification and approval
- Reservation lifecycle management (create, cancel, complete, disrupt)
- Equipment issue reporting
- Equipment status management (`available`, `out_of_order`, `decommissioned`)
- User management and account maintenance

## Tech Stack

- Backend: Node.js + Express + PostgreSQL
- Frontend: Angular
- Infrastructure: Docker
- Testing and CI/CD: planned separately

## Project Status

Core application is functional and stable.

## Author

Diego Boiarski