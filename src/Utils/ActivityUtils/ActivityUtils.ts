import { Activity, ActivityType } from "~Model"
import TransactionUtils from "../TransactionUtils"

/**
 * Determines the type of activity based on the provided clauses.
 *
 * @param clauses - The clauses to interpret.
 * @returns The type of the activity.
 */
export const getActivityTypeFromClause = (
    clauses: Connex.VM.Clause[],
): ActivityType => {
    if (clauses.length > 1) return ActivityType.DAPP_TRANSACTION

    if (TransactionUtils.isTokenTransferClause(clauses[0])) {
        return ActivityType.FUNGIBLE_TOKEN
    }

    if (TransactionUtils.isVETtransferClause(clauses[0])) {
        return ActivityType.VET_TRANSFER
    }

    if (TransactionUtils.isNFTTransferClause(clauses[0])) {
        return ActivityType.NFT_TRANSFER
    }

    return ActivityType.DAPP_TRANSACTION
}

/**
 * Extracts the destination address from a provided clause.
 *
 * @param clause - The clause to extract the address from.
 * @returns The destination address if the clause is a token transfer clause, else the original 'to' field of the clause.
 */
export const getDestinationAddressFromClause = (clause: Connex.VM.Clause) => {
    if (TransactionUtils.isTokenTransferClause(clause)) {
        const tokenData = TransactionUtils.decodeTokenTransferClause(clause)

        return tokenData?.to
    }

    if (TransactionUtils.isNFTTransferClause(clause)) {
        const nftData =
            TransactionUtils.decodeNonFungibleTokenTransferClause(clause)

        return nftData?.to
    }

    return clause.to
}

/**
 * Checks if an activity is a transaction activity.
 *
 * @param activity - The activity to check.
 * @returns A boolean indicating whether the activity is a transaction activity.
 */
export const isTransactionActivity = (activity: Activity) => {
    const type = activity.type

    return (
        type === ActivityType.FUNGIBLE_TOKEN ||
        type === ActivityType.VET_TRANSFER ||
        type === ActivityType.NFT_TRANSFER ||
        type === ActivityType.DELEGATED_TRANSACTION ||
        type === ActivityType.DAPP_TRANSACTION ||
        activity.isTransaction
    )
}
