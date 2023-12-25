import moment from "moment";
import { Customfield } from "./types/customField/customField";

const getTodayDateTime = ():string => moment().format("YYYY-MM-DD HH:MM:ss");

const getClearPhoneNumber = (tel:string | undefined) => {
	const clearNumber = !tel ? [] : tel.split("").filter(item => new RegExp(/\d/).test(item));
	if (!clearNumber.length) {
		return undefined;
	}
	return clearNumber.length > 10 ? clearNumber.join("").slice(1) : clearNumber.join("");
};

const getFieldValue = (customFields:Array<Customfield>, fieldId:number) => {
    const field = customFields
        ? customFields.find((item) => String(item.field_id || item.id) === String(fieldId))
        : undefined;
    const value = field ? field.values[0].value : undefined;
    return value;
};

const getFieldValues = (customFields:Array<Customfield>, fieldId:number) => {
    const field = customFields
        ? customFields.find((item) => String(item.field_id || item.id) === String(fieldId))
        : undefined;
    const values = field ? field.values : [];
    return values.map(item => item.value);
};

const makeField = (field_id:number, value?: string | number | boolean, enum_id?:number) => {
    if (!value) {
        return undefined;
    }
    return {
        field_id,
        values: [
            {
                value,
                enum_id
            },
        ],
    };
};

const getHuminizeTimeFromUnix = (unixTimeStamp: number) => {
    // Принимаем в секундах, моменту нужны миллисекунды
    const time = unixTimeStamp * 1000;
    return moment(time).format("YYYY-MM-DD HH:mm:ss.SSS")
};

const getUnixBithdate = (date:string) => {
    const unix = moment(date, "DD.MM.YYYY").utcOffset(0).unix();
    return unix;
};

const getDateUnixValue = (date:string) => {
    return moment(
        moment(date).utcOffset(3).format("DD.MM.YYYY HH:mm:ss"),
        "DD.MM.YYYY HH:mm:ss"
    ).unix();
};

const getUniqNumbers = (numbers:number[]):number[] => {
    const numberCollection = new Set();
    numbers.forEach((number) => numberCollection.add(number));
    const uniqNumbers = Array.from(numberCollection).map(Number);
    return uniqNumbers;
};

export {
	getClearPhoneNumber,
	getFieldValue,
	getFieldValues,
    makeField,
    getUnixBithdate,
    getDateUnixValue,
    getTodayDateTime,
    getUniqNumbers,
    getHuminizeTimeFromUnix
};
