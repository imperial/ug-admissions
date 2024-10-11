# Undergraduate Admissions Portal

This repository holds all code for Imperial's Department of Computing's Undergraduate Admissions Portal. This is an internal system used to process and manage all undergraduate applications.

For information about using the system, check out the [Wiki](https://github.com/imperial/ug-admissions/wiki).


## Tech stack
- [Next.js](https://nextjs.org/): a [React](https://react.dev/) framework designed for high-performance, server-rendered web applications
- [TypeScript](https://www.typescriptlang.org/): a statically typed JavaScript syntax
- [Radix UI (Themes)](https://www.radix-ui.com/): an open-source pre-styled component library
- [Prisma ORM](https://www.prisma.io/orm): an intuitive data model for working with databases
- [PostgreSQL](https://www.postgresql.org/): an SQL-compliant and extended object-relational database system

## Project structure
### Directories
- `app/` - Next.js app router for pages, authentication and API
- `components/` - components used in and across pages
- `lib/` - TypeScript logic code, covering utilities, type definitions, schemas, form handling, CSV preprocessing, allocation algorithms and other miscellaneous code
- `prisma/` - Prisma data models, migration and database seeding
- `public/` - static files including examples for data uploads via CSV
