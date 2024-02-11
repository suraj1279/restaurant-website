const express = require("express");
const app = express();
const path = require("path");
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");
const cookieparser = require("cookie-parser");
app.use(cookieparser());
const session = require("express-session");
const oneday = 1000 * 60 * 60 * 24;
app.use(
  session({
    saveUninitialized: true,
    resave: false,
    secret: "asd3454#$%$@#324",
    cookie: { maxAge: oneday },
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(__dirname));
app.use("/images", express.static(path.join(__dirname, "images")));

let db;
let collection;

MongoClient.connect("mongodb://127.0.0.1:27017/")
  .then((client) => {
    console.log("Connected to the database");
    db = client.db("list");
    collection = db.collection("store");
  })
  .catch((error) => {
    console.log("Error connecting to the database:", error);
  });

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

app.post("/log", (req, res) => {
  collection
    .find({ username: req.body.username, password: req.body.password })
    .toArray()
    .then((data) => {
      if (data.length > 0) {
        res.sendFile(path.join(__dirname, "home.html"));
      } else {
        res.sendFile(path.join(__dirname, "login.html"));
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Internal Server Error");
    });
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "signUp.html"));
});

app.post("/sign", (req, res) => {
  collection
    .find({ username: req.body.username, password: req.body.password })
    .toArray()
    .then((data) => {
      if (data.length > 0) {
        res.status(409).send("UserName already Exists");
      } else {
        let obj = {};
        obj.username = req.body.username;
        obj.password = req.body.password;
        obj.email = req.body.email;
        //obj.img = "images/profile.jpeg";
        collection.insertOne(obj).then(() => {
          res.sendFile(path.join(__dirname, "home.html"));
        });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Internal Server Error");
    });
});

app.get("/product", (req, res) => {
  collection
    .find()
    .toArray()
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send("Internal Server Error");
    });
});

app.use(express.json());

app.post("/order", async (req, res) => {
  try {
    let obj = {
      Name: req.body.Name,
      price: req.body.price,
      img: req.body.img,
      rating: req.body.rating,
      reviews: req.body.reviews,
      trackingId: req.body.trackingId,
      orderdata: req.body.orderdata,
      time: req.body.time,
    };

    await collection.insertOne(obj);

    res.status(200).send("Order placed successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(5000, () => {
  console.log("Server Started");
});
