import { LedgerAccount, LedgerDevice, Network } from "~Model"
import { Mutex } from "async-mutex"
import { Certificate, Transaction, HDNode } from "thor-devkit"
import AddressUtils from "../AddressUtils"
import BalanceUtils from "../BalanceUtils"
import VETLedgerApp, {
    VETLedgerAccount,
    VET_DERIVATION_PATH,
} from "~Common/Ledger/VetLedgerApp"
import { debug, error, warn } from "~Common"
import { Buffer } from "buffer"

const ledgerMutex = new Mutex()

/**
 * Request a cwertificate signature to the ledger device
 * @category Ledger
 * @param index  The index of the account to sign the certificate with
 * @param cert  The certificate to sign
 * @param device  The device to sign the certificate with
 * @param vetLedger The ledger app to sign the certificate with
 * @returns The signed certificate
 */
const signCertificate = async (
    index: number,
    cert: Certificate,
    device: LedgerDevice,
    vetLedger: VETLedgerApp,
): Promise<Buffer> => {
    debug("Signing certificate")

    return await ledgerMutex.runExclusive(async () => {
        try {
            await validateRootAddress(device.rootAddress, vetLedger)

            const dataToSign = Buffer.from(Certificate.encode(cert), "utf8")

            const path = `${VET_DERIVATION_PATH}/${index}`
            return await vetLedger.signJSON(path, dataToSign)
        } catch (e) {
            error(e)
            throw new Error("Failed to sign the message")
        } finally {
            vetLedger.transport.close().catch(e => {
                warn(e)
            })
        }
    })
}

/**
 *  Request a transaction signature to the ledger device and return the signature as a buffer
 * @param index  The index of the account to sign the transaction with
 * @param transaction  The transaction to sign
 * @param device  The device to sign the transaction with
 * @param vetLedger  The ledger app to sign the transaction with
 * @param onIsAwaitingForSignature  A callback that is called when the ledger is awaiting for a signature
 * @param onProgressUpdate  A callback that is called when the progress of the signature is updated
 * @returns  The signed transaction
 */
const signTransaction = async (
    index: number,
    transaction: Transaction,
    device: LedgerDevice,
    vetLedger: VETLedgerApp,
    onIsAwaitingForSignature: () => void,
    onProgressUpdate?: (progress: number) => void,
): Promise<Buffer> => {
    debug("Signing transaction")

    return await ledgerMutex.runExclusive(async () => {
        try {
            await validateRootAddress(device.rootAddress, vetLedger)

            const path = `${VET_DERIVATION_PATH}/${index}`
            return await vetLedger.signTransaction(
                path,
                transaction.encode(),
                onIsAwaitingForSignature,
                onProgressUpdate,
            )
        } catch (e) {
            error(e)
            throw new Error("Failed to sign the message")
        } finally {
            vetLedger.transport.close().catch(e => {
                warn(e)
            })
        }
    })
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
    const rootAccount = await vetLedger.getAccount(
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
    getAccountsWithBalances,
    signCertificate,
    signTransaction,
}
