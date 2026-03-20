import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const SECRET = "hello123";

const signup = async (req, res) => {
  try {
    const body = req.body;
    if (!body.email || !body.password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const hashPassword = await bcrypt.hash(body.password, 10);
    body.password = hashPassword;
    const result = await userModel.create(body);
    res.status(201).json(result);
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const loginForm = (req, res) => {
  res.render("auth/login-form", { err: null });
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const found = await userModel.findOne({ email });
    console.log("session" + (req.session?.user || "undefined"));
    if (found) {
      const chkPassword = await bcrypt.compare(password, found.password);
      if (chkPassword) {
        const user = {
          id: found._id,
          name: found.name,
          email: found.email,
          role: found.role,
        };
        if (found.role === "admin") {
          req.session.user = user;
          return res.redirect("/users");
        } else {
          const token = jwt.sign(user, SECRET, { expiresIn: "1h" });
          return res.json({ ...user, token });
        }
      } else {
        return res.status(401).json({ message: "Invalid Password" });
      }
    } else {
      return res.status(401).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const logout = async (req, res) => {
  req.session.destroy((err) => {
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
};

const saveNewUser = async (req, res) => {
  const body = req.body;
  const hashPassword = await bcrypt.hash(body.password, 10);
  body.password = hashPassword;
  const result = await userModel.create(body);
  res.redirect("/users");
};

export { signup, login, saveNewUser, loginForm, logout };
