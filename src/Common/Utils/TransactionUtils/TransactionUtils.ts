import { debug } from "~Common/Logger"
import { Activity } from "~Model"

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
