import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useNavigation } from "@react-navigation/native"
import { Blake2b256, Certificate } from "@vechain/sdk-core"
import React, { useCallback, useMemo, useRef, useState } from "react"
import { BaseBottomSheet, BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components/Base"
import { useInAppBrowser } from "~Components/Providers/InAppBrowserProvider"
import { useInteraction } from "~Components/Providers/InteractionProvider"
import { getRpcError, useWalletConnect } from "~Components/Providers/WalletConnectProvider"
import { SelectAccountBottomSheet } from "~Components/Reusable"
import { AccountSelector } from "~Components/Reusable/AccountSelector"
import { AnalyticsEvent, COLORS, ERROR_EVENTS, RequestMethods } from "~Constants"
import {
    useAnalyticTracking,
    useBottomSheetModal,
    useSetSelectedAccount,
    useSignMessage,
    useSmartWallet,
    useTheme,
} from "~Hooks"
import { useLoginSession } from "~Hooks/useLoginSession"
import { useI18nContext } from "~i18n"
import { CertificateRequest, DEVICE_TYPE, LedgerAccountWithDevice } from "~Model"
import { Routes } from "~Navigation"
import {
    addSignCertificateActivity,
    selectSelectedAccountOrNull,
    selectVerifyContext,
    selectVisibleAccountsWithoutObserved,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { AccountUtils, error, HexUtils } from "~Utils"
import { isIOS } from "~Utils/PlatformUtils/PlatformUtils"
import { DappWithDetails } from "../DappWithDetails"
import { Signable } from "../Signable"
import { useExternalDappConnection } from "~Hooks/useExternalDappConnection"
import { FeedbackSeverity, FeedbackType } from "~Components/Providers/FeedbackProvider/Model"
import { Feedback } from "~Components/Providers/FeedbackProvider/Events"

type Request = {
    request: CertificateRequest
    isInjectedWallet?: boolean
}

type Props = {
    request: CertificateRequest
    onCancel: (request: CertificateRequest) => Promise<void>
    onSign: (args: { request: CertificateRequest; password?: string }) => Promise<void>
    selectAccountBsRef: React.RefObject<BottomSheetModalMethods>
    isLoading: boolean
}

const CertificateBottomSheetContent = ({ request, onCancel, onSign, selectAccountBsRef, isLoading }: Props) => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    const track = useAnalyticTracking()

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
                    <BaseText typographyFont="subSubTitleSemiBold" color={theme.colors.editSpeedBs.title}>
                        {LL.SIGN_CERTIFICATE_REQUEST_TITLE()}
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
            <DappWithDetails appName={request.appName} appUrl={request.appUrl}>
                <BaseText color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600} typographyFont="captionRegular">
                    {request.message.payload.content}
                </BaseText>
            </DappWithDetails>
            <BaseSpacer height={24} />
            <BaseView flexDirection="row" gap={16} mb={isIOS() ? 16 : 0}>
                <BaseButton
                    action={onCancel.bind(null, request)}
                    variant="outline"
                    flex={1}
                    testID="SIGN_CERTIFICATE_REQUEST_BTN_CANCEL">
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
                            testID="SIGN_CERTIFICATE_REQUEST_BTN_SIGN">
                            {LL.SIGN_CERTIFICATE_REQUEST_CTA()}
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

export const CertificateBottomSheet = () => {
    const { LL } = useI18nContext()
    const { certificateBsRef, certificateBsData, setCertificateBsData } = useInteraction()
    const { onClose: onCloseBs } = useBottomSheetModal({ externalRef: certificateBsRef })

    const { ref: selectAccountBsRef } = useBottomSheetModal()

    const track = useAnalyticTracking()

    const { postMessage } = useInAppBrowser()
    const { getLoginSession, createSessionIfNotExists } = useLoginSession()

    const { failRequest, processRequest } = useWalletConnect()

    const { onSuccess, onFailure, onRejectRequest } = useExternalDappConnection()

    const selectedAccount = useAppSelector(selectSelectedAccountOrNull)
    const { ownerAddress } = useSmartWallet()
    const smartAccountOwnerAddress =
        selectedAccount?.device.type === DEVICE_TYPE.SMART_WALLET && ownerAddress ? ownerAddress : undefined

    const nav = useNavigation()

    const dispatch = useAppDispatch()

    const isUserAction = useRef(false)

    const [isLoading, setIsLoading] = useState(false)

    const buildCertificate = useCallback(
        (request: CertificateRequest) => {
            if (!selectedAccount) return
            const certificate = Certificate.of({
                purpose: request.message.purpose,
                payload: request.message.payload,
                timestamp: Math.round(Date.now() / 1000),
                domain: new URL(request.appUrl).hostname,
                signer: selectedAccount.address ?? "",
            })
            return {
                certificate,
                payload: Buffer.from(Blake2b256.of(certificate.encode()).bytes),
            }
        },
        [selectedAccount],
    )

    // Sign
    const { signMessage } = useSignMessage()

    const onSign = useCallback(
        async ({ request, password }: { request: CertificateRequest; password?: string }) => {
            try {
                const { certificate, payload } = buildCertificate(request)!
                if (selectedAccount!.device.type === DEVICE_TYPE.LEDGER) {
                    // Do not reject request if it's a ledger request
                    isUserAction.current = true
                    onCloseBs()

                    nav.navigate(Routes.LEDGER_SIGN_CERTIFICATE, {
                        request,
                        accountWithDevice: selectedAccount as LedgerAccountWithDevice,
                        certificate: certificate,
                    })
                    return
                }

                setIsLoading(true)

                const signature = await signMessage(payload, password)
                if (!signature) {
                    throw new Error("Signature is empty")
                }

                const res = {
                    signature: HexUtils.addPrefix(signature.toString("hex")),
                    annex: {
                        domain: certificate.domain,
                        timestamp: certificate.timestamp,
                        signer: certificate.signer,
                    },
                    ...(smartAccountOwnerAddress && { smartAccountOwnerAddress }),
                }

                if (request.type === "wallet-connect") {
                    await processRequest(request.requestEvent, res)
                } else if (request.type === "external-app") {
                    await onSuccess({
                        redirectUrl: request.redirectUrl,
                        data: res,
                        publicKey: request.publicKey,
                    })
                } else {
                    postMessage({ id: request.id, data: res, method: RequestMethods.SIGN_CERTIFICATE })
                }

                dispatch(
                    addSignCertificateActivity(
                        request.appName,
                        certificate.domain,
                        certificate.payload.content,
                        certificate.purpose,
                    ),
                )

                createSessionIfNotExists(request)

                const session = getLoginSession(request.appUrl)
                if (!session || session.replaceable) {
                    Feedback.show({
                        message: LL.FEEDBACK_APP_CONNECTED(),
                        type: FeedbackType.ALERT,
                        severity: FeedbackSeverity.SUCCESS,
                    })
                }
                track(AnalyticsEvent.DAPP_CERTIFICATE_SUCCESS)
                isUserAction.current = true
            } catch (err: unknown) {
                track(AnalyticsEvent.DAPP_CERTIFICATE_FAILED)

                error(ERROR_EVENTS.WALLET_CONNECT, err)

                if (request.type === "wallet-connect") {
                    await failRequest(request.requestEvent, getRpcError("internal"))
                } else if (request.type === "external-app") {
                    await onFailure(request.redirectUrl)
                } else {
                    postMessage({
                        id: request.id,
                        error: "Internal error",
                        method: RequestMethods.SIGN_CERTIFICATE,
                    })
                }
            }
            onCloseBs()
        },
        [
            onCloseBs,
            buildCertificate,
            selectedAccount,
            signMessage,
            dispatch,
            createSessionIfNotExists,
            getLoginSession,
            track,
            nav,
            processRequest,
            onSuccess,
            postMessage,
            LL,
            failRequest,
            onFailure,
            smartAccountOwnerAddress,
        ],
    )

    const rejectRequest = useCallback(
        async (request: CertificateRequest) => {
            setIsLoading(true)
            if (request.type === "wallet-connect") {
                await failRequest(request.requestEvent, getRpcError("userRejectedRequest"))
            } else if (request.type === "external-app") {
                await onRejectRequest(request.redirectUrl)
            } else {
                postMessage({
                    id: request.id,
                    error: "User rejected request",
                    method: RequestMethods.SIGN_CERTIFICATE,
                })
            }

            track(AnalyticsEvent.DAPP_CERTIFICATE_REJECTED)
        },
        [failRequest, postMessage, track, onRejectRequest],
    )

    const onCancel = useCallback(
        async (request: CertificateRequest) => {
            await rejectRequest(request)
            isUserAction.current = true
            onCloseBs()
        },
        [onCloseBs, rejectRequest],
    )

    const onDismiss = useCallback(async () => {
        try {
            if (isUserAction.current) {
                setCertificateBsData(null)
                isUserAction.current = false
                return
            }
            if (!certificateBsData) return
            await rejectRequest(certificateBsData)
            isUserAction.current = false
            setCertificateBsData(null)
        } finally {
            setIsLoading(false)
        }
    }, [certificateBsData, rejectRequest, setCertificateBsData])

    return (
        <BaseBottomSheet<Request> dynamicHeight ref={certificateBsRef} onDismiss={onDismiss}>
            {certificateBsData && (
                <CertificateBottomSheetContent
                    onCancel={onCancel}
                    onSign={onSign}
                    request={certificateBsData}
                    selectAccountBsRef={selectAccountBsRef}
                    isLoading={isLoading}
                />
            )}
        </BaseBottomSheet>
    )
}
