import mongoose from "mongoose";

const ACCOUNT_COLLECTION = 'accounts';

const Schema = mongoose.Schema;

const accountsSchema = new Schema ({
    account_id: {
        type: String,
        required: true,
    },
    domain: {
        type: String,
        required: true,
    },
    access_token: {
        type: String,
        required: true,
    },
    refresh_token: {
        type: String,
        required: true,
    },
    installed: {
        type: Boolean,
        required: true,
    },
},  { timestamps: true });

const AccountModel = mongoose.model('AccountModel', accountsSchema, ACCOUNT_COLLECTION);

export {
    AccountModel,
}