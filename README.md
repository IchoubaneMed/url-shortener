# URL Shortener

A full-stack URL shortening application built with **Django REST Framework, React, TypeScript, PostgreSQL, Redis, and Celery**.

The application converts long URLs into compact Base62 short links, redirects users through a Redis-backed cache, and records click analytics asynchronously using Celery.

The project focuses on backend architecture and system-design concepts such as **cache-aside, asynchronous processing, Base62 encoding, database relationships, API design, and containerization**.

---

## Features

- Create shortened URLs from long URLs
- Generate compact Base62 short codes
- Redirect short URLs to their original destinations
- Cache URL mappings in Redis
- Track clicks asynchronously with Celery
- Store click count and last-accessed timestamp
- View analytics for individual URLs
- Browse previously created URLs
- Paginated URL API
- Responsive React interface
- Dockerized development environment
- Backend tests with Pytest
- Frontend tests with Vitest and React Testing Library

---

## Tech Stack

### Backend

- Python
- Django
- Django REST Framework
- PostgreSQL
- Redis
- Celery
- Pytest

### Frontend

- React
- TypeScript
- Vite
- Axios
- React Router
- Vitest
- React Testing Library

### Infrastructure

- Docker
- Docker Compose

---

## Architecture

```text
                       ┌─────────────────────┐
                       │   React Frontend    │
                       │    TypeScript       │
                       └──────────┬──────────┘
                                  │
                                  │ HTTP / REST
                                  ▼
                       ┌─────────────────────┐
                       │ Django REST         │
                       │ Framework           │
                       └──────────┬──────────┘
                                  │
                  ┌───────────────┼────────────────┐
                  │               │                │
                  ▼               ▼                ▼
           ┌────────────┐   ┌────────────┐   ┌────────────┐
           │ PostgreSQL │   │   Redis    │   │   Celery   │
           │            │   │   Cache    │   │   Worker   │
           └────────────┘   └────────────┘   └──────┬─────┘
                                                    │
                                                    ▼
                                              ┌────────────┐
                                              │ PostgreSQL │
                                              │ Analytics  │
                                              └────────────┘
```

Redis serves two purposes in the application:

1. Caching URL mappings used during redirects.
2. Acting as the Celery message broker for asynchronous analytics tasks.

---

## Project Structure

```text
url-shortener/
│
├── backend/
│   ├── analytics/
│   │   ├── migrations/
│   │   ├── tests/
│   │   ├── admin.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── tasks.py
│   │   ├── urls.py
│   │   └── views.py
│   │
│   ├── config/
│   │   ├── __init__.py
│   │   ├── celery.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   │
│   ├── urls/
│   │   ├── migrations/
│   │   ├── services/
│   │   │   ├── base62.py
│   │   │   └── cache.py
│   │   ├── tests/
│   │   ├── admin.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── views.py
│   │
│   ├── Dockerfile
│   ├── manage.py
│   ├── pytest.ini
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   └── urls.ts
│   │   │
│   │   ├── components/
│   │   │   ├── AnalyticsCard.tsx
│   │   │   ├── ShortUrlResult.tsx
│   │   │   ├── UrlForm.tsx
│   │   │   └── UrlList.tsx
│   │   │
│   │   ├── pages/
│   │   │   ├── AnalyticsPage.tsx
│   │   │   └── HomePage.tsx
│   │   │
│   │   ├── styles/
│   │   │   └── global.css
│   │   │
│   │   ├── test/
│   │   │   └── setup.ts
│   │   │
│   │   ├── types/
│   │   │   └── url.ts
│   │   │
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

# How It Works

## 1. URL Shortening

The user submits a long URL from the React frontend.

```text
React
  │
  │ POST /api/v1/urls/
  ▼
Django REST Framework
  │
  ▼
URLMappingSerializer
  │
  ├── Create URLMapping
  │
  ├── Generate Base62 code
  │
  └── Create Analytics record
  │
  ▼
PostgreSQL
```

Example request:

```http
POST /api/v1/urls/
Content-Type: application/json

{
  "original_url": "https://example.com/some/very/long/url"
}
```

Example response:

```json
{
  "short_code": "b9",
  "short_url": "http://localhost:8000/b9",
  "original_url": "https://example.com/some/very/long/url",
  "created_at": "2026-10-06T10:00:00Z"
}
```

---

## 2. Base62 Short-Code Generation

Short URLs are generated using **Base62 encoding**.

The alphabet contains:

```text
0-9
a-z
A-Z
```

giving:

```text
62 possible characters
```

The database primary key provides a unique integer, which is then encoded into Base62.

For example:

```text
Database ID
    │
    ▼
  125
    │
    ▼
Base62 encoding
    │
    ▼
   "21"
```

This approach provides compact short codes without requiring a separate random-ID generation mechanism.

Base62 itself does not guarantee uniqueness. Uniqueness comes from the database primary key being encoded.

### Trade-off

Sequential database IDs encoded with Base62 are predictable and enumerable.

This approach was selected for the first version because it is simple, deterministic, and collision-free.

A production system requiring non-enumerable URLs could instead use:

- Random Base62 identifiers
- UUID-based identifiers
- Distributed ID generators
- Hash-based identifiers with collision handling

---

# Redirect Flow

When a short URL is opened:

```text
GET /abc
   │
   ▼
Django
   │
   ▼
Redis lookup
   │
   ├───────────────┐
   │               │
 Cache HIT      Cache MISS
   │               │
   │               ▼
   │          PostgreSQL
   │               │
   │               ▼
   │          Cache result
   │               │
   └───────┬───────┘
           │
           ▼
      302 Redirect
           │
           ▼
     Original URL
```

Example:

```text
http://localhost:8000/b9
```

may redirect to:

```text
https://example.com/some/very/long/url
```

The server returns an HTTP `302` redirect instead of returning the original URL as JSON.

---

# Redis Caching

Redis is used to reduce database access during redirects.

The project follows the **cache-aside pattern**.

## Cache Hit

```text
Request
   │
   ▼
Redis
   │
   ▼
Original URL
   │
   ▼
302 Redirect
```

PostgreSQL does not need to be queried.

## Cache Miss

```text
Request
   │
   ▼
Redis
   │
   └── Not found
           │
           ▼
      PostgreSQL
           │
           ▼
     Original URL
           │
           ▼
        Redis
           │
           ▼
      302 Redirect
```

The retrieved URL is cached so subsequent requests can avoid the database lookup.

The current cache TTL is 24 hours.

---

# Asynchronous Analytics

Analytics should not significantly increase redirect latency.

Instead of updating analytics synchronously during the redirect request, the application sends an asynchronous Celery task.

```text
GET /abc
   │
   ├─────────────────────────┐
   │                         │
   ▼                         ▼
302 Redirect           Celery task
                             │
                             ▼
                           Redis
                        Message Broker
                             │
                             ▼
                       Celery Worker
                             │
                             ▼
                        PostgreSQL
```

This separates the critical redirect path from analytics processing.

---

## Analytics Data

Each shortened URL has an associated analytics record.

```text
URLMapping
    │
    │ OneToOne
    ▼
Analytics
```

Analytics currently stores:

```text
click_count
last_accessed
```

Example response:

```json
{
  "short_code": "b9",
  "click_count": 42,
  "last_accessed": "2026-10-06T10:30:00Z"
}
```

---

## Safe Click Counter Updates

Click counts are incremented using Django `F()` expressions.

Conceptually:

```python
click_count = F("click_count") + 1
```

rather than:

```python
analytics.click_count += 1
analytics.save()
```

This lets the database perform the increment directly and reduces the risk of lost updates when multiple workers update the same counter concurrently.

---

# Data Model

## URLMapping

```text
URLMapping
-------------------------
id
short_code
original_url
created_at
tracking_enabled
```

`short_code` uniquely identifies the shortened URL.

Example:

```text
id:           125
short_code:   21
original_url: https://example.com
created_at:   ...
```

---

## Analytics

```text
Analytics
-------------------------
id
url_mapping
click_count
last_accessed
```

Relationship:

```text
URLMapping 1 ─────────── 1 Analytics
```

A `OneToOneField` is used because each URL has one aggregate analytics record.

---

# API

Base API URL:

```text
http://localhost:8000/api/v1/
```

## Create Short URL

```http
POST /api/v1/urls/
```

Request:

```json
{
  "original_url": "https://example.com"
}
```

Response:

```json
{
  "short_code": "1",
  "short_url": "http://localhost:8000/1",
  "original_url": "https://example.com",
  "created_at": "2026-10-06T10:00:00Z"
}
```

---

## List Shortened URLs

```http
GET /api/v1/urls/
```

The endpoint is paginated.

Example:

```json
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "short_code": "2",
      "short_url": "http://localhost:8000/2",
      "original_url": "https://www.djangoproject.com/",
      "created_at": "2026-10-06T10:05:00Z"
    },
    {
      "short_code": "1",
      "short_url": "http://localhost:8000/1",
      "original_url": "https://example.com",
      "created_at": "2026-10-06T10:00:00Z"
    }
  ]
}
```

---

## Redirect Short URL

```http
GET /{short_code}
```

Example:

```http
GET /1
```

Response:

```http
HTTP/1.1 302 Found
Location: https://example.com
```

---

## Get Analytics

```http
GET /api/v1/urls/{short_code}/analytics/
```

Example:

```http
GET /api/v1/urls/1/analytics/
```

Response:

```json
{
  "short_code": "1",
  "click_count": 5,
  "last_accessed": "2026-10-06T10:30:00Z"
}
```

---

# Frontend

The frontend is built with React and TypeScript.

The application contains two primary pages.

## Home

The home page allows users to:

- Enter a long URL
- Generate a short URL
- Copy/open the generated URL
- View recently created URLs
- Navigate to analytics

```text
┌─────────────────────────────────────────┐
│             URL Shortener               │
│                                         │
│ https://example.com       [ Shorten ]   │
│                                         │
│ Short URL                              │
│ http://localhost:8000/1       [ Copy ] │
│                                         │
│ Recent Links                            │
│ ──────────────────────────────────────  │
│ /3    https://github.com     Analytics │
│ /2    https://django...      Analytics │
│ /1    https://example.com    Analytics │
└─────────────────────────────────────────┘
```

## Analytics

The analytics page retrieves analytics using the short code from the URL.

Example frontend route:

```text
/analytics/1
```

The frontend requests:

```text
GET /api/v1/urls/1/analytics/
```

and displays the click count and last-accessed timestamp.

---

# Running the Project

## Prerequisites

Install:

- Docker
- Docker Compose
- Git

Node.js and Python do not need to be installed locally when running the entire project through Docker.

---

## Clone Repository

```bash
git clone <repository-url>
cd url-shortener
```

---

## Environment Variables

Create a `.env` file based on:

```text
.env.example
```

Example:

```env
POSTGRES_DB=url_shortener
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

DATABASE_HOST=db
DATABASE_PORT=5432

REDIS_URL=redis://redis:6379/0

FRONTEND_URL=http://localhost:5173
```

---

## Start Containers

Build and start the application:

```bash
docker compose up --build
```

Or run in detached mode:

```bash
docker compose up --build -d
```

The following services will be started:

```text
frontend
backend
celery
redis
db
```

Check their status:

```bash
docker compose ps
```

---

## Run Database Migrations

```bash
docker compose exec backend python manage.py migrate
```

---

## Create Django Admin User

Optional:

```bash
docker compose exec backend python manage.py createsuperuser
```

Django Admin is available at:

```text
http://localhost:8000/admin/
```

---

## Access Application

Frontend:

```text
http://localhost:5173
```

Backend API:

```text
http://localhost:8000/api/v1/
```

Django Admin:

```text
http://localhost:8000/admin/
```

---

# Docker Services

The development environment contains five main services.

```text
docker-compose.yml
│
├── frontend
│     React + Vite
│
├── backend
│     Django + DRF
│
├── celery
│     Celery worker
│
├── redis
│     Cache + Celery broker
│
└── db
      PostgreSQL
```

The backend and Celery worker use the same Django codebase but run as separate processes.

---

# Testing

The project includes backend and frontend automated tests.

## Backend Tests

Backend tests use:

- Pytest
- pytest-django
- DRF test utilities

Run:

```bash
docker compose exec backend pytest -v
```

The backend tests cover important behavior such as:

- Base62 encoding and decoding
- URL creation
- Invalid URL validation
- Analytics creation
- URL redirection
- Analytics counter updates

---

## Frontend Tests

Frontend tests use:

- Vitest
- React Testing Library
- jsdom

Run:

```bash
docker compose exec frontend npm test
```

The frontend tests cover core components such as:

- URL creation form
- Short URL result
- URL history

---

## Frontend Production Build Check

Verify that the TypeScript frontend builds successfully:

```bash
docker compose exec frontend npm run build
```

---

# Design Decisions

## Why Django REST Framework?

Django REST Framework provides mature tools for:

- Request validation
- Serialization
- Generic API views
- Pagination
- Testing
- Database integration

Generic views are used where the endpoint naturally maps to CRUD operations.

For example:

```text
ListCreateAPIView
```

provides:

```text
GET  /api/v1/urls/
POST /api/v1/urls/
```

without unnecessary custom controller logic.

The redirect endpoint remains a normal Django view because it returns an HTTP redirect rather than a REST resource representation.

---

## Why PostgreSQL?

URL mappings and analytics are structured relational data.

PostgreSQL provides:

- Strong consistency
- Unique constraints
- Transactions
- Indexing
- Reliable relational modeling

The unique `short_code` constraint ensures that two URL mappings cannot have the same short identifier.

---

## Why Redis?

Redirects are expected to be the most frequent operation in a URL-shortening system.

Redis provides fast in-memory access to frequently requested URL mappings.

It is used as a cache in front of PostgreSQL using the cache-aside pattern.

Redis also serves as the message broker for Celery.

---

## Why Celery?

Analytics processing does not need to complete before the user is redirected.

Celery moves this work outside the redirect request:

```text
redirect request
      │
      ├── return 302
      │
      └── enqueue analytics task
```

The worker processes the analytics update independently.

This keeps the redirect path focused on its primary responsibility.

---

## Why React + TypeScript?

React provides a component-based frontend architecture, while TypeScript adds static typing to API responses, component properties, and application state.

The frontend communicates with the Django API through Axios.

---

# Scalability Considerations

The current application is intentionally a small production-inspired implementation rather than a globally distributed URL-shortening platform.

At larger scale, several areas could evolve.

## Database

The current system uses a single PostgreSQL database.

Possible scaling strategies include:

- Read replicas
- Database partitioning
- Sharding
- Distributed identifier generation

## Cache

Redis reduces database load for frequently accessed short URLs.

At larger scale:

```text
Users
   │
   ▼
Load Balancer
   │
   ├─────────────┬─────────────┐
   ▼             ▼             ▼
App 1           App 2         App 3
   │             │             │
   └─────────────┼─────────────┘
                 ▼
             Redis
                 │
                 ▼
            PostgreSQL
```

Because the cache is external to the application instances, multiple backend instances can share it.

## Analytics

Celery workers can be scaled independently from web servers.

```text
Redis Broker
     │
     ├──────────────┐
     ▼              ▼
 Worker 1        Worker 2
     │              │
     └──────┬───────┘
            ▼
       PostgreSQL
```

For much larger traffic volumes, click events could instead be streamed to dedicated event-processing and analytics infrastructure.

---

# Current Limitations

The current version intentionally keeps several concerns simple.

### Sequential Short Codes

Base62 codes are generated from sequential database IDs.

This makes them compact and collision-free, but also enumerable.

### Cache Dependency

The current redirect implementation expects Redis to be available when accessing the cache.

A more resilient implementation should gracefully fall back to PostgreSQL if Redis becomes unavailable.

### Analytics Broker Dependency

Analytics events currently depend on the Celery/Redis broker being available when the redirect occurs.

The redirect path could be hardened so analytics failures never affect URL redirection.

### No Authentication

URLs are not associated with individual user accounts.

### Basic Analytics

Only aggregate click count and last-accessed time are tracked.

### Development Server

The Docker configuration uses Django and Vite development servers.

A production deployment should use production-grade application servers and static frontend hosting.

---

# Future Improvements

Potential improvements include:

- Graceful fallback when Redis is unavailable
- Make analytics failures independent from redirect availability
- API rate limiting and abuse protection
- User authentication
- User-specific URL management
- Custom aliases
- URL expiration
- URL deletion and cache invalidation
- Randomized/non-enumerable short codes
- QR code generation
- Rich analytics
- Geographic analytics
- Device and browser statistics
- Custom domains
- CI/CD pipeline
- Production deployment configuration
- Cloud deployment
- Monitoring and observability

---

# Possible Production Architecture

A production deployment could evolve toward:

```text
                    Internet
                       │
                       ▼
                 Load Balancer
                       │
              ┌────────┴────────┐
              ▼                 ▼
         Django App         Django App
              │                 │
              └────────┬────────┘
                       │
             ┌─────────┼─────────┐
             │         │         │
             ▼         ▼         ▼
        PostgreSQL   Redis    Task Queue
                                 │
                          ┌──────┴──────┐
                          ▼             ▼
                       Worker        Worker
```

The current project demonstrates the same fundamental separation of responsibilities on a smaller development environment.

---

# Key Concepts Demonstrated

This project demonstrates practical use of:

- REST API design
- Django REST Framework generic views
- Django ORM
- Relational database modeling
- One-to-one relationships
- Serializer validation
- Base62 encoding
- HTTP redirects
- Cache-aside
- Redis
- Asynchronous task processing
- Celery
- Message brokers
- Atomic database updates
- React component architecture
- TypeScript
- API integration
- Client-side routing
- Backend testing
- Frontend testing
- Docker
- Docker Compose
- Environment configuration
- System-design trade-offs

---

# License

This project is intended for educational and portfolio purposes.