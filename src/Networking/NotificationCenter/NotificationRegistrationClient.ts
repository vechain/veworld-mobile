import { NETWORK_TYPE } from "~Model"
import {
    registerPushNotification,
    unregisterPushNotification,
} from "~Networking/NotificationCenter/NotificationCenterAPI"
import { error, info } from "~Utils"

import { ERROR_EVENTS } from "../../Constants"

type RegistrationOperation = "REGISTER" | "UNREGISTER"

interface NotificationAPIResponse {
    failed: string[] // Array of addresses that failed
}

/**
 * Result from a single operation in the gateway
 * Contains outcome and optional error context
 */
interface RegistrationResult {
    address: string
    operation: RegistrationOperation
    success: boolean
    error?: string
    timestamp: number
}

const chunkArray = <T>(array: T[], size: number): T[][] => {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) chunks.push(array.slice(i, i + size))
    return chunks
}

const isRetryableError = (err: any): boolean => {
    if (err?.response) {
        const status = err.response.status
        return status >= 500 && status < 600
    }
    return err?.message?.toLowerCase().includes("network") || err?.code === "ECONNABORTED" || !err?.response
}

const MAX_RETRIES = 3

const NOTIFICATION_CENTER_EVENT = ERROR_EVENTS.NOTIFICATION_CENTER

/**
 * Gateway owns batching + retry/backoff, returns per-address outcomes.
 */
export class NotificationRegistrationClient {
    constructor(private batchSize: number) {}

    async registerAddresses(addresses: string[], subscriptionId: string | null): Promise<RegistrationResult[]> {
        return this.perform("REGISTER", addresses, subscriptionId)
    }

    async unregisterAddresses(addresses: string[], subscriptionId: string | null): Promise<RegistrationResult[]> {
        return this.perform("UNREGISTER", addresses, subscriptionId)
    }

    async perform(
        operation: RegistrationOperation,
        addresses: string[],
        subscriptionId: string | null,
    ): Promise<RegistrationResult[]> {
        const batches = chunkArray(addresses, this.batchSize)
        const results: RegistrationResult[] = []

        info(
            NOTIFICATION_CENTER_EVENT,
            `Processing ${batches.length} ${operation.toLowerCase()} batch(es) of up to ${this.batchSize}`,
        )

        for (const batch of batches) {
            const batchResults = await this.processBatch(operation, batch, subscriptionId)
            results.push(...batchResults)
        }
        return results
    }

    private async processBatch(
        operation: RegistrationOperation,
        batch: string[],
        subscriptionId: string | null,
    ): Promise<RegistrationResult[]> {
        const now = Date.now()

        const call = async (): Promise<NotificationAPIResponse> => {
            const networkType = __DEV__ ? NETWORK_TYPE.TEST : NETWORK_TYPE.MAIN
            const apiCall = operation === "REGISTER" ? registerPushNotification : unregisterPushNotification
            return apiCall({ networkType, walletAddresses: batch, subscriptionId })
        }

        // retry with exponential backoff
        let attempt = 0
        while (true) {
            try {
                const resp = await call()
                const failed = new Set(resp.failed)
                if (failed.size) {
                    error(
                        NOTIFICATION_CENTER_EVENT,
                        `Failed to ${operation.toLowerCase()} ${failed.size} address(es): ${Array.from(failed).join(
                            ", ",
                        )}`,
                    )
                }
                return batch.map(addr =>
                    failed.has(addr)
                        ? { address: addr, operation, success: false, error: "failed", timestamp: now }
                        : { address: addr, operation, success: true, timestamp: now },
                )
            } catch (e: any) {
                attempt++
                const canRetry = attempt < MAX_RETRIES && isRetryableError(e)
                error(NOTIFICATION_CENTER_EVENT, `Batch ${operation.toLowerCase()} attempt ${attempt} failed`, e)
                if (!canRetry) {
                    // mark whole batch failed
                    return batch.map(addr => ({
                        address: addr,
                        operation,
                        success: false,
                        error: e?.message ?? "batch failed",
                        timestamp: now,
                    }))
                }
                const delay = 1000 * Math.pow(2, attempt - 1)
                info(NOTIFICATION_CENTER_EVENT, `Retrying in ${delay}ms`)
                await new Promise(r => setTimeout(r, delay))
            }
        }
    }
}
