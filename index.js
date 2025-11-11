const express = require('express');
require("dotenv").config();

const cors = require("cors")
const { MongoClient, ServerApiVersion ,ObjectId} = require('mongodb');

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

//     app.post("/listing", async (req, res) => {
//       try {
//        const data = await listings.insertMany([
//   {
    
//     "name": "Friendly Golden Retriever Puppy",
//     "category": "Pets (Adoption)",
//     "price": "0",
//     "location": "Dhaka",
//     "description": "A playful and energetic 3-month-old Golden Retriever puppy. Fully vaccinated and ready for a loving home.",
//     "image": "https://i.ibb.co.com/k6zq238G/download.jpg",
//     "email": "owner1@example.com",
//     "date": "2025-11-08"
//   },
//   {

//     "name": "Calm Siamese Kitten",
//     "category": "Pets (Adoption)",
//     "price": "0",
//     "location": "Rangpur",
//     "description": "A gentle and well-behaved 6-month-old Siamese kitten. Litter trained and very affectionate.",
//     "image": "https://i.ibb.co.com/pjfLqdRC/download-1.jpg",
//     "email": "owner2@example.com",
//     "date": "2025-11-03"
//   },
//   {

//     "name": "Adorable Beagle Mix",
//     "category": "Pets (Adoption)",
//     "price": "0",
//     "location": "Rajshahi",
//     "description": "A 1-year-old Beagle mix, great with kids and loves long walks.",
//     "image": "https://i.ibb.co.com/fVG054Gn/download-2.jpg",
//     "email": "owner3@example.com",
//     "date": "2025-11-09"
//   },
//   {
  
//     "name": "Pair of Love Birds",
//     "category": "Pets (Adoption)",
//     "price": "0",
//     "location": "Chittagong",
//     "description": "Two beautiful, singing love birds looking for a caring owner.",
//     "image": "https://i.ibb.co.com/tpMQZ1LS/download-3.jpg",
//     "email": "owner4@example.com",
//     "date": "2025-11-07"
//   },
//   {
   
//     "name": "Playful Persian Cat",
//     "category": "Pets (Adoption)",
//     "price": "0",
//     "location": "Sylhet",
//     "description": "A 2-year-old female Persian cat, very fluffy and litter trained.",
//     "image": "https://i.ibb.co.com/zhC290R7/download-4.jpg",
//     "email": "owner5@example.com",
//     "date": "2025-11-06"
//   },
//   {
   
//     "name": "Small Hamster (Male)",
//     "category": "Pets (Adoption)",
//     "price": "0",
//     "location": "Khulna",
//     "description": "A friendly golden hamster, perfect for a first-time pet owner.",
//     "image": "https://i.ibb.co.com/jkCkW9Cq/download-5.jpg",
//     "email": "owner6@example.com",
//     "date": "2025-11-05"
//   },
//   {
    
//     "name": "Premium Salmon Dry Kibble (5kg)",
//     "category": "Pet Food & Treats",
//     "price": "3500",
//     "location": "Chittagong",
//     "description": "High-protein, grain-free dry food made with real salmon. Ideal for medium to large adult dogs.",
//     "image": "https://i.ibb.co.com/1Y5GC3RV/download-6.jpg",
//     "email": "shopA@example.com",
//     "date": "2025-11-07"
//   },
//   {
    
//     "name": "Tuna & Rice Wet Cat Food (24 Cans)",
//     "category": "Pet Food & Treats",
//     "price": "2800",
//     "location": "Dhaka",
//     "description": "Complete and balanced nutrition with real tuna pieces.",
//     "image": "https://i.ibb.co.com/2Yg6FP3m/download-7.jpg",
//     "email": "shopB@example.com",
//     "date": "2025-11-06"
//   },
//   {
    
//     "name": "Natural Chewy Training Bites",
//     "category": "Pet Food & Treats",
//     "price": "750",
//     "location": "Rajshahi",
//     "description": "Soft and chewy treats, great for reward-based training.",
//     "image": "https://i.ibb.co.com/N24BVd0T/download-8.jpg",
//     "email": "shopC@example.com",
//     "date": "2025-11-05"
//   },
//   {
    
//     "name": "Vegetarian Dog Biscuits (Large Pack)",
//     "category": "Pet Food & Treats",
//     "price": "1100",
//     "location": "Khulna",
//     "description": "Healthy, oven-baked biscuits for dogs with meat sensitivities.",
//     "image": "https://i.ibb.co.com/ksX567pF/download-9.jpg",
//     "email": "shopD@example.com",
//     "date": "2025-11-04"
//   },
//   {
    
//     "name": "Rabbit Pellets with Hay (1kg)",
//     "category": "Pet Food & Treats",
//     "price": "950",
//     "location": "Barisal",
//     "description": "Fiber-rich food essential for rabbit digestive health.",
//     "image": "https://i.ibb.co.com/pB6YDmZ7/download-10.jpg",
//     "email": "shopE@example.com",
//     "date": "2025-11-03"
//   },
//   {
    
//     "name": "Puppy Milk Replacer Formula",
//     "category": "Pet Food & Treats",
//     "price": "1600",
//     "location": "Dhaka",
//     "description": "Complete food source for orphaned or nursing puppies.",
//     "image": "https://i.ibb.co.com/ynSBwgJx/download-11.jpg",
//     "email": "shopF@example.com",
//     "date": "2025-11-02"
//   },
//   {
    
//     "name": "Comfort Cat Bed (Large)",
//     "category": "Accessories",
//     "price": "1250",
//     "location": "Khulna",
//     "description": "Soft, washable, and cozy donut-shaped bed, perfect for deep sleep. Available in grey.",
//     "image": "https://i.ibb.co.com/KzD13MwD/download-12.jpg",
//     "email": "shopB@example.com",
//     "date": "2025-11-06"
//   },
//   {
    
//     "name": "Adjustable Nylon Dog Collar (Red)",
//     "category": "Accessories",
//     "price": "350",
//     "location": "Dhaka",
//     "description": "Durable nylon collar with reflective stitching for visibility.",
//     "image": "https://i.ibb.co.com/jX0dCrG/images-1.jpg",
//     "email": "shopG@example.com",
//     "date": "2025-11-08"
//   },
//   {
    
//     "name": "Retractable Dog Leash (5m)",
//     "category": "Accessories",
//     "price": "990",
//     "location": "Sylhet",
//     "description": "Heavy-duty retractable leash with anti-slip handle.",
//     "image": "https://i.ibb.co.com/ksRgNZD4/download-13.jpg",
//     "email": "shopH@example.com",
//     "date": "2025-11-07"
//   },
//   {
    
//     "name": "Small Pet Carrier (Blue)",
//     "category": "Accessories",
//     "price": "2500",
//     "location": "Dhaka",
//     "description": "Ventilated, lightweight carrier for small cats or toy dogs.",
//     "image": "https://i.ibb.co.com/SXgRcFgw/download-14.jpg",
//     "email": "shopI@example.com",
//     "date": "2025-11-05"
//   },
//   {
    
//     "name": "Automatic Pet Feeder",
//     "category": "Accessories",
//     "price": "4500",
//     "location": "Chittagong",
//     "description": "Programmable feeder for controlled portion sizes and scheduled feeding.",
//     "image": "https://i.ibb.co.com/Lz3jP0Kw/download-15.jpg",
//     "email": "shopJ@example.com",
//     "date": "2025-11-04"
//   },
//   {
    
//     "name": "Waterproof Dog Raincoat",
//     "category": "Accessories",
//     "price": "1500",
//     "location": "Rangpur",
//     "description": "Stylish yellow raincoat to keep your dog dry on walks.",
//     "image": "https://i.ibb.co.com/C5rHGfRV/download-16.jpg",
//     "email": "shopK@example.com",
//     "date": "2025-11-03"
//   },
//   {
    
//     "name": "Multi-Vitamin Drops for Birds",
//     "category": "Pet Health & Care",
//     "price": "680",
//     "location": "Sylhet",
//     "description": "Essential liquid vitamin supplement to boost immunity and feather quality in pet birds.",
//     "image": "https://i.ibb.co.com/8LQxnRJV/download-17.jpg",
//     "email": "shopC@example.com",
//     "date": "2025-11-05"
//   },
//   {
    
//     "name": "Flea & Tick Prevention Spray",
//     "category": "Pet Health & Care",
//     "price": "1300",
//     "location": "Dhaka",
//     "description": "Safe and effective solution for immediate parasite protection.",
//     "image": "https://i.ibb.co.com/GQVVtj0P/download-18.jpg",
//     "email": "shopL@example.com",
//     "date": "2025-11-09"
//   },
//   {
    
//     "name": "Dental Water Additive",
//     "category": "Pet Health & Care",
//     "price": "850",
//     "location": "Khulna",
//     "description": "Easy way to clean teeth and freshen breath by adding to drinking water.",
//     "image": "https://i.ibb.co.com/KzRj0wNy/download-19.jpg",
//     "email": "shopM@example.com",
//     "date": "2025-11-08"
//   },
//   {
    
//     "name": "Oatmeal Dog Shampoo",
//     "category": "Pet Health & Care",
//     "price": "700",
//     "location": "Chittagong",
//     "description": "Soothing shampoo for sensitive or itchy skin. Hypoallergenic formula.",
//     "image": "https://i.ibb.co.com/ZRHF2tyG/download-20.jpg",
//     "email": "shopN@example.com",
//     "date": "2025-11-07"
//   },
//   {
    
//     "name": "Joint & Hip Supplement Chews (90 Count)",
//     "category": "Pet Health & Care",
//     "price": "2200",
//     "location": "Dhaka",
//     "description": "Glucosamine and Chondroitin chews for senior dogs.",
//     "image": "/images/care/joint_chews.jpg",
//     "email": "shopO@example.com",
//     "date": "2025-11-06"
//   },
//   {
    
//     "name": "Grooming Slicker Brush",
//     "category": "Pet Health & Care",
//     "price": "550",
//     "location": "Rangpur",
//     "description": "Effective brush for removing loose hair and tangles from long-haired pets.",
//     "image": "https://i.ibb.co.com/cc0wvV7p/download-21.jpg",
//     "email": "shopP@example.com",
//     "date": "2025-11-05"
//   },
//   {
    
//     "name": "Interactive Laser Pointer Toy",
//     "category": "Toys & Play",
//     "price": "400",
//     "location": "Rajshahi",
//     "description": "USB rechargeable laser pointer with multiple patterns to keep your cat engaged and active.",
//     "image": "/images/recent/laser_toy.jpg",
//     "email": "shopD@example.com",
//     "date": "2025-11-04"
//   },
//   {
    
//     "name": "Durable Chew Bone (Medium)",
//     "category": "Toys & Play",
//     "price": "600",
//     "location": "Dhaka",
//     "description": "Indestructible bone toy for aggressive chewers, bacon flavour.",
//     "image": "/images/toys/chew_bone.jpg",
//     "email": "shopQ@example.com",
//     "date": "2025-11-03"
//   },
//   {
    
//     "name": "Plush Squeaky Hedgehog",
//     "category": "Toys & Play",
//     "price": "380",
//     "location": "Sylhet",
//     "description": "Soft plush toy with internal squeaker, perfect for small dogs.",
//     "image": "/images/toys/squeaky_hedgehog.jpg",
//     "email": "shopR@example.com",
//     "date": "2025-11-02"
//   },
//   {
    
//     "name": "Cat Tunnel Collapsible",
//     "category": "Toys & Play",
//     "price": "1150",
//     "location": "Chittagong",
//     "description": "Large, collapsible tunnel for hide-and-seek and exercise.",
//     "image": "https://i.ibb.co.com/gMCLwFG2/download-22.jpg",
//     "email": "shopS@example.com",
//     "date": "2025-11-01"
//   },
//   {
    
//     "name": "Interactive Puzzle Dispenser",
//     "category": "Toys & Play",
//     "price": "900",
//     "location": "Dhaka",
//     "description": "Feeder ball that challenges your pet to dispense treats slowly.",
//     "image": "/images/toys/puzzle_dispenser.jpg",
//     "email": "shopT@example.com",
//     "date": "2025-10-31"
//   },
//   {
    
//     "name": "Fetch Rope Toy Set",
//     "category": "Toys & Play",
//     "price": "780",
//     "location": "Barisal",
//     "description": "Set of 5 durable cotton rope toys for tug-of-war and fetch.",
//     "image": "/images/toys/rope_set.jpg",
//     "email": "shopU@example.com",
//     "date": "2025-10-30"
//   }
// ]
//         )
        
//         res.json(data)
//       } catch (error) {
        
//       }
//     })

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
    app.post("/listings", async (req, res) => {
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

    // যদি valid ObjectId হয়, তাহলে ObjectId হিসেবে query করবো
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      query = { _id: new ObjectId(id) };
    } 
    // অন্যথায় string id হিসেবে খুঁজবো
    else {
      query = { _id: id };
    }

    const result = await listings.findOne(query);

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
    app.put("/listings/:id", async (req, res) => {
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
      const buyerEmail = req.params.email;
      const query ={buyerEmail}
      const result = await orders.find(query).toArray();
      res.status(200).json(result)
    })

    //get all orders by user email 
    app.get('/mylisting/:email', async (req, res) => {
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


