// auth.test.js or your test file
const request = require('supertest');
const app = require('../src/index');  // Import the app from index.js (adjust the path if needed)

let server;

beforeAll(async () => {
    server = app.listen(5000);  // Start the server on port 5000 for testing
});

afterAll(async () => {
    await server.close();  // Ensure the server is closed after tests
});

describe('POST /auth/register', () => {
    it('should register a new user and return a success message', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send({
                username: 'newuser1',
                password: 'securePassword123',
            });

        expect(res.status).toBe(201);
        expect(res.body.message).toBe('User registered successfully');
    });
});

describe('POST /auth/login', () => {
    it('should log in a user with valid credentials', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({
                username: 'newuser1',
                password: 'securePassword123',
            });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Login successful');
        expect(res.body.token).toBeDefined();  // Ensure token is returned
    });
});
