import { AccountModel } from "../models/accountModel"
import Account from "../types/account/accountFields";

class MongoDBAccountServices {

    public addAccount = async (account_id: String, domain: String, access_token: String, refresh_token: String, installed: Boolean): Promise<Account | undefined> => {
            
        const accountData = new AccountModel({
            account_id,
            domain,
            access_token,
            refresh_token,
            installed,
        });
    
        try {
            return await accountData.save().toObject();
            
        } catch (e) {
            console.log(e);
        }
    
    }
    
    public findAccount = async (accountId: String): Promise<void> => {
        
        try {
            return await AccountModel.findOne({account_id: accountId});
        } catch (e) {
            console.log(e);
        }
    
    }
    
    public updateAccount = async (accountId: String, accessToken: String, refreshToken: String, installedB: Boolean): Promise<void> => {
        
        const updateData: Account = {
            access_token: accessToken,
            refresh_token: refreshToken,
            installed: installedB,
        }
        
        try {
            return await AccountModel.findOneAndUpdate(
                { account_id: accountId }, 
                updateData, 
                { useFindAndModify: false });
        } catch (e) {
            console.log(e);
        }
        
    }
    
}

export default MongoDBAccountServices;