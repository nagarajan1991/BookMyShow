const userModel = require("../model/userModel");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");

const getCurrentUser = async (req, res) => {
    try {
      // Changed User to userModel
      const user = await userModel.findById(req.userId).select("-password");
      
      if (!user) {
        return res.status(404).send({
          success: false,
          message: "User not found"
        });
      }
  
      return res.status(200).send({
        success: true,
        message: "Current user fetched successfully",
        data: user
      });
    } catch (error) {
      console.error("Get current user error:", error);
      return res.status(500).send({
        success: false,
        message: error.message
      });
    }
};

const login = async (req, res) => {
  try {
    // Changed User to userModel
    const user = await userModel.findOne({ email: req.body.email });
    console.log("Found user:", user);

    if (!user) {
      return res.status(401).send({
        success: false,
        message: "User does not exist"
      });
    }

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!validPassword) {
      return res.status(401).send({
        success: false,
        message: "Invalid password"
      });
    }

    // Generate JWT token with user data
    const token = jwt.sign(
      { 
        userId: user._id,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    const response = {
      success: true,
      message: "Login successful",
      data: {
        token: token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    };

    console.log("Sending response:", response);
    res.status(200).send(response);

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send({
      success: false,
      message: error.message
    });
  }
};

const register = async (req, res) => {
  try {
      const isUserExist = await userModel.findOne({ email: req.body.email });

      if (isUserExist) {
          return res.send({
              success: false,
              message: "User already registered."
          });
      }

      // Hash the password.
      const saltRounds = 10; // The higher the number, the more secure but slower the hasing proccess.
      const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
      const newUser = new userModel({
          ...req.body,
          password: hashedPassword
      });

      await newUser.save();

      return res.send({
          success: true,
          message: "Registraion successfuly. Please login."
      });
  } catch (err) {
      return res.status(500).json({ message: err.message });
  }

}

module.exports = {
    register,
    login,
    getCurrentUser,
};



