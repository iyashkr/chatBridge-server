const express = require("express");
const router = express()
const client = require("../dbConnect/connect")


// routes/users.js
const collection = client.db().collection('users');

// Create a route for getting all user
router.get('/users', async (req, res) => {
    try {
        const users = await collection.find().toArray();
        res.status(200).send({ message: 'User fetched successfully', user: users });
    } catch (err) {
        res.status(500).send({ message: 'Error getting user', error: err });
    }
});



// Create a route for adding a user
router.post('/users', async (req, res) => {
    try {
        const user = req.body;
        if (!user) {
            res.status(404).send({ message: 'No data found', error: 404 });
            return;
        }
        const result = await collection.insertOne(user);
        const updatedUser = await collection.findOne({ _id: result.insertedId });
        res.status(200).send({ message: 'User added successfully', user: updatedUser });
    } catch (err) {
        res.status(500).send({ message: 'Error adding user', error: err });
    }
});

// Create a route for getting a user by its ID
router.get('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await collection.findOne({ _id: userId });
        res.status(200).send({ message: 'User retrieved successfully', user });
    } catch (err) {
        res.status(500).send({ message: 'Error getting user', error: err });
    }
});

// Create a route for updating a user
router.put('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const user = req.body;
        const result = await collection.updateOne({ _id: userId }, { $set: user });
        const updatedUser = await collection.findOne({ _id: userId });
        res.status(200).send({ message: 'User updated successfully', user: updatedUser });
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: 'Error updating user', error: err });
    }
});

// Create a route for deleting a user
router.delete('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const result = await collection.deleteOne({ _id: userId });
        res.status(200).send({ message: 'User deleted successfully', status: true, id: userId });
    } catch (err) {
        res.status(500).send({ message: 'Error deleting user', error: err });
    }
});


module.exports = router;