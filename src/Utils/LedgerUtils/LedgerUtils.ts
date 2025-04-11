import { LedgerDevice, Network, Response } from "~Model"
import { Certificate, HDNode } from "thor-devkit"
import { AddressUtils, BalanceUtils } from "~Utils"
import { DerivationPath, ERROR_EVENTS, LEDGER_ERROR_CODES, VETLedgerAccount, VETLedgerApp } from "~Constants"
import { debug, error } from "~Utils/Logger"
import { Buffer } from "buffer"
import { Transaction as SDKTransaction } from "@vechain/sdk-core"

import BleTransport from "@ledgerhq/react-native-hw-transport-ble"

/**
 * Codes to detect if the leder has the clause and contract enabled
 */
export enum LedgerConfig {
    UNKNOWN = "0",
    CLAUSE_AND_CONTRACT_DISABLED = "00",
    CONTRACT_ONLY_ENABLED = "01",
    CLAUSE_ONLY_ENABLED = "02",
    CLAUSE_AND_CONTRACT_ENABLED = "03",
}

/**
 * Parses ledger errors based on common issues
 */
export const ledgerErrorHandler = (err: unknown): LEDGER_ERROR_CODES => {
    if (typeof err === "string" && Object.values(LEDGER_ERROR_CODES).includes(err as LEDGER_ERROR_CODES)) {
        return err as LEDGER_ERROR_CODES
    }

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
    if (err.name.includes("Disconnected") || err.name.includes("disconnected")) {
        return LEDGER_ERROR_CODES.CONNECTING
    }

    if (err.message.includes("0x6985")) {
        return LEDGER_ERROR_CODES.USER_REJECTED
    }

    error(ERROR_EVENTS.LEDGER, err)
    return LEDGER_ERROR_CODES.UNKNOWN
}

/**
 * Response from the verify transport function
 * @category Ledger
 * @property error - The error if there is one
 * @property response - The response, which should be defined, only if there is no error
 */
export type VerifyTransportResponse = {
    appConfig: LedgerConfig
    rootAccount: VETLedgerAccount
    app: VETLedgerApp
}

type VerifyResponse = Promise<Response<VerifyTransportResponse>>

export const verifyTransport = async (
    withTransport: (func: (t: BleTransport) => VerifyResponse) => VerifyResponse,
): VerifyResponse => {
    const res = async (transport: BleTransport): VerifyResponse => {
        const app = new VETLedgerApp(transport)

        try {
            debug(ERROR_EVENTS.LEDGER, "[verifyTransport] - getting configuration")
            const config = await app.getAppConfiguration()
            const appConfig: LedgerConfig = config.toString("hex") as LedgerConfig
            debug(ERROR_EVENTS.LEDGER, "[verifyTransport] - getting root address")
            const rootAccount: VETLedgerAccount = await app.getAddress(DerivationPath.VET, false, true)

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
                err: ledgerErrorHandler(e as Error),
            }
        }
    }

    return await withTransport(res)
}

/**
 * Request a message signature to the ledger device
 * @category Ledger
 * @param index  The index of the account to sign the message with
 * @param message  The message to sign
 * @param device  The device to sign the message with
 * @param withTransport  The transport to perform an action with
 * @returns The signed message
 */

type MessageResponse = Promise<Response<Buffer>>
type ISignMessage = {
    index: number
    message: Buffer
    device: LedgerDevice
    withTransport: (func: (t: BleTransport) => MessageResponse) => MessageResponse
}

const signMessage = async ({ index, message, device, withTransport }: ISignMessage): MessageResponse => {
    debug(ERROR_EVENTS.LEDGER, "Signing message")

    const res = async (transport: BleTransport): MessageResponse => {
        try {
            const vetLedger = new VETLedgerApp(transport)

            await validateRootAddress(device.rootAddress, vetLedger)

            const path = `${DerivationPath.VET}/${index}`
            const signature = await vetLedger.signMessage(path, message)

            return {
                success: true,
                payload: signature,
            }
        } catch (e) {
            error(ERROR_EVENTS.LEDGER, "Error signing message", e)

            return {
                success: false,
                err: ledgerErrorHandler(e),
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
    debug(ERROR_EVENTS.LEDGER, "Signing certificate")

    const res = async (transport: BleTransport): CertResponse => {
        try {
            const vetLedger = new VETLedgerApp(transport)

            await validateRootAddress(device.rootAddress, vetLedger)

            const dataToSign = Buffer.from(Certificate.encode(cert), "utf8")

            const path = `${DerivationPath.VET}/${index}`
            const signature = await vetLedger.signJSON(path, dataToSign)

            return {
                success: true,
                payload: signature,
            }
        } catch (e) {
            error(ERROR_EVENTS.LEDGER, "Error signing transaction", e)

            return {
                success: false,
                err: ledgerErrorHandler(e),
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
    transaction: SDKTransaction,
    device: LedgerDevice,
    withTransport: (func: (t: BleTransport) => TxResponse) => TxResponse,
    onIsAwaitingForSignature: () => void,
    onProgressUpdate?: (progress: number) => void,
): TxResponse => {
    debug(ERROR_EVENTS.LEDGER, "Signing transaction")

    const res = async (transport: BleTransport): TxResponse => {
        const vetLedger = new VETLedgerApp(transport)
        try {
            await validateRootAddress(device.rootAddress, vetLedger)

            const path = `${DerivationPath.VET}/${index}`
            const signature = await vetLedger.signTransaction(
                path,
                Buffer.from(transaction.encoded),
                onIsAwaitingForSignature,
                onProgressUpdate,
            )

            return {
                success: true,
                payload: signature,
            }
        } catch (e) {
            error(ERROR_EVENTS.LEDGER, "Error signing transaction", e)

            return {
                success: false,
                err: ledgerErrorHandler(e),
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
    debug(ERROR_EVENTS.LEDGER, "Getting accounts with balances")

    if (numberOfAccounts < 1) throw new Error("Must get at least 1 account")

    if (!rootAccount.publicKey || !rootAccount.chainCode) throw new Error("Failed to get public key/ chaincode")

    const publicKey = Buffer.from(rootAccount.publicKey, "hex")
    const chainCode = Buffer.from(rootAccount.chainCode, "hex")

    const hdNode = HDNode.fromPublicKey(publicKey, chainCode)

    const accounts: LedgerAccount[] = []

    for (let i = 0; i < numberOfAccounts; i++) {
        const childNode = hdNode.derive(i)

        try {
            const balance = await BalanceUtils.getVetAndVthoBalancesFromBlockchain(childNode.address, network)

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
const validateRootAddress = async (rootAddress: string, vetLedger: VETLedgerApp) => {
    debug(ERROR_EVENTS.LEDGER, "Validating root address")
    const rootAccount = await vetLedger.getAddress(DerivationPath.VET, false, false)

    if (!AddressUtils.compareAddresses(rootAddress, rootAccount.address)) {
        throw LEDGER_ERROR_CODES.WRONG_ROOT_ACCOUNT
    }
}

export default {
    ledgerErrorHandler,
    verifyTransport,
    getAccountsWithBalances,
    signCertificate,
    signTransaction,
    signMessage,
}
