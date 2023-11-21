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
    getRpcError,
    RequireUserPassword,
    useWalletConnect,
} from "~Components"
import { blake2b256, Certificate } from "thor-devkit"
import {
    addSignCertificateActivity,
    selectSelectedAccount,
    selectVerifyContext,
    setIsAppLoading,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { debug, error, HexUtils } from "~Utils"
import { useAnalyticTracking, useCheckIdentity, useSignMessage } from "~Hooks"
import { AccountWithDevice, DEVICE_TYPE, LedgerAccountWithDevice } from "~Model"
import { useI18nContext } from "~i18n"
import { RootStackParamListSwitch, Routes } from "~Navigation"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { useNavigation } from "@react-navigation/native"
import { MessageDetails, UnknownAppMessage } from "~Screens"
import { AnalyticsEvent } from "~Constants"
import { useInAppBrowser } from "~Components/Providers/InAppBrowserProvider"

type Props = NativeStackScreenProps<
    RootStackParamListSwitch,
    Routes.CONNECTED_APP_SIGN_CERTIFICATE_SCREEN
>

export const SignCertificateScreen: FC<Props> = ({ route }: Props) => {
    const { request } = route.params

    const { processRequest, failRequest } = useWalletConnect()
    const { postMessage } = useInAppBrowser()
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const selectedAccount: AccountWithDevice = useAppSelector(
        selectSelectedAccount,
    )
    const track = useAnalyticTracking()
    const dispatch = useAppDispatch()

    const [isInvalidChecked, setInvalidChecked] = React.useState(false)

    const sessionContext = useAppSelector(state =>
        selectVerifyContext(
            state,
            request.type === "wallet-connect"
                ? request.session.topic
                : undefined,
        ),
    )

    const validConnectedApp = useMemo(() => {
        if (!sessionContext) return true

        return sessionContext.verifyContext.validation === "VALID"
    }, [sessionContext])

    // Prepare certificate to sign
    const cert: Certificate = useMemo(() => {
        return {
            purpose: request.message.purpose,
            payload: request.message.payload,
            timestamp: Math.round(Date.now() / 1000),
            domain: new URL(request.appUrl).hostname,
            signer: selectedAccount?.address ?? "",
        }
    }, [request.message, selectedAccount, request.appUrl])

    const payloadToSign = useMemo(() => {
        return blake2b256(Certificate.encode(cert))
    }, [cert])

    // Sign
    const { signMessage } = useSignMessage({
        hash: payloadToSign,
    })

    const onClose = useCallback(() => {
        nav.navigate(Routes.BROWSER)
    }, [nav])

    const handleAccept = useCallback(
        async (password?: string) => {
            try {
                if (selectedAccount.device.type === DEVICE_TYPE.LEDGER) {
                    nav.navigate(Routes.LEDGER_SIGN_CERTIFICATE, {
                        request,
                        accountWithDevice:
                            selectedAccount as LedgerAccountWithDevice,
                        certificate: cert,
                    })
                    return
                }

                const signature = await signMessage(password)
                if (!signature) {
                    throw new Error("Signature is empty")
                }

                dispatch(setIsAppLoading(true))

                const res: Connex.Vendor.CertResponse = {
                    signature: HexUtils.addPrefix(signature.toString("hex")),
                    annex: {
                        domain: cert.domain,
                        timestamp: cert.timestamp,
                        signer: cert.signer,
                    },
                }

                if (request.type === "wallet-connect") {
                    await processRequest(request.requestEvent, res)
                } else {
                    postMessage({ id: request.id, data: res })
                }

                dispatch(
                    addSignCertificateActivity(
                        request.appName,
                        cert.domain,
                        cert.payload.content,
                        cert.purpose,
                    ),
                )

                track(AnalyticsEvent.DAPP_CERTIFICATE_SUCCESS)

                dispatch(setIsAppLoading(false))
            } catch (err: unknown) {
                track(AnalyticsEvent.DAPP_CERTIFICATE_FAILED)
                error("SignMessageScreen:handleAccept", err)

                if (request.type === "wallet-connect") {
                    await failRequest(
                        request.requestEvent,
                        getRpcError("internal"),
                    )
                } else {
                    postMessage({
                        id: request.id,
                        error: "Internal error",
                    })
                }

                dispatch(setIsAppLoading(false))
            } finally {
                dispatch(setIsAppLoading(false))
            }

            onClose()
        },
        [
            postMessage,
            onClose,
            selectedAccount,
            signMessage,
            request,
            failRequest,
            processRequest,
            cert,
            dispatch,
            track,
            nav,
        ],
    )

    const onReject = useCallback(async () => {
        if (request.type === "wallet-connect") {
            await failRequest(
                request.requestEvent,
                getRpcError("userRejectedRequest"),
            )
        } else {
            postMessage({ id: request.id, error: "User rejected request" })
        }

        track(AnalyticsEvent.DAPP_CERTIFICATE_REJECTED)
        onClose()
    }, [postMessage, request, track, onClose, failRequest])

    const {
        isPasswordPromptOpen,
        handleClosePasswordModal,
        onPasswordSuccess,
        checkIdentityBeforeOpening,
        isBiometricsEmpty,
    } = useCheckIdentity({
        onIdentityConfirmed: handleAccept,
        allowAutoPassword: true,
    })

    const onPressBack = useCallback(async () => {
        await onReject()
    }, [onReject])

    debug({
        isInvalidChecked,
        validConnectedApp,
    })

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

                    <MessageDetails request={request} />

                    <BaseSpacer height={30} />

                    {sessionContext && (
                        <UnknownAppMessage
                            verifyContext={sessionContext.verifyContext}
                            confirmed={isInvalidChecked}
                            setConfirmed={setInvalidChecked}
                        />
                    )}
                </BaseView>

                <BaseSpacer height={30} />

                <BaseView style={styles.footer}>
                    <BaseButton
                        w={100}
                        haptics="Light"
                        title={LL.COMMON_BTN_SIGN()}
                        action={checkIdentityBeforeOpening}
                        /* We must assert that `biometrics` is not empty otherwise we don't know if the user has set biometrics or passcode, thus failing to decrypt the wallet when signing */
                        isLoading={isBiometricsEmpty}
                        disabled={
                            isBiometricsEmpty ||
                            (!validConnectedApp && !isInvalidChecked)
                        }
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

            <RequireUserPassword
                isOpen={isPasswordPromptOpen}
                onClose={handleClosePasswordModal}
                onSuccess={onPasswordSuccess}
            />
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
