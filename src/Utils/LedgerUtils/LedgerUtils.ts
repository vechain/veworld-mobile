import { LedgerDevice, Network, Response } from "~Model"
import { Certificate, HDNode, Transaction } from "thor-devkit"
import { AddressUtils, BalanceUtils } from "~Utils"
import {
    LEDGER_ERROR_CODES,
    VET_DERIVATION_PATH,
    VETLedgerAccount,
    VETLedgerApp,
} from "~Constants"
import { debug, error, warn } from "~Utils/Logger"
import { Buffer } from "buffer"

import BleTransport from "@ledgerhq/react-native-hw-transport-ble"

/**
 * Codes to detect if the leder has the clause and contract enabled
 */
export enum LedgerConfig {
    UNKNOWN = "00000000",
    CLAUSE_AND_CONTRACT_ENABLED = "03010007",
    CLAUSE_ONLY_ENABLED = "02010007",
    CONTRACT_ONLY_ENABLED = "01010007",
    CLAUSE_AND_CONTRACT_DISABLED = "00010007",
}

/**
 * Parses ledger errors based on common issues
 */
export const ledgerErrorHandler = (err: unknown): LEDGER_ERROR_CODES => {
    if (!(err instanceof Error)) {
        return LEDGER_ERROR_CODES.UNKNOWN
    }

    //0x6d02 - user in homescreen?
    //0x6a15 - user in another app
    if (err.message.includes("0x6d02") || err.message.includes("0x6a15")) {
        return LEDGER_ERROR_CODES.NO_VET_APP
    }
    // 0x6b0c - device is locked or off
    // 0x5515 - LockedDeviceError
    if (
        err.name.includes("BleError") ||
        err.message.includes("0x6b0c") ||
        err.message.includes("0x5515") ||
        err.message.includes("busy")
    ) {
        return LEDGER_ERROR_CODES.OFF_OR_LOCKED
    }
    if (err.name.includes("Disconnected")) {
        return LEDGER_ERROR_CODES.DISCONNECTED
    }

    if (err.message.includes("0x6985")) {
        return LEDGER_ERROR_CODES.USER_REJECTED
    }

    error("[Ledger] - Unknown Error", err)
    return LEDGER_ERROR_CODES.UNKNOWN
}

/**
 * Response from the verify transport function
 * @category Ledger
 * @property error - The error if there is one
 * @property response - The response, which should be defined, only if there is no error
 */
type VerifyTransportResponse = {
    appConfig: LedgerConfig
    rootAccount: VETLedgerAccount
    app: VETLedgerApp
}

type VerifyResponse = Promise<Response<VerifyTransportResponse>>

export const verifyTransport = async (
    withTransport: (
        func: (t: BleTransport) => VerifyResponse,
    ) => VerifyResponse,
): VerifyResponse => {
    const res = async (transport: BleTransport): VerifyResponse => {
        const app = new VETLedgerApp(transport)

        try {
            const config = await app.getAppConfiguration()

            const appConfig: LedgerConfig = config.toString(
                "hex",
            ) as LedgerConfig
            const rootAccount: VETLedgerAccount = await app.getAddress(
                VET_DERIVATION_PATH,
                false,
                true,
            )

            return {
                success: true,
                payload: {
                    appConfig,
                    rootAccount,
                    app,
                },
            }
        } catch (e) {
            return {
                success: false,
                payload: ledgerErrorHandler(e as Error),
            }
        }
    }

    return await withTransport(res)
}

/**
 * Request a certificate signature to the ledger device
 * @category Ledger
 * @param index  The index of the account to sign the certificate with
 * @param cert  The certificate to sign
 * @param device  The device to sign the certificate with
 * @param withTransport  The transport to perform an action with
 * @returns The signed certificate
 */

type CertResponse = Promise<Response<Buffer>>

const signCertificate = async (
    index: number,
    cert: Certificate,
    device: LedgerDevice,
    withTransport: (func: (t: BleTransport) => CertResponse) => CertResponse,
): CertResponse => {
    debug("Signing certificate")

    const res = async (transport: BleTransport): CertResponse => {
        try {
            const vetLedger = new VETLedgerApp(transport)

            await validateRootAddress(device.rootAddress, vetLedger)

            const dataToSign = Buffer.from(Certificate.encode(cert), "utf8")

            const path = `${VET_DERIVATION_PATH}/${index}`
            const signature = await vetLedger.signJSON(path, dataToSign)

            return {
                success: true,
                payload: signature,
            }
        } catch (e) {
            warn("Error signing transaction", e)

            return {
                success: false,
                payload: ledgerErrorHandler(e),
            }
        }
    }

    return await withTransport(res)
}

/**
 *  Request a transaction signature to the ledger device and return the signature as a buffer
 * @param index  The index of the account to sign the transaction with
 * @param transaction  The transaction to sign
 * @param device  The device to sign the transaction with
 * @param withTransport  The transport to perform an action with
 * @param onIsAwaitingForSignature  A callback that is called when the ledger is awaiting for a signature
 * @param onProgressUpdate  A callback that is called when the progress of the signature is updated
 * @returns  The signed transaction
 */

type TxResponse = Promise<Response<Buffer>>

const signTransaction = async (
    index: number,
    transaction: Transaction,
    device: LedgerDevice,
    withTransport: (func: (t: BleTransport) => TxResponse) => TxResponse,
    onIsAwaitingForSignature: () => void,
    onProgressUpdate?: (progress: number) => void,
): TxResponse => {
    debug("Signing transaction")

    const res = async (transport: BleTransport): TxResponse => {
        const vetLedger = new VETLedgerApp(transport)
        try {
            await validateRootAddress(device.rootAddress, vetLedger)

            const path = `${VET_DERIVATION_PATH}/${index}`
            const signature = await vetLedger.signTransaction(
                path,
                transaction.encode(),
                onIsAwaitingForSignature,
                onProgressUpdate,
            )

            return {
                success: true,
                payload: signature,
            }
        } catch (e) {
            warn("Error signing transaction", e)

            return {
                success: false,
                payload: ledgerErrorHandler(e),
            }
        }
    }

    return await withTransport(res)
}

export type LedgerAccount = {
    address: string
    balance?: Connex.Thor.Account
}

/**
 * Get a number of accounts and their balances
 *
 * @param rootAccount - the root account of the ledger (with chaincode)
 * @param numberOfAccounts - the number of accounts to get. Defaults to 6
 */
const getAccountsWithBalances = async (
    rootAccount: VETLedgerAccount,
    network: Network,
    numberOfAccounts = 6,
): Promise<LedgerAccount[]> => {
    debug("Getting accounts with balances")

    if (numberOfAccounts < 1) throw new Error("Must get at least 1 account")

    if (!rootAccount.publicKey || !rootAccount.chainCode)
        throw new Error("Failed to get public key/ chaincode")

    const publicKey = Buffer.from(rootAccount.publicKey, "hex")
    const chainCode = Buffer.from(rootAccount.chainCode, "hex")

    const hdNode = HDNode.fromPublicKey(publicKey, chainCode)

    const accounts: LedgerAccount[] = []

    for (let i = 0; i < numberOfAccounts; i++) {
        const childNode = hdNode.derive(i)

        try {
            const balance =
                await BalanceUtils.getVetAndVthoBalancesFromBlockchain(
                    childNode.address,
                    network,
                )

            accounts.push({
                address: childNode.address,
                balance: balance,
            })
        } catch (e) {
            accounts.push({ address: childNode.address })
        }
    }

    return accounts
}

/**
 * Validates that the root account on the ledger matches that of our XPub
 *
 * @param rootAddress - the address to validate
 * @param vetLedger - the current connection to the ledger
 *
 * @throws an error if the ledger does not contain the expected account
 */
const validateRootAddress = async (
    rootAddress: string,
    vetLedger: VETLedgerApp,
) => {
    debug("Validating root address")
    const rootAccount = await vetLedger.getAddress(
        VET_DERIVATION_PATH,
        false,
        false,
    )

    if (!AddressUtils.compareAddresses(rootAddress, rootAccount.address)) {
        throw new Error(
            "Ledger address does not match expected account address",
        )
    }
}

export default {
    ledgerErrorHandler,
    verifyTransport,
    getAccountsWithBalances,
    signCertificate,
    signTransaction,
}
