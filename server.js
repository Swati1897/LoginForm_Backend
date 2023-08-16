//npm i express mongoose dotenv cors
//npm i jsonwebtoken

const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const DBConnection = require('./config/DBConnection');
const User = require('./models/User');
const app = express();
const secretKey = "r43f2df3#$3fgrtre"

DBConnection();

app.use(express.json());
app.options("/signup", cors())
app.options("/login", cors())
app.options("/profile", cors())

// 
app.post("/signup", cors(), async (req, res) => {
    console.log("Request received signup")
    console.log(req.body)
    let { username, password } = req.body
    const user = new User({
        username: username,
        password: password
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
    console.log(username, password);

    const dbUser = await User.findOne({ username: username });
    console.log(dbUser)

    if (dbUser != null && dbUser.password === password) {
        // res.status(200).json({Status: "Login Successful",data: req.data}) 
        // Creating token with payload, expiry time
        const jwtBearerToken = jwt.sign({ dbUser }, secretKey, { expiresIn: '1000s' }, (err, token) => {
            res.json({
                jwtToken: token,
                message: "Login Successful!"
            });
        })
        // sending jwt token using cookie
        // res.cookie("SESSIONID",jwtBearerToken,{httpOnly:true,secure:true});
        //res.send("Login Successful!");
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

app.get("/profile", cors(), verify, (req, res) => {
    res.send(req.data);
})

app.listen(4000, () => {
    console.log("Server started on port 4000");
});