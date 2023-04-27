const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = `mongodb+srv://TestUser:TestUser12@chatbridge.djyzhiv.mongodb.net/ChatBridge?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

module.exports = client;
