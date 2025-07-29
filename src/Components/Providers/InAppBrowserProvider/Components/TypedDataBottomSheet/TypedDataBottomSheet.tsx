import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { default as React, useCallback, useMemo, useRef, useState } from "react"
import { BaseBottomSheet, BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components/Base"
import { useInAppBrowser } from "~Components/Providers/InAppBrowserProvider"
import { useInteraction } from "~Components/Providers/InteractionProvider"
import { getRpcError, useWalletConnect } from "~Components/Providers/WalletConnectProvider"
import { SelectAccountBottomSheet } from "~Components/Reusable"
import { AccountSelector } from "~Components/Reusable/AccountSelector"
import { AnalyticsEvent, ERROR_EVENTS, RequestMethods } from "~Constants"
import { useAnalyticTracking, useBottomSheetModal, useSetSelectedAccount, useSignTypedMessage, useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { SignedTypedDataResponse, TypeDataRequest, TypedData } from "~Model"
import {
    addSignTypedDataActivity,
    selectFeaturedDapps,
    selectSelectedAccountOrNull,
    selectVerifyContext,
    selectVisibleAccountsWithoutObservedAndLedger,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { AccountUtils, DAppUtils, error, HexUtils } from "~Utils"
import { DappWithDetails } from "../DappWithDetails"
import { Signable } from "../Signable"
import { Renderer } from "./Renderer"

type Props = {
    request: TypeDataRequest
    onCancel: (request: TypeDataRequest) => Promise<void>
    onSign: (args: { request: TypeDataRequest; password?: string }) => Promise<void>
    selectAccountBsRef: React.RefObject<BottomSheetModalMethods>
    isLoading: boolean
}

const TypedDataBottomSheetContent = ({ request, onCancel, onSign, selectAccountBsRef, isLoading }: Props) => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    const track = useAnalyticTracking()

    const allApps = useAppSelector(selectFeaturedDapps)

    const selectedAccount = useAppSelector(selectSelectedAccountOrNull)
    const visibleAccounts = useAppSelector(selectVisibleAccountsWithoutObservedAndLedger)
    const { onClose: onCloseSelectAccountBs, onOpen: onOpenSelectAccountBs } = useBottomSheetModal({
        externalRef: selectAccountBsRef,
    })

    const { onSetSelectedAccount } = useSetSelectedAccount()

    const sessionContext = useAppSelector(state =>
        selectVerifyContext(state, request.type === "wallet-connect" ? request.session.topic : undefined),
    )

    const validConnectedApp = useMemo(() => {
        if (!sessionContext) return true

        return sessionContext.verifyContext.validation === "VALID"
    }, [sessionContext])

    const { icon, name, url } = useMemo(() => {
        const foundDapp = allApps.find(app => new URL(app.href).origin === new URL(request.appUrl).origin)
        if (foundDapp)
            return {
                icon: foundDapp.id
                    ? DAppUtils.getAppHubIconUrl(foundDapp.id)
                    : `${process.env.REACT_APP_GOOGLE_FAVICON_URL}${new URL(foundDapp.href).origin}`,
                name: foundDapp.name,
                url: request.appUrl,
            }

        return {
            name: request.appName,
            url: request.appUrl,
            icon: `${process.env.REACT_APP_GOOGLE_FAVICON_URL}${new URL(request.appUrl).origin}`,
        }
    }, [allApps, request.appName, request.appUrl])

    const signableArgs = useMemo(() => ({ request }), [request])

    const onChangeAccountPress = useCallback(() => {
        track(AnalyticsEvent.DAPP_CERTIFICATE_CHANGE_ACCOUNT_CLICKED)
        onOpenSelectAccountBs()
    }, [onOpenSelectAccountBs, track])

    return (
        <>
            <BaseView
                flexDirection="row"
                gap={12}
                justifyContent="space-between"
                testID="SIGN_CERTIFICATE_REQUEST_TITLE">
                <BaseView flex={1} flexDirection="row" gap={12}>
                    <BaseIcon name="icon-certificate" size={20} color={theme.colors.editSpeedBs.title} />
                    <BaseText typographyFont="subTitleSemiBold" color={theme.colors.editSpeedBs.title}>
                        {LL.SIGN_TYPED_DATA_REQUEST_TITLE()}
                    </BaseText>
                </BaseView>
                {selectedAccount && (
                    <AccountSelector
                        account={selectedAccount}
                        onPress={onChangeAccountPress}
                        variant="short"
                        changeable
                    />
                )}
            </BaseView>
            <BaseSpacer height={12} />
            <DappWithDetails name={name} icon={icon} url={url}>
                <Renderer.Container>
                    <Renderer value={request.value} />
                </Renderer.Container>
            </DappWithDetails>
            <BaseSpacer height={24} />
            <BaseView flexDirection="row" gap={16}>
                <BaseButton
                    action={onCancel.bind(null, request)}
                    variant="outline"
                    flex={1}
                    testID="SIGN_TYPED_DATA_REQUEST_BTN_CANCEL"
                    disabled={isLoading}>
                    {LL.COMMON_BTN_CANCEL()}
                </BaseButton>
                <Signable args={signableArgs} onSign={onSign}>
                    {({ checkIdentityBeforeOpening, isBiometricsEmpty }) => (
                        <BaseButton
                            action={checkIdentityBeforeOpening}
                            flex={1}
                            disabled={
                                AccountUtils.isObservedAccount(selectedAccount) ||
                                isBiometricsEmpty ||
                                !validConnectedApp ||
                                isLoading ||
                                !selectedAccount
                            }
                            isLoading={isLoading}
                            testID="SIGN_TYPED_DATA_REQUEST_BTN_SIGN">
                            {LL.SIGN_TYPED_DATA_REQUEST_CTA()}
                        </BaseButton>
                    )}
                </Signable>
            </BaseView>

            <SelectAccountBottomSheet
                closeBottomSheet={onCloseSelectAccountBs}
                accounts={visibleAccounts}
                setSelectedAccount={onSetSelectedAccount}
                selectedAccount={selectedAccount}
                ref={selectAccountBsRef}
                cardVersion="v2"
            />
        </>
    )
}

export const TypedDataBottomSheet = () => {
    const { typedDataBsRef, typedDataBsData, setTypedDataBsData } = useInteraction()
    const { onClose: onCloseBs } = useBottomSheetModal({ externalRef: typedDataBsRef })

    const { ref: selectAccountBsRef } = useBottomSheetModal()

    const track = useAnalyticTracking()

    const { postMessage } = useInAppBrowser()

    const { failRequest, processRequest } = useWalletConnect()

    const selectedAccount = useAppSelector(selectSelectedAccountOrNull)

    const dispatch = useAppDispatch()

    const isUserAction = useRef(false)

    const [isLoading, setIsLoading] = useState(false)

    const buildTypedData = useCallback(
        (request: TypeDataRequest) => {
            if (!selectedAccount) return
            return {
                timestamp: Math.round(Date.now() / 1000),
                signer: selectedAccount?.address ?? "",
                ...request,
            }
        },
        [selectedAccount],
    )

    // Sign
    const { signTypedData } = useSignTypedMessage()

    const onSign = useCallback(
        async ({ request, password }: { request: TypeDataRequest; password?: string }) => {
            try {
                const tData = buildTypedData(request)!

                setIsLoading(true)

                const signature = await signTypedData(tData, password)
                if (!signature) {
                    throw new Error("Signature is empty")
                }

                const signedTypedData: SignedTypedDataResponse & TypedData = {
                    ...tData,
                    signature: HexUtils.addPrefix(signature),
                }

                if (request.type === "wallet-connect") {
                    await processRequest(request.requestEvent, signature)
                } else {
                    postMessage({
                        id: request.id,
                        data: signedTypedData.signature,
                        method: RequestMethods.SIGN_TYPED_DATA,
                    })
                }

                dispatch(addSignTypedDataActivity(request.origin, signedTypedData))

                track(AnalyticsEvent.DAPP_TYPED_DATA_SUCCESS)
                isUserAction.current = true
            } catch (err: unknown) {
                track(AnalyticsEvent.DAPP_TYPED_DATA_FAILED)

                error(ERROR_EVENTS.WALLET_CONNECT, err)

                if (request.type === "wallet-connect") {
                    await failRequest(request.requestEvent, getRpcError("internal"))
                } else {
                    postMessage({
                        id: request.id,
                        error: "Internal error",
                        method: RequestMethods.SIGN_TYPED_DATA,
                    })
                }
            }
            onCloseBs()
        },
        [buildTypedData, dispatch, failRequest, onCloseBs, postMessage, processRequest, signTypedData, track],
    )

    const rejectRequest = useCallback(
        async (request: TypeDataRequest) => {
            setIsLoading(true)
            if (request.type === "wallet-connect") {
                await failRequest(request.requestEvent, getRpcError("userRejectedRequest"))
            } else {
                postMessage({
                    id: request.id,
                    error: "User rejected request",
                    method: RequestMethods.SIGN_TYPED_DATA,
                })
            }

            track(AnalyticsEvent.DAPP_CERTIFICATE_REJECTED)
        },
        [failRequest, postMessage, track],
    )

    const onCancel = useCallback(
        async (request: TypeDataRequest) => {
            await rejectRequest(request)
            isUserAction.current = true
            onCloseBs()
        },
        [onCloseBs, rejectRequest],
    )

    const onDismiss = useCallback(async () => {
        try {
            if (isUserAction.current) {
                setTypedDataBsData(null)
                isUserAction.current = false
                return
            }
            if (!typedDataBsData) return
            await rejectRequest(typedDataBsData)
            isUserAction.current = false
            setTypedDataBsData(null)
        } finally {
            setIsLoading(false)
        }
    }, [rejectRequest, setTypedDataBsData, typedDataBsData])

    return (
        <BaseBottomSheet dynamicHeight ref={typedDataBsRef} onDismiss={onDismiss}>
            {typedDataBsData && (
                <TypedDataBottomSheetContent
                    onCancel={onCancel}
                    onSign={onSign}
                    request={typedDataBsData}
                    selectAccountBsRef={selectAccountBsRef}
                    isLoading={isLoading}
                />
            )}
        </BaseBottomSheet>
    )
}
