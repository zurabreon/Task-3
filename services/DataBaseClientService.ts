import mongoose from "mongoose";

class ConnectToMongoDB {

    private db = "mongodb://localhost:27017";
    private DB_NAME = 'amo-accounts';
    
    private OPTIONS = {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    }
    
    public connectDB = async (): Promise<typeof mongoose | void> => {
        try {
            console.log('Connected to Mongo');
            return await mongoose.connect(`${this.db}/${this.DB_NAME}`, this.OPTIONS);
        } catch (error) {
            console.log(error);
        }
    }
    
    public disconnectDB = async (): Promise<void> => {
        console.log('Disconnected'); 
        return await mongoose.disconnect();
    }

}

export default ConnectToMongoDB;