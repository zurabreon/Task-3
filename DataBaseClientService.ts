import mongoose from "mongoose";

const db = "mongodb://127.0.0.1:27017";

const DB_NAME = 'amo-accounts';

const OPTIONS = {
    useUnifiedTopology: true,
    useNewUrlParser: true,

}

const connectDB = async () => {
    try {
        await mongoose.connect(`${db}/${DB_NAME}`, OPTIONS);
        console.log('Connected to Mongo');
    } catch (error) {
        console.log(error);
    }
}

const disconnectDB = async () => {
    await mongoose.disconnect();
    console.log('Disconnected'); 
}

export {
    connectDB,
    disconnectDB,
}