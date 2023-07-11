import { DIRECTIONS, VET, chainTagToGenesisId } from "~Constants"
import { ActivityUtils, TransactionUtils, debug } from "~Utils"
import {
    Activity,
    ActivityStatus,
    ActivityType,
    FungibleTokenActivity,
    NonFungibleTokenActivity,
} from "~Model"
import {
    EventTypeResponse,
    IncomingTransferResponse,
    TransactionsResponse,
} from "./Types"

/**
 * Function to create a base activity from a transaction response.
 * This function extracts the needed properties from the transaction response to create the base activity.
 *
 * @param transaction - The transaction response from which to create the activity.
 * @returns An activity created from the transaction response.
 */
export const createBaseActivityFromTransaction = (
    transaction: TransactionsResponse,
): Activity => {
    // Destructure needed properties from transaction
    const {
        origin,
        id,
        blockNumber,
        chainTag,
        gasUsed,
        gasPayer,
        clauses,
        blockTimestamp,
    } = transaction

    return {
        from: origin,
        to: clauses.map(
            (clause: Connex.VM.Clause) =>
                ActivityUtils.getDestinationAddressFromClause(clause) ?? "",
        ),
        id,
        blockNumber,
        isTransaction: true,
        genesisId: chainTagToGenesisId[chainTag],
        type: ActivityUtils.getActivityTypeFromClause(clauses),
        timestamp: blockTimestamp * 1000, // Convert to milliseconds
        gasUsed,
        gasPayer,
        delegated: gasPayer !== origin,
        status: transaction.reverted
            ? ActivityStatus.REVERTED
            : ActivityStatus.SUCCESS,
        clauses,
        outputs: transaction.outputs,
    }
}

/**
 * Creates a transfer clause from an incoming transfer.
 *
 * @param to - The recipient's address.
 * @param value - The number of tokens to transfer.
 * @param tokenAddress - The contract address of the token.
 * @param type - The type of activity, either a VET_TRANSFER or a FUNGIBLE_TOKEN transfer.
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
    if (type === ActivityType.VET_TRANSFER) {
        return TransactionUtils.encodeTransferFungibleTokenClause(
            to,
            value,
            VET.address,
        )
    }

    if (type === ActivityType.FUNGIBLE_TOKEN) {
        return TransactionUtils.encodeTransferFungibleTokenClause(
            to,
            value,
            contractAddress,
        )
    }

    if (type === ActivityType.NFT_TRANSFER && from && tokenId) {
        return TransactionUtils.encodeTransferNonFungibleTokenClause(
            from,
            to,
            contractAddress,
            tokenId,
        )
    }
}

/**
 * Maps the incoming EventTypeResponse to the corresponding ActivityType.
 *
 * @param eventType - The type of event.
 *
 * @returns The corresponding ActivityType, or undefined if the eventType does not map to any known ActivityType.
 */
export const eventTypeToActivityType = (
    eventType: EventTypeResponse,
): ActivityType | undefined => {
    switch (eventType) {
        case EventTypeResponse.VET:
            return ActivityType.VET_TRANSFER

        case EventTypeResponse.FUNGIBLE_TOKEN:
            return ActivityType.FUNGIBLE_TOKEN

        case EventTypeResponse.NFT:
            return ActivityType.NFT_TRANSFER

        default:
            debug(
                "Received not yet supported incoming transfer event type: ",
                eventType,
            )
    }
}

/**
 * Creates a base activity from an incoming transfer.
 *
 * @param incomingTransfer - The incoming transfer from which to create the activity.
 * @param thor - An instance of the Connex.Thor blockchain interface.
 *
 * @returns The Activity created from the incoming transfer, or null if unable to create activity.
 */
export const createBaseActivityFromIncomingTransfer = (
    incomingTransfer: IncomingTransferResponse,
    thor: Connex.Thor,
): Activity | null => {
    // Destructure needed properties from transaction

    const {
        blockNumber,
        blockTimestamp,
        from,
        txId,
        to,
        value,
        tokenAddress,
        eventType,
        tokenId,
    } = incomingTransfer

    const activityType = eventTypeToActivityType(eventType)

    if (!activityType) return null

    const encodedClause = createTransferClauseFromIncomingTransfer(
        to,
        value,
        tokenAddress,
        activityType,
        from,
        tokenId,
    )

    if (!encodedClause) return null

    const clauses: Connex.VM.Clause[] = [encodedClause]

    return {
        from,
        to: [to],
        id: txId,
        blockNumber,
        isTransaction: true,
        genesisId: thor.genesis.id,
        type: ActivityUtils.getActivityTypeFromClause(clauses),
        timestamp: blockTimestamp * 1000, // Convert to milliseconds
        status: ActivityStatus.SUCCESS,
        clauses,
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
    return createFungibleTokenActivity(
        activity as FungibleTokenActivity,
        VET.address,
        Number(clause.value),
        direction,
    )
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
    const nftData =
        TransactionUtils.decodeNonFungibleTokenTransferClause(clause)

    if (!nftData) {
        debug("Unable to decode NFT transfer clause", clause)
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
): Activity => {
    switch (activity.type) {
        case ActivityType.FUNGIBLE_TOKEN:
            return enrichActivityWithTokenData(activity, clause, direction)
        case ActivityType.VET_TRANSFER:
            return enrichActivityWithVetTransfer(activity, clause, direction)
        case ActivityType.NFT_TRANSFER:
            return enrichActivityWithNFTData(activity, clause, direction)
        default:
            return activity
    }
}

/**
 * Retrieves activities from given transactions.
 * It creates a base activity from the transaction and processes the activity based on its type.
 *
 * @param transactions - An array of transactions from which to create activities.
 * @returns An array of activities created from the transactions.
 */
export const getActivitiesFromTransactions = (
    transactions: TransactionsResponse[],
): Activity[] => {
    return transactions.map(transaction => {
        let activity: Activity = createBaseActivityFromTransaction(transaction)

        return processActivity(activity, transaction.clauses[0], DIRECTIONS.UP)
    })
}

/**
 * Retrieves activities from incoming transfers.
 * It creates a base activity from the incoming transfer and processes the activity based on its type.
 * @param incomingTransfers - An array of incoming transfers from which to create activities.
 *
 * @param thor - The thor instance for creating activities from incoming transfers.
 * @returns An array of activities created from the incoming transfers.
 */
export const getActivitiesFromIncomingTransfers = (
    incomingTransfers: IncomingTransferResponse[],
    thor: Connex.Thor,
): Activity[] => {
    return incomingTransfers.reduce(
        (activities: Activity[], incomingTransfer) => {
            let activity: Activity | null =
                createBaseActivityFromIncomingTransfer(incomingTransfer, thor)

            if (activity) {
                activities.push(
                    processActivity(
                        activity,
                        activity.clauses[0],
                        DIRECTIONS.DOWN,
                    ),
                )
            }

            return activities
        },
        [],
    )
}
