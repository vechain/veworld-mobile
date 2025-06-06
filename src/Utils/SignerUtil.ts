import { Transaction } from "@vechain/sdk-core"
import { HexUtils } from "~Utils"
import { sponsorTransaction } from "~Networking/Transactions/sponsorTransaction"
import { error } from "~Utils/Logger"
import { ERROR_EVENTS } from "~Constants"

export enum SignStatus {
    NAVIGATE_TO_LEDGER = "NAVIGATE_TO_LEDGER",
    DELEGATION_FAILURE = "DELEGATION_FAILURE",
}

export interface SponsorRequest {
    origin: string
    raw: string
}

export type SponsorTransactionFunction = (delegateUrl: string, sponsorRequest: SponsorRequest) => Promise<string>

export type LoggerFunction = (event: string, message: string, error?: any) => void

/**
 * Pure function to get URL delegation signature for a transaction
 * @param transaction - The transaction to get delegation signature for
 * @param delegationUrl - The URL to request delegation signature from
 * @param originAddress - The origin address for the sponsorship request
 * @returns Promise resolving to signature buffer or delegation failure status
 */
export const getUrlDelegationSignature = async (
    transaction: Transaction,
    delegationUrl: string,
    originAddress: string,
): Promise<Buffer> => {
    if (!delegationUrl) {
        throw new Error("Delegation url not found when requesting delegation signature")
    }

    // build hex encoded version of the transaction for signing request
    const rawTransaction = HexUtils.addPrefix(Buffer.from(transaction.encoded).toString("hex"))

    // request to send for sponsorship/fee delegation
    const sponsorRequest: SponsorRequest = {
        origin: originAddress.toLowerCase(),
        raw: rawTransaction,
    }

    const signature = await sponsorTransaction(delegationUrl, sponsorRequest)

    if (!signature) {
        throw new Error("Error getting delegator signature")
    }

    return Buffer.from(signature.substr(2), "hex")
}
