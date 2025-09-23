import React, { useCallback, useMemo, useRef } from "react"
import { BaseBottomSheet, BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { useInteraction } from "~Components/Providers/InteractionProvider"
import { ERROR_EVENTS } from "~Constants"
import { useBottomSheetModal, useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { DisconnectAppRequest } from "~Model"
import { selectFeaturedDapps, useAppSelector } from "~Storage/Redux"
import { error } from "~Utils"
import { DappDetails } from "../DappDetails"
import { DappWithDetails } from "../DappWithDetails"
import { useExternalDappConnection } from "~Hooks/useExternalDappConnection"

type Request = {
    request: DisconnectAppRequest
}

const DisconnectBottomSheetContent = ({
    request,
    onCancel,
    onDisconnect,
}: {
    request: DisconnectAppRequest
    onDisconnect: (req: DisconnectAppRequest) => Promise<void>
    onCancel: (req: DisconnectAppRequest) => Promise<void>
}) => {
    const { LL } = useI18nContext()
    const allApps = useAppSelector(selectFeaturedDapps)
    const theme = useTheme()
    const dappName = useMemo(() => {
        const foundDapp = allApps.find(app => new URL(app.href).origin === new URL(request.appUrl).origin)
        return foundDapp?.name ?? request.appName
    }, [allApps, request.appName, request.appUrl])

    return (
        <>
            <BaseView flexDirection="row" gap={12}>
                <BaseIcon name="icon-apps" size={20} color={theme.colors.editSpeedBs.title} />
                <BaseText typographyFont="subTitleSemiBold" color={theme.colors.editSpeedBs.title}>
                    {"Disconnection request"}
                </BaseText>
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
                <BaseButton action={onDisconnect.bind(null, request)} flex={1}>
                    {"Disconnect"}
                </BaseButton>
            </BaseView>
        </>
    )
}

export const DisconnectBottomSheet = () => {
    const { disconnectBsRef, disconnectBsData, setDisconnectBsData } = useInteraction()
    const { ref, onClose: onCloseBs } = useBottomSheetModal({ externalRef: disconnectBsRef })
    const { onDappDisconnected, onRejectRequest } = useExternalDappConnection()

    const isUserAction = useRef(false)

    const onDisconnect = useCallback(
        async (request: DisconnectAppRequest) => {
            if (request.type === "external-app") {
                isUserAction.current = true
                await onDappDisconnected({
                    dappPublicKey: request.publicKey,
                    redirectUrl: request.redirectUrl,
                    genesisId: request.genesisId,
                })
                onCloseBs()
            }
        },
        [onCloseBs, onDappDisconnected],
    )

    const rejectProposal = useCallback(
        async (request: DisconnectAppRequest) => {
            if (request.type === "external-app") {
                try {
                    await onRejectRequest(request.redirectUrl)
                } catch (err: unknown) {
                    error(ERROR_EVENTS.WALLET_CONNECT, err)
                }
            }
        },
        [onRejectRequest],
    )

    const onCancel = useCallback(
        async (request: DisconnectAppRequest) => {
            await rejectProposal(request)
            isUserAction.current = true
            onCloseBs()
        },
        [onCloseBs, rejectProposal],
    )

    const onDismiss = useCallback(async () => {
        try {
            if (isUserAction.current) {
                setDisconnectBsData(null)
                isUserAction.current = false
                return
            }
            if (!disconnectBsData) return
            await rejectProposal(disconnectBsData)
            isUserAction.current = false
            setDisconnectBsData(null)
        } catch (err) {
            error(ERROR_EVENTS.EXTERNAL_DAPP_CONNECTION, err)
        }
    }, [disconnectBsData, rejectProposal, setDisconnectBsData])

    return (
        <BaseBottomSheet<Request> dynamicHeight ref={ref} onDismiss={onDismiss}>
            {disconnectBsData && (
                <DisconnectBottomSheetContent
                    request={disconnectBsData}
                    onCancel={onCancel}
                    onDisconnect={onDisconnect}
                />
            )}
        </BaseBottomSheet>
    )
}
