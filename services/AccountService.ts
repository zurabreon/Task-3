import { AccountModel } from "../models/accountModel"
import Account from "../types/account/accountFields";

class MongoDBAccountServices {

    public addAccount = async (accData: Account): Promise<Account | undefined> => {
            

        const accountData = new AccountModel({
            account_id: accData.account_id,
            domain: accData.domain,
            access_token: accData.access_token,
            refresh_token: accData.refresh_token,
            installed: accData.installed,
        });
    
        try {
            return await accountData.save();
            
        } catch (e) {
            console.log(e);
        }
    
    }
    
    public findAccount = async (accountId: string): Promise<Account> => {

        return await AccountModel.findOne({account_id: accountId});
        
    }
    
    public updateAccount = async (accountData: Account): Promise<Account> => {
        
        const currentAccount = await this.findAccount(accountData.account_id);

        if(currentAccount) {

            return await AccountModel.updateOne(
                {account_id: accountData.account_id},
                {$set: {
                    access_token: accountData.access_token,
                    refresh_token: accountData.refresh_token,
                    installed: accountData.installed
                }},
                {new: true}
            );

        } throw new Error(`Account with id '${accountData.account_id}' not found`);  
    }
    
}

export default MongoDBAccountServices;