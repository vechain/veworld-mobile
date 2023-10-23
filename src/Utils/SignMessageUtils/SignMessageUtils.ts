import { HexUtils } from "~Utils"
import { address, blake2b256, keccak256, secp256k1 } from "thor-devkit"

type SignMessageChain = "vechain" | "eip155"

const hashMessage = (message: string, chain: SignMessageChain): Buffer => {
    const messageBuffer = Buffer.from(message)
    const prefix =
        chain === "vechain"
            ? "\u0019VeChain Signed Message:\n"
            : "\u0019Ethereum Signed Message:\n"
    const prefixBuffer = Buffer.from(prefix + message.length.toString())
    const prefixedMessage = Buffer.concat([prefixBuffer, messageBuffer])

    return chain === "vechain"
        ? blake2b256(prefixedMessage)
        : keccak256(prefixedMessage)
}

type IRecover = {
    message: string
    signature: string
    chain: SignMessageChain
}

const recover = ({ message, signature, chain }: IRecover): string => {
    const hashedMessage = hashMessage(message, chain)

    const signatureBuffer = Buffer.from(HexUtils.removePrefix(signature), "hex")
    const pubKey = secp256k1.recover(hashedMessage, signatureBuffer)
    return address.fromPublicKey(pubKey)
}

export default {
    hashMessage,
    recover,
}
