import express from "express";
import { Request, Response } from "express";
import  AmoCRM  from "./api/amo";
import { mainLogger } from "./logger"
import config from "./config";
import axios from "axios";
import fs from "fs";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authCode = config.AUTH_CODE;
const subDomain = config.SUB_DOMAIN;
const api = new AmoCRM(subDomain, authCode);

async function requestAccessTokenMy() {
    return axios
        .post(`https://${config.SUB_DOMAIN}.amocrm.ru/oauth2/access_token`, {
            client_id: config.CLIENT_ID,
            client_secret: config.CLIENT_SECRET,
            grant_type: "authorization_code",
            code: authCode,
            redirect_uri: config.REDIRECT_URI, 
        })
        .then((res) => {
            console.log(res.data);
            return res.data; 
        })
        .catch((err) =>{
            mainLogger.debug(err.response.data);
            throw err;
        });
}

//недоделанная
async function refreshTokenMy() {
    return axios
            .post(`https://${config.SUB_DOMAIN}.amocrm.ru/oauth2/access_token`, {
                client_id: config.CLIENT_ID,
                client_secret: config.CLIENT_SECRET,
                grant_type: "refresh_token",
                REFRESH_TOKEN: this.REFRESH_TOKEN,
                redirect_uri: config.REDIRECT_URI,
            })
            .then((res) => {
                this.logger.debug("Токен успешно обновлен");
                const token = res.data;
                fs.writeFileSync(this.AMO_TOKEN_PATH, JSON.stringify(token));
                this.ACCESS_TOKEN = token.access_token;
                this.REFRESH_TOKEN = token.refresh_token;
                return token;
            })
            .catch((err) => {
                this.logger.error("Не удалось обновить токен");
                this.logger.error(err.response.data);
            });
}

async function getAccountId(access_token: string) {

    const getAccountId = (() => {
        return axios.get<any>(`https://${subDomain}.amocrm.ru/api/v4/account`, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        }).then((res) => res.data.id);
    })
    const accountId = await getAccountId();

    return accountId;
}

//подумать как сделать правильно передачу id чтобы не обращаться постоянно к api и брать токен
//Один раз нужно сохранить токен и к нему обращаться
//Проверка с файлом не работает. Поищи как в if засунуть проверку
app.get("/login", async (_req: Request, _res: Response) => {

    const token = await requestAccessTokenMy();

    const accountId = await getAccountId(token.access_token);

    if(!fs.readFileSync(`./authclients/${accountId}_amo_token.json`)) {
        mainLogger.debug('Token not found. Creating...');
        fs.writeFileSync(`./authclients/${accountId}_amo_token.json`, JSON.stringify(token));
    }
    else {
        mainLogger.debug('Token is already created');
    }
});

app.get("/logout", async (_req: Request, _res: Response) => {

    const token = await requestAccessTokenMy();

    const accountId = await getAccountId(token.access_token);

    fs.unlink(`./authclients/${accountId}_amo_token.json`, err => {
        if(err) {
            throw err;
        }
        mainLogger.debug('Token deleted successfully');
    });
});

app.listen(config.PORT,() => mainLogger.debug('Server started on ', config.PORT));


