const Group = require("../Models/Group");
const User = require("../Models/User");
const Sent = require("../Models/Sent");
const Template = require("../Models/Template");
const bcrypt = require("bcrypt");
const { sendMail } = require("../services/mail");
const generateToken = require("../utils/generateToken");

const addGroup = async (req, res) => {
  const group = new Group({
    name: req.body.name,
    emails: req.body.emails,
    userId: req.user._id,
  });
  if (!group)
    return res
      .status(400)
      .send({ success: false, message: "Failed to add group" });
  const result = await group.save();
  if (!result)
    return res
      .status(400)
      .send({ success: false, message: "Failed to add group" });
  res
    .status(200)
    .send({ success: true, message: "Successfully added the group" });
};

const viewGroups = async (req, res) => {
  const groups = await Group.find({ userId: req.user._id });
  if (!groups)
    return res.status(500).send({ success: false, message: "No groups found" });
  res
    .status(200)
    .send({ success: true, message: "successfully fetched the data.", groups });
};

const sendMails = async (req, res) => {
  let temp = "none";
  const group = await Group.findById(req.body.group);
  if (req.body.template !== "none") {
    temp = await Template.findById(req.body.template);
  } else {
    temp = "none";
  }
  if (!group)
    return res.status(404).send({ success: false, message: "Group not found" });

  const message = req.body.message ? req.body.message : " ";
  const fromEmail = req.user.email;
  const toEmail = group.emails;
  const subject = req.body.subject;
  const template = temp !== "none" ? temp.content : " ";
  sendMail(fromEmail, toEmail, subject, message);
  const sendBox = new Sent({
    userId: req.user._id,
    subject: req.body.subject,
    groupId: req.body.group,
    message: req.body.template !== "none" ? temp.name : "Custom message",
    fromEmail: req.user.email,
  });

  const result = await sendBox.save();
  if (!result)
    return res
      .status(500)
      .send({ success: false, message: "Failed to add send record" });
  res.status(200).send({ success: true, message: "successfully send" });
};

const deleteGroup = async (req, res) => {
  const group = await Group.findByIdAndDelete(req.params.id);
  if (!group)
    return res
      .status(404)
      .send({ success: false, message: "Failed to delete the group" });
  res
    .status(200)
    .send({ success: true, message: "Group deleted successfully" });
};

const register = async (req, res) => {
  // Check if user already exists
  const existingUser = await User.findOne({ email: req.body.email });
  if (existingUser) {
    return res
      .status(409)
      .send({ success: false, message: "User already exists. Please login." });
  }
  const user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
  });
  if (!user)
    return res
      .status(400)
      .send({ success: false, message: "Registration failed!" });
  const result = await user.save();
  if (!result)
    return res
      .status(500)
      .send({ success: false, message: "Registration failed!" });
  res.status(200).send({ success: true, message: "Registration successfull" });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email: req.body.email });
    // If user not found, send error response
    if (!user) {
      return res
        .status(400)
        .send({ success: false, message: "Incorrect email or password" });
    }

    // Compare passwords
    if (!bcrypt.compareSync(req.body.password, user.password)) {
      return res
        .status(400)
        .send({ success: false, message: "Incorrect email or password" });
    }

    // If everything is correct, generate token and send success response
    const token = generateToken(user.email);
    return res.status(200).send({
      success: true,
      message: "Successfully logged in",
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error" });
  }
};

const sentDetails = async (req, res) => {
  const mails = await Sent.find({ userId: req.user._id }).populate({
    path: "groupId",
    select: "name",
  });

  if (!mails) {
    return res.status(404).send({ success: false, message: "Mails not found" });
  } else {
    return res.send({
      success: true,
      message: "Successfully fetched the data",
      mails,
    });
  }
};
const newTemplate = async (req, res) => {
  const template = new Template({
    userId: req.user._id,
    content: req.body.content,
    name: req.body.name,
  });
  if (!template)
    return res
      .status(500)
      .send({ success: false, message: "Failed creation of template" });
  const result = await template.save();
  if (!result)
    return res
      .status(500)
      .send({ success: false, message: "Failed creation of template" });
  res
    .status(200)
    .send({ success: true, message: "successfully added new template" });
};

const deleteTemplate = async (req, res) => {
  const template = await Template.findByIdAndDelete(req.params.id);
  if (!template)
    return res
      .status(404)
      .send({ success: false, message: "Template not found!" });
  res
    .status(200)
    .send({ success: true, message: "Template successfully deleted" });
};

const viewTemplates = async (req, res) => {
  const templates = await Template.find({ userId: req.user._id });
  if (!templates)
    return res
      .status(500)
      .send({ success: false, message: "Cannot fetch the templates!" });
  res.status(200).send({
    success: true,
    message: "Templates fetched successfully",
    templates,
  });
};

const dashboard = async (req, res) => {
  const groups = await Group.find({ userId: req.user._id });
  const templates = await Template.find({ userId: req.user._id });
  const sents = await Sent.find({ userId: req.user._id });
  res.status(200).send({
    success: true,
    message: "Successfully fetched the data",
    groups: groups.length,
    templates: templates.length,
    sents: sents.length,
  });
};

module.exports = {
  addGroup,
  sendMails,
  viewGroups,
  deleteGroup,
  register,
  login,
  sentDetails,
  newTemplate,
  deleteTemplate,
  viewTemplates,
  dashboard,
};
