const { app } = require('./setup');

describe('User authentication', () => {
  it('should not allow access to protected endpoints without login', (done) => {
    app.get('/api/users').expect(401, done);
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
        app.get('/api/users')
          .set('Cookie', cookie)
          .expect(200, done);
      });
  });
});
