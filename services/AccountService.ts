import { AccountModel } from "../models/accountModel"
import { connectDB, disconnectDB } from "../DataBaseClientService";

const addAccount = async (account_id: String, domain: String, access_token: String, refresh_token: String, installed: Boolean) => {

    connectDB();
    
    const accountData = new AccountModel({
        account_id,
        domain,
        access_token,
        refresh_token,
        installed,
    });

    try {
        await accountData.save();
        
    } catch (e) {
        console.log(e);
    }

    disconnectDB();
}

const findAccont = async (accountId: String) => {

    connectDB();

    try {
        return AccountModel.findOne({account_id: accountId});
    } catch (e) {
        console.log(e);
    }

    disconnectDB();
}

const updateAccount = async (accountId: String, accessToken: String, refreshToken: String, installedB: Boolean) => {

    connectDB();

    const updateData = {
        access_token: accessToken,
        refresh_token: refreshToken,
        installed: installedB,
    }

    
    try {
        await AccountModel.findOneAndUpdate(
            { account_id: accountId }, 
            updateData, 
            { useFindAndModify: false });
    } catch (e) {
        console.log(e);
    }

    disconnectDB();

}

export {
    addAccount,
    findAccont,
    updateAccount,
}