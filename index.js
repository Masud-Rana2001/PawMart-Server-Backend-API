const express = require('express');
require("dotenv").config();

const cors = require("cors")
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express()
const jwt = require('jsonwebtoken');
const port = process.env.POST || 3000;

app.use(cors())
app.use(express.json())

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
// const uri = `mongodb+srv://mdmasudrana307801_db_user:oeAo4Dw3GZMT1guC@cluster0.uscngbq.mongodb.net/?appName=Cluster0`
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.uscngbq.mongodb.net/?appName=Cluster0`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });


    const database = client.db("pawMart");
    const listings = database.collection("listings")
    const orders = database.collection("orders")


    // all api routes is here 






    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
  
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('Hello World! from pawMart')
})

app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})


