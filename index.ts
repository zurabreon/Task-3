import express from "express";
import { Request, Response } from "express";
import  AmoCRM  from "./api/amo";
import { mainLogger } from "./logger"
import config from "./config";

const app = express();
const api = new AmoCRM(config.SUB_DOMAIN, config.AUTH_CODE);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get("/login", async (req : Request, res: Response) => {
    api.getAccessToken();

    
});

app.post("/logout", async (req: Request, res: Response) => {
	
});


app.listen(config.PORT,()=>mainLogger.debug('Server started on ', config.PORT))


