import { DIRECTIONS } from "~Constants"
import { TypedData } from "~Model"
import { ActivityEvent, ActivityStatus, ActivitySupport, ActivityType } from "./enum"

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
}

export interface IndexedHistoryEvent {
    id: string
    blockId: string
    blockNumber: number
    blockTimestamp: number
    txId: string
    origin?: string
    gasPayer?: string
    tokenId?: string
    contractAddress?: string
    eventName: ActivityEvent
    to?: string
    from?: string
    value?: string
    appId?: string
    proof?: string
    roundId?: string
    appVotes: {
        appId: string
        voteWeight: string
    }[]
    support?: ActivitySupport
    votePower?: string
    voteWeight?: string
    reason?: string
    proposalId?: string
    oldLevel?: string
    newLevel?: string
    inputToken?: string
    outputToken?: string
    inputValue?: string
    outputValue?: string
}
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
export interface B3trActionActivity extends Activity {
    type: ActivityType.B3TR_ACTION
    value: string
    appId: string
    proof: string
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
    proof: string
}

export interface TransferVetEvent extends IndexedHistoryEvent {
    eventName: ActivityEvent.TRANSFER_VET
    to: string
    from: string
}

export interface TransferNftEvent extends IndexedHistoryEvent {
    eventName: ActivityEvent.TRANSFER_NFT
    tokendId: string
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
