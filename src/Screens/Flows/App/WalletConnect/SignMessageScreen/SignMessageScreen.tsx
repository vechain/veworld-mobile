import React, { FC, useCallback } from "react"
import { StyleSheet, ScrollView } from "react-native"
import {
    BaseText,
    BaseButton,
    BaseView,
    useWalletConnect,
    BaseSpacer,
    showWarningToast,
    CloseModalButton,
    AccountCard,
    BaseSafeArea,
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
import { RootStackParamListSwitch, Routes } from "~Navigation"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { useNavigation } from "@react-navigation/native"
import { MessageDetails } from "./Components"

type Props = NativeStackScreenProps<
    RootStackParamListSwitch,
    Routes.CONNECTED_APP_SIGN_MESSAGE_SCREEN
>

export const SignMessageScreen: FC<Props> = ({ route }: Props) => {
    const requestEvent = route.params.requestEvent
    const sessionRequest = route.params.session

    const { web3Wallet } = useWalletConnect()
    const { LL } = useI18nContext()
    const selectedAccount: AccountWithDevice = useAppSelector(
        selectSelectedAccount,
    )
    const selectedDevice = useAppSelector(state =>
        selectDevice(state, selectedAccount.rootAddress),
    )
    const nav = useNavigation()

    // Request values
    const { params } =
        WalletConnectUtils.getRequestEventAttributes(requestEvent)
    const { url } =
        WalletConnectUtils.getSessionRequestAttributes(sessionRequest)

    const onClose = useCallback(() => {
        nav.goBack()
    }, [nav])

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

    const onReject = useCallback(async () => {
        if (requestEvent) {
            await WalletConnectResponseUtils.userRejectedMethodsResponse({
                request: requestEvent,
                web3Wallet,
                LL,
            })
        }

        onClose()
    }, [requestEvent, web3Wallet, LL, onClose])

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

    const onPressBack = useCallback(async () => {
        await onReject()
    }, [onReject])

    return (
        <BaseSafeArea>
            <ScrollView
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={[styles.scrollViewContainer]}
                style={styles.scrollView}>
                <CloseModalButton onPress={onPressBack} />
                <BaseView mx={20} style={styles.alignLeft}>
                    <BaseText typographyFont="title">
                        {LL.CONNECTED_APP_REQUEST()}
                    </BaseText>

                    <BaseSpacer height={32} />
                    <BaseText typographyFont="subTitle">
                        {LL.CONNECTED_APP_SIGN_REQUEST_TITLE()}
                    </BaseText>
                    <BaseSpacer height={16} />
                    <BaseText>
                        {LL.CONNECTED_APP_SIGN_REQUEST_DESCRIPTION()}
                    </BaseText>

                    <BaseSpacer height={32} />
                    <BaseText typographyFont="subTitleBold">
                        {LL.CONNECTED_APP_SELECTED_ACCOUNT_LABEL()}
                    </BaseText>
                    <BaseSpacer height={16} />
                    <AccountCard account={selectedAccount} />

                    <BaseSpacer height={32} />
                    <MessageDetails
                        sessionRequest={sessionRequest}
                        requestEvent={requestEvent}
                    />
                </BaseView>

                <BaseSpacer height={48} />
                <BaseView style={styles.footer}>
                    <BaseButton
                        w={100}
                        haptics="light"
                        title={LL.COMMON_BTN_SIGN()}
                        action={checkIdentityBeforeOpening}
                    />
                    <BaseSpacer height={16} />
                    <BaseButton
                        w={100}
                        haptics="light"
                        variant="outline"
                        title={LL.COMMON_BTN_REJECT()}
                        action={onReject}
                    />
                </BaseView>
            </ScrollView>
            <ConfirmIdentityBottomSheet />
        </BaseSafeArea>
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
