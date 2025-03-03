import { DIRECTIONS, VET } from "~Constants"
import { ActivityEvent, ActivityStatus, ActivitySupport, ActivityType } from "./enum"
import { Network, TypedData } from "~Model"
import { AddressUtils } from "~Utils"

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

    genesisId?: string // no
    status?: ActivityStatus // no
    clauses?: Connex.VM.Clause[] // no
    gasUsed?: number // no
    delegated?: boolean
    outputs?: OutputResponse[] // no
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
    type: ActivityType.FUNGIBLE_TOKEN | ActivityType.VET_TRANSFER
    direction: DIRECTIONS
}

/**
 * The NonFungibleTokenActivity interface represents a blockchain activity specifically for non-fungible token transactions.
 */
export interface NonFungibleTokenActivity extends Activity {
    tokenId: string
    contractAddress: string
    type: ActivityType.NFT_TRANSFER
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

/**
 * The DelegatedTransactionActivity interface represents a blockchain activity related to delegated transactions.
 */
export interface DelegatedTransactionActivity extends Activity {
    type: ActivityType.DELEGATED_TRANSACTION
}

export const createActivityFromIndexedHistoryEvent = (
    event: IndexedHistoryEvent,
    selectedAccountAddress: string,
    network: Network,
): Activity => {
    const {
        origin,
        to,
        id,
        txId,
        blockNumber,
        eventName,
        blockTimestamp,
        gasPayer,
        inputValue,
        outputValue,
        contractAddress,
        tokenId,
        value,
        inputToken,
        outputToken,
    } = event

    const isTransaction =
        eventName === ActivityEvent.TRANSFER_FT ||
        eventName === ActivityEvent.TRANSFER_VET ||
        eventName === ActivityEvent.TRANSFER_SF

    const baseActivity: Activity = {
        from: origin ?? "",
        to: to ? [to] : [],
        id: id,
        txId: txId,
        blockNumber: blockNumber,
        genesisId: network.genesis.id,
        isTransaction: isTransaction,
        type: eventName,
        timestamp: blockTimestamp * 1000,
        gasPayer: gasPayer,
        delegated: origin !== gasPayer,
    }

    const direction = AddressUtils.compareAddresses(origin, selectedAccountAddress) ? DIRECTIONS.UP : DIRECTIONS.DOWN

    switch (eventName) {
        case ActivityEvent.TRANSFER_SF:
        case ActivityEvent.TRANSFER_FT: {
            return {
                ...baseActivity,
                amount: value ?? "0x0",
                tokenAddress: contractAddress,
                direction: direction,
            } as FungibleTokenActivity
        }
        case ActivityEvent.TRANSFER_VET: {
            const amount = direction === DIRECTIONS.UP ? outputValue : inputValue

            return {
                ...baseActivity,
                amount: amount ?? "0x0",
                tokenAddress: VET.address,
                direction: direction,
            } as FungibleTokenActivity
        }
        case ActivityEvent.TRANSFER_NFT: {
            return {
                ...baseActivity,
                tokenId: tokenId,
                contractAddress: contractAddress,
                direction: direction,
            } as NonFungibleTokenActivity
        }
        case ActivityEvent.SWAP_FT_TO_VET: {
            return {
                ...baseActivity,
                outputToken: VET.address,
                inputToken: inputToken,
                inputValue: inputValue,
                outputValue: outputValue,
            } as SwapActivity
        }
        case ActivityEvent.SWAP_VET_TO_FT: {
            return {
                ...baseActivity,
                inputToken: inputToken,
                outputToken: VET.address,
                inputValue: inputValue,
                outputValue: outputValue,
            } as SwapActivity
        }
        case ActivityEvent.SWAP_FT_TO_FT: {
            return {
                ...baseActivity,
                inputToken: inputToken,
                outputToken: outputToken,
                inputValue: inputValue,
                outputValue: outputValue,
            } as SwapActivity
        }
        case ActivityEvent.UNKNOWN_TX:
        default: {
            return {
                ...baseActivity,
                type: ActivityType.DAPP_TRANSACTION,
                name: "",
                linkUrl: "",
            } as DappTxActivity
        }
    }
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
