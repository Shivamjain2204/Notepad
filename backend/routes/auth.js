const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require("../middleware/fetchuser");



const JWT_SECRET = 'Roman$believe';



// ROUTE: 1  Create a User using: POST "/api/auth/createuser". No Login required
router.post("/createuser",[
    body("name", "enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Enter a valid password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    let success = false;
    //If there are errors, return bad requests and errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    try {
    // Check whether the user with this email exists already

      let user = await User.findOne({ email: req.body.email });
      console.log(user);
      if (user) {
        return res
          .status(400)
          .json({success, error: "User with email already exists" });
      }

      const salt = await bcrypt.genSalt(10);  // generate salt
      const secPass = await bcrypt.hash(req.body.password, salt)

      //Create a new user
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass, // Secured password
      });

      const data ={
        user:{
            id: user.id
        }
      }

      const authtoken = jwt.sign(data, JWT_SECRET);

      success = true;
      res.json({success, authtoken})
      

    //   res.json(user);
      // res.send(req.body);

      //Catch errors
    } catch (error) { 
      console.error(error.message);
      res.status(500).send("Error occured");
    }
  }
);






// ROUTE: 2   Authentication a user using: POST "/api/auth/login". No Login required
router.post("/login",[
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password can't be blank").exists(),
  ],
  async (req, res) => {
    let success = false;

      //If there are errors, return bad requests and errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {email, password} = req.body;
      try {


        let user = await User.findOne({email});
        if(!user){
          success = false;
            return res.status(400).json({ success, error: "Please try to login with correct details!! "})
        }


        const passwordCompare = await bcrypt.compare(password, user.password);
        if(!passwordCompare){
          success = false;
            return res.status(400).json({ success, error: "Please try to login with correct details!! "})

        }


        const data ={
            user:{
                id: user.id
            }
          }
    
          const authtoken = jwt.sign(data, JWT_SECRET);
          success = true;
          res.json({ success, authtoken})


      } catch (error) {
           console.error(error.message);
           res.status(500).send("Internal Server Error");
      }
    
  });

  // ROUTE: 3   Get loggedin user details using POST "/api/auth/getuser". Login required
  router.post("/getuser",fetchuser,async (req, res) => {
  

  try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user)
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});
module.exports = router;
