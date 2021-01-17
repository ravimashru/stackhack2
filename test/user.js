const { assert } = require('chai');
const { app } = require('./setup');

describe('User', () => {
  let cookie;
  before((done) => {
    app
      .post('/api/login')
      .send('username=test&password=test')
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        cookie = res.get('set-cookie');
        done();
      });
  });

  it('should work', () => {
    assert(true, 'Sanity check failed!!!');
  });

  it('should have an endpoint to get list of all users', (done) => {
    app
      .get('/api/users')
      .set('Cookie', cookie)
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});
