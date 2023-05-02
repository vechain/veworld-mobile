import { DIRECTIONS } from "~Common"
import { Activity, ActivityType, FungibleTokenActivity } from "~Model"
import { TranslationFunctions } from "~i18n"

export const getActivityTitle = (
    activity: Activity,
    LL: TranslationFunctions,
) => {
    switch (activity.type) {
        case ActivityType.FUNGIBLE_TOKEN:
        case ActivityType.VET_TRANSFER: {
            return (activity as FungibleTokenActivity).direction ===
                DIRECTIONS.UP
                ? LL.BTN_SEND()
                : LL.RECEIVE_ACTIVITY()
        }
        case ActivityType.SIGN_CERT:
            return LL.SIGNED_CERTIFICATE()
        case ActivityType.CONNECTED_APP_TRANSACTION:
            return LL.DAPP_TRANSACTION()
    }
}
