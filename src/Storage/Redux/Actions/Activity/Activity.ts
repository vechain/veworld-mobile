import {
    Activity,
    ActivityStatus,
    ActivityType,
    FungibleTokenActivity,
} from "~Model"
import { AppThunk, createAppAsyncThunk } from "~Storage/Redux/Types"
import {
    updateTransactionActivitiesMainnet,
    updateTransactionActivitiesTestnet,
    upsertActivityMainnet,
    upsertActivityTestnet,
} from "~Storage/Redux/Slices"
import {
    selectCurrentTransactionActivities,
    selectSelectedAccount,
} from "~Storage/Redux/Selectors"
import { DEFAULT_PAGE_SIZE } from "./API"
import { Transaction } from "thor-devkit"
import { DIRECTIONS, ThorConstants } from "~Common"
import { ActivityUtils, TransactionUtils } from "~Utils"

/**
 * Creates a new pending FungibleTokenActivity from a given transaction.
 *
 * The transaction clauses are analyzed to determine the activity type (VET_TRANSFER or FUNGIBLE_TOKEN).
 * In case the transaction type is different, an error is thrown.
 *
 * The method also extracts the token address and amount from the first transaction clause.
 * Errors are thrown if these values cannot be extracted.
 *
 * @param tx - The transaction from which to create the activity.
 * @returns A new FungibleTokenActivity object based on the given transaction.
 * @throws {Error} If the transaction type is neither VET_TRANSFER nor FUNGIBLE_TOKEN.
 * @throws {Error} If the token address cannot be extracted from the transaction.
 * @throws {Error} If the amount cannot be extracted from the transaction.
 */
const createPendingTransferActivityFromTx = (
    tx: Transaction,
): FungibleTokenActivity => {
    const { id, origin, delegated, delegator, body } = tx
    const { clauses, gas, chainTag } = body
    const type = ActivityUtils.getActivityTypeFromClause(clauses)

    if (
        type !== ActivityType.VET_TRANSFER &&
        type !== ActivityType.FUNGIBLE_TOKEN
    )
        throw new Error("Invalid transaction type")

    const tokenAddress = TransactionUtils.getTokenAddressFromClause(clauses[0])

    if (!tokenAddress) throw new Error("Invalid token address")

    const amount = TransactionUtils.getAmountFromClause(clauses[0])

    if (!amount) throw new Error("Invalid amount")

    return {
        from: origin ?? "",
        to: clauses.map(
            (clause: Transaction.Clause) =>
                ActivityUtils.getDestinationAddressFromClause(clause) ?? "",
        ),
        id: id ?? "",
        genesisId: ThorConstants.chainTagToGenesisId[chainTag],
        gasUsed: Number(gas),
        clauses,
        delegated,
        status: ActivityStatus.PENDING,
        isTransaction: true,
        timestamp: Date.now(),
        gasPayer: (delegated ? delegator : origin) ?? "", //TODO Check if 'delegator' is correctly set when delegating a transaction to another account
        blockNumber: 0,
        type,
        amount,
        tokenAddress,
        direction: DIRECTIONS.UP,
    }
}

/**
 * This method upserts an activity to the store fetching the transaction details from the chain
 * If the activity is not a transaction, it will just upsert the activity.
 *
 * @param activity - The activity to be upserted.
 * @param thor - The Connex.Thor instance used for querying the chain.
 * @returns A promise which resolves to the upserted activity.
 */
export const validateAndUpsertActivity = createAppAsyncThunk(
    "activity/upsertTransactionDetails",
    async (
        { activity, thor }: { activity: Activity; thor: Connex.Thor },
        { dispatch },
    ) => {
        let updatedActivity = { ...activity }

        // If the activity is a transaction, we need to fetch the transaction from the chain
        if (updatedActivity.isTransaction) {
            const tx = await thor.transaction(updatedActivity.id).get()
            updatedActivity.timestamp = !tx
                ? Date.now()
                : tx.meta.blockTimestamp

            const txReceipt = await thor
                .transaction(updatedActivity.id)
                .getReceipt()

            updatedActivity.blockNumber = txReceipt?.meta.blockNumber ?? 0

            if (!txReceipt) updatedActivity.status = ActivityStatus.PENDING
            else
                updatedActivity.status = txReceipt.reverted
                    ? ActivityStatus.REVERTED
                    : ActivityStatus.SUCCESS
        }

        thor.genesis.id === ThorConstants.genesisesId.main
            ? dispatch(
                  upsertActivityMainnet({
                      address: updatedActivity.from.toLowerCase(),
                      activity: updatedActivity,
                  }),
              )
            : dispatch(
                  upsertActivityTestnet({
                      address: updatedActivity.from.toLowerCase(),
                      activity: updatedActivity,
                  }),
              )

        return updatedActivity
    },
)

export const addPendingTransferTransactionActivity =
    (outgoingTx: Transaction, thor: Connex.Thor): AppThunk<void> =>
    (dispatch, getState) => {
        const selectedAccount = selectSelectedAccount(getState())

        // Ensure selectedAccount is not undefined and outgoingTx has a transaction ID
        if (!selectedAccount || !outgoingTx.id) return

        const pendingActivity: FungibleTokenActivity =
            createPendingTransferActivityFromTx(outgoingTx)

        thor.genesis.id === ThorConstants.genesisesId.main
            ? dispatch(
                  upsertActivityMainnet({
                      address: selectedAccount.address.toLowerCase(),
                      activity: pendingActivity,
                  }),
              )
            : dispatch(
                  upsertActivityTestnet({
                      address: selectedAccount.address.toLowerCase(),
                      activity: pendingActivity,
                  }),
              )
    }

/**
 * This method updates account transaction activities.
 * It fetches the current activities from the state, adds new activities,
 * sorts them based on timestamp, and limits them to DEFAULT_PAGE_SIZE.
 *
 * @param transactionActivities - The new transaction activities to be added.
 * @returns A ThunkAction, which dispatches the updateTransactionActivities action.
 */
export const updateAccountTransactionActivities =
    (transactionActivities: Activity[], thor: Connex.Thor): AppThunk<void> =>
    async (dispatch, getState) => {
        const selectedAccount = selectSelectedAccount(getState())

        // Ensure selectedAccount is not undefined
        if (!selectedAccount) return

        // Existing transaction activities for the account
        const existingActivities = selectCurrentTransactionActivities(
            getState(),
        )

        let newTransactionActivities = existingActivities

        transactionActivities.forEach(activity => {
            const existingActivityIndex = newTransactionActivities.findIndex(
                act => act.id.toLowerCase() === activity.id.toLowerCase(),
            )

            if (existingActivityIndex !== -1)
                newTransactionActivities[existingActivityIndex] = activity
            else newTransactionActivities.push(activity)
        })

        // Sort the activities and slice to the default page size
        newTransactionActivities.sort((a, b) => b.timestamp - a.timestamp)
        newTransactionActivities = newTransactionActivities.slice(
            0,
            DEFAULT_PAGE_SIZE,
        )

        thor.genesis.id === ThorConstants.genesisesId.main
            ? dispatch(
                  updateTransactionActivitiesMainnet({
                      address: selectedAccount.address.toLowerCase(),
                      activities: newTransactionActivities,
                  }),
              )
            : dispatch(
                  updateTransactionActivitiesTestnet({
                      address: selectedAccount.address.toLowerCase(),
                      activities: newTransactionActivities,
                  }),
              )
    }
