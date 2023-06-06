import { Transaction } from "thor-devkit"
import { DIRECTIONS, ThorConstants, VET } from "~Common"
import { ActivityUtils, TransactionUtils } from "~Utils"
import { Activity, ActivityStatus, FungibleTokenActivity } from "~Model"
import { FetchTransactionsResponse } from "./Types"

/**
 * Function to create a base activity from a transaction response.
 * This function extracts the needed properties from the transaction response to create the base activity.
 * @param transaction - The transaction response from which to create the activity.
 * @returns An activity created from the transaction response.
 */
export const createBaseActivityFromTransaction = (
    transaction: FetchTransactionsResponse,
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
            (clause: Transaction.Clause) =>
                ActivityUtils.getDestinationAddressFromClause(clause) ?? "",
        ),
        id,
        blockNumber,
        isTransaction: true,
        genesisId: ThorConstants.chainTagToGenesisId[chainTag],
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
): FungibleTokenActivity => {
    return {
        ...activity,
        amount,
        tokenAddress,
        direction: DIRECTIONS.UP,
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
    clause: Transaction.Clause,
): FungibleTokenActivity => {
    // Decode token transfer clause
    const tokenData = TransactionUtils.decodeTokenTransferClause(clause)
    // Create fungible token activity with token data
    return createFungibleTokenActivity(
        activity as FungibleTokenActivity,
        clause.to ?? "",
        Number(tokenData?.amount),
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
    clause: Transaction.Clause,
): FungibleTokenActivity => {
    return createFungibleTokenActivity(
        activity as FungibleTokenActivity,
        VET.address,
        Number(clause.value),
    )
}
