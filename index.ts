import express from "express";
import { Request, Response } from "express";
import  AuthSync  from "./authSync";
import { mainLogger } from "./logger"
import config from "./config";
import mogooose from "mongoose";
import { error } from "console";

const OPTIONS = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

const app = express();
const db = 'mongodb+srv://zguysanovreon:Qwerty321123@cluster0.usmz3it.mongodb.net/';



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

type RequestQuery = {
    account_id: string,
    code: string,
    referer: string,
}

//доделать поключение к mongo, что туда сохранять токен, домен и акк_id
app.get('/login', async(req: Request<unknown, unknown, unknown, RequestQuery>, res: Response) => {

    mainLogger.debug('LOGIN');    

    mogooose
        .connect(db, OPTIONS)
        .then(() => console.log('connected'))
        .catch((error) => console.log(error));

    const authCode: string = req.query.code;
    const [subDomain] = req.query.referer.split('.');

    const api = new AuthSync(subDomain, authCode, '');
        
    api.getAccessToken();

    res.status(200).send({message: "ok"});
});

app.get('/logout', async (req: Request<unknown, unknown, unknown, RequestQuery>, res: Response) => {

    mainLogger.debug('LOGOUT');
    
    const accountId = req.query.account_id; 
    const api = new AuthSync('', '', accountId);

    api.deleteToken();

    res.status(200).send({message: "ok"});
});


app.listen(config.PORT,() => mainLogger.debug('Server started on ', config.PORT));
