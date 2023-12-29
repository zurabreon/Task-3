import axios from "axios";
import config from "./config";
import fs from "fs";
import axiosRetry from "axios-retry";
import Api from "./api/api";
import {
    getUserLogger
} from "./logger";
import log4js from "log4js"
import { jwtDecode } from "jwt-decode";


axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });


class AuthSync extends Api {
    AMO_TOKEN_PATH: string;
    LIMIT: number;
    ROOT_PATH: string;
    ACCESS_TOKEN: string;
    REFRESH_TOKEN: string;
    SUB_DOMAIN: string;
    logger: log4js.Logger;
    CODE: string;
    ACCOUNT_ID: string;

    constructor(subDomain: string, code: string, account_id: string) {
        super();
        this.SUB_DOMAIN = subDomain;
        this.ACCOUNT_ID = account_id;
        this.AMO_TOKEN_PATH = `./authclients/${this.ACCOUNT_ID}_amo_token.json`;
        this.LIMIT = 200;
        this.ROOT_PATH = `https://${this.SUB_DOMAIN}.amocrm.ru`
        this.ACCESS_TOKEN = "";
        this.REFRESH_TOKEN = "";
        this.logger = getUserLogger(this.SUB_DOMAIN);
        this.CODE = code;
    }

    authChecker = <T extends any[], D>(request: (...args: T) => Promise<D>) => {
        return async (...args: T): Promise<D> => {
            if (!this.ACCESS_TOKEN) {
                return this.getAccessToken().then(() => this.authChecker(request)(...args));
            }
            return request(...args).catch((err: any) => {
                const data = err.response.data;
                if ('validation-errors' in data) {
                    this.logger.error('args', JSON.stringify(args, null, 2))
                }
                if (data.status == 401 && data.title === "Unauthorized") {
                    this.logger.debug('Need to refresh token');
                    return this.refreshToken().then(() => this.authChecker(request)(...args));
                }
                throw err
            });
        };
    };

    async requestAccessToken() {
        return axios
            .post(`${this.ROOT_PATH}/oauth2/access_token`, {
                client_id: config.CLIENT_ID,
                client_secret: config.CLIENT_SECRET,
                grant_type: "authorization_code",
                code: this.CODE,
                redirect_uri: config.REDIRECT_URI,
            })
            .then((res) => {
                this.logger.debug('New token received');
                return res.data;
            })
            .catch((err) => {
                this.logger.error(err.response.data);
                throw err;
            });
    };

    async getAccessToken() {
        if (this.ACCESS_TOKEN) {
            return Promise.resolve(this.ACCESS_TOKEN);
        }
        try {
            const content = fs.readFileSync(this.AMO_TOKEN_PATH).toString();
            const token = JSON.parse(content);
            this.ACCESS_TOKEN = token.access_token;
            this.REFRESH_TOKEN = token.refresh_token;
            return Promise.resolve(token);
        } catch (error) {
            this.logger.error(`Error read file ${this.AMO_TOKEN_PATH}`, error);
            this.logger.debug('Trying get token again');
            const token = await this.requestAccessToken();
            this.ACCESS_TOKEN = token.access_token;
            this.REFRESH_TOKEN = token.refresh_token;
            this.ACCOUNT_ID = String(jwtDecode(token.access_token).account_id);
            this.AMO_TOKEN_PATH = `./authclients/${this.ACCOUNT_ID}_amo_token.json`
            fs.writeFileSync(this.AMO_TOKEN_PATH, JSON.stringify(token));
            return Promise.resolve(token);
        }
    };

    async refreshToken() {
        return axios
            .post(`${this.ROOT_PATH}/oauth2/access_token`, {
                client_id: config.CLIENT_ID,
                client_secret: config.CLIENT_SECRET,
                grant_type: "refresh_token",
                REFRESH_TOKEN: this.REFRESH_TOKEN,
                redirect_uri: config.REDIRECT_URI,
            })
            .then(async (res) => {
                this.logger.debug('Token successfully update');
                const token = res.data;
                this.ACCESS_TOKEN = token.access_token;
                this.REFRESH_TOKEN = token.refresh_token;
                this.ACCOUNT_ID = String(jwtDecode(token.access_token).account_id);
                this.AMO_TOKEN_PATH = `./authclients/${this.ACCOUNT_ID}_amo_token.json`
                fs.writeFileSync(this.AMO_TOKEN_PATH, JSON.stringify(token));
                return token;
            })
            .catch((err) => {
                this.logger.error('Token update failed');
                this.logger.error(err.response.data);
            });
    };

    async deleteToken (accountId: string){

        fs.unlink(`./authclients/${accountId}_amo_token.json`, err => {
            if(err) {
                throw err;
            }
            this.logger.debug('Token deleted successfully');
        });
    }
}

export default AuthSync;