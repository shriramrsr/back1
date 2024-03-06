import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import { register } from "./controllers/auth.js";
import { createPost } from "./controllers/posts.js";
import { verifyToken } from "./middleware/auth.js";
import User from "./models/User.js";
import Post from "./models/Post.js";
import { users, posts } from "./data/index.js";

/* CONFIGURATIONS */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

/* FILE STORAGE */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

app.get("/search", async (req, res) => {
  console.log("Arrives");
  try {
    console.log("reached  search route");
    const { query } = req.query; // Extract the search query from query parameters
    // Perform a database query to find users matching the search query
    const users = await User.find({
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        // Add more fields to search as needed (e.g., lastName, email, etc.)
      ]
    });

    // Respond with the found users
    res.json(users);
  } catch (error) {
    // If an error occurs, send an error response
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* ROUTES WITH FILES */
app.post("/auth/register", upload.single("picture"), register);
app.post("/posts", verifyToken, upload.single("picture"), createPost);

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

/* MONGOOSE SETUP */
const PORT = 3000;

/*mongoose.connect(
  `mongodb+srv://lokheshrj:${process.env.db_pass}@cluster0.8ttolti.mongodb.net/?retryWrites=true&w=majority`
  ).then(()=>app.listen(5000,()=>console.log("Connected"))).catch((e)=> console.log(e));

,
    "multer": "^1.4.5-lts.1",
    "multer-gridfs-storage": "^5.0.2"
  
*/


/*
mongodb+srv://lokheshrj:${process.env.db_pass}@cluster0.3kv7vxf.mongodb.net/?retryWrites=true&w=majority
*/

mongoose
  .connect(`mongodb+srv://shriram_r__:${process.env.db_pass}@cluster0.e4gsd9p.mongodb.net/insta`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {


    /*ADD DATA ONE TIME */
    // User.insertMany(users);
    // Post.insertMany(posts);
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
  })
  .catch((error) => console.log(`${error} did not connect`));

  

  app.get('/',  (req, res) => {
    res.send("hello working");
  });
  app.get('/usersf', async (req, res) => {
    try {
      const users = await User.find();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.get('/usersf/:name', async (req, res) => {
    const { name } = req.params;
    //res.send("Arrives");
    try {
      // Search for users where firstName or lastName matches the provided name
      const user = await User.findOne({ firstName: name });
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.get('/post', async (req, res) => {
    try {
      const posts = await Post.find();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.get('/usersf/:name/post', async (req, res) => {
    const { name } = req.params;
    try {
      // Find the user by firstName (assuming firstName stores the user's name)
      const user = await User.findOne({ firstName: name });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Find all posts by the user using their user ID
      const userPosts = await Post.find({ userId: user._id });
      
      res.json(userPosts);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
