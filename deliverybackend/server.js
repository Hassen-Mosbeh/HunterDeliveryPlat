const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRouter = require("./Routes/AuthRoutes");
const userRouter = require("./Routes/UserRoutes");
const authMiddleware = require("./Middleware/authMiddleware");
const clientRouter = require("./Routes/ClientRoutes");
const restoRouter = require("./Routes/RestoRoutes");
const driverRouter = require("./Routes/DriverRoutes");
const categoryRouter = require("./Routes/CategoryRoutes");
const productRouter = require("./Routes/ProductRoutes");
const orderRouter = require("./Routes/OrderRoutes");


require("dotenv").config();

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Public authentication routes.
app.use("/api/auth", authRouter);

// Protected user profile routes.
app.use("/api/clients", clientRouter);

app.use("/api/users", authMiddleware, userRouter);

app.use("/api/restaurants", restoRouter);

app.use("/api/drivers", driverRouter);

app.use("/api/categories", categoryRouter);

app.use("/api/products", productRouter);

app.use("/api/restaurants/orders", orderRouter);

// Basic API health response for unmatched root access.
app.get("/", (req, res) => {
  res.status(200).json({ status: "success", message: "API is running" });
});

// Fallback for unknown routes.
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
