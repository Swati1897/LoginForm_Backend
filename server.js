//npm i express mongoose dotenv cors
//npm i jsonwebtoken

const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const DBConnection = require('./config/DBConnection');
const UserDb = require('./models/User');
const app = express();
const secretKey = "r43f2df3#$3fgrtre"

DBConnection();

app.use(express.json());
app.options("/register", cors())
app.options("/login", cors())
app.options("/user-info", cors())

// 
app.post("/register", cors(), async (req, res) => {
    console.log("Request received register")
    console.log(req.body)
    let { username, password ,dob, email} = req.body
    const user = new UserDb({
        username: username,
        password: password,
        dob:dob,
        email: email
    });
    try {
        let savedUser = await user.save();
        console.log(savedUser)
        res.status(200).json({ savedUser })
    } catch (error) {
        console.error(error);
    }
});

//
app.post("/login", cors(), async (req, res) => {
    console.log(req.body);
    // request body object destructuring
    let { username, password } = req.body

    const dbUser = await UserDb.findOne({ username: username });
    console.log("ew---",dbUser,password)

    if (dbUser.password == password) {
        // res.status(200).json({Status: "Login Successful",data: req.data}) 
        
        // Creating token with payload, expiry time
        const jwtBearerToken = jwt.sign({ dbUser }, secretKey, { expiresIn: '1000s' })
            res.send({
                jwtToken: jwtBearerToken,
                message: "Login Successful!"
            });
            console.log(jwtBearerToken);
        // sending jwt token using cookie
        
        // res.cookie("SESSIONID",jwtBearerToken,{httpOnly:true,secure:true});
        // res.send("Login Successful!");
    } else
        //  res.status(404).json({Status: "Login Failed"})
        res.send("Login Failure!");
});

//

// middleware to verify token
function verify(req, res, next) {
    console.log(req.headers);
    const authHeader = req.headers['authorization']
    console.log(authHeader);
    if (typeof authHeader === 'undefined') {
        res.send({ errorMessage: "Token not received" });
    } else {
        const bearer = authHeader.split(' ')
        const tokenFromReq = bearer[1]
        console.log(tokenFromReq);
        jwt.verify(tokenFromReq, secretKey, (err, authData) => {
            if (err) {
                res.json({
                    errorMessage: "Invalid Token"
                })
            } else {
                req.data = authData
                next();
            }
        });
    }
}

app.get("/user-info", cors(), verify, (req, res) => {
    res.send(req.data);
})

app.listen(5000, () => {
    console.log("Server started on port 5000");
});