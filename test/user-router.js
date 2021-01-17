const { assert } = require('chai');
const supertest = require('supertest');
const bodyParser = require('body-parser');

let app = require('express')();
const userRouter = require('../app/routers/user');
app.use(bodyParser.json());
app.use(userRouter);

app = supertest(app);

describe('User router', () => {
  it('should create a new user in database', async () => {
    let res = await app.get('/api/users').expect(200);
    assert(
      Array.isArray(res.body.users),
      'GET /api/users response has no property "users" ... (1)'
    );

    const currentLength = res.body.users.length;
    const expectedLength = currentLength + 1;

    await app
      .post('/api/users')
      .send({ firstName: 'Chuck', lastName: 'Norris' });

    res = await app.get('/api/users').expect(200);
    assert(
      Array.isArray(res.body.users),
      'GET /api/users response has no property "users" .... (2)'
    );

    assert(res.body.users.length === expectedLength, 'User not created!');
  });
});
