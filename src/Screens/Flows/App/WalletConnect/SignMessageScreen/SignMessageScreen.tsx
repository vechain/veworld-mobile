import { useNavigation } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { getSdkError } from "@walletconnect/utils"
import React, { FC, useCallback, useMemo, useRef } from "react"
import { ScrollView, StyleSheet } from "react-native"
import {
    AccountCard,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    CloseModalButton,
    getRpcError,
    RequireUserPassword,
    SignAndReject,
    SignAndRejectRefInterface,
    useWalletConnect,
} from "~Components"
import { AnalyticsEvent, ERROR_EVENTS } from "~Constants"
import { useAnalyticTracking, useCheckIdentity, useSignMessage } from "~Hooks"
import { useI18nContext } from "~i18n"
import { AccountWithDevice, DEVICE_TYPE, LedgerAccountWithDevice } from "~Model"
import { RootStackParamListSwitch, Routes } from "~Navigation"
import { AppInfo, UnknownAppMessage } from "~Screens"
import {
    selectSelectedAccount,
    selectVerifyContext,
    setIsAppLoading,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { error, HexUtils, SignMessageUtils, warn } from "~Utils"

type Props = NativeStackScreenProps<RootStackParamListSwitch, Routes.CONNECTED_APP_SIGN_MESSAGE_SCREEN>

export const SignMessageScreen: FC<Props> = ({ route }: Props) => {
    const { requestEvent, message } = route.params
    const { chainId } = requestEvent.params

    const { processRequest, failRequest, activeSessions } = useWalletConnect()
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const selectedAccount: AccountWithDevice = useAppSelector(selectSelectedAccount)
    const track = useAnalyticTracking()
    const dispatch = useAppDispatch()

    const [isInvalidChecked, setInvalidChecked] = React.useState(false)

    const signAndRejectRef = useRef<SignAndRejectRefInterface>(null)

    const sessionContext = useAppSelector(state => selectVerifyContext(state, requestEvent.topic))

    const appInfo = useMemo(() => {
        const session = activeSessions[requestEvent.topic]

        if (!session)
            return {
                name: "",
                description: "",
                url: "",
                icons: [],
            }

        return session.peer.metadata
    }, [requestEvent, activeSessions])

    const validConnectedApp = useMemo(() => {
        if (!sessionContext) return true

        return sessionContext.verifyContext.validation === "VALID"
    }, [sessionContext])

    const utfMessage = useMemo(() => {
        try {
            return Buffer.from(HexUtils.removePrefix(message), "hex").toString()
        } catch (e) {
            warn(ERROR_EVENTS.WALLET_CONNECT, e)
            return message
        }
    }, [message])

    const payloadToSign: Buffer = useMemo(() => {
        const chain = chainId.split(":")[0]

        if (chain === "vechain" || chain === "eip155") {
            return SignMessageUtils.hashMessage(utfMessage, chain)
        }

        // validation should be done before navigating to this screen
        return Buffer.from([])
    }, [chainId, utfMessage])

    // Sign
    const { signMessage } = useSignMessage()

    const onClose = useCallback(() => {
        nav.goBack()
    }, [nav])

    const handleLedgerAccount = useCallback(async () => {
        if (chainId !== "vechain") {
            await failRequest(requestEvent, getSdkError("UNSUPPORTED_ACCOUNTS"))
        } else {
            nav.navigate(Routes.LEDGER_SIGN_MESSAGE, {
                requestEvent,
                accountWithDevice: selectedAccount as LedgerAccountWithDevice,
                message,
            })
        }
    }, [nav, chainId, requestEvent, selectedAccount, message, failRequest])

    const handleAccept = useCallback(
        async (password?: string) => {
            try {
                if (selectedAccount.device.type === DEVICE_TYPE.LEDGER) {
                    return handleLedgerAccount()
                }

                const signature = await signMessage(payloadToSign, password)
                if (!signature) {
                    throw new Error("Signature is empty")
                }

                dispatch(setIsAppLoading(true))

                await processRequest(requestEvent, HexUtils.addPrefix(signature.toString("hex")))

                dispatch(setIsAppLoading(false))
            } catch (err: unknown) {
                track(AnalyticsEvent.DAPP_CERTIFICATE_FAILED)
                //ddLogger.logAction("DAPP_CERTIFICATE", "DAPP_CERTIFICATE_FAILED")

                error(ERROR_EVENTS.WALLET_CONNECT, err)

                await failRequest(requestEvent, getRpcError("internal"))

                dispatch(setIsAppLoading(false))
            } finally {
                dispatch(setIsAppLoading(false))
            }

            onClose()
        },
        [
            onClose,
            selectedAccount.device.type,
            signMessage,
            payloadToSign,
            dispatch,
            processRequest,
            requestEvent,
            handleLedgerAccount,
            track,
            failRequest,
        ],
    )

    const onReject = useCallback(async () => {
        await failRequest(requestEvent, getRpcError("userRejectedRequest"))
        track(AnalyticsEvent.DAPP_CERTIFICATE_REJECTED)

        onClose()
    }, [requestEvent, track, onClose, failRequest])

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
            <ScrollView
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={[styles.scrollViewContainer]}
                scrollEventThrottle={16}
                onScroll={signAndRejectRef.current?.onScroll}
                style={styles.scrollView}>
                <CloseModalButton onPress={onPressBack} />
                <BaseView mx={20} style={styles.alignLeft}>
                    <BaseText typographyFont="title">{LL.CONNECTED_APP_REQUEST()}</BaseText>

                    <BaseSpacer height={32} />
                    <BaseText typographyFont="subTitle">{LL.CONNECTED_APP_SIGN_MESSAGE_TITLE()}</BaseText>
                    <BaseSpacer height={16} />
                    <BaseText>{LL.CONNECTED_APP_SIGN_MESSAGE_REQUEST_DESCRIPTION()}</BaseText>

                    <BaseSpacer height={16} />

                    <AppInfo
                        name={appInfo.name}
                        description={appInfo.description}
                        url={appInfo.url}
                        icon={appInfo.icons[0]}
                    />

                    <BaseSpacer height={32} />
                    <BaseText typographyFont="subTitleBold">{LL.CONNECTED_APP_SELECTED_ACCOUNT_LABEL()}</BaseText>

                    <BaseSpacer height={16} />
                    <AccountCard account={selectedAccount} showOpacityWhenDisabled={false} />

                    <BaseSpacer height={16} />
                    <BaseText typographyFont="subTitle">{LL.CONNECTED_APP_MESSAGE_HEADER()}</BaseText>
                    <BaseSpacer height={16} />
                    <BaseText>{utfMessage}</BaseText>

                    <UnknownAppMessage
                        verifyContext={sessionContext?.verifyContext}
                        confirmed={isInvalidChecked}
                        setConfirmed={setInvalidChecked}
                    />
                </BaseView>
                <BaseSpacer height={194} />
            </ScrollView>

            <SignAndReject
                ref={signAndRejectRef}
                onConfirmTitle={LL.COMMON_BTN_SIGN()}
                onConfirm={checkIdentityBeforeOpening}
                isConfirmLoading={isBiometricsEmpty}
                confirmButtonDisabled={isBiometricsEmpty || (!validConnectedApp && !isInvalidChecked)}
                onRejectTitle={LL.COMMON_BTN_REJECT()}
                onReject={onReject}
            />

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
