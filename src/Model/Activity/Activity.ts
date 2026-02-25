import { AnalyticsEvent, DIRECTIONS } from "~Constants"
import { TypedData, TypedDataMessage } from "~Model"
import { ActivityEvent, ActivityStatus, ActivitySupport, ActivityType } from "./enum"
import { TokenLevelId } from "~Utils/StargateUtils"
import { paths } from "~Generated/indexer/schema"

export type OutputResponse = {
    contractAddress: string
    events: Connex.VM.Event[]
    transfers: Connex.VM.Transfer[]
}

/**
 * The Activity interface represents a blockchain activity with necessary transaction metadata.
 */
export interface Activity {
    id: string
    blockNumber?: number
    timestamp: number
    txId?: string
    gasPayer?: string
    type: ActivityType | ActivityEvent
    to?: string[]
    from: string
    isTransaction: boolean
    genesisId?: string
    status?: ActivityStatus
    clauses?: Connex.VM.Clause[]
    gasUsed?: number
    delegated?: boolean
    outputs?: OutputResponse[]
    levelId?: TokenLevelId

    //Metadata needed for event tracking
    medium?: AnalyticsEvent.DAPP | AnalyticsEvent.SEND
    signature?: AnalyticsEvent.LOCAL | AnalyticsEvent.HARDWARE
    context?: AnalyticsEvent.IN_APP | AnalyticsEvent.WALLET_CONNECT | AnalyticsEvent.SEND
    dappUrlOrName?: string
    subject?: AnalyticsEvent.NATIVE_TOKEN | AnalyticsEvent.TOKEN | AnalyticsEvent.NFT
    smartWalletAddress?: string
}

export type IndexedHistoryEvent =
    paths["/api/v2/history/{account}"]["get"]["responses"]["200"]["content"]["*/*"]["data"][number]
export interface NonTransactionalActivity {
    type: ActivityType.CONNECTED_APP_TRANSACTION | ActivityType.SIGN_CERT
    timestamp: number
}

/**
 * The FungibleTokenActivity interface represents a blockchain activity specifically for fungible token transactions.
 */
export interface FungibleTokenActivity extends Activity {
    amount: string | number
    tokenAddress: string
    type: ActivityType.TRANSFER_FT | ActivityType.TRANSFER_VET
    direction: DIRECTIONS
}

/**
 * The NonFungibleTokenActivity interface represents a blockchain activity specifically for non-fungible token transactions.
 */
export interface NonFungibleTokenActivity extends Activity {
    tokenId: string
    contractAddress: string
    type: ActivityType.TRANSFER_NFT
    direction: DIRECTIONS
}

export interface NFTMarketplaceActivity extends Activity {
    tokenId: string
    contractAddress: string
    type: ActivityType.NFT_SALE
    direction: DIRECTIONS
    price: string
    tokenAddress?: string
    buyer: string
    seller: string
}

export interface SwapActivity extends Activity {
    eventName: ActivityEvent.SWAP_FT_TO_FT
    to: string[]
    from: string
    inputToken: string
    outputToken: string
    inputValue: string
    outputValue: string
}

/**
 * The DappTxActivity interface represents a blockchain activity and is a transaction on-chain.
 */
export interface DappTxActivity extends Activity {
    type: ActivityType.DAPP_TRANSACTION
    name?: string
    linkUrl?: string
}

/**
 * The ConnectedAppActivity interface represents a blockchain activity related to transactions from connected applications.
 */
export interface ConnectedAppActivity extends Activity {
    type: ActivityType.CONNECTED_APP_TRANSACTION
    name?: string
    linkUrl?: string
    description?: string
    methods?: string[]
}

/**
 * The SignCertActivity interface represents a blockchain activity related to certificate signings.
 */
export interface SignCertActivity extends Activity {
    type: ActivityType.SIGN_CERT
    name?: string
    content?: string
    purpose?: string
    linkUrl?: string
}

/**
 * The SignTypedDataActivity interface represents a blockchain activity related to typed data signings.
 */
export interface TypedDataActivity extends Activity {
    type: ActivityType.SIGN_TYPED_DATA
    typedData: TypedData
    sender: string
}

/**
 * Type for describing the activity value
 */
export type LoginActivityValue =
    | { kind: "simple"; value: null }
    | { kind: "certificate"; value: Connex.Vendor.CertMessage }
    | {
          kind: "typed-data"
          value: TypedDataMessage
      }

/**
 * The LoginActivity type represents a dapp login from the in app browser.
 */
export type LoginActivity = Activity & {
    type: ActivityType.DAPP_LOGIN
    linkUrl: string
} & LoginActivityValue

export interface B3trActionActivity extends Activity {
    type: ActivityType.B3TR_ACTION
    value: string
    appId: string
}

export interface B3trProposalVoteActivity extends Activity {
    type: ActivityType.B3TR_PROPOSAL_VOTE
    support: ActivitySupport
    votePower: string
    voteWeight: string
    prposalId: string
}

export interface B3trXAllocationVoteActivity extends Activity {
    eventName: ActivityEvent.B3TR_XALLOCATION_VOTE
    roundId: string
    appVotes: {
        appId: string
        voteWeight: string
    }[]
}
export interface B3trUpgradeGmActivity extends Activity {
    eventName: ActivityEvent.B3TR_XALLOCATION_VOTE
    oldLevel: string
    newLevel: string
}

export interface B3trClaimRewardActivity extends Activity {
    type: ActivityType.B3TR_CLAIM_REWARD
    value: string
    roundId: string
}

export interface B3trSwapB3trToVot3Activity extends Activity {
    eventName: ActivityEvent.B3TR_SWAP_B3TR_TO_VOT3
    value: string
}
export interface B3trSwapVot3ToB3trActivity extends Activity {
    eventName: ActivityEvent.B3TR_SWAP_VOT3_TO_B3TR
    value: string
}
export interface B3trProposalSupportActivity extends Activity {
    eventName: ActivityEvent.B3TR_PROPOSAL_SUPPORT
    value: string
    proposalId: string
}

export interface UnknownTxActivity extends Activity {
    eventName: ActivityEvent.UNKNOWN_TX
}

export interface UknownTxEvent extends IndexedHistoryEvent {
    eventName: ActivityEvent.UNKNOWN_TX
}

export interface TransferFtEvent extends IndexedHistoryEvent {
    eventName: ActivityEvent.TRANSFER_FT
    to: string
    from: string
    value: string
}

export interface B3trActionEvent extends IndexedHistoryEvent {
    eventName: ActivityEvent.B3TR_ACTION
    to: string
    from: string
    value: string
    appId: string
}

export interface TransferVetEvent extends IndexedHistoryEvent {
    eventName: ActivityEvent.TRANSFER_VET
    to: string
    from: string
}

export interface TransferNftEvent extends IndexedHistoryEvent {
    eventName: ActivityEvent.TRANSFER_NFT | ActivityEvent.NFT_SALE
    tokenId: string
    to: string
    from: string
}

export interface B3trSwapVot3ToB3trEvent extends IndexedHistoryEvent {
    eventName: ActivityEvent.B3TR_SWAP_VOT3_TO_B3TR
    to: string
    from: string
    value: string
}

export interface B3trSwapB3trToVot3Event extends IndexedHistoryEvent {
    eventName: ActivityEvent.B3TR_SWAP_B3TR_TO_VOT3
    to: string
    from: string
    value: string
}

export interface SwapFtToVetEvent extends IndexedHistoryEvent {
    eventName: ActivityEvent.SWAP_FT_TO_VET
    to: string
    from: string
    inputToken: string
    inputValue: string
    outputValue: string
}

export interface SwapVetToFtEvent extends IndexedHistoryEvent {
    eventName: ActivityEvent.SWAP_VET_TO_FT
    to: string
    from: string
    outputToken: string
    inputValue: string
    outputValue: string
}

export interface SwapFtToFtEvent extends IndexedHistoryEvent {
    eventName: ActivityEvent.SWAP_FT_TO_FT
    to: string
    from: string
    inputToken: string
    outputToken: string
    inputValue: string
    outputValue: string
}

export interface TransferSfEvent extends IndexedHistoryEvent {
    tokenId: string
    eventName: ActivityEvent.TRANSFER_SF
    to: string
    from: string
    value: string
}

export interface B3trXAllocationVote extends IndexedHistoryEvent {
    eventName: ActivityEvent.B3TR_XALLOCATION_VOTE
    from: string
    roundId: string
    appVotes: {
        appId: string
        voteWeight: string
    }[]
}

export interface B3trProposalVoteEvent extends IndexedHistoryEvent {
    eventName: ActivityEvent.B3TR_PROPOSAL_VOTE
    from: string
    support: ActivitySupport
    votePower: string
    voteWeight: string
    prposalId: string
}

export interface B3trClaimRewardEvent extends IndexedHistoryEvent {
    eventName: ActivityEvent.B3TR_CLAIM_REWARD
    to: string
    from: string
    value: string
    roundId: string
}

export interface B3trUpgradeGmEvent extends IndexedHistoryEvent {
    eventName: ActivityEvent.B3TR_UPGRADE_GM
    oldLevel: string
    newLevel: string
}

export interface B3trProposalSupportEvent extends IndexedHistoryEvent {
    eventName: ActivityEvent.B3TR_PROPOSAL_SUPPORT
    to: string
    from: string
    value: string
    proposalId: string
}

export interface B3trProposalSupportEvent extends IndexedHistoryEvent {
    eventName: ActivityEvent.B3TR_PROPOSAL_SUPPORT
    to: string
    from: string
    value: string
    proposalId: string
}

export interface StargateActivity extends Activity {
    eventName:
        | ActivityEvent.STARGATE_BOOST
        | ActivityEvent.STARGATE_DELEGATE_LEGACY
        | ActivityEvent.STARGATE_DELEGATE_REQUEST
        | ActivityEvent.STARGATE_DELEGATE_EXIT_REQUEST
        | ActivityEvent.STARGATE_DELEGATE_REQUEST_CANCELLED
        | ActivityEvent.STARGATE_DELEGATION_EXITED
        | ActivityEvent.STARGATE_DELEGATION_EXITED_VALIDATOR
        | ActivityEvent.STARGATE_DELEGATE_ACTIVE
        | ActivityEvent.STARGATE_MANAGER_ADDED
        | ActivityEvent.STARGATE_MANAGER_REMOVED
        | ActivityEvent.STARGATE_UNDELEGATE_LEGACY
        | ActivityEvent.STARGATE_STAKE
        | ActivityEvent.STARGATE_UNSTAKE
        | ActivityEvent.STARGATE_CLAIM_REWARDS
        | ActivityEvent.STARGATE_CLAIM_REWARDS_BASE_LEGACY
        | ActivityEvent.STARGATE_CLAIM_REWARDS_DELEGATE_LEGACY
    value: string
    tokenId?: string
    levelId?: TokenLevelId
    owner?: string
    vetGeneratedVthoRewards?: string
    delegationRewards?: string
    migrated?: boolean
    autorenew?: boolean
    validator?: string
    delegationId?: string
}

export interface VeVoteCastActivity extends Activity {
    eventName: ActivityEvent.VEVOTE_VOTE_CAST
    proposalId: string
}
