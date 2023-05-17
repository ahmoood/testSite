const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const db = require("./database");
const mysql = require("mysql2");
const { response } = require("express");
let email;
app.use("/css", express.static(__dirname + "/css"))
app.use("/media", express.static(__dirname + "/media"))
app.route("/").get((req, res) => {
    res.sendFile(__dirname + "/pages/welcome.html");
})
app.get('/register', (req, res) => {
    res.sendFile(__dirname + "/pages/sample1.html");
})
app.route("/login").get((req, res) => { res.sendFile(__dirname + "/pages/login.html") })
//gets the data from the user and sends it to the database
app.post("/processreg", bodyParser.urlencoded({ extended: false }), async (req, res) => {
    const { username, email, password, userType } = req.body
    //check if the email is in the database or not
    const query = `select email from users where email="${email}"`
    const rows = await db.promise().query(query)
    let a = rows[0];
    let b;
    try { b = a.pop().email } catch (err) { a[0] = "null" }
    if (email === b) {
        console.log("ERROR: DATA DUPES FOUND***********************************")
        res.sendFile(__dirname + "/pages/redirectError.html")
    }
    else {
        //insert register creditials into the database
        const id = new Date().getTime();
        db.query(`INSERT INTO USERS VALUES("${id}","${email}","${password}","${userType}","${username}")`, (err, res) => {
            if (err) { console.log("AN EXCEPTION HAPPENED!!!!" + err); return; }
        })
        res.sendFile(__dirname + "/pages/redirect.html")
    }
})
app.post("/processlogin", bodyParser.urlencoded({ extended: false }), async (req, res) => {
    let { logusername, logpassword } = req.body
    const query = `select email,password,userType from users where email = "${logusername}"`
    const rows = await db.promise().query(query)
    //the email needs to be checked if it exists in the database
    let a = rows[0];
    let b;
    try { b = a.pop(); if (b.email === 1) { } } catch (err) { b = { email: "null", password: "null" }; }
    if (b.email != logusername) { res.sendFile(__dirname + "/pages/redirectError.html") }
    else {
        //the passsword has to match the one the email uses
        if (logpassword === b.password) {
            if (b.userType === 'costumer') {
                res.sendFile(__dirname + "/pages/customer.html")
            }
            else if (b.userType === 'worker') {
                res.sendFile(__dirname + "/pages/worker.html")
                email = b.email;
            }
            else if (b.userType === "employee") {
                res.sendFile(__dirname + "/pages/employee.html")
            }
            console.log("user registered!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        }
        else {
            res.sendFile(__dirname + "/pages/redirectError.html")
        }
    }
})
app.route("/workerEdit").get((request, response) => {
    response.sendFile(__dirname + "/pages/workerEditing.html")
}).post(bodyParser.urlencoded({ extended: false }), (request, reponse,) => {
    const { serviceName, phoneNumber, description } = request.body;
    const query = `INSERT INTO SERVICES VALUES("${email}","${serviceName}","${phoneNumber}","${description}")`;
    db.query(query, (err) => { if (err) console.log(err); else console.log("service has been published!") })
    reponse.sendFile(__dirname + "/pages/redirectWorker.html")
})
app.get("/workerList", async (request, response) => {
    response.sendFile(__dirname + "/pages/workerList.html")
})
app.get("/workerListFetch", async (request,response) => {
    const query = "SELECT * FROM SERVICES;"
    const rows = await db.promise().query(query)
    console.log(rows[0])
    response.json(rows[0])
})
app.listen(3000)