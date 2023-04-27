// server.js
const { ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./dbConnect/connect');
const PORT = 8080;

//Routes
const users = require("./routers/users")
const conversations = require("./routers/conversations");
const messages = require("./routers/messages");
const date = Date.now()

// Connect to the MongoDB
db.connect().then(() => {
    console.log('Connected to MongoDB:' + date.toString());
}).catch(err => console.log('Error connecting to the MongoDB:', err));

app.use(cors());
app.use(express.json());
app.use(users, conversations, messages)

// // create a change stream to monitor updates to a specific document
// const collectionName = 'conversations';
// const collection = db.db().collection(collectionName);
// const documentId = '643f59b9a01f8547f84fa7a8'; // replace with the ID of the document you want to monitor
// const changeStream = collection.watch([{ $match: { 'documentKey._id': new ObjectId(documentId) } }]);

// // set up event listener to handle changes
// changeStream.on('change', async (change) => {
//     console.log(change.updateDescription.updatedFields);
//     // handle the change as needed, such as sending updated data to clients
// });


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
