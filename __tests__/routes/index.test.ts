import router from '../../src/routes/index';
import supertest from 'supertest';

const request = supertest(router);

describe('GET /', () => {
  it('responds with a json message', async () => {
    const response = await request.get('/');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'success', message: 'Welcome to the API' });
  });
});
