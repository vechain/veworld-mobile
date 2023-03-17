import * as i18n from "~i18n"
const locale = i18n.detectLocale()
export const getAliasName = i18n.i18n()[locale].WALLET_LABEL_ACCOUNT()
