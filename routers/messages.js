const express = require("express");
const router = express()
const client = require("../dbConnect/connect");
const { ObjectId } = require("mongodb");


// routes/messages.js
const collection = client.db().collection('messages');

// Create a route for getting all message
router.get('/messages/ofConversations/:id', async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            res.status(404).send({ message: 'No id found', error: 404 });
            return;
        }
        const conversations = await collection.find({ "conversationId": id }).toArray();
        res.status(200).send({ message: 'message fetched successfully', data: conversations });
    } catch (err) {
        res.status(500).send({ message: 'Error getting message', error: err });
    }
});

// Create a route for getting all message
router.post('/messages', async (req, res) => {
    try {
        const body = req.body;
        if (!body) {
            res.status(404).send({ message: 'No data found', error: 404 });
            return;
        }
        const result = await collection.insertOne(body);
        res.status(200).send({ message: 'message added successfully', data: body, id: result?.insertedId });
    } catch (err) {
        res.status(500).send({ message: 'Error getting message', error: err });
    }
});

module.exports = router;