import { Schema, model } from "mongoose";

var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();

today = mm + '/' + dd + '/' + yyyy;

const userSchema = new Schema({
    role: {
        type: String,
        // required: true
    },
    userId: {
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
    index: {
        type: Number,
        default: 0
    },
    clothes: [
        {
            serialNo: {
                type: Number,
                required: true
            },
            collectedOn: {
                type: String,
                default: today
            },
            shirt: {
                type: Number,
                default: 0,
            },
            pent: {
                type: Number,
                default: 0,
            },
            tShirt: {
                type: Number,
                default: 0,
            },
            lower: {
                type: Number,
                default: 0,
            },
            shorts: {
                type: Number,
                default: 0,
            },
            towel: {
                type: Number,
                default: 0,
            },
            pillowCover: {
                type: Number,
                default: 0,
            },
            bedSheet: {
                type: Number,
                default: 0,
            }
        }
    ],
    messages: [
        {
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
            message: {
                type: String,
                required: true
            },
            complaintImg: {
                type: String,
                // required: true
            }
        }
    ],
    tokens: [
        {
            token: {
                type: String,
            }
        }
    ]
})

const User = model("USER", userSchema);

export default User;