const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Role = require("../models/role");
const UserRole = require("../models/userRole");
require("dotenv").config();

// Register a new user
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const newUser = await User.create({ name, email, password: hashedPassword });

    // Assign a role
    const roleRecord = await Role.findOne({ where: { name: role } });
    if (!roleRecord) return res.status(400).json({ message: "Invalid role" });

    await UserRole.create({ userId: newUser.id, roleId: roleRecord.id });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login a user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Verify the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: "Invalid credentials" });

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
