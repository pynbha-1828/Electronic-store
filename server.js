const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
const { exec } = require("child_process");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static(__dirname + "/Public"));
app.use("/admin", express.static(__dirname + "/admin"));





// DATABASE CONNECTION

const db = mysql.createConnection({

    host: "localhost",
    user: "root",
    password: "Root@123",
    database: "electronic_store"

});

db.connect((err)=>{

    if(err){

        console.log(err);

    }else{

        console.log("MySQL Connected");

    }

});



// REGISTER

app.post("/register", (req,res)=>{

    const {email,password} = req.body;

    const sql = "INSERT INTO user(email,password) VALUES(?,?)";

    db.query(sql,[email,password], (err,result)=>{

        if(err){

            res.send(err);

        }else{

            res.send("Registered Successfully");

        }

    });

});



// LOGIN

app.post("/login", (req,res)=>{

    const {email,password} = req.body;

    const sql = "SELECT * FROM user WHERE email=? AND password=?";

    db.query(sql,[email,password], (err,result)=>{

        if(err){

            res.send(err);

        }else{

            if(result.length > 0){

                res.json({
                    success:true,
                    user:result[0]
                });

            }else{

                res.json({
                    success:false,
                    message:"Invalid Email or Password"
                });

            }

        }

    });

});



// ADD TO CART

app.post("/addcart", (req,res)=>{

    const {user_id, product_name, price, image} = req.body;

    const sql = "INSERT INTO cart(user_id,product_name,price,image) VALUES(?,?,?,?)";

    db.query(sql,[user_id,product_name,price,image], (err,result)=>{

        if(err){

            console.log(err);
            res.send(err);

        }else{

            res.send("Added To Cart");

        }

    });

});



// GET CART ITEMS

app.get("/cartitems/:id", (req,res)=>{

    const id = req.params.id;

    const sql = "SELECT * FROM cart WHERE user_id=?";

    db.query(sql,[id], (err,result)=>{

        if(err){

            res.send(err);

        }else{

            res.json(result);

        }

    });

});



// ORDER PRODUCT

app.post("/order", (req,res)=>{

    const {user_id, product_name, price, image} = req.body;

    // INSERT INTO ORDERS TABLE

    const insertSql = `
    INSERT INTO orders(user_id,product_name,price,image)
    VALUES(?,?,?,?)
    `;

    db.query(insertSql,[user_id,product_name,price,image], (err,result)=>{

        if(err){

            console.log(err);

            res.send(err);

        }else{

            // DELETE PRODUCT FROM CART

            const deleteSql = `
            DELETE FROM cart
            WHERE user_id=? AND product_name=?
            `;

            db.query(deleteSql,[user_id,product_name], (deleteErr,deleteResult)=>{

                if(deleteErr){

                    console.log(deleteErr);

                    res.send(deleteErr);

                }else{

                    res.send("Order Placed Successfully");

                }

            });

        }

    });

});


// GET USER ORDERS

app.get("/orders/:id", (req,res)=>{

    const id = req.params.id;

    const sql = "SELECT * FROM orders WHERE user_id=?";

    db.query(sql,[id], (err,result)=>{

        if(err){

            res.send(err);

        }else{

            res.json(result);

        }

    });

});

// ADD PRODUCT

app.post("/addproduct",(req,res)=>{

    const {
        product_name,
        price,
        image,
        category
    } = req.body;

    const sql = `
    INSERT INTO products
    (product_name,price,image,category)
    VALUES(?,?,?,?)
    `;

    db.query(sql,

    [
        product_name,
        price,
        image,
        category
    ],

    (err,result)=>{

        if(err){

            console.log(err);

            res.send(err);

        }else{

            res.send("Product Added Successfully");

        }

    });

});

// GET ALL USERS
app.get("/api/users", (req, res) => {
    db.query("SELECT * FROM user", (err, result) => {
        if (err) {
            res.status(500).json(err);
        } else {
            res.json(result);
        }
    });
});

// GET ALL PRODUCTS
app.get("/api/products", (req, res) => {
    db.query("SELECT * FROM product", (err, result) => {
        if (err) {
            res.status(500).json(err);
        } else {
            res.json(result);
        }
    });
});

// GET ALL ORDERS
app.get("/api/orders", (req, res) => {
    db.query("SELECT * FROM orders", (err, result) => {
        if (err) {
            res.status(500).json(err);
        } else {
            res.json(result);
        }
    });
});

// DASHBOARD COUNTS
app.get("/api/dashboard", (req, res) => {

    db.query("SELECT COUNT(*) AS users FROM user", (e1, users) => {

        db.query("SELECT COUNT(*) AS products FROM product", (e2, products) => {

            db.query("SELECT COUNT(*) AS orders FROM orders", (e3, orders) => {

                res.json({
                    users: users[0].users,
                    products: products[0].products,
                    orders: orders[0].orders
                });

            });

        });

    });

});

app.post("/api/add-product", (req, res) => {

    const { name, price, image, category } = req.body;

    const sql =
    "INSERT INTO product(name,price,image,category) VALUES(?,?,?,?)";

    db.query(
        sql,
        [name, price, image, category],
        (err, result) => {

            if (err) {
                res.status(500).json(err);
            } else {
                res.json({
                    success: true,
                    message: "Product Added"
                });
            }

        }
    );

});

app.get("/api/dashboard", (req, res) => {

    db.query("SELECT COUNT(*) AS users FROM user", (err, users) => {

        db.query("SELECT COUNT(*) AS products FROM product", (err, products) => {

            db.query("SELECT COUNT(*) AS orders FROM orders", (err, orders) => {

                db.query(
                    "SELECT IFNULL(SUM(price),0) AS sales FROM orders",
                    (err, sales) => {

                        res.json({
                            users: users[0].users,
                            products: products[0].products,
                            orders: orders[0].orders,
                            sales: sales[0].sales
                        });

                    }
                );

            });

        });

    });

});

// SERVER

app.listen(3000, ()=>{

    console.log("Server Running On Port 3000");

    exec('start http://localhost:3000/login.html');

});