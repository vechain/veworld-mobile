import { default as React, useCallback } from "react"
import { StyleSheet } from "react-native"
import { BaseBottomSheet, BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { ColorThemeType } from "~Constants"
import { useBottomSheetModal, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { ConnectAppRequest } from "~Model"
import { selectFeaturedDapps, useAppSelector } from "~Storage/Redux"
import { DAppUtils } from "~Utils"
import { useInteraction } from "../../InteractionProvider"
import { useInAppBrowser } from "../InAppBrowserProvider"
import { DappDetails } from "./DappDetails"
import { DappWithDetails } from "./DappWithDetails"

type Request = {
    request: Extract<ConnectAppRequest, { type: "in-app" }>
}

export const ConnectBottomSheet = () => {
    const { LL } = useI18nContext()
    const { addAppAndNavToRequest, postMessage } = useInAppBrowser()
    const { connectBsRef } = useInteraction()
    const { ref, onClose: onCloseBs } = useBottomSheetModal({ externalRef: connectBsRef })

    const { styles, theme } = useThemedStyles(baseStyles)

    const allApps = useAppSelector(selectFeaturedDapps)

    const getInfo = useCallback(
        (req: Request) => {
            const foundDapp = allApps.find(app => new URL(app.href).origin === new URL(req.request.appUrl).origin)
            if (foundDapp)
                return {
                    icon: foundDapp.id
                        ? DAppUtils.getAppHubIconUrl(foundDapp.id)
                        : `${process.env.REACT_APP_GOOGLE_FAVICON_URL}${new URL(foundDapp.href).origin}`,
                    name: foundDapp.name,
                    url: req.request.appUrl,
                }

            return {
                name: req.request.appName,
                url: req.request.appUrl,
                icon: `${process.env.REACT_APP_GOOGLE_FAVICON_URL}${new URL(req.request.appUrl).origin}`,
            }
        },
        [allApps],
    )

    const onConnect = useCallback(
        ({ request }: Request) => {
            onCloseBs()
            addAppAndNavToRequest(request.initialRequest)
        },
        [addAppAndNavToRequest, onCloseBs],
    )

    const onCancel = useCallback(
        ({ request }: Request) => {
            postMessage({
                id: request.initialRequest.id,
                error: "User rejected the request",
                method: request.initialRequest.method,
            })
            onCloseBs()
        },
        [onCloseBs, postMessage],
    )

    return (
        <>
            <BaseBottomSheet<Request> dynamicHeight contentStyle={styles.rootContent} ref={ref}>
                {data => {
                    const { icon, name, url } = getInfo(data)
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
                                <DappDetails.Title>
                                    {LL.CONNECTED_APP_ASKING_FOR_ACCESS({ dappName: name })}
                                </DappDetails.Title>
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
                                <BaseButton action={onCancel.bind(null, data)} variant="outline" flex={1}>
                                    {LL.COMMON_BTN_CANCEL()}
                                </BaseButton>
                                <BaseButton action={onConnect.bind(null, data)} flex={1}>
                                    {LL.COMMON_BTN_APPLY()}
                                </BaseButton>
                            </BaseView>
                        </>
                    )
                }}
            </BaseBottomSheet>
        </>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        rootContent: {
            paddingBottom: 40,
        },
        icon: {
            borderRadius: 8,
            overflow: "hidden",
        },
        detailsContainer: {
            backgroundColor: theme.colors.editSpeedBs.result.background,
            borderColor: theme.colors.editSpeedBs.result.border,
            borderWidth: 1,
            padding: 16,
            gap: 12,
        },
        rightIcon: {
            marginLeft: 2,
        },
    })
