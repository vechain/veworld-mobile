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
    // getRpcError,
    RequireUserPassword,
    SelectAccountBottomSheet,
    // useWalletConnect,
    useInAppBrowser,
} from "~Components"
import {
    addSignTypedDataActivity,
    // selectVerifyContext,
    setIsAppLoading,
    useAppDispatch,
    // useAppSelector,
} from "~Storage/Redux"
import { error, HexUtils } from "~Utils"
import {
    useAnalyticTracking,
    useBottomSheetModal,
    useCheckIdentity,
    useSetSelectedAccount,
    useSignTypedMessage,
} from "~Hooks"
import { AccountWithDevice, DEVICE_TYPE, SignedTypedDataResponse, TypedData, WatchedAccount } from "~Model"
import { useI18nContext } from "~i18n"
import { RootStackParamListSwitch, Routes } from "~Navigation"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { useNavigation } from "@react-navigation/native"
// import { UnknownAppMessage } from "~Screens"
import { AnalyticsEvent, ERROR_EVENTS, RequestMethods } from "~Constants"
import { useObservedAccountExclusion } from "../WalletConnect/Hooks"
import { TypedDataDetails } from "./Components"

type Props = NativeStackScreenProps<RootStackParamListSwitch, Routes.CONNECTED_APP_SIGN_TYPED_MESSAGE_SCREEN>

export const SignDataMessageScreen: FC<Props> = ({ route }: Props) => {
    const { request } = route.params

    // const { processRequest, failRequest } = useWalletConnect()
    const { postMessage } = useInAppBrowser()
    const { LL } = useI18nContext()
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

    // const [isInvalidChecked, setInvalidChecked] = React.useState(false)

    const setSelectedAccount = (account: AccountWithDevice | WatchedAccount) => {
        onSetSelectedAccount({ address: account.address })
    }

    // const sessionContext = useAppSelector(state =>
    //     selectVerifyContext(state, request.type === "wallet-connect" ? request.session.topic : undefined),
    // )

    // const validConnectedApp = useMemo(() => {
    //     if (!sessionContext) return true

    //     return sessionContext.verifyContext.validation === "VALID"
    // }, [sessionContext])

    const onAccountCardPress = useCallback(() => {
        if (!request.options.signer) {
            openSelectAccountBottomSheet()
        }
    }, [openSelectAccountBottomSheet, request.options.signer])

    const typedData: TypedData = useMemo(() => {
        return {
            timestamp: Math.round(Date.now() / 1000),
            signer: selectedAccount?.address ?? "",
            ...request,
        }
    }, [request, selectedAccount?.address])

    const { signTypedData } = useSignTypedMessage({ typedData })

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
                    throw new Error("Ledger signature not supported")
                }

                const signature = await signTypedData(password)

                if (!signature) {
                    throw new Error("Signature is empty")
                }

                const signedTypedData: SignedTypedDataResponse & TypedData = {
                    ...typedData,
                    signature: HexUtils.addPrefix(signature),
                }

                dispatch(setIsAppLoading(true))

                // if (request.type === "wallet-connect") {
                //     await processRequest(request.requestEvent, res)
                // } else {
                postMessage({ id: request.id, data: signedTypedData.signature, method: RequestMethods.SIGN_TYPED_DATA })
                // }

                dispatch(addSignTypedDataActivity(signedTypedData.signer, request.appName, signedTypedData))

                track(AnalyticsEvent.DAPP_TYPED_DATA_SUCCESS)

                dispatch(setIsAppLoading(false))
            } catch (err: unknown) {
                track(AnalyticsEvent.DAPP_TYPED_DATA_FAILED)

                error(ERROR_EVENTS.WALLET_CONNECT, err)

                // if (request.type === "wallet-connect") {
                //     await failRequest(request.requestEvent, getRpcError("internal"))
                // } else {
                postMessage({
                    id: request.id,
                    error: "Internal error",
                    method: RequestMethods.SIGN_TYPED_DATA,
                })
                // }

                dispatch(setIsAppLoading(false))
            } finally {
                dispatch(setIsAppLoading(false))
            }

            onClose()
        },
        [
            onClose,
            selectedAccount.device.type,
            signTypedData,
            typedData,
            dispatch,
            postMessage,
            request.id,
            request.appName,
            track,
        ],
    )

    const onReject = useCallback(async () => {
        // if (request.type === "wallet-connect") {
        //     await failRequest(request.requestEvent, getRpcError("userRejectedRequest"))
        // } else {
        postMessage({ id: request.id, error: "User rejected request", method: RequestMethods.REQUEST_TRANSACTION })
        // }

        track(AnalyticsEvent.DAPP_TYPED_DATA_REJECTED)

        onClose()
    }, [postMessage, request, track, onClose])

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

                    <BaseSpacer height={32} />
                    <BaseText typographyFont="subTitleBold">{LL.CONNECTED_APP_SELECTED_ACCOUNT_LABEL()}</BaseText>

                    <BaseSpacer height={16} />
                    <AccountCard
                        account={selectedAccount}
                        showOpacityWhenDisabled={false}
                        onPress={onAccountCardPress}
                    />

                    <BaseSpacer height={32} />

                    <TypedDataDetails request={request} />

                    {/* {sessionContext && (
                        <UnknownAppMessage
                            verifyContext={sessionContext.verifyContext}
                            confirmed={isInvalidChecked}
                            setConfirmed={setInvalidChecked}
                        />
                    )} */}
                </BaseView>

                <BaseSpacer height={30} />

                <BaseView style={styles.footer}>
                    <BaseButton
                        w={100}
                        haptics="Light"
                        title={LL.COMMON_BTN_SIGN()}
                        action={() => onSubmit(checkIdentityBeforeOpening)}
                        /* We must assert that `biometrics` is not empty otherwise we don't know if the user has set biometrics or passcode, thus failing to decrypt the wallet when signing */
                        isLoading={isBiometricsEmpty}
                        // disabled={isBiometricsEmpty || (!validConnectedApp && !isInvalidChecked)}
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
