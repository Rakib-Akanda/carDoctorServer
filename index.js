const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://cars-doctor-cf4d3.web.app/",
      "https://cars-doctor-cf4d3.firebaseapp.com/"
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v7fwagz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// custom middleware;

const logger = async (req, res, next) => {
  console.log("Called", req.host, req.originalUrl);
  next();
};

const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token;
  console.log("Value of token in middleware", token);
  if (!token) {
    return res.status(401).send({ message: "unauthorized" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN, (error, decoded) => {
    // error
    if (error) {
      console.log(error);
      return res.status(401).send({ message: "unauthorized" });
    }
    // if token is valid then it would be decoded
    console.log("Value in the token", decoded);
    req.user = decoded;
    next();
  });
};
const cookieOptions = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  secure: process.env.NODE_ENV === "production" ? true : false,
};
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    //collections
    const serviceCollection = client.db("carDoctor").collection("services");
    const checkOutCollection = client.db("carDoctor").collection("checkOut");

    // APIs

    // auth related api
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      console.log("user for token", user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
        expiresIn: "1h",
      });
      res.cookie("token", token, cookieOptions).send({ success: true });
    });
    app.post("/logout", async (req, res) => {
      const user = req.body;
      console.log("Logging out user", user);
      res
        .clearCookie("token", { ...cookieOptions, maxAge: 0 })
        .send({ success: true });
    });

    // services related api
    app.get("/services", logger, async (req, res) => {
      const cursor = serviceCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = {
        projection: { title: 1, price: 1, service_id: 1, img: 1 },
      };
      const result = await serviceCollection.findOne(query, options);
      res.send(result);
    });

    // checkOut/ bookings

    app.get("/checkout", logger, verifyToken, async (req, res) => {
      console.log("Token", req.cookies.token);
      console.log("cookies  check", req.cookies);
      console.log("User in the valid token", req.user);
      if (req.query.email !== req.user.email) {
        return res.status(403).send({ message: "Forbidden Access" });
      }
      let query = {};
      if (req.query?.email) {
        query = { email: req.query?.email };
      }
      const result = await checkOutCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/checkout", async (req, res) => {
      const checkOut = req.body;
      console.log(checkOut);
      const result = await checkOutCollection.insertOne(checkOut);
      res.send(result);
    });
    app.patch("/checkout/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedCheckout = req.body;
      console.log(updatedCheckout);

      const updatedDoc = {
        $set: {
          status: updatedCheckout.status,
        },
      };
      const result = await checkOutCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });
    app.delete("/checkout/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await checkOutCollection.deleteOne(query);
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Doctor is running");
});

app.listen(port, () => {
  console.log(`Car Doctor server is running on port: ${port}`);
});
