const express = require("express");
require("dotenv").config();
const app = express();

var cookieParser = require("cookie-parser");

// set up running port
const port = process.env.PORT || 3000;

// sslcommerz
const SSLCommerzPayment = require("sslcommerz-lts");
const store_id = "green663a6f8b0c6fd";
const store_passwd = "green663a6f8b0c6fd@ssl";
const is_live = false; //true for live, false for sandbox

// cors for of auto block when call data by other client site
const jwt = require("jsonwebtoken");
const cors = require("cors");
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://green-mart-shop.netlify.app",
      "https://green-mart-shop.netlify.app",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// require mongodb
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// ===========================================
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// =============================================

// mongodb uri

const uri = `mongodb+srv://${process?.env?.DB_USER}:${process?.env?.DB_PASSWORD}@curd-operation-database.movqgwc.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// ===================================================================================

//  main function for connect with mongodb
async function run() {
  try {
    // daatabase collection
    const database = client.db("green_mart");
    const allUser = database.collection("allUser");
    const allProduct = database.collection("allProduct");
    const allCart = database.collection("allCart");
    const banner = database.collection("allBanner");
    const allOrders = database.collection("allOrders");
    const allTransaction = database.collection("allTransaction");
    const allContact = database.collection("allContact");
    const subscriber = database.collection("subscriber");

    app.post("/users", async (req, res) => {
      console.log(req.body);
      const user = req.body;
      const query = { userEmail: user.userEmail };
      const existingUser = await allUser.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exists", insertedId: null });
      }
      const result = await allUser.insertOne(user);
      res.send(result);
    });

    // user get methoud for chack admin role
    app.get("/getUser", async (req, res) => {
      console.log("get for admin check");
      const email = req.query.email;
      const query = { userEmail: email };
      const result = await allUser.findOne(query);
      res.send(result);
    });

    //  all users for admin control page
    app.get("/allUser", async (req, res) => {
      console.log("get all uerer for admin page ");
      const result = await allUser.find().toArray();
      res.send(result);
    });

    // delete user
    app.delete("/deleteUser/:_id", async (req, res) => {
      const _id = req.params._id;
      const query = { _id: new ObjectId(_id) };
      const result = await allUser.deleteOne(query);
      res.send(result);
    });

    // make admin from user or remov admin
    app.put("/makeAdminOrRemov", async (req, res) => {
      const email = req.query.email;
      const setRole = req.query.role;
      const filter = { userEmail: email };
      const updatedDoc = {
        $set: {
          userRole: setRole,
        },
      };
      const result = await allUser.updateOne(filter, updatedDoc);
      res.send(result);
    });
    // ====================================================================

    //================ Product add update delete related CRUD operation =======================
    app.post("/allProduct", async (req, res) => {
      const product = req.body;
      const result = await allProduct.insertOne(product);
      res.send(result);
    });
    //  delete product
    app.delete("/deleteProduct", async (req, res) => {
      const id = req?.query.id;
      const query = { _id: new ObjectId(id) };
      const result = await allProduct.deleteOne(query);
      res.send(result);
    });
    // get product for update
    app.get("/forUpdate/:_id", async (req, res) => {
      console.log("geting for  product update");
      const id = req?.params._id;
      const query = { _id: new ObjectId(id) };
      const result = await allProduct.findOne(query);
      res.send(result);
    });
    // update product
    app.put("/update/:_id", async (req, res) => {
      const id = req?.params._id;
      const updatedData = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDocument = {
        $set: {
          productName: updatedData?.productName,
          Price: updatedData?.Price,
          productDescription: updatedData?.productDescription,
        },
      };
      const result = await allProduct.updateOne(filter, updateDocument);
      res.send(result);
    });
    // =========================================================================================

    // ==================== show product display related api ===============================================
    app.get("/CategoresProduct/:Categores", async (req, res) => {
      // console.log("get categori wais froduct for all product ");
      const finder = req.params.Categores;
      const query = { productCategories: finder };
      const result = await allProduct.find(query).toArray();
      res.send(result);
    });

    // home page categories shower api
    app.get("/HomeProduct", async (req, res) => {
      console.log("get for home page product shower");

      const populer = await allProduct
        .find({ promote: true })
        .limit(8)
        .toArray();
      const fish = await allProduct
        .find({ productCategories: "FISH" })
        .limit(6)
        .toArray();
      const meat = await allProduct
        .find({ productCategories: "MEAT" })
        .limit(6)
        .toArray();
      const fruits = await allProduct
        .find({ productCategories: "FRUITS" })
        .limit(6)
        .toArray();
      const vegetable = await allProduct
        .find({ productCategories: "VEGETABLES" })
        .limit(6)
        .toArray();
      const banners = await banner.find().toArray();

      const allHomeProduct = {
        populer,
        fish,
        meat,
        fruits,
        vegetable,
        banners,
      };
      res.send(allHomeProduct);
    });

    // allProduct get api
    app.get("/allProduct", async (req, res) => {
      console.log("get all product for all product page");
      const categori = req.query.categories;

      const query = { productCategories: categori };

      if (categori == "allProduct") {
        const result = await allProduct.find().toArray();
        res.send(result);
      } else {
        const result = await allProduct.find(query).toArray();
        res.send(result);
      }
    });

    //  single product shower api
    app.get("/signleProduct/:id", async (req, res) => {
      console.log("showing single product shower");
      const id = req.params.id;

      const query = { _id: new ObjectId(id) };
      const result = await allProduct.findOne(query);
      res.send(result);
    });

    //  recommended product
    app.get("/recomended", async (req, res) => {
      console.log("recommended data for single product page");
      const getLength = await allProduct.find().toArray();
      const multiplier = getLength.length - 5;
      const skipper = Math.floor(Math.random() * multiplier);
      const result = await allProduct.find().skip(skipper).limit(5).toArray();
      res.send(result);
    });
    // ========================================================================

    // ===========================add to cart remov cart etc related api =================================
    app.post("/addToCart", async (req, res) => {
      const cartData = req.body;
      const result = await allCart.insertOne(cartData);
      res.send(result);
    });

    //  api for show total cart item in home page
    app.get("/allCart", async (req, res) => {
      console.log("get for all cart page ");
      const email = req?.query?.email;
      const query = { BuyerEmail: email };
      const result = await allCart.find(query).toArray();
      res.send(result);
    });

    //  delete form cart
    app.delete("/delete/:_id", async (req, res) => {
      const _id = req.params._id;
      const query = { _id: new ObjectId(_id) };
      const result = await allCart.deleteOne(query);
      res.send(result);
    });
    // =====================================================================================

    // ====================== banner related api ====================================
    app.get("/banner", async (req, res) => {
      const banners = await banner.find().toArray();
      res.send(banners);
    });
    app.post("/banner", async (req, res) => {
      console.log("post banner");
      const bannerData = req.body;
      const result = await banner.insertOne(bannerData);
      res.send(result);
    });

    app.delete("/banner", async (req, res) => {
      const bannerData = req.query.bannerName;
      const query = { bannerName: bannerData };
      const result = await banner.deleteOne(query);
      res.send(result);
    });
    // ==============================================================================

    // =====================================================================
    //                      payment related api
    // ======================================================================

    app.post("/payment", async (req, res) => {
      const product = req?.body?.cartItems;
      // total Price
      const totalPrice = await product?.reduce((total, currentItem) => {
        return total + currentItem.Price * currentItem.quntity;
      }, 50);

      const deleveryData = req?.body?.deleveryData;
      const tran_id = new ObjectId().toString();

      const data = {
        total_amount: totalPrice,
        currency: "BDT",
        tran_id: tran_id, // use unique tran_id for each api call
        success_url: "https://test-server-pink.vercel.app/success/order",
        fail_url: "https://green-mart-shop.netlify.app/paymentFail",
        cancel_url: "https://green-mart-shop.netlify.app/paymentFail",
        ipn_url: "http://localhost:3030/ipn",
        shipping_method: "Courier",
        product_name: "Computer.",
        product_category: "Electronic",
        product_profile: "general",
        cus_name: deleveryData?.firstName + " " + deleveryData?.lastName,
        cus_email: deleveryData?.email,
        cus_add1: deleveryData?.addressDetails,
        cus_add2: "Dhaka",
        cus_city: deleveryData?.city,
        cus_state: "Dhaka",
        cus_postcode: deleveryData?.postCode,
        cus_country: deleveryData?.country,
        cus_phone: deleveryData?.phoneNumber,
        cus_fax: "01711111111",
        ship_name: "Customer Name",
        ship_add1: "Dhaka",
        ship_add2: "Dhaka",
        ship_city: "Dhaka",
        ship_state: "Dhaka",
        ship_postcode: 1000,
        ship_country: "Bangladesh",
      };

      // console.log(data);

      const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
      sslcz.init(data).then((apiResponse) => {
        // Redirect the user to payment gateway
        let GatewayPageURL = apiResponse.GatewayPageURL;
        // changed
        res.send({ url: GatewayPageURL });
        console.log("Redirecting to: ", GatewayPageURL);
      });

      // save order data to mongodb after successfully payment
      app.post("/success/order", async (req, res) => {
        const orderedItems = product;
        product.forEach((one) => {
          one.deleveryAddress = deleveryData;
          one.deleveryStatus = "pending";
          delete one._id;
        });
        const options = { ordered: true };
        const sendDatabase = await allOrders.insertMany(orderedItems, options);
        if (sendDatabase.acknowledged) {
          const query = { BuyerEmail: product[0].BuyerEmail };
          const cleareCart = await allCart.deleteMany(query);
          if (cleareCart.acknowledged) {
            res.redirect(`http://localhost:5173/paymentSuccess/${tran_id}`);
          }
        }
        const transactionData = {
          tran_id,
          BuyerEmail: product[0].BuyerEmail,
          totalPrice,
        };
        const sendTransactions = await allTransaction.insertOne(
          transactionData
        );
        console.log(sendTransactions);
      });
    });

    //  get for showing tranaction details
    app.get("/transsctionDetails/:tran_id", async (req, res) => {
      const query = { tran_id: req.params.tran_id };
      const result = await allTransaction.findOne(query);
      res.send(result);
    });

    // transaction related api
    app.get("/transactions", async (req, res) => {
      // console.log("transaction get");
      const dataCollector = req.query.email;
      const userFinder = { userEmail: dataCollector };
      const userRole = await allUser.findOne(userFinder);
      if (userRole?.userRole == "user") {
        const query = { BuyerEmail: dataCollector };
        const result = await allTransaction.find(query).toArray();
        res.send(result.reverse());
      } else {
        const alldata = await allTransaction.find().toArray();
        res.send(alldata.reverse());
      }
    });
    // ======================================================================

    // ========================================================================
    //                      order related api
    // ========================================================================
    app.get("/order", async (req, res) => {
      // console.log("order geting ");
      const dataCollector = req.query.email;
      const userFinder = { userEmail: dataCollector };
      const userRole = await allUser.findOne(userFinder);
      if (userRole?.userRole == "user") {
        const query = { BuyerEmail: dataCollector };
        const result = await allOrders.find(query).toArray();
        res.send(result.reverse());
      } else {
        const alldata = await allOrders.find().toArray();
        res.send(alldata.reverse());
      }
    });

    app.put("/statusUpdate", async (req, res) => {
      const status = req.query.status;
      const id = req.query.id;
      const filter = { _id: new ObjectId(id) };
      const updateDocument = {
        $set: {
          deleveryStatus: status,
        },
      };
      const result = await allOrders.updateOne(filter, updateDocument);
      res.send(result);
    });
    // ==========================================================================

    // ========================================================================
    //                     contact related api
    // ========================================================================
    app.post("/Contact", async (req, res) => {
      const data = req.body;
      const result = await allContact.insertOne(data);
      res.send(result);
    });
    app.get("/ContactAll", async (req, res) => {
      // console.log("get contact message ");
      const result = await allContact.find().toArray();
      res.send(result.reverse());
    });
    // ==========================================================================

    // ========================================================================
    //                     subscriber related api
    // ========================================================================
    app.post("/subscriber", async (req, res) => {
      const data = req.body;
      const result = await subscriber.insertOne(data);
      res.send(result);
    });
    app.get("/subscriberAll", async (req, res) => {
      // console.log("get all subscriber email");
      const result = await subscriber.find().toArray();
      res.send(result.reverse());
    });
    // ==========================================================================
    //                    promote related api
    // ========================================================================
    app.put("/promote", async (req, res) => {
      const filter = { _id: new ObjectId(req?.query?.id) };
      const conditions = req?.query?.condition;
      const updateDocument = {
        $set: { promote: conditions == "promote" ? true : false },
      };
      const result = await allProduct.updateOne(filter, updateDocument);
      res.send(result);
    });
    // ==========================================================================

    // ========================   deshbord relaed api ===============================
    app.get("/userDeshbord", async (req, res) => {
      const userEmail = req?.query?.email;
      const totalOrder = await allOrders
        .find({ BuyerEmail: userEmail })
        .toArray();
      const totalCost = totalOrder?.reduce((total, currentItem) => {
        return total + currentItem.Price * currentItem.quntity;
      }, 0);

      const totalCartItems = await allCart
        .find({
          BuyerEmail: userEmail,
        })
        .toArray();

      const sendData = {
        totalOrders: totalOrder?.length,
        totalCost,
        totalCartItem: totalCartItems?.length,
      };
      res.send(sendData);
    });
    app.get("/adminDeshbord", async (req, res) => {
      const totalProduct = await allProduct.find().toArray();
      const totalOrder = await allOrders.find().toArray();
      const totalEarn = totalOrder?.reduce((total, currentItem) => {
        return total + currentItem.Price * currentItem.quntity;
      }, 0);

      const activeOrder = await allOrders
        .find({ deleveryStatus: "Delevered" })
        .toArray();

      const totalUser = await allUser.find().toArray();

      // for pichart data
      const maetOrder = await allOrders
        .find({ productCategories: "MEAT" })
        .toArray();
      const vergetableOrder = await allOrders
        .find({ productCategories: "VEGETABLES" })
        .toArray();
      const fishOrder = await allOrders
        .find({ productCategories: "FISH" })
        .toArray();
      const fruitsOrder = await allOrders
        .find({ productCategories: "FRUITS" })
        .toArray();
      const senderData = {
        totalProducts: totalProduct?.length,
        totalOrders: totalOrder?.length,
        totalEarn,
        activeOrders: totalOrder?.length - activeOrder?.length,
        totalUsers: totalUser?.length,
        maetOrders: maetOrder?.length,
        vergetableOrders: vergetableOrder?.length,
        fishOrders: fishOrder?.length,
        fruitsOrders: fruitsOrder?.length,
      };
      res.send(senderData);
    });
    // ================================================================================
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);
// ========================================
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
