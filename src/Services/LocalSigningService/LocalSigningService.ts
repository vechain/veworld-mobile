import { AppThunk, RootState } from "~Storage/Caches/cache"
import { getVisibleAccounts } from "~Storage/Caches/AccountCache"
import AddressUtils from "~Common/Utils/AddressUtils"
import { getWalletMode } from "~Storage/Caches/SettingsCache"
import { DEVICE_TYPE, WALLET_MODE } from "~Model/Wallet/enums"
import {
    blake2b256,
    Certificate,
    HDNode,
    secp256k1,
    Transaction,
} from "thor-devkit"
import { getAllDevices } from "~Storage/Caches/DeviceCache"
import LocalWalletService from "../LocalWalletService"
import { veWorldErrors } from "~Common/Errors"
import HexUtils from "~Common/Utils/HexUtils"
import { debug, error } from "~Common/Logger/Logger"

const getSigningDevice = (
    accountIndex: number,
    rootAddress: string,
    rootState: RootState,
) => {
    debug("Getting signing device")

    const accounts = getVisibleAccounts(rootState)

    // Get the signing account and validate it
    const signingAccount = accounts.find(
        acc =>
            AddressUtils.compareAddresses(acc.rootAddress, rootAddress) &&
            acc.index === accountIndex,
    )
    if (!signingAccount) {
        throw veWorldErrors.rpc.resourceNotFound({
            message: `No account found for root address: ${rootAddress}`,
        })
    }

    const devices = getAllDevices(rootState)

    const signingDevice = devices.find(
        device =>
            (device.type === DEVICE_TYPE.LOCAL_MNEMONIC ||
                device.type === DEVICE_TYPE.LOCAL_PRIVATE_KEY) &&
            AddressUtils.compareAddresses(device.rootAddress, rootAddress),
    )

    if (!signingDevice) {
        throw veWorldErrors.rpc.resourceNotFound({
            message: `No local device found for root address: ${rootAddress}`,
        })
    }

    return signingDevice
}

const signCertificate =
    (
        accountIndex: number,
        rootAddress: string,
        certificate: Certificate,
        userKey?: string,
    ): AppThunk<Promise<Certificate>> =>
    async dispatch => {
        debug("Signing a certificate")

        try {
            const hash = blake2b256(Certificate.encode(certificate))

            const signature = await dispatch(
                sign(accountIndex, rootAddress, hash, userKey),
            )

            certificate.signature = HexUtils.addPrefix(
                signature.toString("hex"),
            )
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                error: e,
                message: "Failed to sign message",
            })
        }

        return certificate
    }

const signTransaction =
    (
        accountIndex: number,
        rootAddress: string,
        tx: Transaction,
        userKey?: string,
    ): AppThunk<Promise<Transaction>> =>
    async dispatch => {
        debug("Signing a transaction")

        try {
            tx.signature = await dispatch(
                sign(accountIndex, rootAddress, tx.signingHash(), userKey),
            )
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                error: e,
                message: "Failed to sign transaction",
            })
        }

        return tx
    }

const sign =
    (
        accountIndex: number,
        rootAddress: string,
        hash: Buffer,
        userKey?: string,
    ): AppThunk<Promise<Buffer>> =>
    async (_, getState) => {
        debug("Signing a hash")

        const mode = getWalletMode(getState())

        try {
            //1. Unlock the wallet store if needed
            if (mode === WALLET_MODE.ASK_TO_SIGN && userKey)
                LocalWalletService.unlock(userKey)

            //2. Get the signing device
            const device = getSigningDevice(
                accountIndex,
                rootAddress,
                getState(),
            )

            //3. Get the wallet
            const storage = await LocalWalletService.get()

            const wallet = storage.wallets.find(wal =>
                AddressUtils.compareAddresses(
                    wal.rootAddress,
                    device.rootAddress,
                ),
            )
            if (!wallet) {
                throw Error(
                    `No local wallet found with root address ${device.rootAddress}`,
                )
            }

            let privateKey: Buffer

            //4. Get the private key based on the index/ type of wallet
            switch (device.type) {
                case DEVICE_TYPE.LOCAL_PRIVATE_KEY: {
                    if (!wallet.privateKey)
                        throw veWorldErrors.rpc.internal({
                            message:
                                "Private Key wallet can't have an empty private key",
                        })

                    privateKey = Buffer.from(wallet.privateKey, "hex")
                    break
                }
                case DEVICE_TYPE.LOCAL_MNEMONIC: {
                    if (!wallet.mnemonic)
                        throw veWorldErrors.rpc.internal({
                            message:
                                "Mnemonic wallet can't have an empty mnemonic",
                        })

                    const hdNode = HDNode.fromMnemonic(wallet.mnemonic)
                    const derivedNode = hdNode.derive(accountIndex)

                    privateKey = derivedNode.privateKey as Buffer
                    break
                }
                default: {
                    throw veWorldErrors.rpc.invalidRequest({
                        message:
                            "Can't sign locally with wallet type: " +
                            device.type,
                    })
                }
            }

            //5. Sign the data
            return secp256k1.sign(hash, privateKey)
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                error: e,
                message: "Failed to sign transaction",
            })
        } finally {
            if (mode === WALLET_MODE.ASK_TO_SIGN) LocalWalletService.lock()
        }
    }

export default {
    signTransaction,
    signCertificate,
}
