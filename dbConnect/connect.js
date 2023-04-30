const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = `mongodb+srv://demo:password@chatbridge.djyzhiv.mongodb.net/ChatBridge?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

module.exports = client;
