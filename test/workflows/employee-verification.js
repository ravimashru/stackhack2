const { assert } = require('chai');
const { app } = require('../setup');

const { connect, getUserModel } = require('../../database');

describe('Employee verification', () => {
  let cookie;
  let User;
  before(async function () {
    this.timeout(50000);
    const res = await app
      .post('/api/login')
      .send('username=test&password=test')
      .expect(200);

    cookie = res.get('set-cookie');
  });

  before(async () => {
    await connect();
    User = getUserModel();
  });

  it('should save username, passwordHash and employee id of activated user', async () => {
    // Create employee record
    let res = await app
      .post('/api/employees')
      .set('Cookie', cookie)
      .send({ employeeId: 'CN01001', firstName: 'Chuck', lastName: 'Norris' })
      .expect(200);

    assert(!!res.body._id, 'ID of newly created employee record not returned');

    const employeeId = res.body._id;

    // Activate user
    const username = 'chucknorris';
    const password = 'chucknorrisdoesntneedapassword';
    res = await app
      .post(`/api/verify/${employeeId}`)
      .send({ username, password })
      .expect(200);

    assert(
      !res.body.passwordHash,
      'Created user object should not return passwordHash!'
    );

    const createdUser = await User.findById(res.body._id).exec();
    assert(createdUser, 'Created user object not returned from User model');
    assert(
      createdUser.employeeId.toString() === employeeId,
      `Expected user to have employeeId '${employeeId}', but found '${createdUser.employeeId}'`
    );
    assert(
      createdUser.username === username,
      `Expected user object to have username '${username}', got '${createdUser.username}`
    );
    assert(
      createdUser.passwordHash,
      'Created user object does not have passwordHash'
    );
  });

  it('should require both username and password for user activation', async () => {
    // Create employee record
    let res = await app
      .post('/api/employees')
      .set('Cookie', cookie)
      .send({ employeeId: 'CN01002', firstName: 'Chuck', lastName: 'Norris' })
      .expect(200);

    assert(!!res.body._id, 'ID of newly created employee record not returned');
    const employeeId = res.body._id;
    res = await app.post(`/api/verify/${employeeId}`).expect(400);
  });

  it('should not activate user if username is already taken', async () => {
    // Create employee1 record
    let res = await app
      .post('/api/employees')
      .set('Cookie', cookie)
      .send({ employeeId: 'SW14123', firstName: 'Darth', lastName: 'Vader' })
      .expect(200);

    assert(!!res.body._id, 'ID of newly created employee record not returned');

    let employeeId = res.body._id;

    // Activate user 1
    let username = 'thedarklord';
    let password = 'J3d1sR$tup1d!';
    res = await app
      .post(`/api/verify/${employeeId}`)
      .send({ username, password })
      .expect(200);

    // Create employee2 record
    res = await app
      .post('/api/employees')
      .set('Cookie', cookie)
      .send({ employeeId: 'SW12935', firstName: 'Darth', lastName: 'Sidious' })
      .expect(200);

    assert(!!res.body._id, 'ID of newly created employee record not returned');

    employeeId = res.body._id;

    // Activate user 2
    username = 'thedarklord';
    password = 'Th3F0rCeR0cks!';
    res = await app
      .post(`/api/verify/${employeeId}`)
      .send({ username, password })
      .expect(409);

    assert(
      res.body.message,
      'Response does not contain information about error'
    );
  });

  it('should not allow activation of already activated user', async () => {
    // Create employee record
    let res = await app
      .post('/api/employees')
      .set('Cookie', cookie)
      .send({ employeeId: 'SW14124', firstName: 'Luke', lastName: 'Skywalker' })
      .expect(200);

    assert(!!res.body._id, 'ID of newly created employee record not returned');

    const employeeId = res.body._id;

    // Activate user
    const username = 'mrskywalker';
    const password = 'I@mTh3F0rc3';
    await app
      .post(`/api/verify/${employeeId}`)
      .send({ username, password })
      .expect(200);

    // Try activating the user again
    res = await app
      .post(`/api/verify/${employeeId}`)
      .send({ username, password })
      .expect(403);

    assert(
      res.body.message,
      'Response does not contain information about error'
    );
  });

  it('should allow login for activated user with correct password', async function() {
    this.timeout(50000);
    // Create employee record
    let res = await app
      .post('/api/employees')
      .set('Cookie', cookie)
      .send({ employeeId: 'TU19248', firstName: 'Rey', lastName: 'Skywalker' })
      .expect(200);

    assert(!!res.body._id, 'ID of newly created employee record not returned');

    const employeeId = res.body._id;

    // Activate user
    const username = 'thenewskywalker';
    const password = 'correctpassword';
    await app
      .post(`/api/verify/${employeeId}`)
      .send({ username, password })
      .expect(200);

    // Log in with wrong credentials should fail
    res = await app
      .post('/api/login')
      .send(`username=${username}&password=wrongpassword`)
      .expect(401);

    assert(
      res.get('set-cookie'),
      'Authentication with wrong credentials sets a cookie'
    );

    // Log in with right credentials should work and authenticated route should be accessible
    res = await app
      .post('/api/login')
      .send(`username=${username}&password=${password}`)
      .expect(200);

      assert(
        res.get('set-cookie').length > 0,
        'Cookie not set after successful login.'
      );

    const userCookie = res.get('set-cookie');

    await app.get('/api/me').expect(401);
    await app.get('/api/me').set('Cookie', userCookie).expect(200);
  });
});
