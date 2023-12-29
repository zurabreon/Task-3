import express from "express";
import { Request, Response } from "express";
import  AuthSync  from "./authSync";
import { mainLogger } from "./logger"
import config from "./config";

const app = express();

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

    const api = new AuthSync(subDomain, authCode, '');
        
    api.getAccessToken();

    res.status(200).send({message: "ok"});
});

app.get('/logout', async (req: Request<unknown, unknown, unknown, RequestQuery>, res: Response) => {

    mainLogger.debug('LOGOUT');
    
    const accountId = req.query.account_id; 
    const api = new AuthSync('', '', '');

    api.deleteToken(accountId);

    res.status(200).send({message: "ok"});
});


app.listen(config.PORT,() => mainLogger.debug('Server started on ', config.PORT));
