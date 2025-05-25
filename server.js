const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Project Schema
const projectSchema = new mongoose.Schema({
  Img: String,
  Title: String,
  Description: String,
  Features: [String],
  Link: String,
  Github: String,
  TechStack: [String],
});

const Project = mongoose.model("Project", projectSchema);

// Get all projects
app.get("/api/projects", async (req, res) => {
  const projects = await Project.find();
  res.json(projects);
});

// Add a new project (optional, for admin use)
app.post("/api/projects", async (req, res) => {
  const project = new Project(req.body);
  await project.save();
  res.status(201).json(project);
});

// Email sending endpoint
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  // Create transporter
  const transporter = nodemailer.createTransport({
    service: "gmail", // or your email provider
    auth: {
      user: process.env.EMAIL_USER, // your email address
      pass: process.env.EMAIL_PASS, // your email password or app password
    },
  });

  // Email options
  const mailOptions = {
    from: email,
    to: process.env.EMAIL_RES, // your email address
    subject: `Portfolio Contact from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send email" });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
