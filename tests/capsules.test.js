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


describe('POST /capsules', () => {
    let token;
    let userId;

    beforeAll(async () => {
        // Register a user
        const registerRes = await request(app)
            .post('/auth/register')
            .send({
                username: 'testuser',
                password: 'testPassword123',
            });

        // Check if the user was registered successfully
        expect(registerRes.status).toBe(201);

        // Login to get the JWT token
        const loginRes = await request(app)
            .post('/auth/login')
            .send({
                username: 'testuser',
                password: 'testPassword123',
            });

        expect(loginRes.status).toBe(200);
        token = loginRes.body.token; // Get the token from the login response
        userId = loginRes.body.userId; // Get the userId (if included in the response)
    });

    it('should create a time-locked message capsule successfully', async () => {
        const res = await request(app)
            .post('/capsules')
            .set('Authorization', `Bearer ${token}`)  // Pass the token as Authorization header
            .send({
                message: 'This is a time-locked message.',
                unlock_at: new Date(Date.now() + 1000 * 60 * 60), // 1 hour later
            });

        expect(res.status).toBe(201);
        expect(res.body.id).toBeDefined();
        expect(res.body.unlock_code).toBeDefined();
    });

    it('should return an error if message or unlock_at is missing', async () => {
        const res = await request(app)
            .post('/capsules')
            .set('Authorization', `Bearer ${token}`)  // Pass the token as Authorization header
            .send({
                message: '',  // Empty message
                unlock_at: new Date(),
            });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Message and unlock time are required');
    });
});


