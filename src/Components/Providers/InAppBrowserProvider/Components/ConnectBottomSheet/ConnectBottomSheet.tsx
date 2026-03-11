import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { useCallback, useMemo, useRef } from "react"
import {
    BaseBottomSheet,
    BaseButton,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseView,
    SelectAccountBottomSheet,
} from "~Components"
import { useInteraction } from "~Components/Providers/InteractionProvider"
import { useWalletConnect } from "~Components/Providers/WalletConnectProvider"
import { AccountSelector } from "~Components/Reusable/AccountSelector"
import { ERROR_EVENTS } from "~Constants"
import { useBottomSheetModal, useSetSelectedAccount, useTheme } from "~Hooks"
import { useExternalDappConnection } from "~Hooks/useExternalDappConnection"
import { useI18nContext } from "~i18n"
import { ConnectAppRequest } from "~Model"
import {
    selectFeaturedDapps,
    selectSelectedAccountOrNull,
    selectVisibleAccountsWithoutObserved,
    useAppSelector,
} from "~Storage/Redux"
import { AccountUtils, error } from "~Utils"
import { useInAppBrowser } from "../../InAppBrowserProvider"
import { DappDetails } from "../DappDetails"
import { DappWithDetails } from "../DappWithDetails"
import { useWcConnect } from "./useWcConnect"
import { useWcSwitchChain } from "./useWcSwitchChain"

type Request = {
    request: ConnectAppRequest
}

const ConnectBottomSheetContent = ({
    request,
    onCancel,
    onConnect,
    onCloseBs,
    isLoading,
    selectAccountBsRef,
}: {
    request: ConnectAppRequest
    onConnect: (req: ConnectAppRequest) => Promise<void>
    onCancel: (req: ConnectAppRequest) => Promise<void>
    onCloseBs: () => void
    isLoading: boolean
    selectAccountBsRef: React.RefObject<BottomSheetModalMethods>
}) => {
    const { LL } = useI18nContext()
    const allApps = useAppSelector(selectFeaturedDapps)
    const theme = useTheme()
    const dappName = useMemo(() => {
        const foundDapp = allApps.find(app => new URL(app.href).origin === new URL(request.appUrl).origin)
        return foundDapp?.name ?? request.appName
    }, [allApps, request.appName, request.appUrl])
    const selectedAccount = useAppSelector(selectSelectedAccountOrNull)
    const visibleAccounts = useAppSelector(selectVisibleAccountsWithoutObserved)
    const { onClose: onCloseSelectAccountBs, onOpen: onOpenSelectAccountBs } = useBottomSheetModal({
        externalRef: selectAccountBsRef,
    })

    const { onSetSelectedAccount } = useSetSelectedAccount()

    useWcSwitchChain(request, { onCloseBs })

    const shouldShowAccountSelector = useMemo(() => {
        return request.type === "external-app"
    }, [request.type])

    const isWatchedAccount = useMemo(() => {
        return AccountUtils.isObservedAccount(selectedAccount)
    }, [selectedAccount])

    const onChangeAccountPress = useCallback(() => {
        onOpenSelectAccountBs()
    }, [onOpenSelectAccountBs])

    return (
        <>
            <BaseView flexDirection="row" gap={12} justifyContent="space-between">
                <BaseView flex={1} flexDirection="row" gap={12}>
                    <BaseIcon name="icon-apps" size={20} color={theme.colors.editSpeedBs.title} />
                    <BaseText typographyFont="subSubTitleSemiBold" color={theme.colors.editSpeedBs.title}>
                        {LL.CONNECTION_REQUEST_TITLE()}
                    </BaseText>
                </BaseView>
                {shouldShowAccountSelector && selectedAccount && (
                    <AccountSelector
                        account={selectedAccount}
                        variant="short"
                        changeable={shouldShowAccountSelector}
                        onPress={onChangeAccountPress}
                    />
                )}
            </BaseView>
            <BaseSpacer height={24} />
            <DappWithDetails appName={request.appName} appUrl={request.appUrl}>
                <DappDetails.Title>{LL.CONNECTED_APP_ASKING_FOR_ACCESS({ dappName })}</DappDetails.Title>
                <DappDetails.Container>
                    {([1, 2] as const).map(value => (
                        <DappDetails.CheckItem key={value}>
                            {LL[`CONNECTED_APP_ASKING_FOR_ACCESS_${value}`]()}
                        </DappDetails.CheckItem>
                    ))}
                </DappDetails.Container>
            </DappWithDetails>
            <BaseSpacer height={24} />
            <BaseView flexDirection="row" gap={16} mb={16}>
                <BaseButton action={onCancel.bind(null, request)} variant="outline" flex={1}>
                    {LL.COMMON_BTN_CANCEL()}
                </BaseButton>
                <BaseButton
                    action={onConnect.bind(null, request)}
                    flex={1}
                    isLoading={isLoading}
                    disabled={isLoading || isWatchedAccount}>
                    {LL.CONNECTION_REQUEST_CTA()}
                </BaseButton>
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

export const ConnectBottomSheet = () => {
    const { addAppAndNavToRequest, postMessage } = useInAppBrowser()
    const { connectBsRef, connectBsData, setConnectBsData } = useInteraction()
    const { ref, onClose: onCloseBs } = useBottomSheetModal({ externalRef: connectBsRef })
    const { rejectPendingProposal } = useWalletConnect()
    const { onConnect: onConnectExternalDapp, onRejectRequest } = useExternalDappConnection()
    const { ref: selectAccountBsRef } = useBottomSheetModal()

    const { processProposal, isLoading, setIsLoading } = useWcConnect({ onCloseBs })
    const isUserAction = useRef(false)

    const onConnect = useCallback(
        async (request: ConnectAppRequest) => {
            if (request.type === "wallet-connect") {
                await processProposal(request)
            } else if (request.type === "external-app") {
                await onConnectExternalDapp({
                    dappPublicKey: request.publicKey,
                    redirectUrl: request.redirectUrl,
                    dappName: request.appName,
                    dappUrl: request.appUrl,
                    genesisId: request.genesisId,
                })
            } else {
                addAppAndNavToRequest(request.initialRequest)
            }
            isUserAction.current = true
            onCloseBs()
        },
        [addAppAndNavToRequest, onCloseBs, onConnectExternalDapp, processProposal],
    )

    const rejectProposal = useCallback(
        async (request: ConnectAppRequest) => {
            if (request.type === "wallet-connect") {
                try {
                    await rejectPendingProposal(request.proposal)
                } catch (err: unknown) {
                    error(ERROR_EVENTS.WALLET_CONNECT, err)
                }
            } else if (request.type === "external-app") {
                await onRejectRequest(request.redirectUrl)
            } else {
                postMessage({
                    id: request.initialRequest.id,
                    error: "User rejected the request",
                    method: request.initialRequest.method,
                })
            }
        },
        [onRejectRequest, postMessage, rejectPendingProposal],
    )

    const onCancel = useCallback(
        async (request: ConnectAppRequest) => {
            await rejectProposal(request)
            isUserAction.current = true
            onCloseBs()
        },
        [onCloseBs, rejectProposal],
    )

    const onDismiss = useCallback(async () => {
        try {
            if (isUserAction.current) {
                setConnectBsData(null)
                isUserAction.current = false
                return
            }
            if (!connectBsData) return
            await rejectProposal(connectBsData)
            isUserAction.current = false
            setConnectBsData(null)
        } finally {
            setIsLoading(false)
        }
    }, [connectBsData, rejectProposal, setConnectBsData, setIsLoading])

    return (
        <BaseBottomSheet<Request> dynamicHeight ref={ref} onDismiss={onDismiss}>
            {connectBsData && (
                <ConnectBottomSheetContent
                    request={connectBsData}
                    onCancel={onCancel}
                    onConnect={onConnect}
                    onCloseBs={onCloseBs}
                    isLoading={isLoading}
                    selectAccountBsRef={selectAccountBsRef}
                />
            )}
        </BaseBottomSheet>
    )
}
