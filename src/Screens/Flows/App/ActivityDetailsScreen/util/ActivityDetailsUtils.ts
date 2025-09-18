import { DIRECTIONS, ERROR_EVENTS } from "~Constants"
import { warn } from "~Utils"
import {
    Activity,
    ActivityType,
    B3trXAllocationVoteActivity,
    FungibleTokenActivity,
    NonFungibleTokenActivity,
} from "~Model"
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
            return LL.B3TR_XALLOCATION_VOTE({ number: parseInt((activity as B3trXAllocationVoteActivity).roundId, 10) })
        case ActivityType.B3TR_UPGRADE_GM:
            return LL.B3TR_UPGRADE_GM()
        case ActivityType.TRANSFER_NFT:
            return (activity as NonFungibleTokenActivity).direction === DIRECTIONS.UP ? LL.NFT_SEND() : LL.NFT_RECEIVE()
        case ActivityType.NFT_SALE:
            return (activity as NonFungibleTokenActivity).direction === DIRECTIONS.UP
                ? LL.NFT_SOLD()
                : LL.NFT_PURCHASED()
        case ActivityType.CONNECTED_APP_TRANSACTION:
            return LL.CONNECTED_APP_TITLE()
        case ActivityType.SIGN_TYPED_DATA:
            return LL.CONNECTED_APP_SIGN_TYPED_DATA()
        case ActivityType.STARGATE_CLAIM_REWARDS_BASE:
            return LL.ACTIVITY_STARGATE_CLAIM_REWARDS_BASE_LABEL()
        case ActivityType.STARGATE_CLAIM_REWARDS_DELEGATE:
            return LL.ACTIVITY_STARGATE_CLAIM_REWARDS_DELEGATE_LABEL()
        case ActivityType.STARGATE_DELEGATE:
            return LL.ACTIVITY_STARGATE_NODE_DELEGATE_LABEL()
        case ActivityType.STARGATE_DELEGATE_ONLY:
            return LL.ACTIVITY_STARGATE_NODE_DELEGATE_ONLY_LABEL()
        case ActivityType.STARGATE_UNDELEGATE:
            return LL.ACTIVITY_STARGATE_NODE_UNDELEGATE_LABEL()
        case ActivityType.STARGATE_STAKE:
            return LL.ACTIVITY_STARGATE_STAKE_LABEL()
        case ActivityType.STARGATE_UNSTAKE:
            return LL.ACTIVITY_STARGATE_UNSTAKE_LABEL()
        case ActivityType.UNKNOWN_TX:
            return LL.UNKNOWN_TX()
        default:
            warn(ERROR_EVENTS.ACTIVITIES, "Unknown activity type", activity.type)
    }
}

export const getActivityModalTitle = (activity: Activity, LL: TranslationFunctions) => {
    switch (activity.type) {
        case ActivityType.TRANSFER_FT:
        case ActivityType.TRANSFER_VET:
        case ActivityType.TRANSFER_SF:
        case ActivityType.SIGN_CERT:
        case ActivityType.SWAP_FT_TO_FT:
        case ActivityType.SWAP_FT_TO_VET:
        case ActivityType.SWAP_VET_TO_FT:
        case ActivityType.B3TR_SWAP_B3TR_TO_VOT3:
        case ActivityType.B3TR_SWAP_VOT3_TO_B3TR:
        case ActivityType.DAPP_TRANSACTION:
        case ActivityType.B3TR_CLAIM_REWARD:
        case ActivityType.B3TR_PROPOSAL_VOTE:
        case ActivityType.B3TR_XALLOCATION_VOTE:
        case ActivityType.B3TR_UPGRADE_GM:
        case ActivityType.TRANSFER_NFT:
        case ActivityType.CONNECTED_APP_TRANSACTION:
        case ActivityType.SIGN_TYPED_DATA:
        case ActivityType.STARGATE_CLAIM_REWARDS_BASE:
        case ActivityType.STARGATE_CLAIM_REWARDS_DELEGATE:
        case ActivityType.STARGATE_DELEGATE:
        case ActivityType.STARGATE_DELEGATE_ONLY:
        case ActivityType.STARGATE_UNDELEGATE:
        case ActivityType.STARGATE_STAKE:
        case ActivityType.STARGATE_UNSTAKE:
        case ActivityType.UNKNOWN_TX:
            return getActivityTitle(activity, LL)
        case ActivityType.B3TR_ACTION:
            return LL.B3TR_ACTION_MODAL_TITLE()
        default:
            warn(ERROR_EVENTS.ACTIVITIES, "Unknown activity type" + activity.type)
    }
}
