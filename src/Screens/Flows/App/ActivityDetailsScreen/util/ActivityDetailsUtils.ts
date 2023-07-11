import { DIRECTIONS } from "~Constants"
import { warn } from "~Utils"
import {
    Activity,
    ActivityType,
    FungibleTokenActivity,
    NonFungibleTokenActivity,
} from "~Model"
import { TranslationFunctions } from "~i18n"

export const getActivityTitle = (
    activity: Activity,
    LL: TranslationFunctions,
    isSwap?: boolean,
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
            return isSwap ? LL.SWAP() : LL.DAPP_TRANSACTION()
        case ActivityType.NFT_TRANSFER:
            return (activity as NonFungibleTokenActivity).direction ===
                DIRECTIONS.UP
                ? LL.NFT_SEND()
                : LL.NFT_RECEIVE()
        default:
            warn("Unknown activity type")
    }
}
