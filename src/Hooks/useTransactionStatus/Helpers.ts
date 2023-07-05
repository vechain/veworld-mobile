import { TransactionOrigin } from "~Model"
import * as i18n from "~i18n"

export const getTranslation = (txOrigin: TransactionOrigin) => {
    const locale = i18n.detectLocale()

    switch (txOrigin) {
        case TransactionOrigin.FROM: {
            return [
                i18n.i18n()[locale].SUCCESS_GENERIC(),
                i18n.i18n()[locale].SUCCESS_GENERIC_OPERATION(),
                i18n.i18n()[locale].SUCCESS_GENERIC_VIEW_DETAIL_LINK(),
            ]
        }

        case TransactionOrigin.TO: {
            return [
                i18n.i18n()[locale].SUCCESS_GENERIC(),
                i18n.i18n()[locale].SUCCESS_GENERIC_OPERATION(),
                i18n.i18n()[locale].SUCCESS_GENERIC_VIEW_DETAIL_LINK(),
            ]
        }

        default: {
            return [
                i18n.i18n()[locale].SUCCESS_GENERIC(),
                i18n.i18n()[locale].SUCCESS_GENERIC_OPERATION(),
                i18n.i18n()[locale].SUCCESS_GENERIC_VIEW_DETAIL_LINK(),
            ]
        }
    }
}
