import bcrypt from "bcryptjs";
import { Router } from "express";
import jsonwebtoken from "jsonwebtoken";
import cookieParser from "cookie-parser";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import User from "../models/userSchema.js";
import cloudinary from "../cloudinary.js";

dotenv.config({ path: "./config.env" });

const userRoutes = Router();

userRoutes.use(cookieParser());

const sendEmail = async (systemOtp, email) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    const mailOptions = await transporter.sendMail({
        from: process.env.SMTP_MAIL, // sender address
        to: email,
        subject: "Laundry Management System: Email ID Verification ",
        text: `Your One Time Password (OTP) for registration: ${systemOtp}`,
    });

    transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
            console.log(err);
        } else {
            console.log("Email sent succesfully");
        }
    });

    console.log("Email", systemOtp);
}

userRoutes.get("/", function (req, res) {
    console.log("WWE");
    res.send("Aman is chaman");
});

userRoutes.post("/user/register", async function (req, res) {

    let { name, email, phone, registration, room, password, cpassword } = req.body;

    let userId = room.slice(0, 1) + room.slice(3, 4);

    try {
        const findUser = await User.findOne({ email: email });

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

            const user = new User({ role: "user", userId, name, email, phone, registration, room, password: hash, systemOtp, index: 0 });

            await user.save();

            console.log("User Saved Successfully");
            res.send("User Saved Successfully");

            await sendEmail(systemOtp, email);

        }

    } catch (err) {
        console.log(err);
    }

});

userRoutes.post("/verifyOtp", async function (req, res) {
    console.log("verifyOtp");

    let userOtp = req.body.otp;
    const email = req.body.email;

    userOtp = Number(userOtp);

    const rootUser = await User.findOne({ email: email });

    console.log("userOtp", userOtp);
    // console.log("rootUser.systemOtp", rootUser.systemOtp);

    if (userOtp === rootUser.systemOtp) {

        return res.status(200).json({ Message: "OTP verified successfully" });
    } else {
        return res.status(409).json({ Error: "Invalid OTP" });
    }
});

userRoutes.post("/reSendOtp", async function (req, res) {
    console.log("Re-SendOtp");

    var systemOtp = Math.round(Math.random() * 10000) + 1;

    if (systemOtp < 1000) {
        systemOtp += 1000;
    }

    const email = req.body.email;
    // await sendEmail(systemOtp, email);

    await User.findOneAndUpdate({ email: email }, { systemOtp: systemOtp });

    console.log("OTP sent successfully");
    return res.status(200).json({ Message: "OTP sent successfully" });

});

userRoutes.post("/forgotPassword", async function (req, res) {
    console.log("Forgot Password");

    const email = req.body.email;

    const rootUser = await User.findOne({ email: email });

    if (rootUser) {
        var systemOtp = Math.round(Math.random() * 10000) + 1;

        if (systemOtp < 1000) {
            systemOtp += 1000;
        }
        console.log("OTP", systemOtp);
        await User.findOneAndUpdate({ email: email }, { systemOtp: systemOtp });
        // await sendEmail(systemOtp, email);
        return res.status(200).json({ Message: "OTP sent successfully" });

    }
    else {
        return res.status(409).json({ Message: "Email not found" });
    }

});

userRoutes.post("/changePassword", async function (req, res) {
    console.log("Change Password");

    const { password, email } = req.body;

    const hash = await bcrypt.hash(password, 12);

    await User.findOneAndUpdate({ email: email }, { password: hash });

    return res.status(200).json({ Message: "Password changed successfully" });

});

userRoutes.post("/user/login", async (req, res) => {

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(422).json({ error: "Please fill all the required fields!!!" });
        }
        const findUser = await User.findOne({ email: email });

        if (!findUser) {
            return res.status(401).json({ error: "Invalid Credentials!!!" });
        } else {

            const isMatch = await bcrypt.compare(password, findUser.password);

            if (isMatch) {

                // Generating token using jsonwebtoken
                let token = jsonwebtoken.sign({ _id: findUser._id }, process.env.SECRET_KEY);
                findUser.tokens = findUser.tokens.concat({ token: token });

                // Creating cookie using the generated token
                res.json( {token,
                    // expiresIn: toString() new Date(Date.now + 86400000),
                    httpOnly: false
                });

                await findUser.save();
                console.log("User Login Successfull!!!");
                return res.json({ message: "User Login Successfull!!!" });
            } else {
                return res.status(401).json({ error: "Invalid Credentials!!! pass" });
            }
        }

    } catch (err) {
        console.log(err);
    }

});



userRoutes.get("/getData", async function (req, res) {

    try {
        const token = req.cookies.jwtoken;

        const verifyToken = jsonwebtoken.verify(token, process.env.SECRET_KEY);

        const rootUser = await User.findOne({ _id: verifyToken._id, "tokens.token": token });

        if (!rootUser) { throw new Error("User Not Found") }

        res.send(rootUser);

    } catch (err) {
        res.status(401).send("Unauthorized: No token Provided");
        console.log(err);
    }

});


const complaintSendMail = async (email, id) => {

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    const mailOptions = await transporter.sendMail({
        from: process.env.SMTP_MAIL, // sender address
        to: email,
        subject: "Laundry Management System: Complaint Registered ",
        text: `Your complaint has been registered with token ${id}`,
    });

    transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
            console.log(err);
        } else {
            console.log("Email sent succesfully");
        }
    });

    console.log("Complaint Email sent", id);

}

userRoutes.post("/complaint", async (req, res) => {

    try {

        const token = req.cookies.jwtoken;

        const verifyToken = jsonwebtoken.verify(token, process.env.SECRET_KEY);

        const rootUser = await User.findOne({ _id: verifyToken._id, "tokens.token": token });

        if (!rootUser) { throw new Error("User Not Found") }

        const { name, email, phone, message } = req.body;

        if (!name || !email || !phone || !message) {
            console.log("Error in complaint form");
            return res.status(422).json({ error: "Please fill the complaint form" });
        }

        const userContact = await User.findOne({ _id: rootUser._id });

        if (userContact) {
            var systemOtp = Math.round(Math.random() * 100) + 1;

            if (systemOtp < 10) {
                systemOtp += 10;
            }
            const id = rootUser.userId + systemOtp;

            // await complaintSendMail(email, id);

            userContact.messages.push({ name, email, phone, message });
            // userContact.messages = userContact.messages.concat({ name, email, phone, message });

            await userContact.save();

            return res.status(201).json({ message: "User Complaint Successfull" })
        }

    } catch (error) {
        console.log(error);
    }

});

userRoutes.post("/addClothes", async (req, res) => {

    try {

        const token = req.cookies.jwtoken;

        const verifyToken = jsonwebtoken.verify(token, process.env.SECRET_KEY);

        const rootUser = await User.findOne({ _id: verifyToken._id, "tokens.token": token });

        if (!rootUser) { throw new Error("User Not Found") }


        const { shirt, pent, tShirt, lower, shorts, towel, pillowCover, bedSheet } = (req.body);

        if (shirt > 0 || pent > 0 || tShirt > 0 || lower > 0 || shorts > 0 || towel > 0 || pillowCover > 0 || bedSheet) {

            const userContact = await User.findOne({ _id: rootUser._id });

            if (userContact) {

                const currIndex = userContact.index;

                const userContacted = await User.findOneAndUpdate({ _id: rootUser._id }, { index: currIndex + 1 });
                await userContacted.save();

                // userContact.clothes = userContact.clothes.concat({ serialNo:"2",shirt, pent, tShirt, lower, shorts, towel, pillowCover, bedSheet });
                userContact.clothes.push({ serialNo: currIndex + 1, shirt: shirt || 0, pent: pent || 0, tShirt: tShirt || 0, lower: lower || 0, shorts: shorts || 0, towel: towel || 0, pillowCover: pillowCover || 0, bedSheet: bedSheet || 0 });
                await userContact.save();

                res.status(201).json({ message: "User Clothes added Successfully" })
            }
        }

    } catch (error) {
        console.log(error);
    }

});

userRoutes.post('/updateProfile', async (req, res) => {
    try {

        const token = req.cookies.jwtoken;

        const verifyToken = jsonwebtoken.verify(token, process.env.SECRET_KEY);

        const rootUser = await User.findOne({ _id: verifyToken._id, "tokens.token": token });

        if (!rootUser) { throw new Error("User Not Found") }

        const fileString = req.body.data;

        const uploadedResponse = await cloudinary.uploader.
            upload(fileString, {
                upload_preset: "i91jqvyx",

            }).then(async (uploadedImg) => {
                console.log("Image Saved Successfully");
                console.log(uploadedImg.secure_url);
                const userContact = await User.findOne({ _id: rootUser._id });

                if (userContact) {

                    const userContacted = await User.findOneAndUpdate({ _id: rootUser._id }, { image: uploadedImg.secure_url });

                    res.status(201).json({ message: "Image Added Successfully" });
                }

            })
            .catch((err) => {
                console.log(err);
            });


    } catch (error) {
        console.log(error);
    }

});


export default userRoutes;