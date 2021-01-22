const { assert } = require('chai');
const supertest = require('supertest');
const bodyParser = require('body-parser');

let app = require('express')();
app.use(bodyParser.json());
const employeeRouter = require('../../app/routers/employee');
app.use(employeeRouter);

// The employeeRouter does not include the prefix `/api/employees`
app = supertest(app);

describe('Employee router', () => {
  it('should have an endpoint to get list of all employees', (done) => {
    app.get('/').expect('Content-Type', /json/).expect(200, done);
  });

  it('should create a new employee in database', async () => {
    let res = await app.get('/').expect(200);
    assert(
      Array.isArray(res.body.employees),
      'GET /api/employees response has no property "employees" ... (1)'
    );

    const currentLength = res.body.employees.length;
    const expectedLength = currentLength + 1;

    res = await app
      .post('/')
      .send({ employeeId: 'CN00100', firstName: 'Chuck', lastName: 'Norris' })
      .expect(200);

    res = await app.get('/').expect(200);
    assert(
      Array.isArray(res.body.employees),
      'GET /api/employees response has no property "employees" .... (2)'
    );

    assert(
      res.body.employees.length === expectedLength,
      'Employee record not created!'
    );
  });

  it('should have an endpoint to get the details of a single employee', async () => {
    const employeeId = 'LS01234';
    const firstName = 'Luke';
    const lastName = 'Skywalker';

    let res = await app.post('/').send({ employeeId, firstName, lastName });
    const userId = res.body._id;

    res = await app.get(`/${userId}`).expect(200);

    const userData = res.body;
    assert(userData._id === userId);
    assert(userData.firstName === firstName);
    assert(userData.lastName === lastName);
    assert(userData.lastName === lastName);
  });

  it('should require first and last names when creating employee', async () => {
    const firstName = 'Han';
    const lastName = 'Solo';
    await app.post('/').send({ firstName }).expect(400);
    await app.post('/').send({ lastName }).expect(400);
    await app.post('/').send({}).expect(400);
  });

  it('should not allow creating an employee with a date of birth in the future', async () => {
    const employeeId = 'HS00838';
    const firstName = 'Han';
    const lastName = 'Solo';
    const pastDate = new Date(1993, 5, 15);
    const futureDate = new Date(Date.now() + 1e10);
    await app
      .post('/')
      .send({ employeeId, firstName, lastName, dateOfBirth: futureDate })
      .expect(400);
    await app
      .post('/')
      .send({ employeeId, firstName, lastName, dateOfBirth: pastDate })
      .expect(200);
  });

  it('should not allow a negative number as salary', async () => {
    const employeeId = 'LO01101';
    const firstName = 'Leia';
    const lastName = 'Organa';
    await app
      .post('/')
      .send({ employeeId, firstName, lastName, salary: -10000 })
      .expect(400);

    await app
      .post('/')
      .send({ employeeId, firstName, lastName, salary: 0 })
      .expect(400);

    await app
      .post('/')
      .send({ employeeId, firstName, lastName, salary: 10000 })
      .expect(200);
  });

  it('should not allow an employee id that is already taken', async () => {
    await app
      .post('/')
      .send({ employeeId: 'CN00101', firstName: 'Chuck', lastName: 'Norris' })
      .expect(200);

    const res = await app
      .post('/')
      .send({ employeeId: 'CN00101', firstName: 'Chuck', lastName: 'Norris' })
      .expect(400);

    assert(
      res.body.message,
      'Response does not contain information about error'
    );
  });
});
