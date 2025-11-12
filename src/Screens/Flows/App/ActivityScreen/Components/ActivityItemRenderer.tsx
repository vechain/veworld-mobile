import React from "react"
import { useVeBetterDaoDapps } from "~Hooks"
import {
    Activity,
    ActivityType,
    B3trActionActivity,
    B3trClaimRewardActivity,
    B3trProposalSupportActivity,
    B3trProposalVoteActivity,
    B3trSwapB3trToVot3Activity,
    B3trSwapVot3ToB3trActivity,
    B3trUpgradeGmActivity,
    B3trXAllocationVoteActivity,
    ConnectedAppActivity,
    DappTxActivity,
    FungibleTokenActivity,
    LoginActivity,
    NFTMarketplaceActivity,
    NonFungibleTokenActivity,
    SignCertActivity,
    StargateActivity,
    SwapActivity,
    TypedDataActivity,
    UnknownTxActivity,
    VeVoteCastActivity,
} from "~Model"
import { ActivityBox, OverridableActivityBoxProps } from "./ActivityBox"

export const ActivityItemRenderer = ({ activity, onPress, ...props }: OverridableActivityBoxProps<Activity>) => {
    const { data: veBetterDaoDapps } = useVeBetterDaoDapps()

    switch (activity.type) {
        case ActivityType.TRANSFER_FT:
        case ActivityType.TRANSFER_VET: {
            return (
                <ActivityBox.TokenTransfer
                    key={activity.id}
                    activity={activity as FungibleTokenActivity}
                    onPress={onPress}
                    {...props}
                />
            )
        }
        case ActivityType.TRANSFER_NFT:
            return (
                <ActivityBox.NFTTransfer
                    key={activity.id}
                    activity={activity as NonFungibleTokenActivity}
                    onPress={onPress}
                    {...props}
                />
            )
        case ActivityType.NFT_SALE:
            return (
                <ActivityBox.NFTSale
                    key={activity.id}
                    activity={activity as NFTMarketplaceActivity}
                    onPress={onPress}
                    {...props}
                />
            )
        case ActivityType.SWAP_FT_TO_FT:
        case ActivityType.SWAP_FT_TO_VET:
        case ActivityType.SWAP_VET_TO_FT:
            return <ActivityBox.TokenSwap activity={activity as SwapActivity} onPress={onPress} {...props} />
        case ActivityType.DAPP_TRANSACTION: {
            return (
                <ActivityBox.DAppTransaction
                    key={activity.id}
                    activity={activity as DappTxActivity}
                    onPress={onPress}
                    {...props}
                />
            )
        }
        case ActivityType.SIGN_CERT:
            return (
                <ActivityBox.DAppSignCert
                    key={activity.id}
                    activity={activity as SignCertActivity}
                    onPress={onPress}
                    {...props}
                />
            )
        case ActivityType.CONNECTED_APP_TRANSACTION:
            return (
                <ActivityBox.ConnectedAppActivity
                    key={activity.id}
                    activity={activity as ConnectedAppActivity}
                    onPress={onPress}
                    {...props}
                />
            )
        case ActivityType.SIGN_TYPED_DATA:
            return (
                <ActivityBox.SignedTypedData
                    key={activity.id}
                    activity={activity as TypedDataActivity}
                    onPress={onPress}
                    {...props}
                />
            )
        case ActivityType.B3TR_ACTION:
            return (
                <ActivityBox.B3trAction
                    activity={activity as B3trActionActivity}
                    onPress={onPress}
                    {...props}
                    veBetterDaoDapps={veBetterDaoDapps ?? []}
                />
            )
        case ActivityType.B3TR_PROPOSAL_VOTE:
            return (
                <ActivityBox.B3trProposalVote
                    activity={activity as B3trProposalVoteActivity}
                    onPress={onPress}
                    {...props}
                />
            )
        case ActivityType.B3TR_XALLOCATION_VOTE:
            return (
                <ActivityBox.B3trXAllocationVote
                    activity={activity as B3trXAllocationVoteActivity}
                    onPress={onPress}
                    {...props}
                />
            )
        case ActivityType.B3TR_CLAIM_REWARD:
            return (
                <ActivityBox.B3trClaimReward
                    activity={activity as B3trClaimRewardActivity}
                    onPress={onPress}
                    {...props}
                />
            )
        case ActivityType.B3TR_UPGRADE_GM:
            return (
                <ActivityBox.B3trUpgradeGM activity={activity as B3trUpgradeGmActivity} onPress={onPress} {...props} />
            )
        case ActivityType.B3TR_SWAP_B3TR_TO_VOT3:
            return (
                <ActivityBox.B3trSwapB3trToVot3
                    activity={activity as B3trSwapB3trToVot3Activity}
                    onPress={onPress}
                    {...props}
                />
            )
        case ActivityType.B3TR_SWAP_VOT3_TO_B3TR:
            return (
                <ActivityBox.B3trSwapVot3ToB3tr
                    activity={activity as B3trSwapVot3ToB3trActivity}
                    onPress={onPress}
                    {...props}
                />
            )
        case ActivityType.B3TR_PROPOSAL_SUPPORT:
            return (
                <ActivityBox.B3trProposalSupport
                    activity={activity as B3trProposalSupportActivity}
                    onPress={onPress}
                    {...props}
                />
            )
        case ActivityType.UNKNOWN_TX:
            return <ActivityBox.UnknownTx activity={activity as UnknownTxActivity} onPress={onPress} {...props} />
        case ActivityType.STARGATE_DELEGATE_LEGACY:
        case ActivityType.STARGATE_STAKE:
        case ActivityType.STARGATE_CLAIM_REWARDS_BASE_LEGACY:
        case ActivityType.STARGATE_CLAIM_REWARDS_DELEGATE_LEGACY:
        case ActivityType.STARGATE_CLAIM_REWARDS:
        case ActivityType.STARGATE_BOOST:
        case ActivityType.STARGATE_DELEGATE_REQUEST:
        case ActivityType.STARGATE_DELEGATE_REQUEST_CANCELLED:
        case ActivityType.STARGATE_DELEGATE_EXIT_REQUEST:
        case ActivityType.STARGATE_DELEGATION_EXITED:
        case ActivityType.STARGATE_DELEGATION_EXITED_VALIDATOR:
        case ActivityType.STARGATE_DELEGATE_ACTIVE:
        case ActivityType.STARGATE_MANAGER_ADDED:
        case ActivityType.STARGATE_MANAGER_REMOVED:
        case ActivityType.STARGATE_UNDELEGATE_LEGACY:
        case ActivityType.STARGATE_UNSTAKE:
            return <ActivityBox.Staking activity={activity as StargateActivity} onPress={onPress} {...props} />
        case ActivityType.VEVOTE_VOTE_CAST:
            return <ActivityBox.VeVoteCast activity={activity as VeVoteCastActivity} onPress={onPress} {...props} />
        case ActivityType.DAPP_LOGIN:
            return <ActivityBox.DappLogin activity={activity as LoginActivity} onPress={onPress} {...props} />
        default:
            return null
    }
}
