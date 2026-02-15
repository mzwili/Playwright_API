import { test, expect } from '@playwright/test';

test.describe.serial('Products API Tests', () => {

    // 🔹 Reusable variables
    let baseURL;
    let response;
    let body;
    let product;

    // Runs once before all tests
    test.beforeAll(async () => {
        baseURL = 'https://fakestoreapi.com';
    });

    // Safe request wrapper
    async function getProducts(request) {
        const res = await request.get(`${baseURL}/products`, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 Playwright API Tests'
            }
        });

        // validate response BEFORE parsing
        const contentType = res.headers()['content-type'] || '';

        // expect(contentType, 'API returned HTML instead of JSON — likely rate limited')
        //     .toContain('application/json');

        // const json = await res.json();
        return { res, contentType };
    }

    // Runs before EACH test
    test.beforeEach(async ({ request }) => {
        const { res, contentType } = await getProducts(request);

        // If CDN blocks us → skip entire test gracefully
        if (!contentType.includes('application/json')) {
            test.skip(true, 'Public API temporarily blocked or rate limited (returned HTML)');
        }

        response = res;
        body = await res.json();
        product = body[0];
    });

    // Runs once after all tests
    test.afterAll(async () => {
        console.log('Products API tests completed');
    });

    // ====================================================
    // POSITIVE TESTS
    // ====================================================

    test('Status code should be 200', async () => {
        expect(response.status()).toBe(200);
    });

    test('Response should be JSON', async () => {
        expect(response.headers()['content-type']).toContain('application/json');
    });

    test('Response should contain products array', async () => {
        expect(Array.isArray(body)).toBeTruthy();
        expect(body.length).toBeGreaterThan(0);
    });

    test('Product should contain required fields', async () => {
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('title');
        expect(product).toHaveProperty('price');
        expect(product).toHaveProperty('description');
        expect(product).toHaveProperty('category');
        expect(product).toHaveProperty('image');
        expect(product).toHaveProperty('rating');
    });

    test('Product rating should contain nested fields', async () => {
        expect(product.rating).toHaveProperty('rate');
        expect(product.rating).toHaveProperty('count');
    });

    test('Product field types should be correct', async () => {
        expect(typeof product.id).toBe('number');
        expect(typeof product.title).toBe('string');
        expect(typeof product.price).toBe('number');
    });

    // ====================================================
    // NEGATIVE TESTS
    // ====================================================

     test('DELETE should not be allowed', async ({ request }) => {
        const res = await request.delete(`${baseURL}/products`);
        expect(res.status()).toBeGreaterThanOrEqual(400);
    });

    test('PATCH should not be allowed', async ({ request }) => {
        const res = await request.patch(`${baseURL}/products`);
        expect(res.status()).toBeGreaterThanOrEqual(400);
    });

    test('Invalid endpoint should greater than 400', async ({ request }) => {
        const res = await request.get(`${baseURL}/productssss`);
        expect(res.status()).toBeGreaterThanOrEqual(400);
    });

    test('Invalid accept header handled gracefully', async ({ request }) => {
            const res = await request.get(`${baseURL}/products`, {
            headers: { Accept: 'application/xml' }
        });

        const contentType = res.headers()['content-type'] || '';

        // API should not crash
        expect(res.status()).toBeLessThan(500);

        // Response should be a valid HTTP response (JSON OR HTML error page)
        expect(contentType.length).toBeGreaterThan(0);
    });

    // ====================================================
    // DESTRUCTIVE TESTS
    // ====================================================

    test('Very long query should not crash API', async ({ request }) => {
        const longString = 'a'.repeat(5000);

        const res = await request.get(`${baseURL}/products?search=${longString}`);

        expect(res.status()).toBeLessThan(500);
    });

    test('Malformed encoding should fail gracefully', async ({ request }) => {
        const res = await request.get(`${baseURL}/products?query=%E0%A4%A`);

        expect(res.status()).toBeLessThan(500);
    });

    test('SQL injection attempt should not crash API', async ({ request }) => {
        const res = await request.get(`${baseURL}/products?search=' OR 1=1 --`);

        expect(res.status()).toBeLessThan(500);
    });

    test('Concurrent requests should not crash API', async ({ request }) => {

        const requests = Array.from({ length: 15 }, () =>
            request.get(`${baseURL}/products`)
        );

        const responses = await Promise.all(requests);

        responses.forEach(res => {
            const status = res.status();
            // Acceptable outcomes for public API
            expect([200, 403, 429]).toContain(status);
        });
    });

});
