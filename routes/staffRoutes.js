import bcrypt from "bcryptjs";
import { Router } from "express";
import Staff from "../models/staffSchema.js";

const staffRoutes = Router();

staffRoutes.post("/staff/register", async (req, res) => {
    let { name, email, phone, registration, room, password, cpassword } = req.body;

    let userId = room.slice(0, 1) + room.slice(3, 4);

    try {
        const findUser = await Staff.findOne({ email: email });

        if (findUser) {
            return res.status(409).json({ error: "User already exists!!!" });
        } else if (password != cpassword) {

            return res.status(409).json({ error: "Passwords not Matched" });
        } else {

            const hash = await bcrypt.hash(password, 12);

            var systemOtp = Math.round(Math.random() * 10000) + 1;

            if (systemOtp < 1000) {
                systemOtp += 1000;
            }

            const staff = new Staff({ role:"staff",userId, name, email, phone, registration, room, password: hash, systemOtp, index: 0 });

            await staff.save();

            console.log("Admin Saved Successfully");
            res.send("Admin Saved Successfully");

            // await sendEmail(systemOtp, email);

        }

    } catch (err) {
        console.log(err);
    }
});

export default staffRoutes;