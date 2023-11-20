import express from "express";
import cors from 'cors';
import dbConnect from "./dbConnect.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";

const app = express();

dbConnect()
    .then(() => console.log("Database Connected Successfully"))
    .catch((error) => {
        console.error("Error connecting to the database:", error);
    });

// app.use(cors({
//     origin: 'https://655b52620306dc0ab594ab11--exquisite-cajeta-0ab313.netlify.app/',
//     credentials: true
// }));
// app.use(cors());
const corsConfig = {
    origin: '*',
    credentials: true,
};

app.use(express.json({ limit: '50mb' }));

app.use(userRoutes);
app.use(adminRoutes);
app.use(staffRoutes);

app.listen(5000, function () {
    console.log("Server started on port 5000");
});