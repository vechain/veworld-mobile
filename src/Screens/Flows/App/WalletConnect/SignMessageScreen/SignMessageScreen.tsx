import React, { FC, useCallback, useMemo } from "react"
import { StyleSheet, ScrollView } from "react-native"
import {
    BaseText,
    BaseButton,
    BaseView,
    useWalletConnect,
    BaseSpacer,
    CloseModalButton,
    AccountCard,
    BaseSafeArea,
} from "~Components"
import { Certificate, blake2b256 } from "thor-devkit"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { WalletConnectUtils, WalletConnectResponseUtils, error } from "~Utils"
import { useCheckIdentity, useSignMessage } from "~Hooks"
import { AccountWithDevice, DEVICE_TYPE, LedgerAccountWithDevice } from "~Model"
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
    const nav = useNavigation()
    const selectedAccount: AccountWithDevice = useAppSelector(
        selectSelectedAccount,
    )

    // Request values
    const { params } =
        WalletConnectUtils.getRequestEventAttributes(requestEvent)
    const { url } =
        WalletConnectUtils.getSessionRequestAttributes(sessionRequest)

    // Prepare certificate to sign
    const cert: Certificate = useMemo(() => {
        return {
            ...params,
            timestamp: Math.round(Date.now() / 1000),
            domain: new URL(url),
            signer: selectedAccount?.address ?? "",
        }
    }, [params, url, selectedAccount])

    const payloadToSign = useMemo(() => {
        return blake2b256(Certificate.encode(cert))
    }, [cert])

    // Sign
    const { signMessage } = useSignMessage({
        hash: payloadToSign,
    })

    const onClose = useCallback(() => {
        nav.goBack()
    }, [nav])

    const handleOnConfirm = () => {
        if (selectedAccount.device.type === DEVICE_TYPE.LEDGER) {
            nav.navigate(Routes.LEDGER_SIGN_MESSAGE_SCREEN, {
                accountWithDevice: selectedAccount as LedgerAccountWithDevice,
                certificate: cert,
                initialRoute: Routes.HOME,
                origin: "walletConnect",
                requestEvent,
            })
        } else checkIdentityBeforeOpening()
    }

    const signCertificate = useCallback(
        async (password?: string) => {
            try {
                const signature = await signMessage(password)
                if (!signature) {
                    throw new Error("Signature is empty")
                }

                //TODO: add to history

                await WalletConnectResponseUtils.signMessageRequestSuccessResponse(
                    {
                        request: requestEvent,
                        web3Wallet,
                        LL,
                    },
                    signature,
                    cert,
                )
            } catch (err: unknown) {
                error(err)
                await WalletConnectResponseUtils.signMessageRequestErrorResponse(
                    {
                        request: requestEvent,
                        web3Wallet,
                        LL,
                    },
                )
            }

            onClose()
        },
        [signMessage, requestEvent, web3Wallet, LL, cert, onClose],
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

    const { ConfirmIdentityBottomSheet, checkIdentityBeforeOpening } =
        useCheckIdentity({
            onIdentityConfirmed: signCertificate,
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
                    <AccountCard
                        account={selectedAccount}
                        showOpacityWhenDisabled={false}
                    />

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
                        action={handleOnConfirm}
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
