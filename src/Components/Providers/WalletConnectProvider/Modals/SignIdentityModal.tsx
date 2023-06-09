import { SessionTypes, SignClientTypes } from "@walletconnect/types"
import React, { useCallback } from "react"
import { Image, StyleSheet } from "react-native"
import {
    BaseText,
    BaseButton,
    BaseView,
    useWalletConnect,
    BaseSpacer,
    showWarningToast,
    BaseModal,
    showSuccessToast,
} from "~Components"
import { HDNode, secp256k1, Certificate, blake2b256 } from "thor-devkit"
import {
    useAppSelector,
    selectDevice,
    selectSelectedAccount,
} from "~Storage/Redux"
import { HexUtils, CryptoUtils, WalletConnectUtils } from "~Utils"
import { useCheckIdentity, error } from "~Common"
import { DEVICE_TYPE, Wallet } from "~Model"
import { formatJsonRpcError } from "@json-rpc-tools/utils"
import { getSdkError } from "@walletconnect/utils"
import { useI18nContext } from "~i18n"

interface Props {
    sessionRequest: SessionTypes.Struct
    requestEvent: SignClientTypes.EventArguments["session_request"]
    onClose: () => void
    isOpen: boolean
}

export const SignIdentityModal = ({
    requestEvent,
    sessionRequest,
    onClose,
    isOpen,
}: Props) => {
    const { web3Wallet } = useWalletConnect()
    const account = useAppSelector(selectSelectedAccount)
    const selectedDevice = useAppSelector(state =>
        selectDevice(state, account.rootAddress),
    )
    const { LL } = useI18nContext()

    // Request values
    const { chainId, method, params, topic } =
        WalletConnectUtils.getRequestEventAttributes(requestEvent)
    const { requestName, requestIcon, requestURL } =
        WalletConnectUtils.getSessionRequestAttributes(sessionRequest)
    const message = params.payload.content

    const signIdentityCertificate = useCallback(
        async (id: number, privateKey: Buffer) => {
            if (!web3Wallet) return

            const cert: Certificate = {
                ...params,
                timestamp: Math.round(Date.now() / 1000),
                domain: new URL(requestURL),
                signer: account?.address ?? "",
            }

            const hash = blake2b256(Certificate.encode(cert))
            const signature = secp256k1.sign(hash, privateKey)

            await web3Wallet.respondSessionRequest({
                topic,
                response: {
                    id,
                    jsonrpc: "2.0",
                    result: {
                        annex: {
                            timestamp: cert.timestamp,
                            domain: cert.domain,
                            signer: cert.signer,
                        },
                        signature: HexUtils.addPrefix(
                            signature.toString("hex"),
                        ),
                    },
                },
            })

            //TODO: add to history?

            onClose()
            showSuccessToast(LL.NOTIFICATION_wallet_connect_identity_signed())
        },
        [account, params, requestURL, topic, web3Wallet, onClose, LL],
    )

    const onApprove = useCallback(
        async (decryptedWallet: Wallet) => {
            if (!requestEvent) return

            const { id } = requestEvent

            if (!decryptedWallet)
                throw new Error("Mnemonic wallet can't be empty")

            if (decryptedWallet && !decryptedWallet.mnemonic)
                error("Mnemonic wallet can't have an empty mnemonic")

            if (!account.index && account.index !== 0)
                throw new Error("Account index is empty")

            const hdNode = HDNode.fromMnemonic(decryptedWallet.mnemonic)
            const derivedNode = hdNode.derive(account.index)
            const privateKey = derivedNode.privateKey as Buffer

            await signIdentityCertificate(id, privateKey)
        },
        [account, requestEvent, signIdentityCertificate],
    )

    async function onReject() {
        if (requestEvent) {
            const { id } = requestEvent
            const response = formatJsonRpcError(
                id,
                getSdkError("USER_REJECTED_METHODS").message,
            )

            try {
                await web3Wallet?.respondSessionRequest({
                    topic,
                    response,
                })
            } catch (err: unknown) {
                error(err)
            }
        }

        onClose()
    }

    const onIdentityConfirmed = useCallback(
        async (password?: string) => {
            if (!selectedDevice) return

            //TODO: support ledger
            if (selectedDevice.type === DEVICE_TYPE.LEDGER) {
                showWarningToast("Hardware wallet not supported yet")
                return
            }

            //local mnemonic, identity already verified via useCheckIdentity
            if (!selectedDevice.wallet) {
                // TODO: support hardware wallet
                showWarningToast("Hardware wallet not supported yet")
            }
            const { decryptedWallet } = await CryptoUtils.decryptWallet(
                selectedDevice,
                password,
            )

            onApprove(decryptedWallet)
        },
        [onApprove, selectedDevice],
    )

    const { ConfirmIdentityBottomSheet, checkIdentityBeforeOpening } =
        useCheckIdentity({
            onIdentityConfirmed,
        })

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            animationType="fade"
            presentationStyle="overFullScreen">
            <BaseView alignItems="center" justifyContent="center">
                <BaseText typographyFont="subTitleBold">
                    {"Session Request"}
                </BaseText>
            </BaseView>
            <BaseView>
                <BaseView alignItems="center" justifyContent="center">
                    <Image
                        style={styles.dappLogo}
                        source={{
                            uri: requestIcon,
                        }}
                    />
                    <BaseText>{requestName}</BaseText>
                    <BaseText>{requestURL}</BaseText>
                </BaseView>

                <BaseSpacer height={24} />

                <BaseText>
                    {"Chains: "}
                    {chainId}
                </BaseText>

                <BaseSpacer height={24} />

                <BaseView>
                    <BaseText>{"Method:"}</BaseText>
                    <BaseText>{method}</BaseText>
                </BaseView>

                <BaseSpacer height={24} />

                <BaseView>
                    <BaseText>{"Message:"}</BaseText>
                    <BaseText>{message}</BaseText>
                </BaseView>

                <BaseSpacer height={24} />

                <BaseView
                    alignItems="center"
                    justifyContent="center"
                    flexDirection="row">
                    <BaseButton action={onReject} title="Cancel" />
                    <BaseButton
                        title="Accept"
                        action={checkIdentityBeforeOpening}
                    />
                </BaseView>
            </BaseView>
            <ConfirmIdentityBottomSheet />
        </BaseModal>
    )
}

const styles = StyleSheet.create({
    dappLogo: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginVertical: 4,
    },
})
