import { DIRECTIONS, ERROR_EVENTS } from "~Constants"
import { warn } from "~Utils"
import { Activity, ActivityType, FungibleTokenActivity, NonFungibleTokenActivity } from "~Model"
import { TranslationFunctions } from "~i18n"

export const getActivityTitle = (activity: Activity, LL: TranslationFunctions) => {
    switch (activity.type) {
        case ActivityType.TRANSFER_FT:
        case ActivityType.TRANSFER_VET:
        case ActivityType.TRANSFER_SF: {
            return (activity as FungibleTokenActivity).direction === DIRECTIONS.UP
                ? LL.BTN_SEND()
                : LL.RECEIVE_ACTIVITY()
        }
        case ActivityType.SIGN_CERT:
            return LL.SIGNED_CERTIFICATE()
        case ActivityType.SWAP_FT_TO_FT:
        case ActivityType.SWAP_FT_TO_VET:
        case ActivityType.SWAP_VET_TO_FT:
            return LL.SWAP()
        case ActivityType.B3TR_SWAP_B3TR_TO_VOT3:
        case ActivityType.B3TR_SWAP_VOT3_TO_B3TR:
            return LL.TOKEN_CONVERSION()
        case ActivityType.DAPP_TRANSACTION:
            return activity.isTransaction ? LL.DAPP_TRANSACTION() : LL.DAPP_CONNECTION()
        case ActivityType.B3TR_ACTION:
            return LL.B3TR_ACTION()
        case ActivityType.B3TR_CLAIM_REWARD:
            return LL.B3TR_CLAIM_REWARD()
        case ActivityType.B3TR_PROPOSAL_VOTE:
            return LL.B3TR_PROPOSAL_VOTE()
        case ActivityType.B3TR_XALLOCATION_VOTE:
            return LL.B3TR_XALLOCATION_VOTE()
        case ActivityType.B3TR_UPGRADE_GM:
            return LL.B3TR_UPGRADE_GM()
        case ActivityType.TRANSFER_NFT:
            return (activity as NonFungibleTokenActivity).direction === DIRECTIONS.UP ? LL.NFT_SEND() : LL.NFT_RECEIVE()
        case ActivityType.CONNECTED_APP_TRANSACTION:
            return LL.CONNECTED_APP_TITLE()
        case ActivityType.SIGN_TYPED_DATA:
            return LL.CONNECTED_APP_SIGN_TYPED_DATA()
        default:
            warn(ERROR_EVENTS.ACTIVITIES, "Unknown activity type")
    }
}
