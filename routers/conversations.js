const express = require("express");
const router = express()
const client = require("../dbConnect/connect");
const { ObjectId } = require("mongodb");


// routes/conversations.js
const collection = client.db().collection('conversations');

// Create a route for getting all conversation
router.get('/conversations', async (req, res) => {
    try {
        const conversations = await collection.find().toArray();
        res.status(200).send({ message: 'conversation fetched successfully', data: conversations });
    } catch (err) {
        res.status(500).send({ message: 'Error getting conversation', error: err });
    }
});

// Create a route for adding a conversation
router.post('/conversations', async (req, res) => {
    try {
        const { members } = req.body;
        if (!members || members.length !== 2) {
            return res.status(400).json({ message: 'Invalid request body' });
        }

        // Check if a conversation already exists for the given members
        const sortedMembers = members.sort();
        const existingConversation = await collection.findOne({ members: sortedMembers });

        if (existingConversation) {
            // Return the existing conversation if found
            return res.status(200).json({ message: 'Conversation already exists', data: existingConversation });
        }

        // Create a new conversation if not found
        const newConversation = {
            members: sortedMembers,
            createdAt: Date.now()
        };
        const result = await collection.insertOne(newConversation);

        // Fetch user details for the new conversation using aggregation
        const conversation = await collection.aggregate([
            { $match: { _id: result.insertedId } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'members',
                    foreignField: '_id',
                    as: 'users'
                }
            },
            {
                $project: {
                    _id: 1,
                    messages: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    members: {
                        $map: {
                            input: '$users',
                            as: 'user',
                            in: {
                                _id: '$$user._id',
                                displayName: '$$user.displayName',
                                activeStatus: '$$user.activeStatus',
                                photoUrl: '$$user.photoURL'
                            }
                        }
                    }
                }
            }
        ]).next();

        res.status(201).json({ message: 'Conversation added successfully', data: conversation });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding conversation' });
    }
});

router.get('/conversations/:id', async (req, res) => {
    try {
        const pipeline = [
            {
                $match: {
                    _id: new ObjectId(req.params.id),
                },
            },
            {
                $lookup: {
                    from: 'users',
                    let: { memberIds: '$members' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $in: ['$_id', '$$memberIds'] },
                            },
                        },
                        {
                            $project: {
                                _id: 1,
                                displayName: 1,
                                email: 1,
                                photoURL: 1,
                            },
                        },
                    ],
                    as: 'members',
                },
            },
        ];

        const conversation = await collection.aggregate(pipeline).next();

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        res.json(conversation);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});




// Get all conversations for a given user
router.get('/conversations/byUser/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const conversations = await collection.aggregate([
            { $match: { members: userId } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'members',
                    foreignField: '_id',
                    as: 'users'
                }
            },
            {
                $project: {
                    _id: 1,
                    messages: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    members: {
                        $map: {
                            input: '$users',
                            as: 'user',
                            in: {
                                _id: '$$user._id',
                                displayName: '$$user.displayName',
                                activeStatus: '$$user.activeStatus',
                                photoUrl: '$$user.photoURL',
                            }
                        }
                    }
                }
            }
        ]).toArray();
        res.status(200).send({ message: 'Conversations fetched successfully', data: conversations });
    } catch (err) {
        res.status(500).send({ message: 'Error fetching conversations', error: err });
    }
});


// Create a route for updating a conversation
router.put('/conversations/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const conversation = req.body;
        if (!conversation) {
            res.status(404).send({ message: 'No data found', error: 404 });
            return;
        }
        const result = await collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $push: { conversation: conversation } },
            { returnOriginal: false }
        );
        res.status(200).send({ message: 'conversation updated successfully', data: result.value });
    } catch (err) {
        console.error(err); // log the error to the console for debugging purposes
        res.status(500).send({ message: 'Error updating conversation', error: err });
    }
});



// Create a route for deleting a conversation
router.delete('/conversations/:id', async (req, res) => {
    try {
        const conversationId = req.params.id;
        const result = await collection.deleteOne({ _id: conversationId });
        res.status(200).send({ message: 'conversation deleted successfully', status: true, id: conversationId });
    } catch (err) {
        res.status(500).send({ message: 'Error deleting conversation', error: err });
    }
});


module.exports = router;