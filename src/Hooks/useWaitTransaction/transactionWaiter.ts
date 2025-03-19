import { PollExecution } from "@vechain/sdk-errors"
import { ThorClient, WaitForTransactionOptions } from "@vechain/sdk-network"
import { ERROR_EVENTS } from "~Constants"
import { Network } from "~Model"
import { error } from "~Utils"

/**
 * Default interval (in ms) for `useWaitTransaction.waitTransaction`
 */
export const WAIT_TRANSACTION_DEFAULT_INTERVAL = 3000
/**
 * Default timeout (in ms) for `useWaitTransaction.waitTransaction`. It should be 5 blocks
 */
export const WAIT_TRANSACTION_DEFAULT_TIMEOUT = 50000

type WaitTransactionOptions = {
    network: Network
} & WaitForTransactionOptions

export const waitTransaction = async (
    txId: string,
    {
        intervalMs = WAIT_TRANSACTION_DEFAULT_INTERVAL,
        timeoutMs = WAIT_TRANSACTION_DEFAULT_TIMEOUT,
        network,
    }: WaitTransactionOptions,
) => {
    try {
        return await ThorClient.at(network.currentUrl).transactions.waitForTransaction(txId, {
            intervalMs,
            timeoutMs,
        })
    } catch (e) {
        if (e instanceof PollExecution) {
            return null
        }
        error(ERROR_EVENTS.SEND, e)
        throw e
    }
}
