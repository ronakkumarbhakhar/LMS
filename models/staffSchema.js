import { Schema, model } from "mongoose";

const staffSchema = new Schema({
    role: {
        type: String,
        required: true
    },
    adminId: {
        type: String
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    registration: {
        type: Number,
        required: true
    },
    room: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    systemOtp: {
        type: Number,
        required: true
    },
    image: {
        type: String,
    },
    tokens: [
        {
            token: {
                type: String,
            }
        }
    ]
});

const Staff = new model("staff",staffSchema);

export default Staff;