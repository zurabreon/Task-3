import express from "express";
import { Request, Response } from "express";
import  AuthSync  from "./authSync";
import { mainLogger } from "./logger"
import config from "./config";
import fs from "fs";
import { subtle } from "crypto";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

type RequestQuery = {
    account_id: string,
    code: string,
    referer: string,
}

type WebHook = {
    account: {
        subdomain: string,
        id: string,
    }
    contacts: {
        update:[ {
            id: string,
            linked_leads_id: number,
        }]
    }
}

app.get("/login", async(req: Request<unknown, unknown, unknown, RequestQuery>, res: Response) => {

    mainLogger.debug("LOGIN");
     
    const authCode: string = req.query.code;
    const [subDomain] = req.query.referer.split('.');

    const api = new AuthSync(subDomain, authCode, "");

    api.getAccessToken();


    res.status(200).send({message: "ok"});
});

app.post("/contact", async(req: Request<unknown, unknown, WebHook, RequestQuery>, res: Response) => {

    const accountId: string = req.body.account.id;

    const authCode = config.AUTH_CODE;
    const subDomain = config.SUB_DOMAIN; 

    const api = new AuthSync(subDomain, authCode, accountId);

    console.log(await api.getContact(5239253));

    res.status(200).send({message: "ok"});
})

app.get("/logout", async (req: Request<unknown, unknown, unknown, RequestQuery>, _res: Response) => {

    mainLogger.debug("LOGOUT");
    
    const accountId = req.query.account_id; 

    fs.unlink(`./authclients/${accountId}_amo_token.json`, err => {
        if(err) {
            throw err;
        }
        mainLogger.debug('Token deleted successfully');
    });

});


app.listen(config.PORT,() => mainLogger.debug('Server started on ', config.PORT));
