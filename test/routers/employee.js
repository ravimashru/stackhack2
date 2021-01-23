const { assert } = require('chai');
const supertest = require('supertest');
const bodyParser = require('body-parser');

let app = require('express')();
app.use(bodyParser.json());
const employeeRouter = require('../../app/routers/employee');
app.use(employeeRouter);

// The employeeRouter does not include the prefix `/api/employees`
app = supertest(app);

const { connect, getEmployeeModel } = require('../../database');

describe('Employee router', () => {
  let Employee;
  before(async () => {
    await connect();
    Employee = getEmployeeModel();
  });

  it('should have an endpoint to get list of all employees in JSON format', (done) => {
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

  // Updating employee details
  it('should update details in the database', async () => {
    // Create employee
    const employeeId = 'AS12841';
    const firstName = 'Anakin';
    const lastName = 'Skywalker';
    const res = await app
      .post('/')
      .send({ employeeId, firstName, lastName })
      .expect(200);

    const id = res.body._id;

    const newFirstName = 'Darth';
    const newLastName = 'Vader';
    const dateOfBirth = new Date(Date.now() - 1e10);
    const role = 'Lord';
    const team = 'The Sith Order';
    const salary = 100000;

    const updatePayload = {
      firstName: newFirstName,
      lastName: newLastName,
      dateOfBirth,
      role,
      team,
      salary,
    };

    // Update details
    await app.put(`/${id}`).send(updatePayload).expect(200);

    // Check database updated
    const createdEmployee = await Employee.findById(id).exec();
    assert(createdEmployee, 'Created user not found in database');

    const compareProps = (obj1, obj2) => {
      for (let prop of Object.keys(obj1)) {
        // We can't compare date values using `===` so we do it separately
        if (prop === 'dateOfBirth') {
          continue;
        }
        assert(
          obj2[prop] === obj1[prop],
          `Expected '${prop}' to be '${obj1[prop]}' but got '${obj2[prop]}'`
        );
      }
    };

    const assertSimilarity = (expected, actual) => {
      assert(
        expected.dateOfBirth.toString() ===
          new Date(actual.dateOfBirth).toString(),
        `Expected 'dateOfBirth' to be '${expected.dateOfBirth}', got '${actual.dateOfBirth}'`
      );
      compareProps(expected, actual);
    };

    assertSimilarity(updatePayload, createdEmployee);

    // Check for updated details in API - all employees
    const allEmployees = await app.get('/').expect(200);
    const employeeObject = allEmployees.body.employees.find(
      (e) => e._id === id
    );
    assert(employeeObject, 'Employee object not found in API response!');
    assertSimilarity(updatePayload, employeeObject);

    // Check for updated details in API - one employee
    const employeeDetails = await app.get(`/${id}`).expect(200);
    assertSimilarity(updatePayload, employeeDetails.body);
  });

  it('should not allow employeeId to be changed', async () => {
    const employeeId = 'AV12841';
    const firstName = 'Anakin';
    const lastName = 'Skywalker';
    const res = await app
      .post('/')
      .send({ employeeId, firstName, lastName })
      .expect(200);

    const id = res.body._id;

    await app.put(`/${id}`).send({ employeeId: 'DV12841' }).expect(400);
  });

  // Deleting employees
  it('should set deleted flag in database and return deleted flag in API', async () => {
    const employeeId = 'AV12941';
    const firstName = 'Anakin';
    const lastName = 'Skywalker';
    let res = await app
      .post('/')
      .send({ employeeId, firstName, lastName })
      .expect(200);

    const id = res.body._id;

    await app.delete(`/${id}`).expect(204);

    // Database should have flag set
    const createdEmployee = await Employee.findById(id).exec();
    assert(createdEmployee, 'Created user not found in database');
    assert(
      createdEmployee.deleted === true,
      'Database flag not updated for deleted employee'
    );

    // API call should have flag set
    res = await app.get(`/${id}`).expect(200);
    assert(
      res.body.deleted === true,
      'API not returning correct deleted flag'
    );
  });
});
