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
 * Result from a single operation
 * Contains outcome and optional error context
 */
export interface RegistrationResult {
    address: string
    operation: RegistrationOperation
    success: boolean
    error?: string
    timestamp: number
}

const MAX_RETRIES = 3
const NOTIFICATION_CENTER_EVENT = ERROR_EVENTS.NOTIFICATION_CENTER

/**
 * Client for handling notification registrations with batching and retry logic
 */
export class PushRegistrationClient {
    private static readonly BATCH_SIZE = 5

    static async registerAddresses(addresses: string[], subscriptionId: string | null): Promise<RegistrationResult[]> {
        return this.performOperation("REGISTER", addresses, subscriptionId)
    }

    static async unregisterAddresses(
        addresses: string[],
        subscriptionId: string | null,
    ): Promise<RegistrationResult[]> {
        return this.performOperation("UNREGISTER", addresses, subscriptionId)
    }

    private static async performOperation(
        operation: RegistrationOperation,
        addresses: string[],
        subscriptionId: string | null,
    ): Promise<RegistrationResult[]> {
        const batches = this.chunkArray(addresses, this.BATCH_SIZE)
        const results: RegistrationResult[] = []
        info(
            NOTIFICATION_CENTER_EVENT,
            `Processing ${batches.length} ${operation.toLowerCase()} batch(es) of up to ${this.BATCH_SIZE}`,
        )

        for (const batch of batches) {
            const batchResults = await this.processBatch(operation, batch, subscriptionId)
            results.push(...batchResults)
        }
        return results
    }

    private static async processBatch(
        operation: RegistrationOperation,
        batch: string[],
        subscriptionId: string | null,
    ): Promise<RegistrationResult[]> {
        const now = Date.now()

        const callApi = async (): Promise<NotificationAPIResponse> => {
            const apiCall = operation === "REGISTER" ? registerPushNotification : unregisterPushNotification
            return apiCall({ walletAddresses: batch, subscriptionId })
        }

        // retry with exponential backoff
        let attempt = 0
        while (true) {
            try {
                const resp = await callApi()
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
            } catch (e: unknown) {
                attempt++
                const canRetry = attempt < MAX_RETRIES && this.isRetryableError(e)
                error(NOTIFICATION_CENTER_EVENT, `Batch ${operation.toLowerCase()} attempt ${attempt} failed`, e)
                if (!canRetry) {
                    const errorMessage = e instanceof Error ? e.message : "batch failed"
                    // mark whole batch failed
                    return batch.map(addr => ({
                        address: addr,
                        operation,
                        success: false,
                        error: errorMessage,
                        timestamp: now,
                    }))
                }
                const delay = 1000 * Math.pow(2, attempt - 1)
                info(NOTIFICATION_CENTER_EVENT, `Retrying in ${delay}ms`)
                await new Promise(r => setTimeout(r, delay))
            }
        }
    }

    private static chunkArray<T>(array: T[], size: number): T[][] {
        const chunks: T[][] = []
        for (let i = 0; i < array.length; i += size) chunks.push(array.slice(i, i + size))
        return chunks
    }

    private static isRetryableError(err: unknown): boolean {
        if (typeof err === "object" && err !== null && "response" in err) {
            const response = (err as any).response
            if (response?.status) {
                const status = response.status
                return status >= 500 && status < 600
            }
        }

        if (err instanceof Error) {
            return err.message.toLowerCase().includes("network")
        }

        if (typeof err === "object" && err !== null) {
            if ("code" in err && (err as any).code === "ECONNABORTED") {
                return true
            }
            if (!("response" in err)) {
                return true
            }
        }

        return false
    }
}
