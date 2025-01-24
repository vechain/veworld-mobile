import { useNavigation } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { FC, useCallback, useMemo, useRef } from "react"
import { ScrollView, StyleSheet } from "react-native"
import { blake2b256, Certificate } from "thor-devkit"
import {
    AccountCard,
    BackButtonHeader,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    getRpcError,
    RequireUserPassword,
    SelectAccountBottomSheet,
    SignAndReject,
    SignAndRejectRefInterface,
    useInAppBrowser,
    useWalletConnect,
} from "~Components"
import { AnalyticsEvent, ERROR_EVENTS, RequestMethods } from "~Constants"
import {
    useAnalyticTracking,
    useBottomSheetModal,
    useCheckIdentity,
    useSetSelectedAccount,
    useSignMessage,
    useThemedStyles,
} from "~Hooks"
import { useI18nContext } from "~i18n"
import { AccountWithDevice, DEVICE_TYPE, LedgerAccountWithDevice, WatchedAccount } from "~Model"
import { RootStackParamListSwitch, Routes } from "~Navigation"
import { MessageDetails, UnknownAppMessage } from "~Screens"
import {
    addSignCertificateActivity,
    selectVerifyContext,
    setIsAppLoading,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { error, HexUtils } from "~Utils"
import { useObservedAccountExclusion } from "../Hooks"

type Props = NativeStackScreenProps<RootStackParamListSwitch, Routes.CONNECTED_APP_SIGN_CERTIFICATE_SCREEN>

export const SignCertificateScreen: FC<Props> = ({ route }: Props) => {
    const { request } = route.params

    const { processRequest, failRequest } = useWalletConnect()
    const { postMessage } = useInAppBrowser()
    const { LL } = useI18nContext()
    const { styles } = useThemedStyles(baseStyles)
    const nav = useNavigation()

    const {
        ref: selectAccountBottomSheetRef,
        onOpen: openSelectAccountBottomSheet,
        onClose: closeSelectAccountBottonSheet,
    } = useBottomSheetModal()

    const { visibleAccounts, selectedAccount, onSubmit } = useObservedAccountExclusion({
        openSelectAccountBottomSheet,
    })

    const { onSetSelectedAccount } = useSetSelectedAccount()
    const track = useAnalyticTracking()
    const dispatch = useAppDispatch()

    const [isInvalidChecked, setInvalidChecked] = React.useState(false)

    const setSelectedAccount = (account: AccountWithDevice | WatchedAccount) => {
        onSetSelectedAccount({ address: account.address })
    }

    const sessionContext = useAppSelector(state =>
        selectVerifyContext(state, request.type === "wallet-connect" ? request.session.topic : undefined),
    )

    const signAndRejectRef = useRef<SignAndRejectRefInterface>(null)

    const validConnectedApp = useMemo(() => {
        if (!sessionContext) return true

        return sessionContext.verifyContext.validation === "VALID"
    }, [sessionContext])

    const onAccountCardPress = useCallback(() => {
        if (!request.options.signer) {
            openSelectAccountBottomSheet()
        }
    }, [openSelectAccountBottomSheet, request.options.signer])

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
        if (nav.canGoBack()) {
            // Requires an extra goBack if it's the first request from the dapp
            if (request.type === "in-app" && request.isFirstRequest) nav.goBack()

            nav.goBack()
        } else {
            nav.navigate(Routes.DISCOVER)
        }
    }, [request, nav])

    const handleAccept = useCallback(
        async (password?: string) => {
            try {
                if (selectedAccount.device.type === DEVICE_TYPE.LEDGER) {
                    nav.navigate(Routes.LEDGER_SIGN_CERTIFICATE, {
                        request,
                        accountWithDevice: selectedAccount as LedgerAccountWithDevice,
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
                    postMessage({ id: request.id, data: res, method: RequestMethods.SIGN_CERTIFICATE })
                }

                dispatch(addSignCertificateActivity(request.appName, cert.domain, cert.payload.content, cert.purpose))

                track(AnalyticsEvent.DAPP_CERTIFICATE_SUCCESS)

                dispatch(setIsAppLoading(false))
            } catch (err: unknown) {
                track(AnalyticsEvent.DAPP_CERTIFICATE_FAILED)

                error(ERROR_EVENTS.WALLET_CONNECT, err)

                if (request.type === "wallet-connect") {
                    await failRequest(request.requestEvent, getRpcError("internal"))
                } else {
                    postMessage({
                        id: request.id,
                        error: "Internal error",
                        method: RequestMethods.SIGN_CERTIFICATE,
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
            await failRequest(request.requestEvent, getRpcError("userRejectedRequest"))
        } else {
            postMessage({ id: request.id, error: "User rejected request", method: RequestMethods.REQUEST_TRANSACTION })
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

    return (
        <BaseSafeArea>
            <BaseView style={styles.header}>
                <BackButtonHeader
                    title={LL.CONNECTED_APP_REQUEST()}
                    action={onPressBack}
                    hasBottomSpacer={false}
                    iconTestID={"CloseModalButton-BaseIcon-closeModal"}
                />
            </BaseView>
            <ScrollView
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={[styles.scrollViewContainer]}
                style={styles.scrollView}
                scrollEventThrottle={16}
                onScroll={signAndRejectRef.current?.onScroll}>
                <BaseView mx={4} style={styles.alignLeft}>
                    <BaseSpacer height={16} />
                    <BaseText typographyFont="subTitle">{LL.CONNECTED_APP_SIGN_REQUEST_TITLE()}</BaseText>
                    <BaseSpacer height={16} />
                    <BaseText>{LL.CONNECTED_APP_SIGN_REQUEST_DESCRIPTION()}</BaseText>

                    <BaseSpacer height={32} />
                    <BaseText typographyFont="subTitleBold">{LL.CONNECTED_APP_SELECTED_ACCOUNT_LABEL()}</BaseText>

                    <BaseSpacer height={16} />
                    <AccountCard
                        account={selectedAccount}
                        showOpacityWhenDisabled={false}
                        onPress={onAccountCardPress}
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
                <BaseSpacer height={194} />
            </ScrollView>

            <SignAndReject
                ref={signAndRejectRef}
                onConfirmTitle={LL.COMMON_BTN_SIGN()}
                onRejectTitle={LL.COMMON_BTN_REJECT()}
                onConfirm={() => onSubmit(checkIdentityBeforeOpening)}
                onReject={onReject}
                isConfirmLoading={isBiometricsEmpty}
                confirmButtonDisabled={isBiometricsEmpty || (!validConnectedApp && !isInvalidChecked)}
            />

            <RequireUserPassword
                isOpen={isPasswordPromptOpen}
                onClose={handleClosePasswordModal}
                onSuccess={onPasswordSuccess}
            />

            <SelectAccountBottomSheet
                closeBottomSheet={closeSelectAccountBottonSheet}
                accounts={visibleAccounts}
                setSelectedAccount={setSelectedAccount}
                selectedAccount={selectedAccount}
                ref={selectAccountBottomSheetRef}
            />
        </BaseSafeArea>
    )
}

const baseStyles = () =>
    StyleSheet.create({
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
            paddingHorizontal: 16,
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
        header: {
            paddingHorizontal: 16,
        },
    })
