import { debug } from "~Common/Logger"
import { Activity } from "~Model"

/**
 *  Checks if an activity is finalised by querying the chain for the block of the transaction and checking if it is finalised
 * @param activity  - Activity to check
 * @param thor   - Connex.Thor instance
 * @returns
 */
export const checkForTransactionFinality = async (
    activity: Activity,
    thor: Connex.Thor,
): Promise<boolean> => {
    if (!activity.txReceipt) return false

    const block = await thor.block(activity.txReceipt.meta.blockNumber).get()

    if (activity.isTransaction && activity.txReceipt && block?.isFinalized) {
        debug(`Finalised activity ${activity.id}`)
        return true
    }
    return false
}
