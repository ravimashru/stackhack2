const { assert } = require('chai');
const supertest = require('supertest');
const bodyParser = require('body-parser');

let app = require('express')();
app.use(bodyParser.json());
const userRouter = require('../app/routers/user');
app.use(userRouter);

app = supertest(app);

describe('User router', () => {

  it('should have an endpoint to get list of all users', (done) => {
    app.get('/api/users').expect('Content-Type', /json/).expect(200, done);
  });

  it('should create a new user in database', async () => {
    let res = await app.get('/api/users').expect(200);
    assert(
      Array.isArray(res.body.users),
      'GET /api/users response has no property "users" ... (1)'
    );

    const currentLength = res.body.users.length;
    const expectedLength = currentLength + 1;

    res = await app
      .post('/api/users')
      .send({ firstName: 'Chuck', lastName: 'Norris' })
      .expect(200);

    res = await app.get('/api/users').expect(200);
    assert(
      Array.isArray(res.body.users),
      'GET /api/users response has no property "users" .... (2)'
    );

    assert(res.body.users.length === expectedLength, 'User not created!');
  });

  it('should have an endpoint to get the details of a single user', async () => {
    const firstName = 'Luke';
    const lastName = 'Skywalker';

    let res = await app.post('/api/users').send({ firstName, lastName });

    const userId = res.body._id;

    res = await app.get(`/api/users/${userId}`).expect(200);

    const userData = res.body;
    assert(userData._id === userId);
    assert(userData.firstName === firstName);
    assert(userData.lastName === lastName);
    assert(userData.lastName === lastName);
  });

  it('should create new user that is not activated', async () => {
    const firstName = 'Anakin';
    const lastName = 'Skywalker';

    let res = await app.post('/api/users').send({ firstName, lastName });

    const userId = res.body._id;
    res = await app.get(`/api/users/${userId}`).expect(200);

    const userData = res.body;
    assert(userData._id === userId);
    assert(
      userData.userActivated === false,
      'Newly created user does not have userActivated ==== false'
    );
  });
});
