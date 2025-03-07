import uuid from "react-native-uuid"
import { Transaction } from "thor-devkit"
import { chainTagToGenesisId, DIRECTIONS, ERROR_EVENTS, VET } from "~Constants"
import {
    Activity,
    ActivityEvent,
    ActivityStatus,
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
    IndexedHistoryEvent,
    Network,
    NonFungibleTokenActivity,
    SignCertActivity,
    SwapActivity,
    TypedData,
    TypedDataActivity,
} from "~Model"
import { EventTypeResponse } from "~Networking"
import { ActivityUtils, AddressUtils, debug, TransactionUtils } from "~Utils"

/**
 * Creates a base activity from a given transaction.
 *
 * The function extracts necessary details from the transaction such as its id, origin, delegated status, delegator, body and more.
 * It also determines the activity type based on the transaction's clauses.
 *
 * @param tx - The transaction from which to create the base activity.
 * @returns A new activity object based on the given transaction.
 */
const createBaseActivityFromTx = (tx: Transaction) => {
    const { id, origin, delegated, delegator, body } = tx
    const { clauses, gas, chainTag } = body
    const type = ActivityUtils.getActivityTypeFromClause(clauses)

    return {
        from: origin ?? "",
        to: clauses.map((clause: Transaction.Clause) => ActivityUtils.getDestinationAddressFromClause(clause) ?? ""),
        id: id ?? "",
        txId: id ?? "",
        genesisId: chainTagToGenesisId[chainTag],
        gasUsed: Number(gas),
        clauses,
        delegated,
        status: ActivityStatus.PENDING,
        isTransaction: true,
        timestamp: Date.now(),
        gasPayer: (delegated ? delegator : origin) ?? "",
        blockNumber: 0,
        type,
        direction: DIRECTIONS.UP,
        outputs: [],
    }
}

/**
 * A helper function to handle exceptions regarding the address extraction.
 */
const getAddressFromClause = (clause: Transaction.Clause) => {
    const address = TransactionUtils.getContractAddressFromClause(clause)
    if (!address) throw new Error("Invalid address")
    return address
}

/**
 * Creates a new pending FungibleTokenActivity from a given transaction.
 *
 * The transaction clauses are analyzed to determine the activity type (TRANSFER_VET or TRANSFER_FT).
 * In case the transaction type is different, an error is thrown.
 *
 * The method also extracts the token address and amount from the first transaction clause.
 * Errors are thrown if these values cannot be extracted.
 *
 * @param tx - The transaction from which to create the activity.
 * @returns A new FungibleTokenActivity object based on the given transaction.
 * @throws {Error} If the transaction type is neither TRANSFER_VET nor TRANSFER_FT.
 * @throws {Error} If the token address cannot be extracted from the transaction.
 * @throws {Error} If the amount cannot be extracted from the transaction.
 */
export const createPendingTransferActivityFromTx = (tx: Transaction): FungibleTokenActivity => {
    const baseActivity = createBaseActivityFromTx(tx)

    if (baseActivity.type !== ActivityType.TRANSFER_VET && baseActivity.type !== ActivityType.TRANSFER_FT)
        throw new Error("Invalid transaction type")

    const tokenAddress = getAddressFromClause(baseActivity.clauses[0])

    const amount = TransactionUtils.getAmountFromClause(baseActivity.clauses[0])

    if (!amount) throw new Error("Invalid amount")

    return {
        ...baseActivity,
        type: baseActivity.type,
        amount,
        tokenAddress,
    }
}

/**
 * Creates a new pending Non-Fungible Token (NFT) activity from a given transaction.
 *
 * The function creates a base activity from the transaction and then checks the activity type. If the type is not 'TRANSFER_NFT',
 * an error is thrown. It also extracts the contract address and the decoded NFT token id from the first transaction clause.
 *
 * @param tx - The transaction from which to create the NFT activity.
 * @returns A new NonFungibleTokenActivity object based on the given transaction.
 * @throws {Error} If the transaction type is not 'TRANSFER_NFT'.
 * @throws {Error} If the contract address cannot be extracted from the transaction.
 * @throws {Error} If the NFT token Id cannot be decoded from the transaction clause.
 */
export const createPendingNFTTransferActivityFromTx = (tx: Transaction): NonFungibleTokenActivity => {
    const baseActivity = createBaseActivityFromTx(tx)

    if (baseActivity.type !== ActivityType.TRANSFER_NFT) throw new Error("Invalid transaction type")

    const contractAddress = getAddressFromClause(baseActivity.clauses[0])

    const decodedTransfer = TransactionUtils.decodeNonFungibleTokenTransferClause(baseActivity.clauses[0])

    if (!decodedTransfer?.tokenId) throw new Error("Invalid tokenId")

    return {
        ...baseActivity,
        type: baseActivity.type,
        tokenId: decodedTransfer.tokenId,
        contractAddress,
    }
}

/**
 * Creates a new incoming FungibleTokenActivity.
 *
 * @param txID - The id of the transaction that created the activity.
 * @param blockNumber - The block number of the transaction that created the activity.
 * @param blockTimestamp - The block timestamp of the transaction that created the activity.
 * @param amount - The amount of tokens involved in the transaction.
 * @param recipient - The address of the recipient of the tokens.
 * @param sender - The address of the sender of the tokens.
 * @param tokenAddress - The address of the token contract.
 * @param thor - The Connex.Thor instance used for querying the chain.
 *
 * @returns A new FungibleTokenActivity object based on the given parameters.
 * @throws {Error} If an encoded clause cannot be created from the incoming transfer log.
 */
export const createIncomingTransfer = (
    txID: string,
    blockNumber: number,
    blockTimestamp: number,
    amount: string,
    recipient: string,
    sender: string,
    tokenAddress: string,
    thor: Connex.Thor,
): FungibleTokenActivity => {
    const activityType = tokenAddress === VET.address ? ActivityType.TRANSFER_VET : ActivityType.TRANSFER_FT

    const encodedClause = createTransferClauseFromIncomingTransfer(recipient, amount, tokenAddress, activityType)

    if (!encodedClause) {
        throw new Error("Invalid encoded clause. Can't create incoming transfer activity from TransferLog")
    }

    const clauses: Connex.VM.Clause[] = [encodedClause]

    return {
        from: sender,
        to: [recipient],
        id: txID,
        txId: txID,
        blockNumber,
        isTransaction: true,
        genesisId: thor.genesis.id,
        type: activityType,
        timestamp: blockTimestamp * 1000, // Convert to milliseconds
        status: ActivityStatus.SUCCESS,
        clauses,
        direction: DIRECTIONS.DOWN,
        amount: Number(amount),
        tokenAddress: tokenAddress,
    }
}

/**
 * This function creates a new connected app activity object.
 *
 * @param from - The origin of the activity.
 * @param name - The name of the connected application (optional).
 * @param linkUrl - The URL of the connected application (optional).
 * @param description - The description of the connected application (optional).
 * @param methods - The methods used by the connected application (optional).
 *
 * @returns A new connected app activity object.
 */
export const createConnectedAppActivity = (
    network: Network,
    from: string,
    name?: string,
    linkUrl?: string,
    description?: string,
    methods?: string[],
): ConnectedAppActivity => {
    return {
        from,
        id: uuid.v4().toString(),
        type: ActivityType.CONNECTED_APP_TRANSACTION,
        timestamp: Date.now(),
        isTransaction: false,
        name,
        linkUrl,
        description,
        methods,
        genesisId: network.genesis.id,
    }
}

/**
 * This function creates a new sign certificate activity object.
 *
 * @param from - The origin of the activity.
 * @param name - The name of the certificate (optional).
 * @param linkUrl - The URL of the certificate (optional).
 * @param content - The content of the certificate (optional).
 * @param purpose - The purpose of the certificate (optional).
 * @returns A new sign certificate activity object.
 */
export const createSignCertificateActivity = (
    network: Network,
    from: string,
    name?: string,
    linkUrl?: string,
    content?: string,
    purpose?: string,
): SignCertActivity => {
    return {
        from,
        id: uuid.v4().toString(),
        type: ActivityType.SIGN_CERT,
        timestamp: Date.now(),
        isTransaction: false,
        name,
        linkUrl,
        content,
        purpose,
        genesisId: network.genesis.id,
    }
}

/**
 * This function creates a new sign typed data activity object.
 *
 * @param from - The origin of the activity.
 * @param sender - The sender of the activity
 * @param content - The typed data
 * @returns A new sign typed data activity object.
 */
export const createSingTypedDataActivity = (
    network: Network,
    from: string,
    sender: string,
    content: TypedData,
): TypedDataActivity => {
    return {
        from,
        id: uuid.v4().toString(),
        type: ActivityType.SIGN_TYPED_DATA,
        timestamp: Date.now(),
        isTransaction: false,
        typedData: content,
        sender,
        clauses: [],
        genesisId: network.genesis.id,
    }
}

/**
 * This function creates a new pending DApp transaction activity object.
 *
 * @param tx - The transaction details.
 * @param name - The name of the DApp (optional).
 * @param linkUrl - The URL of the DApp (optional).
 *
 * @returns A new pending DApp transaction activity object.
 */
export const createPendingDappTransactionActivity = (tx: Transaction, name?: string, linkUrl?: string): Activity => {
    const baseActivity = createBaseActivityFromTx(tx)

    return processActivity(baseActivity, tx.body.clauses[0], DIRECTIONS.UP, name, linkUrl)
}

/**
 * Creates a transfer clause from an incoming transfer.
 *
 * @param to - The recipient's address.
 * @param value - The number of tokens to transfer.
 * @param tokenAddress - The contract address of the token.
 * @param type - The type of activity, either a TRANSFER_VET or a TRANSFER_FT transfer.
 *
 * @returns A Connex.VM.Clause object for a transfer, or undefined if the activity type does not match known types.
 */
export const createTransferClauseFromIncomingTransfer = (
    to: string,
    value: string,
    contractAddress: string,
    type: ActivityType,
    from?: string,
    tokenId?: number,
): Connex.VM.Clause | undefined => {
    if (type === ActivityType.TRANSFER_VET) {
        return TransactionUtils.encodeTransferFungibleTokenClause(to, value, VET.address)
    }

    if (type === ActivityType.TRANSFER_FT) {
        return TransactionUtils.encodeTransferFungibleTokenClause(to, value, contractAddress)
    }

    if (type === ActivityType.TRANSFER_NFT && from && tokenId) {
        return TransactionUtils.encodeTransferNonFungibleTokenClause(from, to, contractAddress, tokenId)
    }
}

/**
 * Maps the incoming EventTypeResponse to the corresponding ActivityType.
 *
 * @param eventType - The type of event.
 *
 * @returns The corresponding ActivityType, or undefined if the eventType does not map to any known ActivityType.
 */
export const eventTypeToActivityType = (eventType: EventTypeResponse): ActivityType | undefined => {
    switch (eventType) {
        case EventTypeResponse.VET:
            return ActivityType.TRANSFER_VET

        case EventTypeResponse.FUNGIBLE_TOKEN:
            return ActivityType.TRANSFER_FT

        case EventTypeResponse.NFT:
            return ActivityType.TRANSFER_NFT

        default:
            debug(ERROR_EVENTS.ACTIVITIES, "Received not yet supported incoming transfer event type: ", eventType)
    }
}

/**
 * Function to create a FungibleTokenActivity.
 * This type of activity involves the transfer of a fungible token from one address to another.
 * @param activity - Base activity to be enriched with fungible token data.
 * @param tokenAddress - The address of the token contract.
 * @param amount - The amount of tokens being transferred.
 * @returns A FungibleTokenActivity enriched with token data.
 */
export const createFungibleTokenActivity = (
    activity: FungibleTokenActivity,
    tokenAddress: string,
    amount: number,
    direction: DIRECTIONS,
): FungibleTokenActivity => {
    return {
        ...activity,
        amount,
        tokenAddress,
        direction,
    }
}

/**
 * Function to create a NonFungibleTokenActivity.
 * This type of activity involves the transfer of a non-fungible token from one address to another.
 * @param activity - Base activity to be enriched with non-fungible token data.
 * @param contractAddress - The address of the token contract.
 * @param tokenId - The id of the token being transferred.
 * @param direction - The direction of the transfer.
 * @returns  A NonFungibleTokenActivity enriched with token data.
 */
export const createNonFungibleTokenActivity = (
    activity: NonFungibleTokenActivity,
    contractAddress: string,
    tokenId: string,
    direction: DIRECTIONS,
): NonFungibleTokenActivity => {
    return {
        ...activity,
        contractAddress,
        tokenId,
        direction,
    }
}

/**
 * Function to enrich an activity with token data.
 * If the activity involves a fungible token transfer, this function decodes the token transfer clause and adds the token data to the activity.
 * @param activity - The activity to be enriched with token data.
 * @param clause - The transaction clause from which to decode the token data.
 * @returns A FungibleTokenActivity enriched with token data.
 */
export const enrichActivityWithTokenData = (
    activity: Activity,
    clause: Connex.VM.Clause,
    direction: DIRECTIONS,
): FungibleTokenActivity => {
    // Decode token transfer clause
    const tokenData = TransactionUtils.decodeTokenTransferClause(clause)
    // Create fungible token activity with token data
    return createFungibleTokenActivity(
        activity as FungibleTokenActivity,
        clause.to ?? "",
        Number(tokenData?.amount),
        direction,
    )
}

/**
 * Function to enrich an activity with VET transfer data.
 * If the activity involves a VET transfer, this function adds the VET transfer data to the activity.
 * @param activity - The activity to be enriched with VET transfer data.
 * @param clause - The transaction clause containing the VET transfer data.
 * @returns A FungibleTokenActivity enriched with VET transfer data.
 */
export const enrichActivityWithVetTransfer = (
    activity: Activity,
    clause: Connex.VM.Clause,
    direction: DIRECTIONS,
): FungibleTokenActivity => {
    return createFungibleTokenActivity(activity as FungibleTokenActivity, VET.address, Number(clause.value), direction)
}

/**
 * Function to enrich an activity with NFT data.
 * If the activity involves a non-fungible token transfer, this function decodes the token transfer clause and adds the token data to the activity.
 * @param activity - The activity to be enriched with NFT data.
 * @param clause - The transaction clause from which to decode the NFT data.
 * @param direction - The direction of the transfer.
 * @returns A NonFungibleTokenActivity enriched with NFT data.
 */
export const enrichActivityWithNFTData = (
    activity: Activity,
    clause: Connex.VM.Clause,
    direction: DIRECTIONS,
): NonFungibleTokenActivity => {
    // Decode NFT transfer clause
    const nftData = TransactionUtils.decodeNonFungibleTokenTransferClause(clause)

    if (!nftData) {
        debug(ERROR_EVENTS.ACTIVITIES, "Unable to decode NFT transfer clause", clause)
        return activity as NonFungibleTokenActivity
    }

    // Create non fungible token activity with NFT data
    return createNonFungibleTokenActivity(
        activity as NonFungibleTokenActivity,
        clause.to ?? "",
        nftData?.tokenId,
        direction,
    )
}

/**
 * This function enriches an existing activity object with DApp data.
 *
 * @param activity - The activity to be enriched.
 * @param appName - The name of the DApp (optional).
 * @param appUrl - The URL of the DApp (optional).
 * @returns A new activity object enriched with DApp data.
 */
export const enrichActivityWithDappData = (activity: Activity, appName?: string, appUrl?: string): DappTxActivity => {
    return {
        ...activity,
        type: ActivityType.DAPP_TRANSACTION,
        name: appName ?? "",
        linkUrl: appUrl ?? "",
    }
}

/**
 * Process an activity based on its type.
 *
 * @param activity - The activity to be processed.
 * @param clause - The transaction clause from which to decode the data.
 * @param direction - The direction of the transaction.
 * @returns A FungibleTokenActivity processed based on its type.
 */
const processActivity = (
    activity: Activity,
    clause: Connex.VM.Clause,
    direction: DIRECTIONS,
    appName?: string,
    appUrl?: string,
): Activity => {
    switch (activity.type) {
        case ActivityType.TRANSFER_FT:
            return enrichActivityWithTokenData(activity, clause, direction)
        case ActivityType.TRANSFER_VET:
            return enrichActivityWithVetTransfer(activity, clause, direction)
        case ActivityType.TRANSFER_NFT:
            return enrichActivityWithNFTData(activity, clause, direction)
        default:
            return enrichActivityWithDappData(activity, appName, appUrl)
    }
}

export const sortActivitiesByTimestamp = (activities: Activity[]) => {
    return activities.sort((a, b) => b.timestamp - a.timestamp)
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
        appId,
        proof,
        support,
        votePower,
        voteWeight,
        proposalId,
        roundId,
        appVotes,
        oldLevel,
        newLevel,
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
                isTransaction: true,
                outputToken: VET.address,
                inputToken: inputToken,
                inputValue: inputValue,
                outputValue: outputValue,
            } as SwapActivity
        }
        case ActivityEvent.SWAP_VET_TO_FT: {
            return {
                ...baseActivity,
                isTransaction: true,
                inputToken: inputToken,
                outputToken: VET.address,
                inputValue: inputValue,
                outputValue: outputValue,
            } as SwapActivity
        }
        case ActivityEvent.SWAP_FT_TO_FT: {
            return {
                ...baseActivity,
                isTransaction: true,
                inputToken: inputToken,
                outputToken: outputToken,
                inputValue: inputValue,
                outputValue: outputValue,
            } as SwapActivity
        }
        case ActivityEvent.B3TR_ACTION: {
            return {
                ...baseActivity,
                to: to ? [to] : [],
                value: value ?? "0x0",
                appId: appId,
                proof: proof,
            } as B3trActionActivity
        }
        case ActivityEvent.B3TR_PROPOSAL_VOTE: {
            return {
                ...baseActivity,
                prposalId: proposalId,
                support: support,
                votePower: votePower,
                voteWeight: voteWeight,
            } as B3trProposalVoteActivity
        }
        case ActivityEvent.B3TR_XALLOCATION_VOTE: {
            return {
                ...baseActivity,
                eventName: ActivityEvent.B3TR_XALLOCATION_VOTE,
                roundId: roundId,
                appVotes: appVotes,
            } as B3trXAllocationVoteActivity
        }
        case ActivityEvent.B3TR_CLAIM_REWARD: {
            return {
                ...baseActivity,
                eventName: ActivityEvent.B3TR_XALLOCATION_VOTE,
                value: value ?? "0x0",
                roundId: roundId,
            } as B3trClaimRewardActivity
        }
        case ActivityEvent.B3TR_UPGRADE_GM: {
            return {
                ...baseActivity,
                oldLevel: oldLevel,
                newLevel: newLevel,
            } as B3trUpgradeGmActivity
        }
        case ActivityEvent.B3TR_SWAP_B3TR_TO_VOT3: {
            return {
                ...baseActivity,
                value: value,
            } as B3trSwapB3trToVot3Activity
        }
        case ActivityEvent.B3TR_SWAP_VOT3_TO_B3TR: {
            return {
                ...baseActivity,
                value: value,
            } as B3trSwapVot3ToB3trActivity
        }
        case ActivityEvent.B3TR_PROPOSAL_SUPPORT: {
            return {
                ...baseActivity,
                value: value,
                proposalId: proposalId,
            } as B3trProposalSupportActivity
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
