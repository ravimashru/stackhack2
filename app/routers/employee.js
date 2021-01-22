const express = require('express');

const employeeRouter = express.Router();

const { getEmployeeModel } = require('../../database');

employeeRouter.get('/', async (req, res) => {
  const Employee = getEmployeeModel();
  const employees = await Employee.find();
  return res.json({ employees }).status(200);
});

employeeRouter.get('/:userId', async (req, res) => {
  const Employee = getEmployeeModel();
  const employee = await Employee.findById(req.params.userId);
  return res.json(employee).status(200);
});

employeeRouter.post('/', async (req, res) => {
  const Employee = getEmployeeModel();
  const employeeDetails = req.body;

  // Do not allow employee id that is already taken
  const existingEmployee = await Employee.findOne({
    employeeId: employeeDetails.employeeId,
  }).exec();
  if (existingEmployee) {
    res.status(400).json({
      message: 'The employee id used is already assigned to another employee',
    });
  }

  try {
    const employee = await Employee.create(employeeDetails);
    res.json(employee);
  } catch (e) {
    res.status(400).json(e);
  }
});

module.exports = employeeRouter;
