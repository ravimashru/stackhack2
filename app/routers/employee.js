const express = require('express');

const employeeRouter = express.Router();

const { getEmployeeModel } = require('../../database');

employeeRouter.get('/', async (req, res) => {
  const Employee = getEmployeeModel();
  const employees = await Employee.find();
  return res.json({ employees }).status(200);
});

employeeRouter.get('/:id', async (req, res) => {
  const Employee = getEmployeeModel();
  const employee = await Employee.findById(req.params.id);
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

employeeRouter.put('/:id', async (req, res) => {
  const updatedDetails = req.body;

  // Employee ID cannot be changed
  if (Object.keys(updatedDetails).includes('employeeId')) {
    res.status(400).end();
  }

  const Employee = getEmployeeModel();
  const employee = await Employee.findById(req.params.id).exec();
  if (!employee) {
    return res.status(404).end();
  }

  Object.assign(employee, updatedDetails);
  await employee.save();

  res.status(200).end();
});

employeeRouter.delete('/:id', async (req, res) => {
  const Employee = getEmployeeModel();
  const employee = await Employee.findById(req.params.id).exec();
  if (!employee) {
    return res.status(404).end();
  }

  employee.deleted = true;
  await employee.save();
  res.status(204).end();
});

module.exports = employeeRouter;
