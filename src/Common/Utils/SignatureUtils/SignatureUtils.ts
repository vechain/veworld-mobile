// import { WALLET_MODE, DEVICE_TYPE, Device } from "~Model"
// // import * as utils from "thorify/dist/utils"
// // import { address, blake2b256, secp256k1 } from "thor-devkit"
// import { blake2b256 } from "thor-devkit"
// import web3 from "web3"
// import { AddressUtils, veWorldErrors } from "~Common"

// const getSignType = (
//     walletMode: WALLET_MODE,
//     device?: Device,
// ): WALLET_MODE | DEVICE_TYPE.LEDGER => {
//     if (!device)
//         throw veWorldErrors.rpc.internal({ message: "No device selected" })

//     if (device.type === DEVICE_TYPE.LEDGER) return DEVICE_TYPE.LEDGER

//     return walletMode
// }

// //Copied from thorify: https://github.com/vechain/thorify/blob/master/src/extend/accounts.ts
// const recover = (
//     message: string,
//     signature: string,
//     preFixed: boolean,
// ): string => {
//     if (!preFixed) {
//         message = hashMessage(message)
//     }

//     // const hexBuffer = Buffer.from(utils.sanitizeHex(message), "hex")
//     // const signatureBuffer = Buffer.from(utils.sanitizeHex(signature), "hex")
//     // const pubKey = secp256k1.recover(hexBuffer, signatureBuffer)
//     // const addr = address.fromPublicKey(pubKey)

//     // return utils.toPrefixedHex(addr)
//     return ""
// }

// //Copied from thorify: https://github.com/vechain/thorify/blob/master/src/extend/accounts.ts
// const hashMessage = (data: string) => {
//     const message = web3.utils.isHexStrict(data)
//         ? web3.utils.hexToBytes(data)
//         : data
//     const messageBuffer = Buffer.from(message)
//     const prefix = "\u0019VeChain Signed Message:\n" + message.length.toString()
//     const prefixBuffer = Buffer.from(prefix)
//     const prefixedMessage = Buffer.concat([prefixBuffer, messageBuffer])

//     return blake2b256(prefixedMessage).toString("hex")
// }

// const verifySignature = (
//     signingAddress: string,
//     message: string,
//     signature: string,
// ): boolean => {
//     try {
//         // 1. Recover the address from the message and signature
//         const recoveredAddress = recover(message, signature, false)

//         // 2. Compare recovered address with the provided signing address
//         return AddressUtils.compareAddresses(signingAddress, recoveredAddress)
//     } catch (e) {
//         return false
//     }
// }

// export default {
//     getSignType,
//     hashMessage,
//     recover,
//     verifySignature,
// }
