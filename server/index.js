const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const cors = require("cors");

const authRoutes = require("./routes/auth.js")
const listingRoutes = require("./routes/listing.js")
const bookingRoutes = require("./routes/booking.js")
const userRoutes = require("./routes/user.js")

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

/* ROUTES */
app.use("/auth", authRoutes)
app.use("/properties", listingRoutes)
app.use("/bookings", bookingRoutes)
app.use("/users", userRoutes)

/* MONGOOSE SETUP */
const PORT = 3001;

// Validate Mongo connection string early for clearer errors
const mongoUrl = process.env.MONGO_URL;
if (!mongoUrl) {
  console.error("Missing MONGO_URL in server/.env. Set your Atlas connection string.");
  process.exit(1);
}
if (!/^mongodb(\+srv)?:\/\//.test(mongoUrl)) {
  console.error("MONGO_URL must start with mongodb:// or mongodb+srv:// and include a valid hostname.");
  process.exit(1);
}

mongoose
  .connect(mongoUrl, {
    dbName: "Dream_Nest",
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
  })
  .catch((err) => console.log(`${err} did not connect`));
