import React, { FC, useCallback, useMemo } from "react"
import { ScrollView, StyleSheet } from "react-native"
import {
    AccountCard,
    BaseButton,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    CloseModalButton,
    useWalletConnect,
} from "~Components"
import { blake2b256, Certificate } from "thor-devkit"
import {
    addSignCertificateActivity,
    selectSelectedAccount,
    setIsAppLoading,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { error, WalletConnectResponseUtils, WalletConnectUtils } from "~Utils"
import { useAnalyticTracking, useCheckIdentity, useSignMessage } from "~Hooks"
import { AccountWithDevice, DEVICE_TYPE, LedgerAccountWithDevice } from "~Model"
import { useI18nContext } from "~i18n"
import { RootStackParamListSwitch, Routes } from "~Navigation"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { useNavigation } from "@react-navigation/native"
import { MessageDetails } from "~Screens"
import { AnalyticsEvent } from "~Constants"

type Props = NativeStackScreenProps<
    RootStackParamListSwitch,
    Routes.CONNECTED_APP_SIGN_CERTIFICATE_SCREEN
>

export const SignCertificateScreen: FC<Props> = ({ route }: Props) => {
    const { requestEvent, session, message } = route.params

    const { web3Wallet } = useWalletConnect()
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const selectedAccount: AccountWithDevice = useAppSelector(
        selectSelectedAccount,
    )
    const track = useAnalyticTracking()
    const dispatch = useAppDispatch()

    // Request values
    const { url } = WalletConnectUtils.getSessionRequestAttributes(session)

    // Prepare certificate to sign
    const cert: Certificate = useMemo(() => {
        return {
            purpose: message.purpose,
            payload: message.payload,
            timestamp: Math.round(Date.now() / 1000),
            domain: new URL(url).hostname,
            signer: selectedAccount?.address ?? "",
        }
    }, [message, selectedAccount, url])

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

    const handleAccept = useCallback(
        async (password?: string) => {
            try {
                if (selectedAccount.device.type === DEVICE_TYPE.LEDGER) {
                    nav.navigate(Routes.LEDGER_SIGN_CERTIFICATE, {
                        requestEvent,
                        accountWithDevice:
                            selectedAccount as LedgerAccountWithDevice,
                        certificate: cert,
                        //TODO: What should initialRoute be?
                        initialRoute: Routes.HOME,
                    })
                    return
                }

                const signature = await signMessage(password)
                if (!signature) {
                    throw new Error("Signature is empty")
                }

                dispatch(setIsAppLoading(true))

                await WalletConnectResponseUtils.signMessageRequestSuccessResponse(
                    {
                        request: requestEvent,
                        web3Wallet,
                        LL,
                    },
                    signature,
                    cert,
                )

                // refactor(Minimizer): issues with iOS 17 & Android when connecting to desktop DApp (https://github.com/vechainfoundation/veworld-mobile/issues/951)
                // MinimizerUtils.goBack()

                dispatch(
                    addSignCertificateActivity(
                        session.peer.metadata.name,
                        cert.domain,
                        cert.payload.content,
                        cert.purpose,
                    ),
                )

                track(AnalyticsEvent.DAPP_CERTIFICATE_SUCCESS)
            } catch (err: unknown) {
                track(AnalyticsEvent.DAPP_CERTIFICATE_FAILED)
                error("SignMessageScreen:handleAccept", err)

                await WalletConnectResponseUtils.signMessageRequestErrorResponse(
                    {
                        request: requestEvent,
                        web3Wallet,
                        LL,
                    },
                )
            } finally {
                dispatch(setIsAppLoading(false))
            }

            onClose()
        },
        [
            onClose,
            selectedAccount,
            signMessage,
            requestEvent,
            web3Wallet,
            LL,
            cert,
            dispatch,
            session.peer.metadata.name,
            track,
            nav,
        ],
    )

    const onReject = useCallback(async () => {
        if (requestEvent) {
            await WalletConnectResponseUtils.userRejectedMethodsResponse({
                request: requestEvent,
                web3Wallet,
                LL,
            })
        }
        track(AnalyticsEvent.DAPP_CERTIFICATE_REJECTED)
        onClose()
    }, [requestEvent, track, onClose, web3Wallet, LL])

    const {
        ConfirmIdentityBottomSheet,
        checkIdentityBeforeOpening,
        isBiometricsEmpty,
    } = useCheckIdentity({
        onIdentityConfirmed: handleAccept,
        allowAutoPassword: true,
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
                        sessionRequest={session}
                        requestEvent={requestEvent}
                        message={message}
                    />
                </BaseView>

                <BaseSpacer height={48} />
                <BaseView style={styles.footer}>
                    <BaseButton
                        w={100}
                        haptics="Light"
                        title={LL.COMMON_BTN_SIGN()}
                        action={checkIdentityBeforeOpening}
                        /* We must assert that `biometrics` is not empty otherwise we don't know if the user has set biometrics or passcode, thus failing to decrypt the wallet when signing */
                        isLoading={isBiometricsEmpty}
                        disabled={isBiometricsEmpty}
                    />
                    <BaseSpacer height={16} />
                    <BaseButton
                        w={100}
                        haptics="Light"
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
