// // TODO: to be ported?
// // import { VET_DERIVATION_PATH } from "~Common/constants/Ledger/LedgerConstants"
// // import VETLedgerApp, { VETLedgerAccount } from "~Common/ledger/VETLedgerApp"

// // TODO: install?
// import { DeviceModel } from "@ledgerhq/devices"

// import { Buffer } from "buffer"
// import { Certificate, HDNode, Transaction } from "thor-devkit"
// import { Mutex } from "async-mutex"
// import { DEVICE_TYPE, Device, LedgerAccounts } from "~Model"
// import {
//     AddressUtils,
//     HexUtils,
//     LedgerConstants,
//     debug,
//     error,
//     veWorldErrors,
//     warn,
// } from "~Common"
// import { AppThunk } from "~Storage/Caches"
// import BalanceService from "~Services/BalanceService"
// import DeviceService from "~Services/DeviceService"
// import AccountService from "~Services/AccountService"

// const ledgerMutex = new Mutex()

// const signCertificate = async (
//     index: number,
//     cert: Certificate,
//     device: Device,
//     vetLedger: VETLedgerApp,
// ): Promise<string> => {
//     debug("Siging certificate")

//     return ledgerMutex.runExclusive(async () => {
//         try {
//             await validateRootAddress(device.rootAddress, vetLedger)

//             const dataToSign = Buffer.from(Certificate.encode(cert), "utf8")

//             const path = `${LedgerConstants.VET_DERIVATION_PATH}/${index}`
//             const signature = await vetLedger.signJSON(path, dataToSign)

//             return HexUtils.addPrefix(signature.toString("hex"))
//         } catch (e) {
//             error(e)
//             throw veWorldErrors.rpc.internal({
//                 error: e,
//                 message: "Failed to sign the message",
//             })
//         } finally {
//             vetLedger.transport.close().catch(e => {
//                 warn(e)
//             })
//         }
//     })
// }

// const signTransaction = async (
//     index: number,
//     transaction: Transaction,
//     device: Device,
//     vetLedger: VETLedgerApp,
//     onIsAwaitingForSignature: () => void,
//     onProgressUpdate?: (progress: number) => void,
// ): Promise<Transaction> => {
//     debug("Signing transaction")

//     return ledgerMutex.runExclusive(async () => {
//         try {
//             await validateRootAddress(device.rootAddress, vetLedger)

//             const path = `${LedgerConstants.VET_DERIVATION_PATH}/${index}`
//             transaction.signature = await vetLedger.signTransaction(
//                 path,
//                 transaction.encode(),
//                 onIsAwaitingForSignature,
//                 onProgressUpdate,
//             )

//             return transaction
//         } catch (e) {
//             error(e)
//             throw veWorldErrors.rpc.internal({
//                 error: e,
//                 message: "Failed to sign the message",
//             })
//         } finally {
//             vetLedger.transport.close().catch(e => {
//                 warn(e)
//             })
//         }
//     })
// }
// /**
//  * Get a number of accounts and their balances
//  *
//  * @param rootAccount - the root account of the ledger (with chaincode)
//  * @param numberOfAccounts - the number of accounts to get. Defaults to 6
//  */
// const getAccountsWithBalances =
//     (
//         rootAccount: VETLedgerAccount,
//         numberOfAccounts = 6,
//     ): AppThunk<Promise<LedgerAccounts>> =>
//     async dispatch => {
//         debug("Getting accounts with balances")

//         if (numberOfAccounts < 1) {
//             throw veWorldErrors.rpc.invalidRequest({
//                 message: "Must get at least 1 account",
//             })
//         }

//         if (!rootAccount.publicKey || !rootAccount.chainCode) {
//             throw veWorldErrors.rpc.internal({
//                 message: "Failed to get public key/ chaincode",
//             })
//         }

//         const publicKey = Buffer.from(rootAccount.publicKey, "hex")
//         const chainCode = Buffer.from(rootAccount.chainCode, "hex")

//         const hdNode = HDNode.fromPublicKey(publicKey, chainCode)

//         const accounts: LedgerAccounts = {
//             balances: [],
//         }

//         for (let i = 0; i < numberOfAccounts; i++) {
//             const childNode = hdNode.derive(i)
//             const balance = await dispatch(
//                 BalanceService.getVetAndVthoBalancesFromBlockchain(
//                     childNode.address,
//                 ),
//             )
//             accounts.balances.push({ ...balance, address: childNode.address })
//         }

//         return accounts
//     }

// const addLedgerDevice =
//     (
//         rootAccount: VETLedgerAccount,
//         deviceModel: DeviceModel,
//         selectedAccounts?: number[],
//     ): AppThunk<Promise<string>> =>
//     async dispatch => {
//         debug("Add a ledger device")

//         try {
//             if (!rootAccount.chainCode) {
//                 throw veWorldErrors.rpc.internal({
//                     message: "Failed to extract chaincode from ledger device",
//                 })
//             }

//             //Create the new ledger device and persist it
//             const newDevice: Device = {
//                 xPub: {
//                     publicKey: rootAccount.publicKey,
//                     chainCode: rootAccount.chainCode,
//                 },
//                 rootAddress: rootAccount.address,
//                 type: DEVICE_TYPE.LEDGER,
//                 alias: deviceModel.productName,
//             }

//             // Store the device
//             await dispatch(DeviceService.add(newDevice))

//             // Add accounts
//             await dispatch(
//                 AccountService.addForNewDevice(newDevice, selectedAccounts),
//             )

//             return newDevice.rootAddress
//         } catch (e) {
//             error(e)
//             throw veWorldErrors.rpc.internal({
//                 error: e,
//                 message: "Failed to add ledger device",
//             })
//         }
//     }

// /**
//  * Validates that the root account on the ledger matches that of our XPub
//  *
//  * @param rootAddress - the address to validate
//  * @param vetLedger - the current connection to the ledger
//  *
//  * @throws an error if the ledger does not contain the expected account
//  */
// const validateRootAddress = async (
//     rootAddress: string,
//     vetLedger: VETLedgerApp,
// ) => {
//     debug("Validating root address")
//     const rootAccount = await vetLedger.getAccount(
//         LedgerConstants.VET_DERIVATION_PATH,
//         false,
//         false,
//     )

//     if (!AddressUtils.compareAddresses(rootAddress, rootAccount.address)) {
//         throw veWorldErrors.rpc.invalidRequest({
//             message: "ledger_does_not_match_account",
//         })
//     }
// }

// export default {
//     signTransaction,
//     signCertificate,
//     addLedgerDevice,
//     getAccountsWithBalances,
// }
