const { assert } = require('chai');
const { app } = require('./setup');

describe('User verification', () => {
  let cookie;
  before(async function () {
    this.timeout(50000);
    const res = await app
      .post('/api/login')
      .send('username=test&password=test')
      .expect(200);

    cookie = res.get('set-cookie');
  });

  it('should not require authentication for verify endpoint', async () => {
    const firstName = 'Rey';
    const lastName = 'Skywalker';

    await app.post('/api/users').send({ firstName, lastName }).expect(401);
    let res = await app
      .post('/api/users')
      .set('Cookie', cookie)
      .send({ firstName, lastName })
      .expect(200);

    const userId = res.body._id;
    const username = 'rey';

    await app
      .post(`/api/users/${userId}/verify`)
      .send({ username, password: 'iAmSkyw@lk3r' })
      .expect(200);
  });
  it('should verify user and save user details', async () => {
    const firstName = 'Rey';
    const lastName = 'Skywalker';

    await app.post('/api/users').send({ firstName, lastName }).expect(401);
    let res = await app
      .post('/api/users')
      .set('Cookie', cookie)
      .send({ firstName, lastName })
      .expect(200);

    const userId = res.body._id;
    const username = 'rey2';

    res = await app
      .post(`/api/users/${userId}/verify`)
      .send({ username, password: 'iAmSkyw@lk3r' })
      .expect(200);

    assert(
      res.body.username === username,
      'Username not saved when verifying user'
    );

    res = await app
      .get(`/api/users/${userId}`)
      .set('Cookie', cookie)
      .expect(200);

    assert(
      res.body.username === username,
      'Correct username not returned in GET call after verification'
    );
  });
  it('should not verify user if username is already taken', async () => {
    const firstName = 'Rey';
    const lastName = 'Skywalker';

    await app.post('/api/users').send({ firstName, lastName }).expect(401);
    let res = await app
      .post('/api/users')
      .set('Cookie', cookie)
      .send({ firstName, lastName })
      .expect(200);

    const userId1 = res.body._id;
    const username = 'rey3';

    res = await app
      .post(`/api/users/${userId1}/verify`)
      .send({ username, password: 'iAmSkyw@lk3r' })
      .expect(200);

    res = await app
      .post('/api/users')
      .set('Cookie', cookie)
      .send({ firstName, lastName })
      .expect(200);

    const userId2 = res.body._id;

    res = await app
      .post(`/api/users/${userId2}/verify`)
      .send({ username, password: 'iAmSkyw@lk3r' })
      .expect(400);
  });
  it('should not allow verification of already verified user', async () => {
    const firstName = 'Rey';
    const lastName = 'Skywalker';

    await app.post('/api/users').send({ firstName, lastName }).expect(401);
    let res = await app
      .post('/api/users')
      .set('Cookie', cookie)
      .send({ firstName, lastName })
      .expect(200);

    const userId = res.body._id;
    const username = 'rey4';

    res = await app
      .post(`/api/users/${userId}/verify`)
      .send({ username, password: 'iAmSkyw@lk3r' })
      .expect(200);

    res = await app
      .post(`/api/users/${userId}/verify`)
      .send({ username, password: 'iAmSkyw@lk3r' })
      .expect(400);
  });
  it('should allow login for verified user with correct password', async function () {
    this.timeout(50000);
    const firstName = 'Rey';
    const lastName = 'Skywalker';

    await app.post('/api/users').send({ firstName, lastName }).expect(401);
    let res = await app
      .post('/api/users')
      .set('Cookie', cookie)
      .send({ firstName, lastName })
      .expect(200);

    const userId = res.body._id;
    const username = 'rey5';
    const password = 'iAmSkyw@lk3r';

    res = await app
      .post(`/api/users/${userId}/verify`)
      .send({ username, password })
      .expect(200);

    await app
      .post('/api/login')
      .send(`username=${username}&password=${password}`)
      .expect(200);

    await app
      .post('/api/login')
      .send(`username=${username}&password=blah`)
      .expect(401);
  });
});
