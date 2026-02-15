# Playwright API Automation – Fake Store API

This project contains automated API tests built using Playwright Test for the Fake Store API.

The primary endpoint under test is:

GET /products

Base URL:
[https://fakestoreapi.com](https://fakestoreapi.com)

API Documentation:
[https://fakestoreapi.com/docs](https://fakestoreapi.com/docs)

---

## API Under Test

The Fake Store API is a public REST API that simulates an e-commerce backend. It provides endpoints for:

* Products
* Categories
* Carts
* Users
* Authentication

In this project, we are testing the Products endpoint:

GET /products

Expected Response:

* HTTP 200 OK
* Content-Type: application/json
* Response body: Array of product objects

Each product object includes:

* id (number)
* title (string)
* price (number)
* description (string)
* category (string)
* image (string)
* rating (object)

  * rate (number)
  * count (number)

---

## Project Structure

```
tests/
  └── products/
        └── get_all_products_tests.spec.js
```

The test file contains:

* Positive tests
* Negative tests
* Destructive (robustness) tests

---

## Test Strategy Implemented

### 1. Positive Testing (Happy Path)

Validates:

* Status code is 200
* Response is JSON
* Response body is an array
* Product object contains required fields
* Nested rating object validation
* Field data type validation

### 2. Negative Testing

Validates improper or unsupported usage:

* DELETE method on /products
* PATCH method on /products
* Invalid endpoint (404 validation)
* Invalid Accept header handling

Ensures:

* API does not return 2XX for invalid operations
* API handles unsupported methods properly

### 3. Destructive / Robustness Testing

Attempts to break or stress the API:

* Extremely long query strings
* Malformed URL encoding
* SQL injection-like input
* Concurrent requests (basic concurrency test)

Ensures:

* API does not crash (no 500 errors)
* API fails gracefully
* API remains stable under concurrent load

---

## Hooks Usage

The test suite uses Playwright hooks:

* beforeAll → Initializes base URL
* beforeEach → Sends GET /products request and prepares reusable variables
* afterAll → Logs completion message

Reusable variables:

* baseURL
* response
* body
* product

This ensures clean, maintainable, and scalable test design.

---

## Installation

1. Clone the repository

```
git clone <your-repo-url>
cd <project-folder>
```

2. Install dependencies

```
npm install
```

3. Install Playwright

```
npx playwright install --with-deps
```

---

## Running Tests

Run all tests:

```
npx playwright test
```

Run specific test file:

```
npx playwright test tests/products/get_all_products_tests.spec.js
```

Show HTML report after execution:

```
npx playwright show-report
```

---

## CI Integration

The project is configured to run in GitHub Actions.

On push or pull request to main branch:

* Dependencies are installed
* Playwright is installed
* API tests are executed
* HTML report is uploaded as artifact

---

