import axios from "axios";
import config from "./config";
import axiosRetry from "axios-retry";
import Api from "./api/api";
import {
    getUserLogger
} from "./logger";
import log4js from "log4js"
import { jwtDecode } from "jwt-decode";
import MongoDBAccountServices from "./services/AccountService";
import Account from "./types/account/accountFields";


axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

class AuthSync extends Api {
    LIMIT: number;
    ROOT_PATH: string;
    ACCESS_TOKEN: string;
    REFRESH_TOKEN: string;
    SUB_DOMAIN: string;
    logger: log4js.Logger;
    CODE: string;
    ACCOUNT_ID: string;

    constructor(
        subDomain: string, code: string, account_id: string,
        private readonly mongoAccountServices = new MongoDBAccountServices()
        ) {
        super();
        this.SUB_DOMAIN = subDomain;
        this.ACCOUNT_ID = account_id;
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

            const account = String(await this.mongoAccountServices.findAccount(this.ACCOUNT_ID));
            const token = JSON.parse(account);
            this.ACCESS_TOKEN = token.access_token;
            this.REFRESH_TOKEN = token.refresh_token;
            return Promise.resolve(token);

        } catch (error) {

            this.logger.debug('Trying get token again');
            const token = await this.requestAccessToken();
            this.ACCESS_TOKEN = token.access_token;
            this.REFRESH_TOKEN = token.refresh_token;
            this.ACCOUNT_ID = String(jwtDecode(token.access_token).account_id);

            const account = await this.mongoAccountServices.findAccount(this.ACCOUNT_ID);
            
            const accountData: Account = {
                account_id: this.ACCOUNT_ID,
                domain: this.SUB_DOMAIN,
                access_token: this.ACCESS_TOKEN,
                refresh_token: this.REFRESH_TOKEN,
                installed: true,
            }
            
            if(account !== null) {

                await this.mongoAccountServices.updateAccount(accountData);
            }
            else {

                await this.mongoAccountServices.addAccount(accountData);
            }

            return Promise.resolve(token);
        }
    };

    async refreshToken() {
        return axios
            .post(`${this.ROOT_PATH}/oauth2/access_token`, {
                client_id: config.CLIENT_ID,
                client_secret: config.CLIENT_SECRET,
                grant_type: "refresh_token",
                refresh_token: this.REFRESH_TOKEN,
                redirect_uri: config.REDIRECT_URI,
            })
            .then(async (res) => {
                this.logger.debug('Token successfully update');
                const token = res.data;
                this.ACCESS_TOKEN = token.access_token;
                this.REFRESH_TOKEN = token.refresh_token;
                this.ACCOUNT_ID = String(jwtDecode(token.access_token).account_id);
            
                const accountData: Account = {
                    account_id: this.ACCOUNT_ID,
                    domain: this.SUB_DOMAIN,
                    access_token: this.ACCESS_TOKEN,
                    refresh_token: this.REFRESH_TOKEN,
                    installed: true,
                }

                await this.mongoAccountServices.updateAccount(accountData);

                return token;
            }) 
            .catch((err) => {
                this.logger.error('Token update failed');
                this.logger.error(err.response.data);
            });
    };

    async deleteToken (): Promise<Account>{

        const accountData: Account = {
            account_id: this.ACCOUNT_ID,
            domain: this.SUB_DOMAIN,
            access_token: "",
            refresh_token: "",
            installed: false,
        }

        return await this.mongoAccountServices.updateAccount(accountData);
        
    }
}

export default AuthSync;