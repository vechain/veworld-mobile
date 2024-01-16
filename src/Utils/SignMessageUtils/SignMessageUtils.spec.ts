import SignMessageUtils from "~Utils/SignMessageUtils/SignMessageUtils"
import { HexUtils } from "~Utils"
import { HDNode, secp256k1 } from "thor-devkit"

const mnemonic = "denial kitchen pet squirrel other broom bar gas better priority spoil cross"

const hdNode = HDNode.fromMnemonic(mnemonic.split(" "))

const privateKey = hdNode.derive(0).privateKey as Buffer
const address = hdNode.derive(0).address

describe("SignMessageUtils", () => {
    describe("hashMessage", () => {
        it("should hash utf message", () => {
            const message = "Hello World"
            const chain = "vechain"

            const result = SignMessageUtils.hashMessage(message, chain)

            expect(result.length).toEqual(32)
        })

        it("should hash a hex message", () => {
            const message = HexUtils.generateRandom(128)

            const chain = "vechain"

            const result = SignMessageUtils.hashMessage(message, chain)

            expect(result.length).toEqual(32)
        })
    })

    describe("recover", () => {
        it("should verify a utf message", () => {
            const message = "Hello World"
            const chain = "vechain"

            const messageHash = SignMessageUtils.hashMessage(message, chain)

            const signature = secp256k1.sign(messageHash, privateKey)

            const result = SignMessageUtils.recover({
                message,
                signature: signature.toString("hex"),
                chain,
            })

            expect(result).toEqual(address)
        })
    })
})
