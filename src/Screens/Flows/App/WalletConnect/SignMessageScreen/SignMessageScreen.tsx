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
import {
    selectSelectedAccount,
    selectVerifyContext,
    setIsAppLoading,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { error, HexUtils, SignMessageUtils, warn } from "~Utils"
import { useAnalyticTracking, useCheckIdentity, useSignMessage } from "~Hooks"
import { AccountWithDevice, DEVICE_TYPE, LedgerAccountWithDevice } from "~Model"
import { useI18nContext } from "~i18n"
import { RootStackParamListSwitch, Routes } from "~Navigation"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { useNavigation } from "@react-navigation/native"
import { AppInfo, UnknownAppMessage } from "~Screens"
import { AnalyticsEvent } from "~Constants"
import { getSdkError } from "@walletconnect/utils"

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
            warn("SignMessageScreen: utfMessage", e)
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
    const { signMessage } = useSignMessage({
        hash: payloadToSign,
    })

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

                const signature = await signMessage(password)
                if (!signature) {
                    throw new Error("Signature is empty")
                }

                dispatch(setIsAppLoading(true))

                await processRequest(requestEvent, HexUtils.addPrefix(signature.toString("hex")))

                dispatch(setIsAppLoading(false))
            } catch (err: unknown) {
                track(AnalyticsEvent.DAPP_CERTIFICATE_FAILED)
                error("SignMessageScreen:handleAccept", err)

                await failRequest(requestEvent, getRpcError("internal"))

                dispatch(setIsAppLoading(false))
            } finally {
                dispatch(setIsAppLoading(false))
            }

            onClose()
        },
        [
            handleLedgerAccount,
            onClose,
            selectedAccount,
            signMessage,
            requestEvent,
            failRequest,
            processRequest,
            dispatch,
            track,
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
                        verifyContext={sessionContext.verifyContext}
                        confirmed={isInvalidChecked}
                        setConfirmed={setInvalidChecked}
                    />
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
                        disabled={isBiometricsEmpty || (!validConnectedApp && !isInvalidChecked)}
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
