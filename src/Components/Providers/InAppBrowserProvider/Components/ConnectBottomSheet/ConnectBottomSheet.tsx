import { default as React, useCallback, useMemo, useRef } from "react"
import { BaseBottomSheet, BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { useInteraction } from "~Components/Providers/InteractionProvider"
import { useWalletConnect } from "~Components/Providers/WalletConnectProvider"
import { ERROR_EVENTS } from "~Constants"
import { useBottomSheetModal, useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { ConnectAppRequest } from "~Model"
import { selectFeaturedDapps, useAppSelector } from "~Storage/Redux"
import { DAppUtils, error } from "~Utils"
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
}: {
    request: ConnectAppRequest
    onConnect: (req: ConnectAppRequest) => Promise<void>
    onCancel: (req: ConnectAppRequest) => Promise<void>
    onCloseBs: () => void
    isLoading: boolean
}) => {
    const { LL } = useI18nContext()
    const allApps = useAppSelector(selectFeaturedDapps)
    const theme = useTheme()
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

    useWcSwitchChain(request, { onCloseBs })

    return (
        <>
            <BaseView flexDirection="row" gap={12}>
                <BaseIcon name="icon-apps" size={20} color={theme.colors.editSpeedBs.title} />
                <BaseText typographyFont="subTitleSemiBold" color={theme.colors.editSpeedBs.title}>
                    {LL.CONNECTION_REQUEST_TITLE()}
                </BaseText>
            </BaseView>
            <BaseSpacer height={24} />
            <DappWithDetails name={name} icon={icon} url={url}>
                <DappDetails.Title>{LL.CONNECTED_APP_ASKING_FOR_ACCESS({ dappName: name })}</DappDetails.Title>
                <DappDetails.Container>
                    {([1, 2] as const).map(value => (
                        <DappDetails.CheckItem key={value}>
                            {LL[`CONNECTED_APP_ASKING_FOR_ACCESS_${value}`]()}
                        </DappDetails.CheckItem>
                    ))}
                </DappDetails.Container>
            </DappWithDetails>
            <BaseSpacer height={24} />
            <BaseView flexDirection="row" gap={16}>
                <BaseButton action={onCancel.bind(null, request)} variant="outline" flex={1}>
                    {LL.COMMON_BTN_CANCEL()}
                </BaseButton>
                <BaseButton action={onConnect.bind(null, request)} flex={1} isLoading={isLoading} disabled={isLoading}>
                    {LL.CONNECTION_REQUEST_CTA()}
                </BaseButton>
            </BaseView>
        </>
    )
}

export const ConnectBottomSheet = () => {
    const { addAppAndNavToRequest, postMessage } = useInAppBrowser()
    const { connectBsRef, connectBsData, setConnectBsData } = useInteraction()
    const { ref, onClose: onCloseBs } = useBottomSheetModal({ externalRef: connectBsRef })
    const { rejectPendingProposal } = useWalletConnect()

    const { processProposal, isLoading, setIsLoading } = useWcConnect({ onCloseBs })
    const isUserAction = useRef(false)

    const onConnect = useCallback(
        async (request: ConnectAppRequest) => {
            if (request.type === "wallet-connect") {
                await processProposal(request)
            } else {
                addAppAndNavToRequest(request.initialRequest)
            }
            isUserAction.current = true
            onCloseBs()
        },
        [addAppAndNavToRequest, onCloseBs, processProposal],
    )

    const rejectProposal = useCallback(
        async (request: ConnectAppRequest) => {
            if (request.type === "wallet-connect") {
                try {
                    await rejectPendingProposal(request.proposal)
                } catch (err: unknown) {
                    error(ERROR_EVENTS.WALLET_CONNECT, err)
                }
            } else {
                postMessage({
                    id: request.initialRequest.id,
                    error: "User rejected the request",
                    method: request.initialRequest.method,
                })
            }
        },
        [postMessage, rejectPendingProposal],
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
                />
            )}
        </BaseBottomSheet>
    )
}
