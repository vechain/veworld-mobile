import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { useCallback, useMemo, useRef, useState } from "react"
import { BaseBottomSheet, BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components/Base"
import { useInAppBrowser } from "~Components/Providers/InAppBrowserProvider"
import { useInteraction } from "~Components/Providers/InteractionProvider"
import { getRpcError, useWalletConnect } from "~Components/Providers/WalletConnectProvider"
import { SelectAccountBottomSheet } from "~Components/Reusable"
import { AccountSelector } from "~Components/Reusable/AccountSelector"
import { TypedDataRenderer } from "~Components/Reusable/TypedDataRenderer"
import { AnalyticsEvent, ERROR_EVENTS, RequestMethods } from "~Constants"
import { useAnalyticTracking, useBottomSheetModal, useSetSelectedAccount, useSmartWallet, useTheme } from "~Hooks"
import { useLoginSession } from "~Hooks/useLoginSession"
import { useSignTypedMessage } from "~Hooks/useSignTypedData"
import { useI18nContext } from "~i18n"
import { DEVICE_TYPE, SignedTypedDataResponse, TypeDataRequest, TypedData } from "~Model"
import {
    addSignTypedDataActivity,
    selectSelectedAccountOrNull,
    selectVerifyContext,
    selectVisibleAccountsWithoutObserved,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { AccountUtils, error, HexUtils } from "~Utils"
import { isIOS } from "~Utils/PlatformUtils/PlatformUtils"
import { DappDetails } from "../DappDetails"
import { DappDetailsCard } from "../DappDetailsCard"
import { Signable } from "../Signable"
import { LedgerDeviceAlert } from "./LedgerDeviceAlert"
import { useExternalDappConnection } from "~Hooks/useExternalDappConnection"

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

    const selectedAccount = useAppSelector(selectSelectedAccountOrNull)
    const visibleAccounts = useAppSelector(selectVisibleAccountsWithoutObserved)
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

    const signableArgs = useMemo(() => ({ request }), [request])

    const onChangeAccountPress = useCallback(() => {
        onOpenSelectAccountBs()
    }, [onOpenSelectAccountBs])

    const isConfirmDisabled = useMemo(
        () =>
            AccountUtils.isObservedAccount(selectedAccount) ||
            !validConnectedApp ||
            isLoading ||
            !selectedAccount ||
            selectedAccount.device.type === DEVICE_TYPE.LEDGER,
        [isLoading, selectedAccount, validConnectedApp],
    )

    return (
        <>
            <BaseView
                flexDirection="row"
                gap={12}
                justifyContent="space-between"
                testID="SIGN_TYPED_DATA_REQUEST_TITLE">
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
            <DappDetailsCard appName={request.appName} appUrl={request.appUrl}>
                {({ visible }) => (
                    <>
                        {selectedAccount?.device.type === DEVICE_TYPE.LEDGER && (
                            <>
                                <LedgerDeviceAlert />
                                <BaseSpacer height={16} />
                            </>
                        )}
                        <DappDetails show={visible}>
                            <TypedDataRenderer.Container>
                                <TypedDataRenderer value={request.value} />
                            </TypedDataRenderer.Container>
                        </DappDetails>
                    </>
                )}
            </DappDetailsCard>
            <BaseSpacer height={24} />
            <BaseView flexDirection="row" gap={16} mb={isIOS() ? 16 : 0}>
                <BaseButton
                    action={onCancel.bind(null, request)}
                    variant="outline"
                    flex={1}
                    testID="SIGN_TYPED_DATA_REQUEST_BTN_CANCEL">
                    {LL.COMMON_BTN_CANCEL()}
                </BaseButton>
                <Signable args={signableArgs} onSign={onSign}>
                    {({ checkIdentityBeforeOpening, isBiometricsEmpty }) => (
                        <BaseButton
                            action={checkIdentityBeforeOpening}
                            flex={1}
                            disabled={isConfirmDisabled || isBiometricsEmpty}
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
    const { createSessionIfNotExists } = useLoginSession()

    const { failRequest, processRequest } = useWalletConnect()

    const { onSuccess, onFailure, onRejectRequest } = useExternalDappConnection()

    const selectedAccount = useAppSelector(selectSelectedAccountOrNull)
    const { ownerAddress } = useSmartWallet()
    const smartAccountOwnerAddress =
        selectedAccount?.device.type === DEVICE_TYPE.SMART_WALLET && ownerAddress ? ownerAddress : undefined

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
                    await processRequest(
                        request.requestEvent,
                        smartAccountOwnerAddress ? { signature, smartAccountOwnerAddress } : signature,
                    )
                } else if (request.type === "external-app") {
                    await onSuccess({
                        redirectUrl: request.redirectUrl,
                        data: smartAccountOwnerAddress ? { signature, smartAccountOwnerAddress } : { signature },
                        publicKey: request.publicKey,
                    })
                } else {
                    postMessage({
                        id: request.id,
                        data: smartAccountOwnerAddress
                            ? { signature: signedTypedData.signature!, smartAccountOwnerAddress }
                            : signedTypedData.signature!,
                        method: RequestMethods.SIGN_TYPED_DATA,
                    })
                }

                dispatch(addSignTypedDataActivity(request.origin, signedTypedData))

                createSessionIfNotExists(request)

                track(AnalyticsEvent.DAPP_TYPED_DATA_SUCCESS)
                isUserAction.current = true
            } catch (err: unknown) {
                track(AnalyticsEvent.DAPP_TYPED_DATA_FAILED)

                error(ERROR_EVENTS.WALLET_CONNECT, err)

                if (request.type === "wallet-connect") {
                    await failRequest(request.requestEvent, getRpcError("internal"))
                } else if (request.type === "external-app") {
                    await onFailure(request.redirectUrl)
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
        [
            buildTypedData,
            createSessionIfNotExists,
            dispatch,
            failRequest,
            onCloseBs,
            onFailure,
            onSuccess,
            postMessage,
            processRequest,
            signTypedData,
            smartAccountOwnerAddress,
            track,
        ],
    )

    const rejectRequest = useCallback(
        async (request: TypeDataRequest) => {
            setIsLoading(true)
            if (request.type === "wallet-connect") {
                await failRequest(request.requestEvent, getRpcError("userRejectedRequest"))
            } else if (request.type === "external-app") {
                await onRejectRequest(request.redirectUrl)
            } else {
                postMessage({
                    id: request.id,
                    error: "User rejected request",
                    method: RequestMethods.SIGN_TYPED_DATA,
                })
            }

            track(AnalyticsEvent.DAPP_CERTIFICATE_REJECTED)
        },
        [failRequest, postMessage, track, onRejectRequest],
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
