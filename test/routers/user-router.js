const { assert } = require('chai');
const supertest = require('supertest');
const bodyParser = require('body-parser');

let app = require('express')();
app.use(bodyParser.json());
const userRouter = require('../../app/routers/user');
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

  it('should require first and last names when creating user', async () => {
    const firstName = 'Han';
    const lastName = 'Solo';
    await app.post('/api/users').send({ firstName }).expect(400);
    await app.post('/api/users').send({ lastName }).expect(400);
    await app.post('/api/users').send({}).expect(400);
  });

  it('should not allow creating a user with a date of birth in the future', async () => {
    const firstName = 'Han';
    const lastName = 'Solo';
    const pastDate = new Date(1993, 5, 15);
    const futureDate = new Date(Date.now() + 1e10);
    await app
      .post('/api/users')
      .send({ firstName, lastName, dateOfBirth: futureDate })
      .expect(400);
    await app
      .post('/api/users')
      .send({ firstName, lastName, dateOfBirth: pastDate })
      .expect(200);
  });

  it('should not allow a negative number as salary', async () => {
    const firstName = 'Leia';
    const lastName = 'Organa';
    await app
      .post('/api/users')
      .send({ firstName, lastName, salary: -10000 })
      .expect(400);

    await app
      .post('/api/users')
      .send({ firstName, lastName, salary: 0 })
      .expect(400);

    await app
      .post('/api/users')
      .send({ firstName, lastName, salary: 10000 })
      .expect(200);
  });

  it('should not save values for username, passwordHash and userActivated when creating a user', async () => {
    const firstName = 'Sheev';
    const lastName = 'Palpatine';
    const username = 'thedarklord';
    const passwordHash = 'oHAhAOA((^&)9A(';
    const userActivated = true;

    const assertValuesAbsent = (body) => {
      assert(!body.username, 'Newly created user should not have username.');
      assert(!body.passwordHash, 'Password hash should not be returned.');
      assert(!body.userActivated, 'Newly created user should not be activated.');
    }

    let res = await app
      .post('/api/users')
      .send({ firstName, lastName, username, passwordHash, userActivated })
      .expect(200);

    assertValuesAbsent(res.body);

    const userId = res.body._id;

    res = await app
      .get(`/api/users/${userId}`)
      .expect(200);

      assertValuesAbsent(res.body);
  });
});
