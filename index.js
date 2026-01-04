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
    // origin: "https://paw-martmr.netlify.app",
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
    await client.connect();
    //DB & collections
    const database = client.db("pawMart");
    const listings = database.collection("listings");
    const orders = database.collection("orders");
    const users = database.collection("users");
    const favorites = database.collection("favorites");

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
        const listingData = {
          ...req.body,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const result = await listings.insertOne(listingData);
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
      const query = { 
        $or: [
          { email: req.params.email },
          { ownerEmail: req.params.email }
        ]
      };
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

    // 👤 Get user profile by email
    app.get("/user/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const query = { email };
        const result = await users.findOne(query);
        
        if (!result) {
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }
        
        res.status(200).json({
          success: true,
          data: result,
        });
      } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    });

    // 🔄 Create or update user profile
    app.post("/user", async (req, res) => {
      try {
        const { email, displayName, photoURL, phone, bio } = req.body;
        
        if (!email) {
          return res.status(400).json({
            success: false,
            message: "Email is required",
          });
        }

        const query = { email };
        const existingUser = await users.findOne(query);

        if (existingUser) {
          // User already exists, don't create duplicate
          return res.status(200).json({
            success: true,
            message: "User already exists",
            data: existingUser,
          });
        }

        const newUser = {
          email,
          displayName: displayName || "",
          photoURL: photoURL || "",
          phone: phone || "",
          bio: bio || "",
          role: "user",
          rating: 0,
          totalOrders: 0,
          totalListings: 0,
          favoriteListings: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const result = await users.insertOne(newUser);

        res.status(201).json({
          success: true,
          message: "User profile created successfully",
          data: result,
        });
      } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    });

    // 🔄 Sync User on Login - Creates or updates user profile with all fields
    app.post("/user/sync", async (req, res) => {
      try {
        const { email, displayName, photoURL } = req.body;
        
        if (!email) {
          return res.status(400).json({
            success: false,
            message: "Email is required",
          });
        }

        const existingUser = await users.findOne({ email });

        if (existingUser) {
          // User exists, update with new info if provided
          const updatedUser = await users.findOneAndUpdate(
            { email },
            {
              $set: {
                displayName: displayName || existingUser.displayName,
                photoURL: photoURL || existingUser.photoURL,
                updatedAt: new Date(),
              }
            },
            { returnDocument: "after" }
          );

          return res.status(200).json({
            success: true,
            message: "User profile updated",
            data: updatedUser.value,
          });
        }

        // Create new user with all required fields
        const adminEmails = ["admin@pawmart.com"]; // Define admin emails
        const newUser = {
          email,
          displayName: displayName || email.split("@")[0],
          photoURL: photoURL || "",
          phone: "",
          bio: "",
          role: adminEmails.includes(email) ? "admin" : "user",
          rating: 5.0,
          totalOrders: 0,
          totalListings: 0,
          totalSales: 0,
          favoritesCount: 0,
          favoriteListings: [],
          orderHistory: [],
          listingHistory: [],
          badges: [],
          verificationStatus: "pending",
          accountStatus: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const result = await users.insertOne(newUser);

        res.status(201).json({
          success: true,
          message: "User profile created successfully",
          data: {
            _id: result.insertedId,
            ...newUser,
          },
        });
      } catch (error) {
        console.error("Error syncing user:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
          error: error.message,
        });
      }
    });

    // ✏️ Update user profile
    app.put("/user/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const { displayName, photoURL, phone, bio } = req.body;

        const query = { email };
        const updateData = {
          $set: {
            displayName: displayName || "",
            photoURL: photoURL || "",
            phone: phone || "",
            bio: bio || "",
            updatedAt: new Date(),
          },
        };

        const result = await users.updateOne(query, updateData, { upsert: true });

        if (result.matchedCount === 0 && result.upsertedCount === 0) {
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }

        res.status(200).json({
          success: true,
          message: "User profile updated successfully",
          data: result,
        });
      } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    });

    // ❤️ ADD TO FAVORITES
    app.post("/fav", async (req, res) => {
      try {
        const { listingId, userEmail } = req.body;
        
        if (!listingId || !userEmail) {
          return res.status(400).json({
            success: false,
            message: "Listing ID and user email are required",
          });
        }

        // Convert listingId to ObjectId if it's a valid MongoDB ID
        let listingIdQuery = listingId;
        if (/^[0-9a-fA-F]{24}$/.test(listingId)) {
          listingIdQuery = new ObjectId(listingId);
        }

        const query = { listingId: listingIdQuery, userEmail };
        const existingFav = await favorites.findOne(query);

        if (existingFav) {
          return res.status(200).json({
            success: false,
            message: "Already added to favorites",
          });
        }

        const newFav = {
          listingId: listingIdQuery,
          userEmail,
          createdAt: new Date(),
        };

        const result = await favorites.insertOne(newFav);

        res.status(201).json({
          success: true,
          message: "Added to favorites successfully",
          data: result,
        });
      } catch (error) {
        console.error("Error adding to favorites:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
          error: error.message
        });
      }
    });

    // 💔 REMOVE FROM FAVORITES
    app.delete("/fav/:listingId/:userEmail", async (req, res) => {
      try {
        const { listingId, userEmail } = req.params;

        // Convert listingId to ObjectId if it's a valid MongoDB ID
        let listingIdQuery = listingId;
        if (/^[0-9a-fA-F]{24}$/.test(listingId)) {
          listingIdQuery = new ObjectId(listingId);
        }

        const query = { listingId: listingIdQuery, userEmail };
        const result = await favorites.deleteOne(query);

        if (result.deletedCount > 0) {
          res.status(200).json({
            success: true,
            message: "Removed from favorites",
          });
        } else {
          res.status(404).json({
            success: false,
            message: "Favorite not found",
          });
        }
      } catch (error) {
        console.error("Error removing from favorites:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
          error: error.message
        });
      }
    });

    // 📋 GET USER FAVORITES
    app.get("/my-favorites/:userEmail", async (req, res) => {
      try {
        const { userEmail } = req.params;

        const favoritesData = await favorites.find({ userEmail }).toArray();
        
        // Handle both string and ObjectId formats
        const listingIds = favoritesData.map(fav => {
          if (typeof fav.listingId === 'string' && /^[0-9a-fA-F]{24}$/.test(fav.listingId)) {
            return new ObjectId(fav.listingId);
          }
          return fav.listingId;
        });

        const favoriteListings = await listings.find({ _id: { $in: listingIds } }).toArray();

        res.status(200).json({
          success: true,
          data: favoriteListings,
        });
      } catch (error) {
        console.error("Error fetching favorites:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
          error: error.message
        });
      }
    });

    // ✅ CHECK IF LISTING IS FAVORITE
    app.get("/is-favorite/:listingId/:userEmail", async (req, res) => {
      try {
        const { listingId, userEmail } = req.params;

        // Convert listingId to ObjectId if it's a valid MongoDB ID
        let listingIdQuery = listingId;
        if (/^[0-9a-fA-F]{24}$/.test(listingId)) {
          listingIdQuery = new ObjectId(listingId);
        }

        const result = await favorites.findOne({ listingId: listingIdQuery, userEmail });

        res.status(200).json({
          success: true,
          isFavorite: !!result,
        });
      } catch (error) {
        console.error("Error checking favorite:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
          error: error.message
        });
      }
    });

    // Dashboard Statistics Endpoints

    // Migration: Update existing listings to use ownerEmail if email field exists
    app.post("/migrate/listings", async (req, res) => {
      try {
        const result = await listings.updateMany(
          { email: { $exists: true }, ownerEmail: { $exists: false } },
          [{ $set: { ownerEmail: "$email" } }]
        );
        res.status(200).json({
          success: true,
          message: `Migrated ${result.modifiedCount} listings to use ownerEmail`
        });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // GET /dashboard/stats - For Admin Dashboard
    app.get("/dashboard/stats", async (req, res) => {
      try {
        const totalUsers = await users.countDocuments();
        const totalListings = await listings.countDocuments();
        const totalOrders = await orders.countDocuments();
        
        // Calculate total revenue
        const revenueResult = await orders.aggregate([
          { $group: { _id: null, totalRevenue: { $sum: "$price" } } }
        ]).toArray();
        const totalRevenue = revenueResult[0]?.totalRevenue || 0;

        // Get growth metrics (last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const usersGrowth = await users.countDocuments({
          createdAt: { $gte: thirtyDaysAgo }
        });
        const ordersGrowth = await orders.countDocuments({
          createdAt: { $gte: thirtyDaysAgo }
        });

        // Order status breakdown
        const orderStatusBreakdown = await orders.aggregate([
          { $group: { _id: "$status", count: { $sum: 1 } } }
        ]).toArray();

        res.status(200).json({
          success: true,
          data: {
            totalUsers,
            totalListings,
            totalOrders,
            totalRevenue,
            userGrowth: usersGrowth,
            orderGrowth: ordersGrowth,
            orderStatusBreakdown: orderStatusBreakdown || []
          }
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        res.status(500).json({
          success: false,
          message: "Failed to fetch dashboard statistics"
        });
      }
    });

    // GET /dashboard/user-stats/:email - For User Dashboard
    app.get("/dashboard/user-stats/:email", async (req, res) => {
      try {
        const { email } = req.params;
        
        // User's orders count
        const myOrders = await orders.countDocuments({ buyerEmail: email });
        
        // User's active listings (handle both email and ownerEmail for backwards compatibility)
        const activeListings = await listings.countDocuments({ 
          $or: [
            { ownerEmail: email },
            { email: email }
          ]
        });
        
        // User's total sales (handle both ownerEmail and email fields)
        const userSalesResult = await orders.aggregate([
          { 
            $match: { 
              $or: [
                { ownerEmail: email },
                { sellerEmail: email }
              ]
            } 
          },
          { $group: { _id: null, totalSales: { $sum: "$price" } } }
        ]).toArray();
        const totalSales = userSalesResult[0]?.totalSales || 0;

        // User's average rating (if ratings collection exists, otherwise default)
        const userProfile = await users.findOne({ email });
        const rating = userProfile?.rating || 4.8;

        // Sales growth (last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const recentSalesResult = await orders.aggregate([
          { 
            $match: { 
              $or: [
                { ownerEmail: email },
                { sellerEmail: email }
              ],
              createdAt: { $gte: thirtyDaysAgo }
            } 
          },
          { $group: { _id: null, sales: { $sum: "$price" } } }
        ]).toArray();
        const recentSales = recentSalesResult[0]?.sales || 0;
        const totalSalesAllTime = totalSales || 1;
        const salesGrowth = totalSalesAllTime ? Math.round((recentSales / totalSalesAllTime) * 100) : 0;

        res.status(200).json({
          success: true,
          data: {
            myOrders,
            activeListings,
            totalSales,
            rating,
            salesGrowth
          }
        });
      } catch (error) {
        console.error("Error fetching user dashboard stats:", error);
        res.status(500).json({
          success: false,
          message: "Failed to fetch user statistics"
        });
      }
    });

    // GET /dashboard/monthly-sales - For Charts
    app.get("/dashboard/monthly-sales/:email", async (req, res) => {
      try {
        const { email } = req.params;
        const isAdmin = req.query.isAdmin === "true";

        const query = isAdmin ? {} : { 
          $or: [
            { ownerEmail: email },
            { sellerEmail: email }
          ]
        };
        
        // Get sales data for last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlySales = await orders.aggregate([
          {
            $match: {
              ...query,
              createdAt: { $gte: sixMonthsAgo }
            }
          },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" }
              },
              sales: { $sum: "$price" },
              orders: { $sum: 1 }
            }
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]).toArray();

        // Format for chart
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const chartData = monthlySales.map(item => ({
          month: monthNames[item._id.month - 1],
          sales: item.sales,
          orders: item.orders
        }));

        res.status(200).json({
          success: true,
          data: chartData
        });
      } catch (error) {
        console.error("Error fetching monthly sales:", error);
        res.status(500).json({
          success: false,
          message: "Failed to fetch monthly sales data"
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