import express from "express";
import userRouter from "./routes/userRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import questionRoutes from './routes/questionRoutes.js';
import profileRoutes from "./routes/profileRoutes.js";
import cors from "cors";
import { authMiddleware } from './middleware/auth.js';

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://apti-verse.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (origin.startsWith("http://localhost") || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));


app.use(express.json());

app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`);
  next();
});



app.use("/api/users", userRouter);
app.use("/api/users", profileRoutes); 

app.use("/api/admin", adminRouter);

app.use('/api/questions', questionRoutes); 

app.post("/api/auth/sync", authMiddleware, (req, res) => {
  res.status(200).json({ 
    message: "User synced successfully", 
    user: req.user 
  });
});

app.get("/", (req, res) => {
  res.status(200).send("SERVER IS RUNNING");
});

export { app };
