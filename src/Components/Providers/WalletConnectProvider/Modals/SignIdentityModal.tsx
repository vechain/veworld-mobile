import { SessionTypes, SignClientTypes } from "@walletconnect/types"
import React, { useCallback } from "react"
import { StyleSheet } from "react-native"
import {
    BaseText,
    BaseButton,
    BaseView,
    useWalletConnect,
    BaseSpacer,
    showWarningToast,
    BaseModal,
    showSuccessToast,
    CloseModalButton,
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
import { ScrollView } from "react-native-gesture-handler"
import { capitalize } from "lodash"

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
    const { method, params, topic } =
        WalletConnectUtils.getRequestEventAttributes(requestEvent)
    const { name, url } =
        WalletConnectUtils.getSessionRequestAttributes(sessionRequest)
    const message = params.payload.content

    const signIdentityCertificate = useCallback(
        async (id: number, privateKey: Buffer) => {
            if (!web3Wallet) return

            const cert: Certificate = {
                ...params,
                timestamp: Math.round(Date.now() / 1000),
                domain: new URL(url),
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
            showSuccessToast(LL.NOTIFICATION_wallet_connect_sign_success())
        },
        [account, params, url, topic, web3Wallet, onClose, LL],
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
            <CloseModalButton onPress={onClose} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentInsetAdjustmentBehavior="never"
                contentContainerStyle={[styles.scrollViewContainer]}
                style={styles.scrollView}>
                <BaseView mx={20} style={styles.alignLeft}>
                    <BaseText typographyFont="title">
                        {"Connected app"}
                    </BaseText>

                    <BaseSpacer height={8} />
                    <BaseText typographyFont="subSubTitleLight">
                        {
                            "Your Signature is being requested to sign a certificate"
                        }
                    </BaseText>

                    <BaseSpacer height={24} />
                    <BaseView>
                        <BaseText typographyFont="subTitleBold">
                            {LL.SEND_DETAILS()}
                        </BaseText>
                        <BaseSpacer height={16} />
                        <BaseText typographyFont="subTitleLight">
                            {"From"}
                        </BaseText>
                        <BaseSpacer height={8} />
                        <BaseText>{name}</BaseText>

                        <BaseSpacer height={24} />
                        <BaseText typographyFont="subTitleLight">
                            {"Purpose"}
                        </BaseText>
                        <BaseSpacer height={8} />
                        <BaseText>{capitalize(method)}</BaseText>

                        <BaseSpacer height={24} />
                        <BaseText typographyFont="subTitleLight">
                            {"Content:"}
                        </BaseText>
                        <BaseSpacer height={8} />
                        <BaseText>{message}</BaseText>
                    </BaseView>
                </BaseView>
            </ScrollView>
            <BaseSpacer height={24} />
            <BaseView style={styles.footer}>
                <BaseButton
                    w={100}
                    haptics="light"
                    title={"ACCEPT"}
                    action={checkIdentityBeforeOpening}
                />
                <BaseSpacer height={16} />
                <BaseButton
                    w={100}
                    haptics="light"
                    variant="outline"
                    title={"REJECT"}
                    action={onReject}
                />
            </BaseView>
            <ConfirmIdentityBottomSheet />
        </BaseModal>
    )
}

const styles = StyleSheet.create({
    dappLogo: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginVertical: 4,
    },
    alignLeft: {
        alignSelf: "flex-start",
    },
    scrollViewContainer: {
        width: "100%",
        height: "60%",
    },
    scrollView: {
        width: "100%",
    },
    footer: {
        width: "100%",
        alignItems: "center",
        paddingLeft: 20,
        paddingRight: 20,
    },
    separator: {
        borderWidth: 0.5,
        borderColor: "#0B0043",
        opacity: 0.56,
    },
})
