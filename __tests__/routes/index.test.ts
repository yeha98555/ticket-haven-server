import router from '../../src/routes/index';
import supertest from 'supertest';
import { redis, sub } from '../../src/connections/redis';

const request = supertest(router);

afterAll(async () => {
  await sub.unsubscribe();
  sub.disconnect();
  redis.disconnect();
});

describe('GET /', () => {
  it('responds with a json message', async () => {
    const response = await request.get('/');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'success',
      message: 'Welcome to the API',
    });
  });
});
