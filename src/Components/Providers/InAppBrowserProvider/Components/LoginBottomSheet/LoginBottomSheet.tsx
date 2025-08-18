import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { Blake2b256, Certificate } from "@vechain/sdk-core"
import { ethers } from "ethers"
import { default as React, useCallback, useMemo, useRef, useState } from "react"
import { BaseBottomSheet, BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components/Base"
import { useInAppBrowser } from "~Components/Providers/InAppBrowserProvider"
import { useInteraction } from "~Components/Providers/InteractionProvider"
import { SelectAccountBottomSheet } from "~Components/Reusable"
import { AccountSelector } from "~Components/Reusable/AccountSelector"
import { COLORS } from "~Constants"
import { useBottomSheetModal, useSetSelectedAccount, useSignMessage, useTheme } from "~Hooks"
import { useSignTypedMessage } from "~Hooks/useSignTypedData"
import { useI18nContext } from "~i18n"
import { DEVICE_TYPE, LoginRequest, TypedDataMessage } from "~Model"
import { selectSelectedAccountOrNull, selectVisibleAccountsWithoutObserved, useAppSelector } from "~Storage/Redux"
import { AccountUtils, HexUtils } from "~Utils"
import { isIOS } from "~Utils/PlatformUtils/PlatformUtils"
import { DappDetails } from "../DappDetails"
import { DappDetailsCard } from "../DappDetailsCard"
import { Signable } from "../Signable"
import { LedgerDeviceAlert as TypedDataLedgerDeviceAlert } from "../TypedDataBottomSheet/LedgerDeviceAlert"
import { Renderer as TypedDataRenderer } from "../TypedDataBottomSheet/Renderer"

type Props = {
    request: LoginRequest
    onCancel: (request: LoginRequest) => Promise<void>
    onSign: (args: { request: LoginRequest; password?: string }) => Promise<void>
    selectAccountBsRef: React.RefObject<BottomSheetModalMethods>
    isLoading: boolean
}

const LoginBottomSheetContent = ({ request, onCancel, onSign, selectAccountBsRef, isLoading }: Props) => {
    const { LL } = useI18nContext()
    const theme = useTheme()

    const selectedAccount = useAppSelector(selectSelectedAccountOrNull)
    const visibleAccounts = useAppSelector(selectVisibleAccountsWithoutObserved)
    const { onClose: onCloseSelectAccountBs, onOpen: onOpenSelectAccountBs } = useBottomSheetModal({
        externalRef: selectAccountBsRef,
    })

    const { onSetSelectedAccount } = useSetSelectedAccount()

    const enhancedRequest = useMemo(() => {
        //Using ethers.utils.getAddress to checksum the address
        switch (request.kind) {
            case "simple":
                return request
            case "certificate": {
                return {
                    ...request,
                    value: {
                        ...request.value,
                        payload: {
                            type: "text",
                            content: request.value.payload.content.replace(
                                "<<veworld_address>>",
                                ethers.utils.getAddress(selectedAccount?.address ?? ""),
                            ),
                        },
                    } satisfies Connex.Vendor.CertMessage,
                }
            }
            case "typed-data": {
                if ("VeWorldLogin" in request.value.types)
                    return {
                        ...request,
                        value: {
                            ...request.value,
                            value: {
                                ...request.value.value,
                                veworld_login_address: ethers.utils.getAddress(selectedAccount?.address ?? ""),
                            },
                        } satisfies TypedDataMessage,
                    }
                return {
                    ...request,
                    value: {
                        ...request.value,
                        types: {
                            ...request.value.types,
                            VeWorldLogin: [{ name: "veworld_login_address", type: "address" }],
                        },
                        value: {
                            ...request.value.value,
                            veworld_login_address: ethers.utils.getAddress(selectedAccount?.address ?? ""),
                        },
                    } satisfies TypedDataMessage,
                }
            }
        }
    }, [request, selectedAccount?.address])

    const signableArgs = useMemo(() => ({ request: enhancedRequest }), [enhancedRequest])

    const onChangeAccountPress = useCallback(() => {
        onOpenSelectAccountBs()
    }, [onOpenSelectAccountBs])

    const isConfirmDisabled = useMemo(
        () =>
            AccountUtils.isObservedAccount(selectedAccount) ||
            isLoading ||
            !selectedAccount ||
            (request.kind === "typed-data" && selectedAccount.device.type === DEVICE_TYPE.LEDGER),
        [isLoading, request.kind, selectedAccount],
    )

    return (
        <>
            <BaseView flexDirection="row" gap={12} justifyContent="space-between" testID="LOGIN_REQUEST_TITLE">
                <BaseView flex={1} flexDirection="row" gap={12}>
                    <BaseIcon name="icon-certificate" size={20} color={theme.colors.editSpeedBs.title} />
                    <BaseText typographyFont="subTitleSemiBold" color={theme.colors.editSpeedBs.title}>
                        {LL.LOGIN_REQUEST_TITLE()}
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
            <DappDetailsCard
                appName={request.appName}
                appUrl={request.appUrl}
                renderDetailsButton={request.kind !== "simple"}>
                {({ visible }) => (
                    <>
                        {selectedAccount?.device.type === DEVICE_TYPE.LEDGER && (
                            <>
                                <TypedDataLedgerDeviceAlert />
                                <BaseSpacer height={16} />
                            </>
                        )}
                        <DappDetails show={visible}>
                            {enhancedRequest.kind === "typed-data" ? (
                                <TypedDataRenderer.Container>
                                    <TypedDataRenderer value={enhancedRequest.value} />
                                </TypedDataRenderer.Container>
                            ) : enhancedRequest.kind === "certificate" ? (
                                <BaseText
                                    color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600}
                                    typographyFont="captionRegular">
                                    {enhancedRequest.value.payload.content}
                                </BaseText>
                            ) : null}
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
                    testID="LOGIN_REQUEST_BTN_CANCEL">
                    {LL.COMMON_BTN_CANCEL()}
                </BaseButton>
                <Signable args={signableArgs} onSign={onSign}>
                    {({ checkIdentityBeforeOpening, isBiometricsEmpty }) => (
                        <BaseButton
                            action={checkIdentityBeforeOpening}
                            flex={1}
                            disabled={isConfirmDisabled || isBiometricsEmpty}
                            isLoading={isLoading}
                            testID="LOGIN_REQUEST_BTN_SIGN">
                            {LL.LOGIN_REQUEST_TITLE()}
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

export const LoginBottomSheet = () => {
    const { loginBsRef, loginBsData, setLoginBsData } = useInteraction()
    const { onClose: onCloseBs } = useBottomSheetModal({ externalRef: loginBsRef })

    const { ref: selectAccountBsRef } = useBottomSheetModal()

    const { postMessage } = useInAppBrowser()

    const selectedAccount = useAppSelector(selectSelectedAccountOrNull)

    const isUserAction = useRef(false)

    const [isLoading, setIsLoading] = useState(false)

    const buildTypedData = useCallback(
        (request: Extract<LoginRequest, { kind: "typed-data" }>) => {
            if (!selectedAccount) return
            return {
                timestamp: Math.round(Date.now() / 1000),
                signer: selectedAccount?.address ?? "",
                ...request.value,
            }
        },
        [selectedAccount],
    )

    const buildCertificate = useCallback(
        (request: Extract<LoginRequest, { kind: "certificate" }>) => {
            if (!selectedAccount) return
            const certificate = Certificate.of({
                purpose: request.value.purpose,
                payload: request.value.payload,
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
    const { signTypedData } = useSignTypedMessage()
    const { signMessage } = useSignMessage()

    const signRequest = useCallback(
        async (request: LoginRequest, password?: string) => {
            switch (request.kind) {
                case "simple":
                    return { signer: selectedAccount?.address ?? "" }
                case "certificate": {
                    const { certificate, payload } = buildCertificate(request)!
                    const signature = await signMessage(payload, password)
                    return {
                        signature: HexUtils.addPrefix(signature!.toString("hex")),
                        annex: {
                            domain: certificate.domain,
                            timestamp: certificate.timestamp,
                            signer: certificate.signer,
                        },
                    }
                }
                case "typed-data": {
                    const typedData = buildTypedData(request)!
                    const signature = await signTypedData(typedData, password)
                    return {
                        signature: signature!,
                        signer: selectedAccount?.address ?? "",
                    }
                }
            }
        },
        [buildCertificate, buildTypedData, selectedAccount?.address, signMessage, signTypedData],
    )

    const onSign = useCallback(
        async ({ request, password }: { request: LoginRequest; password?: string }) => {
            try {
                setIsLoading(true)

                const result = await signRequest(request, password)

                postMessage({
                    id: request.id,
                    data: result,
                    method: request.method,
                })

                //TODO: Maybe add Login activity?
                //TODO: Maybe track Login with MP

                isUserAction.current = true
            } catch (err: unknown) {
                postMessage({
                    id: request.id,
                    error: "Login failed",
                    method: request.method,
                })
            }
            onCloseBs()
        },
        [onCloseBs, postMessage, signRequest],
    )

    const rejectRequest = useCallback(
        async (request: LoginRequest) => {
            setIsLoading(true)
            postMessage({
                id: request.id,
                error: "User rejected request",
                method: request.method,
            })

            //TODO: Maybe add MP event
        },
        [postMessage],
    )

    const onCancel = useCallback(
        async (request: LoginRequest) => {
            await rejectRequest(request)
            isUserAction.current = true
            onCloseBs()
        },
        [onCloseBs, rejectRequest],
    )

    const onDismiss = useCallback(async () => {
        try {
            if (isUserAction.current) {
                setLoginBsData(null)
                isUserAction.current = false
                return
            }
            if (!loginBsData) return
            await rejectRequest(loginBsData)
            isUserAction.current = false
            setLoginBsData(null)
        } finally {
            setIsLoading(false)
        }
    }, [loginBsData, rejectRequest, setLoginBsData])

    return (
        <BaseBottomSheet dynamicHeight ref={loginBsRef} onDismiss={onDismiss}>
            {loginBsData && (
                <LoginBottomSheetContent
                    onCancel={onCancel}
                    onSign={onSign}
                    request={loginBsData}
                    selectAccountBsRef={selectAccountBsRef}
                    isLoading={isLoading}
                />
            )}
        </BaseBottomSheet>
    )
}
