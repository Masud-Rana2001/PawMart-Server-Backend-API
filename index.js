const express = require("express");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "https://paw-martmr.netlify.app",
  })
);

app.use(async (req, res, next) => {
  console.log(
    `⚡ ${req.method} - ${req.path} from ${
      req.host
    } at ⌛ ${new Date().toLocaleString()}`
  );
  next();
});

//ports & clients

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.uscngbq.mongodb.net/?appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("Hello World! from pawMart");
});

async function run() {
  try {
    //  await client.connect();
    //DB & collections
    const database = client.db("pawMart");
    const listings = database.collection("listings");
    const orders = database.collection("orders");

    //Apps Route

    //all list without pagination
    app.get("/allListing", async (req, res) => {
      const data = await listings.find().toArray();
      res.status(200).json({
        success: true,
        data,
      });
    });

    //get all listing with pagination
    app.get("/allList", async (req, res) => {
      const page = parseInt(req.query.page) || 1;
      const limitNums = parseInt(req.query.limit) || 6;
      const skipNum = (page - 1) * limitNums;

      const { search = "", category = "" } = req.query;

      const query = {};
      if (category && category !== "All") query.category = category;
      if (search) query.name = { $regex: search, options: "i" };

      const data = await listings
        .find(query)
        .limit(limitNums)
        .skip(skipNum)
        .toArray();
      const totalListing = await listings.countDocuments();
      const totalPage = Math.ceil(totalListing / limitNums);

      res.status(200).json({
        total: totalListing,
        skip: skipNum,
        limit: limitNums,
        data: data,
      });
    });

    // create listings
    app.post("/listings", async (req, res) => {
      try {
        const result = await listings.insertOne(req.body);
        res.status(200).json({
          success: true,
          data: result,
        });
      } catch (error) {
        console.log(error);
      }
    });

    //get single Listing for details
    app.get("/allList/:id", async (req, res) => {
      const { id } = req.params;
      try {
        let query;

        if (/^[0-9a-fA-F]{24}$/.test(id)) {
          query = { _id: new ObjectId(id) };
        } else {
          query = { _id: id };
        }
        const result = await listings.findOne(query);
        console.log(result);
        if (!result) {
          return res
            .status(404)
            .json({ success: false, message: "Listing not found" });
        }

        res.status(200).json({ success: true, data: result });
      } catch (error) {
        console.error("Error fetching listing:", error);
        res.status(500).json({ success: false, message: "Server error" });
      }
    });

    //update listing
    app.put("/listings/:id", async (req, res) => {
      const { id } = req.params;
      const updateData = req.body;
      try {
        const filter = /^[0-9a-fA-F]{24}$/.test(id)
          ? { _id: new ObjectId(id) }
          : { _id: id };
        const updateDoc = {
          $set: updateData,
        };
        const result = await listings.updateOne(filter, updateDoc);
        if (result.matchedCount === 0) {
          return res
            .status(404)
            .json({ success: false, message: "Listing not found" });
        }
        res
          .status(200)
          .json({ success: true, message: "Listing updated successfully" });
      } catch (error) {
        console.error("Error updating listing:", error);
        res.status(500).json({ success: false, message: "Server error" });
      }
    });

    //delete a listing
    app.delete("/listings/:id", async (req, res) => {
      const { id } = req.params;
      const filter = /^[0-9a-fA-F]{24}$/.test(id)
        ? { _id: new ObjectId(id) }
        : { _id: id };
      try {
        const result = await listings.deleteOne(filter);
        res
          .status(200)
          .json({ success: true, message: "Listing deleted successfully" });
      } catch (error) {
        console.error("Error Deleting listing:", error);
        res.status(500).json({ success: false, message: "Server error" });
      }
    });

    //post  order
    app.post("/orders/", async (req, res) => {
      // if (req.user_email !== req.body.email) {
      //   return res.status(403).json({
      //     success: false,
      //     message: "Access denied: You are not authorized to view this resource.",
      //   });
      // }
      const data = req.body;
      const result = await orders.insertOne({ ...data, createdAt: new Date() });
      res.status(201).json({
        success: true,
        message: "Order created successfully",
        product: result,
      });
    });

    //get all orders by user email
    app.get("/orders/:email", async (req, res) => {
      //  if (req.user_email !==  req.params.email) {
      //   return res.status(403).json({
      //     success: false,
      //     message: "Access denied: You are not authorized to view this resource.",
      //   });
      // }
      try {
        const buyerEmail = req.params.email;
        console.log(buyerEmail);
        const query = { buyerEmail };
        const result = await orders.find(query).toArray();
        res.status(200).json(result);
      } catch (error) {
        console.log(error);
      }
    });

    //get all orders by user email
    app.get("/mylisting/:email", async (req, res) => {
      // if (req.user_email !== req.params.email) {
      //   return res.status(403).json({
      //     success: false,
      //     message: "Access denied: You are not authorized to view this resource.",
      //   });
      // }
      const query = { email: req.params.email };
      const result = await listings.find(query).toArray();
      res.status(200).json(result);
    });

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
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});