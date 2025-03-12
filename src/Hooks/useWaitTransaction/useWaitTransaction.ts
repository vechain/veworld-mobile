import { PollExecution } from "@vechain/sdk-errors"
import { ThorClient, WaitForTransactionOptions } from "@vechain/sdk-network"
import { useCallback } from "react"
import { ERROR_EVENTS } from "~Constants"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { error } from "~Utils"

/**
 * Default interval (in ms) for `useWaitTransaction.waitTransaction`
 */
export const WAIT_TRANSACTION_DEFAULT_INTERVAL = 3000
/**
 * Default timeout (in ms) for `useWaitTransaction.waitTransaction`. It should be 5 blocks
 */
export const WAIT_TRANSACTION_DEFAULT_TIMEOUT = 50000

export const useWaitTransaction = ({
    intervalMs = WAIT_TRANSACTION_DEFAULT_INTERVAL,
    timeoutMs = WAIT_TRANSACTION_DEFAULT_TIMEOUT,
}: WaitForTransactionOptions = {}) => {
    const selectedNetwork = useAppSelector(selectSelectedNetwork)

    const waitTransaction = useCallback(
        async (txId: string) => {
            try {
                return await ThorClient.at(selectedNetwork.currentUrl).transactions.waitForTransaction(txId, {
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
        },
        [intervalMs, selectedNetwork.currentUrl, timeoutMs],
    )

    return { waitTransaction }
}
