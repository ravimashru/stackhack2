const { assert } = require('chai');
const { app } = require('../setup');

describe('User authentication', () => {
  it('should not allow access to protected endpoints without login', (done) => {
    app.get('/api/me').expect(401, done);
  });

  it('should allow access to protected endpoints after login', (done) => {
    app
      .post('/api/login')
      .send('username=test&password=test')
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        const cookie = res.get('set-cookie');
        app.get('/api/me').set('Cookie', cookie).expect(200, done);
      });
  });

  it('should not allow access to protected endpoint after logout', async () => {
    let res = await app
      .post('/api/login')
      .send('username=test&password=test')
      .expect(200);

    const cookie = res.get('set-cookie');
    assert(!!cookie, 'Cookie not returned from login endpoint');

    await app.get('/api/me').set('Cookie', cookie).expect(200);

    await app.post('/api/logout').set('Cookie', cookie).expect(200);

    await app.get('/api/me').set('Cookie', cookie).expect(401);
  });
});
