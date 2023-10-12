import { logger, Wallet } from "ethers"
import {
    arrayify,
    computeAddress,
    concat,
    defaultPath,
    entropyToMnemonic,
    getAddress,
    HDNode,
    hexlify,
    keccak256,
    Logger,
} from "ethers/lib/utils"
import { ExternallyOwnedAccount } from "@ethersproject/abstract-signer"
import { isKeystoreWallet } from "@ethersproject/json-wallets"
import {
    _KeystoreAccount,
    KeystoreAccount,
} from "@ethersproject/json-wallets/lib/keystore"
import aes from "aes-js"
const Buffer = require("@craftzdog/react-native-buffer").Buffer
import scrypt from "react-native-scrypt"
import { DEVICE_CREATION_ERRORS as ERRORS } from "~Model"
import { error } from "~Utils/Logger"

const fastKeystoreDecrypt = async (
    json: string,
    password: string,
): Promise<Wallet> => {
    const account = await decryptJsonWallet(json, password)
    return new Wallet(account)
}

function decryptJsonWallet(
    json: string,
    password: string,
): Promise<ExternallyOwnedAccount> {
    if (isKeystoreWallet(json)) {
        return decrypt(json, password)
    }
    return Promise.reject(new Error("invalid JSON wallet"))
}

async function decrypt(
    json: string,
    password: string,
): Promise<KeystoreAccount> {
    const data = JSON.parse(json)

    const key: Uint8Array | undefined = await _computeKdfKey(data, password)

    if (!key) {
        throw new Error("Error computing KDF key")
    }

    return _getAccount(data, key)
}

async function _computeKdfKey(data: any, password: string) {
    const kdf = searchPath(data, "crypto/kdf")

    if (kdf && typeof kdf === "string") {
        const throwError = function (name: string, value: any): any {
            return {
                title: "invalid key-derivation function parameters",
                name,
                value,
            }
        }

        if (kdf.toLowerCase() === "scrypt") {
            const salt = looseArrayify(
                searchPath(data, "crypto/kdfparams/salt")!,
            )

            const N = parseInt(searchPath(data, "crypto/kdfparams/n")!, 10)
            const r = parseInt(searchPath(data, "crypto/kdfparams/r")!, 10)
            const p = parseInt(searchPath(data, "crypto/kdfparams/p")!, 10)

            // Check for all required parameters
            if (!N || !r || !p) {
                throwError("kdf", kdf)
            }

            // Make sure N is a power of 2
            // eslint-disable-next-line no-bitwise
            if ((N & (N - 1)) !== 0) {
                throwError("N", N)
            }

            const dkLen = parseInt(
                searchPath(data, "crypto/kdfparams/dklen")!,
                10,
            )
            if (dkLen !== 32) {
                throwError("dklen", dkLen)
            }

            const _key = await scrypt(
                Buffer.from(password).toString("base64"),
                Buffer.from(salt).toString("base64"),
                N,
                r,
                p,
                64,
                "base64",
            )

            return arrayify(Buffer.from(_key, "base64"))
        }
    }
}

function _getAccount(data: any, key: Uint8Array): KeystoreAccount {
    const ciphertext = looseArrayify(searchPath(data, "crypto/ciphertext")!)

    const computedMAC = hexlify(
        keccak256(concat([key.slice(16, 32), ciphertext])),
    ).substring(2)

    if (computedMAC !== searchPath(data, "crypto/mac")?.toLowerCase()) {
        throw new Error(ERRORS.INCORRECT_PASSWORD)
    }

    const privateKey = _decrypt(data, key.slice(0, 16), ciphertext)

    if (!privateKey) {
        logger.throwError(
            "unsupported cipher",
            Logger.errors.UNSUPPORTED_OPERATION,
            {
                operation: "decrypt",
            },
        )
    }

    const mnemonicKey = key.slice(32, 64)

    const address = computeAddress(privateKey)

    if (data.address) {
        let check = data.address.toLowerCase()
        if (check.substring(0, 2) !== "0x") {
            check = "0x" + check
        }

        if (getAddress(check) !== address) {
            throw new Error("address mismatch")
        }
    }

    const account: _KeystoreAccount = {
        _isKeystoreAccount: true,
        address: address,
        privateKey: hexlify(privateKey),
    }

    // Version 0.1 x-ethers metadata must contain an encrypted mnemonic phrase
    if (searchPath(data, "x-ethers/version") === "0.1") {
        const mnemonicCiphertext = looseArrayify(
            searchPath(data, "x-ethers/mnemonicCiphertext")!,
        )
        const mnemonicIv = looseArrayify(
            searchPath(data, "x-ethers/mnemonicCounter")!,
        )

        const mnemonicCounter = new aes.Counter(mnemonicIv)
        const mnemonicAesCtr = new aes.ModeOfOperation.ctr(
            mnemonicKey,
            mnemonicCounter,
        )

        const path = searchPath(data, "x-ethers/path") ?? defaultPath
        const locale = searchPath(data, "x-ethers/locale") ?? "en"

        const entropy = arrayify(mnemonicAesCtr.decrypt(mnemonicCiphertext))

        try {
            const mnemonic = entropyToMnemonic(entropy, locale)
            const node = HDNode.fromMnemonic(
                mnemonic,
                undefined,
                locale,
            ).derivePath(path)

            if (node.privateKey !== account.privateKey) {
                throw new Error("mnemonic mismatch")
            }

            account.mnemonic = node.mnemonic
        } catch (err: unknown) {
            // If we don't have the locale wordlist installed to
            // read this mnemonic, just bail and don't set the
            // mnemonic
            error(err)
        }
    }

    return new KeystoreAccount(account)
}

//

//

//

//

// ~ Utils

function looseArrayify(hexString: string): Uint8Array {
    if (typeof hexString === "string" && !hexString.startsWith("0x")) {
        hexString = "0x" + hexString
    }
    return arrayify(hexString)
}

function searchPath(object: any, path: string): string | null {
    let currentChild = object

    const comps = path.toLowerCase().split("/")
    for (const element of comps) {
        // Search for a child object with a case-insensitive matching key
        let matchingChild = null
        for (const key in currentChild) {
            if (key.toLowerCase() === element) {
                matchingChild = currentChild[key]
                break
            }
        }

        // Didn't find one. :'(
        if (matchingChild === null) {
            return null
        }

        // Now check this child...
        currentChild = matchingChild
    }

    return currentChild
}

function _decrypt(
    data: any,
    key: Uint8Array,
    ciphertext: Uint8Array,
): Uint8Array | undefined {
    const cipher = searchPath(data, "crypto/cipher")
    if (cipher === "aes-128-ctr") {
        const iv = looseArrayify(searchPath(data, "crypto/cipherparams/iv")!)
        const counter = new aes.Counter(iv)

        const aesCtr = new aes.ModeOfOperation.ctr(key, counter)

        return arrayify(aesCtr.decrypt(ciphertext))
    }
}

export default fastKeystoreDecrypt
