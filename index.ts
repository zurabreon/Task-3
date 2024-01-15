import express from "express";
import { Request, Response } from "express";
import  AuthSync  from "./authSync";
import { mainLogger } from "./logger"
import config from "./config";
import ConnectToMongoDB from "./services/DataBaseClientService";
import MongoDBAccountServices from "./services/AccountService";

const app = express();

const connectToMongoDB = new ConnectToMongoDB();
const mongoDBAccountServices = new MongoDBAccountServices();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

type RequestQuery = {
    account_id: string,
    code: string,
    referer: string,
}

app.get('/login', async(req: Request<unknown, unknown, unknown, RequestQuery>, res: Response) => {

    mainLogger.debug('LOGIN');    

    const authCode: string = req.query.code;
    const [subDomain] = req.query.referer.split('.');

    const api = new AuthSync(subDomain, authCode, '', mongoDBAccountServices);
    
    api.getAccessToken();

    res.status(200).send({message: "ok"});
});

app.get('/logout', async (req: Request<unknown, unknown, unknown, RequestQuery>, res: Response) => {

    mainLogger.debug('LOGOUT');

    const accountId = req.query.account_id; 
    const api = new AuthSync('', '', accountId, mongoDBAccountServices);

    api.deleteToken();

    res.status(200).send({message: "ok"});
});


app.listen(config.PORT,() => {
    mainLogger.debug('Server started on ', config.PORT);
    connectToMongoDB.connectDB();
});