const express = require('express');
require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors")
const { MongoClient, ServerApiVersion ,ObjectId} = require('mongodb');

const app = express()
const jwt = require('jsonwebtoken');
const port = process.env.POST || 3000;


app.use(express.json())
app.use(cookieParser());
app.use(cors())


// app.use(cors({
//   origin: "http://localhost:5173",
//   credentials: true
// }));



// Firebase setup

const admin = require("firebase-admin");

const decoded = Buffer.from(process.env.FIREBASE_SERVICE_KEY, "base64").toString("utf8");
const serviceAccount = JSON.parse(decoded);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});




// MongoDB setup
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.uscngbq.mongodb.net/?appName=Cluster0`;

let listings;
let orders;
let client;


async function connectToMongoDB() {
  if (client && client.topology && client.topology.isConnected()) return
  try {
        client = new MongoClient(uri, {
          serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
          }
        });
    
     const database = client.db("pawMart");
    
     listings = database.collection("listings")
     orders = database.collection("orders")

    console.log("MongoDB Connected and Collections Initialized!");
  } catch (error) {
    console.error("MongoDB Connection or Initialization Error:", error);
    throw error;
  }
}

app.use(async (req,res,next) => {
  try {
    await connectToMongoDB();
    next()
  } catch (error) {
    res.status(503).json({ success: false, message: "Service Unavailable: Database connection failed." });
  }
})

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });



// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();
//     // Send a ping to confirm a successful connection
//     // await client.db("admin").command({ ping: 1 });


//     const database = client.db("pawMart");
    
//      listings = database.collection("listings")
//      orders = database.collection("orders")

// } catch(e) {
//       console.error("MongoDB Connection or Initialization Error:", e);
//   }
// }

// run().catch(console.dir);



      // verify firebase token and set in cookie
      //   app.post("/set-token", async (req, res) => {
      //   const authHeader = req.headers.authorization;
      //   if (!authHeader) return res.status(401).json({ message: "No token" });

      //   const token = authHeader.split(" ")[1];

      //   try {
      //     const decodedUser = await admin.auth().verifyIdToken(token);

      //     res.cookie("accessToken", token, {
      //       httpOnly: true,   
      //       secure: false,    
      //       sameSite: "lax",
      //       maxAge: 24 * 60 * 60 * 1000
      //     });

      //     res.status(200).json({
      //       success: true,
      //       message: "Firebase token saved in cookie",
      //       email: decodedUser.email
      //     });
      //   } catch (error) {
      //     res.status(401).json({ message: "Invalid Firebase token" });
      //   }
      // });


    // const verifyFirebaseToken = async (req, res, next) => {
    //   const authHeader = req.headers.authorization;
    //   if (!authHeader) return res.status(401).json({ message: "No token" });
      
    //   const token = authHeader.split(" ")[1];
    //   console.log(token)
    //   try {
    //     const decoded = await admin.auth().verifyIdToken(token);
    //     req.user_email = decoded.email;
    //     next();
    //   } catch (err) {
    //     res.status(401).json({ message: "Invalid token" });
    //   }
    // };


    //cookie verifier middleware
    // const verifyFirebaseCookie = async (req, res, next) => {
    //   const token = req.cookies.accessToken; 
    //   console.log(token)
    //   if (!token) return res.status(401).json({ message: "Invalid credential" });
    //   try {
    //     const decoded = await admin.auth().verifyIdToken(token);
    //     req.user_email = decoded.email;
    //     next();
    //   } catch (error) {
    //     res.status(401).json({ message: "Invalid credential" });
    //   }
    // };

    // const  authorization = async (req,res,next) => {
    //   const token = req.headers.authorization.split(" ")[1];
      
    //   if (!req.headers.authorization && !token) return res.status(401).json({
    //     message : "Unauthorize user "
    //   })
    //   try {
    //     const user = await admin.auth().verifyIdToken(token);
    //     req.user_email = user.email
    //     next()
    //   } catch {
    //     return res.status(401).json({
    //       message: "Unauthorize user "
    //     }
    //   )}
      
    // }; 
    app.get('/', (req, res) => {
      res.send('Hello World! from pawMart')
    })
 

    //all list without pagination 
    app.get("/allListing", async (req, res) => {
      const data = await listings.find().toArray()
      res.status(200).json({
         success: true,
          data
      })
    })


    //get all listing with pagination 
    app.get("/allList", async (req, res) => {
      const page = parseInt(req.query.page) || 1;
      const limitNums = parseInt(req.query.limit) || 6;
      const skipNum = (page - 1) * limitNums;
      
      const { search = "", category = "" } = req.query;

      const query = {};
      if (category && category !== "All") query.category = category;
      if(search) query.name =  {$regex :search ,options : 'i'}

      const data = await listings.find(query).limit(limitNums).skip(skipNum).toArray();
      const totalListing = await listings.countDocuments();
      const totalPage = Math.ceil(totalListing / limitNums);

      res.status(200).json({
        
        total: totalListing,
        skip: skipNum,
        limit :limitNums,
        data: data,
      })
    })



    // create listings 
    app.post("/listings",  async (req, res) => {
      try {
        const result = await listings.insertOne(req.body)
        res.status(200).json({
         success: true,
         data:result
         })
      } catch (error) {
        console.log(error)
      }
    })

    //get single Listing for details 
    app.get("/allList/:id", async (req, res) => {
      const { id } = req.params;
      try {
        let query;
       
        if (/^[0-9a-fA-F]{24}$/.test(id)) {
          query = { _id: new ObjectId(id) };
        } 
        else {
          query = { _id: id };
        }
        const result = await listings.findOne(query);
        console.log(result)
        if (!result) {
          return res.status(404).json({ success: false, message: "Listing not found" });
        }

        res.status(200).json({ success: true, data: result });
      } catch (error) {
        console.error("Error fetching listing:", error);
        res.status(500).json({ success: false, message: "Server error" });
      }
    });
  

    //update listing 
    app.put("/listings/:id",async (req, res) => {
      const { id } = req.params;
      const updateData = req.body;
      try {
        const filter  =  /^[0-9a-fA-F]{24}$/.test(id)
      ? { _id: new ObjectId(id) }
          : { _id: id };
        const updateDoc = {
          $set : updateData
        }
        const result = await listings.updateOne(filter, updateDoc);
        if (result.matchedCount === 0) {
          return res.status(404).json({ success: false, message: "Listing not found" });
        }
         res.status(200).json({ success: true, message: "Listing updated successfully" });
      } catch (error) {
        console.error("Error updating listing:", error);
        res.status(500).json({ success: false, message: "Server error" });
      }
    })

    //delete a listing 
    app.delete('/listings/:id', async (req, res) => {
      const {id} = req.params
      const filter  =  /^[0-9a-fA-F]{24}$/.test(id)
      ? { _id: new ObjectId(id) }
        : { _id: id };
      try {
        const result = await listings.deleteOne(filter);
        res.status(200).json({ success: true, message: "Listing deleted successfully" });
      } catch (error) {
         console.error("Error Deleting listing:", error);
        res.status(500).json({ success: false, message: "Server error" });
      }
    })

    //post  order
    app.post('/orders/', async (req, res) => {
      // if (req.user_email !== req.body.email) {
      //   return res.status(403).json({
      //     success: false,
      //     message: "Access denied: You are not authorized to view this resource.",
      //   });
      // }
      const data = req.body;
      const result = await orders.insertOne({...data,createdAt:new Date()});
      res.status(201).json({
        success: true,
        message: "Order created successfully",
        product:result
      })
    })
    
    //get all orders by user email 
    app.get('/orders/:email', async (req, res) => {
      //  if (req.user_email !==  req.params.email) {
      //   return res.status(403).json({
      //     success: false,
      //     message: "Access denied: You are not authorized to view this resource.",
      //   });
      // }
     try {
       const buyerEmail = req.params.email
      console.log(buyerEmail)
      const query ={buyerEmail}
      const result = await orders.find(query).toArray();
      res.status(200).json(result)
     } catch (error) {
      console.log(error)
     }
    })

    //get all orders by user email 
    app.get('/mylisting/:email', async (req, res) => {
     
      // if (req.user_email !== req.params.email) {
      //   return res.status(403).json({
      //     success: false,
      //     message: "Access denied: You are not authorized to view this resource.",
      //   });
      // }
      const query ={"email" :req.params.email}
      const result = await listings.find(query).toArray();
      res.status(200).json(result)
    })

    // 🗑️ Delete a single order
    app.delete("/orders/:id", async (req, res) => {
      try {
        const query = { _id: new ObjectId(req.params.id) };
        const result = await orders.deleteOne(query);

        if (result.deletedCount > 0) {
          res.status(200).json({
            success: true,
            message: "Order deleted successfully",
          });
        } else {
          res.status(404).json({
            success: false,
            message: "Order not found",
          });
        }
      } catch (error) {
        console.error("Error deleting order:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    });







    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  


// Instead export the Express app
module.exports = app;


// app.listen(port, () => {
//   console.log(`app listening on port ${port}`)
// })


