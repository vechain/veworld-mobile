import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useNavigation } from "@react-navigation/native"
import { Blake2b256, Certificate } from "@vechain/sdk-core"
import { default as React, useCallback, useMemo } from "react"
import { BaseBottomSheet, BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components/Base"
import { useInteraction } from "~Components/Providers/InteractionProvider"
import { getRpcError, useWalletConnect } from "~Components/Providers/WalletConnectProvider"
import { SelectAccountBottomSheet } from "~Components/Reusable"
import { AccountSelector } from "~Components/Reusable/AccountSelector"
import { AnalyticsEvent, COLORS, ERROR_EVENTS, RequestMethods } from "~Constants"
import { useAnalyticTracking, useBottomSheetModal, useSetSelectedAccount, useSignMessage, useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { CertificateRequest, DEVICE_TYPE, LedgerAccountWithDevice } from "~Model"
import { Routes } from "~Navigation"
import {
    addSignCertificateActivity,
    selectFeaturedDapps,
    selectSelectedAccount,
    selectVerifyContext,
    selectVisibleAccountsWithoutObserved,
    setIsAppLoading,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { AccountUtils, DAppUtils, error, HexUtils } from "~Utils"
import { useInAppBrowser } from "../../InAppBrowserProvider"
import { DappWithDetails } from "../DappWithDetails"
import { Signable } from "../Signable"

type Request = {
    request: CertificateRequest
    isInjectedWallet?: boolean
}

type Props = {
    request: CertificateRequest
    onCancel: (request: CertificateRequest) => Promise<void>
    onSign: (args: { request: CertificateRequest; password?: string }) => Promise<void>
    onCloseBs: () => void
    selectAccountBsRef: React.RefObject<BottomSheetModalMethods>
}

const CertificateBottomSheetContent = ({ request, onCancel, onSign, selectAccountBsRef }: Props) => {
    const { LL } = useI18nContext()
    const theme = useTheme()

    const allApps = useAppSelector(selectFeaturedDapps)

    const selectedAccount = useAppSelector(selectSelectedAccount)
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

    return (
        <>
            <BaseView flexDirection="row" gap={12} justifyContent="space-between">
                <BaseView flex={1} flexDirection="row" gap={12}>
                    <BaseIcon name="icon-apps" size={20} color={theme.colors.editSpeedBs.title} />
                    <BaseText typographyFont="subTitleSemiBold" color={theme.colors.editSpeedBs.title}>
                        {LL.SIGN_CERTIFICATE_REQUEST_TITLE()}
                    </BaseText>
                </BaseView>
                <AccountSelector account={selectedAccount} onPress={onOpenSelectAccountBs} variant="short" />
            </BaseView>
            <BaseSpacer height={24} />
            <DappWithDetails name={name} icon={icon} url={url} isDefaultVisible>
                <BaseText color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600} typographyFont="captionRegular">
                    {request.message.payload.content}
                </BaseText>
            </DappWithDetails>
            <BaseSpacer height={24} />
            <BaseView flexDirection="row" gap={16}>
                <BaseButton action={onCancel.bind(null, request)} variant="outline" flex={1}>
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
                                !validConnectedApp
                            }>
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
    const { certificateBsRef } = useInteraction()
    const { onClose: onCloseBs } = useBottomSheetModal({ externalRef: certificateBsRef })

    const { ref: selectAccountBsRef } = useBottomSheetModal()

    const track = useAnalyticTracking()

    const { postMessage } = useInAppBrowser()

    const { failRequest, processRequest } = useWalletConnect()

    const selectedAccount = useAppSelector(selectSelectedAccount)

    const nav = useNavigation()

    const dispatch = useAppDispatch()

    const buildCertificate = useCallback(
        (request: CertificateRequest) => {
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
        [selectedAccount.address],
    )

    // Sign
    const { signMessage } = useSignMessage()

    const onSign = useCallback(
        async ({ request, password }: { request: CertificateRequest; password?: string }) => {
            try {
                const { certificate, payload } = buildCertificate(request)
                if (selectedAccount.device.type === DEVICE_TYPE.LEDGER) {
                    nav.navigate(Routes.LEDGER_SIGN_CERTIFICATE, {
                        request,
                        accountWithDevice: selectedAccount as LedgerAccountWithDevice,
                        certificate: certificate,
                    })
                    return
                }

                const signature = await signMessage(payload, password)
                if (!signature) {
                    throw new Error("Signature is empty")
                }

                dispatch(setIsAppLoading(true))

                const res: Connex.Vendor.CertResponse = {
                    signature: HexUtils.addPrefix(signature.toString("hex")),
                    annex: {
                        domain: certificate.domain,
                        timestamp: certificate.timestamp,
                        signer: certificate.signer,
                    },
                }

                if (request.type === "wallet-connect") {
                    await processRequest(request.requestEvent, res)
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

            onCloseBs()
        },
        [
            buildCertificate,
            dispatch,
            failRequest,
            nav,
            onCloseBs,
            postMessage,
            processRequest,
            selectedAccount,
            signMessage,
            track,
        ],
    )

    const onCancel = useCallback(
        async (request: CertificateRequest) => {
            if (request.type === "wallet-connect") {
                await failRequest(request.requestEvent, getRpcError("userRejectedRequest"))
            } else {
                postMessage({
                    id: request.id,
                    error: "User rejected request",
                    method: RequestMethods.REQUEST_TRANSACTION,
                })
            }

            track(AnalyticsEvent.DAPP_CERTIFICATE_REJECTED)

            onCloseBs()
        },
        [failRequest, onCloseBs, postMessage, track],
    )

    return (
        <BaseBottomSheet<Request> dynamicHeight ref={certificateBsRef}>
            {data => (
                <CertificateBottomSheetContent
                    onCancel={onCancel}
                    onSign={onSign}
                    onCloseBs={onCloseBs}
                    request={data.request}
                    selectAccountBsRef={selectAccountBsRef}
                />
            )}
        </BaseBottomSheet>
    )
}
