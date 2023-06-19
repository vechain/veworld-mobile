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
    CloseModalButton,
    BaseScrollView,
    AccountCard,
} from "~Components"
import { HDNode, secp256k1, Certificate, blake2b256 } from "thor-devkit"
import {
    selectDevice,
    selectSelectedAccount,
    useAppSelector,
} from "~Storage/Redux"
import {
    CryptoUtils,
    WalletConnectUtils,
    WalletConnectResponseUtils,
} from "~Utils"
import { useCheckIdentity } from "~Hooks"
import { error } from "~Utils/Logger"
import { AccountWithDevice, DEVICE_TYPE, Wallet } from "~Model"
import { useI18nContext } from "~i18n"
import { capitalize } from "lodash"

interface Props {
    sessionRequest: SessionTypes.Struct
    requestEvent: SignClientTypes.EventArguments["session_request"]
    onClose: () => void
    isOpen: boolean
}

export const SignMessageModal = ({
    requestEvent,
    sessionRequest,
    onClose,
    isOpen,
}: Props) => {
    const { web3Wallet } = useWalletConnect()
    const { LL } = useI18nContext()
    const selectedAccount: AccountWithDevice = useAppSelector(
        selectSelectedAccount,
    )
    const selectedDevice = useAppSelector(state =>
        selectDevice(state, selectedAccount.rootAddress),
    )
    // Request values
    const { method, params } =
        WalletConnectUtils.getRequestEventAttributes(requestEvent)
    const { url } =
        WalletConnectUtils.getSessionRequestAttributes(sessionRequest)
    const message = params.payload.content

    const signIdentityCertificate = useCallback(
        async (privateKey: Buffer) => {
            if (!web3Wallet) return
            if (!requestEvent) return

            const cert: Certificate = {
                ...params,
                timestamp: Math.round(Date.now() / 1000),
                domain: new URL(url),
                signer: selectedAccount?.address ?? "",
            }

            const hash = blake2b256(Certificate.encode(cert))
            const signature = secp256k1.sign(hash, privateKey)

            await WalletConnectResponseUtils.signMessageRequestSuccessResponse(
                {
                    request: requestEvent,
                    web3Wallet,
                    LL,
                },
                signature,
                cert,
            )

            //TODO: add to history?

            onClose()
        },
        [selectedAccount, params, url, web3Wallet, onClose, LL, requestEvent],
    )

    const onExtractPrivateKey = useCallback(
        async (decryptedWallet: Wallet) => {
            if (!decryptedWallet)
                throw new Error("Mnemonic wallet can't be empty")

            if (decryptedWallet && !decryptedWallet.mnemonic)
                error("Mnemonic wallet can't have an empty mnemonic")

            if (!selectedAccount.index && selectedAccount.index !== 0)
                throw new Error("Account index is empty")

            const hdNode = HDNode.fromMnemonic(decryptedWallet.mnemonic)
            const derivedNode = hdNode.derive(selectedAccount.index)
            const privateKey = derivedNode.privateKey as Buffer

            return privateKey
        },
        [selectedAccount],
    )

    async function onReject() {
        if (requestEvent) {
            await WalletConnectResponseUtils.userRejectedMethodsResponse({
                request: requestEvent,
                web3Wallet,
                LL,
            })
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

            const privateKey = await onExtractPrivateKey(decryptedWallet)
            await signIdentityCertificate(privateKey)
        },
        [onExtractPrivateKey, selectedDevice, signIdentityCertificate],
    )

    const { ConfirmIdentityBottomSheet, checkIdentityBeforeOpening } =
        useCheckIdentity({
            onIdentityConfirmed,
        })

    return (
        <BaseModal isOpen={isOpen} onClose={onClose}>
            <BaseScrollView
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={[styles.scrollViewContainer]}
                style={styles.scrollView}>
                <CloseModalButton onPress={onClose} />
                <BaseView mx={20} style={styles.alignLeft}>
                    <BaseText typographyFont="title">
                        {"External app request"}
                    </BaseText>

                    <BaseSpacer height={32} />
                    <BaseText typographyFont="subTitle">
                        {"Sign a certificate"}
                    </BaseText>
                    <BaseSpacer height={16} />
                    <BaseText>
                        {
                            "Your Signature is being requested to sign a certificate"
                        }
                    </BaseText>

                    <BaseSpacer height={32} />
                    <BaseText typographyFont="subTitleBold">
                        {"Account"}
                    </BaseText>
                    <BaseSpacer height={16} />
                    <AccountCard account={selectedAccount} />

                    <BaseSpacer height={32} />
                    <BaseView>
                        <BaseText typographyFont="subTitleBold">
                            {LL.SEND_DETAILS()}
                        </BaseText>

                        <BaseSpacer height={16} />
                        <BaseText typographyFont="subTitle">
                            {"Origin"}
                        </BaseText>
                        <BaseSpacer height={8} />
                        <BaseText>{sessionRequest.peer.metadata.name}</BaseText>

                        <BaseSpacer height={16} />
                        <BaseText typographyFont="subTitle">
                            {"Purpose"}
                        </BaseText>
                        <BaseSpacer height={8} />
                        <BaseText>{capitalize(method)}</BaseText>

                        <BaseSpacer height={24} />
                        <BaseText typographyFont="subTitle">
                            {"Content"}
                        </BaseText>
                        <BaseSpacer height={8} />
                        <BaseText>{message}</BaseText>
                    </BaseView>
                </BaseView>
                <BaseSpacer height={48} />
                <BaseView style={styles.footer}>
                    <BaseButton
                        w={100}
                        haptics="light"
                        title={"SIGN"}
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
            </BaseScrollView>
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
        height: "100%",
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
