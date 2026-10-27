// Task1: initiate app and run server at 3000
const express = require('express');
const app = new express();
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const path=require('path');
app.use(express.static(path.join(__dirname+'/dist/FrontEnd')));
app.use(express.static(path.join(__dirname, 'dist', 'Frontend')));

// Task2: create mongoDB connection 
const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB Atlas connection string (can be configured via .env or fallback string)
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://userone:userone@cluster0.5g1pl.mongodb.net/EmployeeDB?retryWrites=true&w=majority";

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB Atlas successfully');
    })
    .catch((err) => {
        console.log('Error connecting to MongoDB Atlas: ' + err.message);
    });

// Employee Schema & Model
const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    salary: {
        type: Number,
        required: true
    }
}, { versionKey: false });

const Employee = mongoose.model('Employee', employeeSchema);

//Task 2 : write api with error handling and appropriate api mentioned in the TODO below

//TODO: get data from db  using api '/api/employeelist'
app.get('/api/employeelist', async (req, res) => {
    try {
        const employees = await Employee.find();
        res.status(200).send(employees);
    } catch (error) {
        res.status(500).send({ message: 'Error retrieving employee list', error: error.message });
    }
});

//TODO: get single data from db  using api '/api/employeelist/:id'
app.get('/api/employeelist/:id', async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).send({ message: 'Employee not found' });
        }
        res.status(200).send(employee);
    } catch (error) {
        res.status(500).send({ message: 'Error retrieving employee', error: error.message });
    }
});

//TODO: send data from db using api '/api/employeelist'
//Request body format:{name:'',location:'',position:'',salary:''}
app.post('/api/employeelist', async (req, res) => {
    try {
        const { name, location, position, salary } = req.body;
        const newEmployee = new Employee({
            name,
            location,
            position,
            salary
        });
        const savedEmployee = await newEmployee.save();
        res.status(201).send(savedEmployee);
    } catch (error) {
        res.status(500).send({ message: 'Error adding employee', error: error.message });
    }
});

//TODO: delete a employee data from db by using api '/api/employeelist/:id'
app.delete('/api/employeelist/:id', async (req, res) => {
    try {
        const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);
        if (!deletedEmployee) {
            return res.status(404).send({ message: 'Employee not found' });
        }
        res.status(200).send({ message: 'Employee deleted successfully', deletedEmployee });
    } catch (error) {
        res.status(500).send({ message: 'Error deleting employee', error: error.message });
    }
});

//TODO: Update  a employee data from db by using api '/api/employeelist'
//Request body format:{name:'',location:'',position:'',salary:''}
app.put('/api/employeelist', async (req, res) => {
    try {
        const { _id, id, name, location, position, salary } = req.body;
        const empId = _id || id;
        let updatedEmployee;

        if (empId) {
            updatedEmployee = await Employee.findByIdAndUpdate(
                empId,
                { name, location, position, salary },
                { new: true, runValidators: true }
            );
        } else {
            updatedEmployee = await Employee.findOneAndUpdate(
                { name },
                { location, position, salary },
                { new: true, runValidators: true }
            );
        }

        if (!updatedEmployee) {
            return res.status(404).send({ message: 'Employee not found' });
        }
        res.status(200).send(updatedEmployee);
    } catch (error) {
        res.status(500).send({ message: 'Error updating employee', error: error.message });
    }
});

// Support for PUT with id parameter
app.put('/api/employeelist/:id', async (req, res) => {
    try {
        const { name, location, position, salary } = req.body;
        const updatedEmployee = await Employee.findByIdAndUpdate(
            req.params.id,
            { name, location, position, salary },
            { new: true, runValidators: true }
        );
        if (!updatedEmployee) {
            return res.status(404).send({ message: 'Employee not found' });
        }
        res.status(200).send(updatedEmployee);
    } catch (error) {
        res.status(500).send({ message: 'Error updating employee', error: error.message });
    }
});

//! dont delete this code. it connects the front end file.
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname + '/dist/Frontend/index.html'));
});

// Run server at port 3000 (when running locally)
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running at port ${PORT}`);
    });
}

module.exports = app;
