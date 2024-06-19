import { useNavigation } from "@react-navigation/native"
import React, { memo, useCallback } from "react"
import { useCameraBottomSheet, useCopyClipboard, useTheme, useVisitedUrls } from "~Hooks"
import { BaseIcon, BaseText, BaseView, useWalletConnect } from "~Components"
import { useI18nContext } from "~i18n"
import { RootStackParamListHome, Routes, TabStackParamList } from "~Navigation"
import HapticsService from "~Services/HapticsService"
import { ERROR_EVENTS, ScanTarget } from "~Constants"
import { SelectedNetworkViewer } from "~Components/Reusable/SelectedNetworkViewer"
import { AddressUtils, debug, URIUtils, WalletConnectUtils } from "~Utils"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"

type Navigation = NativeStackNavigationProp<TabStackParamList, "HomeStack"> &
    NativeStackNavigationProp<RootStackParamListHome, Routes.HOME>

export const Header = memo(() => {
    const theme = useTheme()
    const nav = useNavigation<Navigation>()
    const { LL } = useI18nContext()
    const { addVisitedUrl } = useVisitedUrls()

    const { onPair } = useWalletConnect()

    const { onCopyToClipboard } = useCopyClipboard()

    const goToInAppBrowser = useCallback(
        (url: string) => {
            nav.reset({
                routes: [
                    {
                        name: "DiscoverStack",
                        params: {
                            state: {
                                routes: [{ name: Routes.DISCOVER }, { name: Routes.BROWSER, params: { url } }],
                            },
                        },
                    },
                ],
            })
        },
        [nav],
    )

    const onScan = useCallback(
        (qrData: string) => {
            if (WalletConnectUtils.validateUri(qrData).isValid) {
                HapticsService.triggerImpact({ level: "Light" })
                onPair(qrData)
            } else if (AddressUtils.isValid(qrData)) {
                onCopyToClipboard(qrData, LL.COMMON_LBL_ADDRESS())
            } else if (URIUtils.isValid(qrData) && URIUtils.isHttps(qrData)) {
                addVisitedUrl(qrData)
                goToInAppBrowser(qrData)
            } else {
                debug(ERROR_EVENTS.APP, qrData)
            }
        },
        [LL, addVisitedUrl, goToInAppBrowser, onCopyToClipboard, onPair],
    )

    const { RenderCameraModal, handleOpenCamera } = useCameraBottomSheet({
        onScan,
        targets: [ScanTarget.WALLET_CONNECT, ScanTarget.ADDRESS, ScanTarget.HTTPS_URL],
    })

    const goToWalletManagement = useCallback(() => {
        nav.navigate(Routes.WALLET_MANAGEMENT)
    }, [nav])

    return (
        <BaseView w={100} px={20} pb={8} flexDirection="row" alignItems="center" justifyContent="space-between">
            <BaseView alignItems="flex-start" alignSelf="flex-start">
                <BaseText typographyFont="largeTitle" testID="veworld-homepage">
                    {LL.VEWORLD()}
                </BaseText>
            </BaseView>

            <BaseView flexDirection="row">
                <SelectedNetworkViewer />
                <BaseIcon
                    name={"qrcode-scan"}
                    size={24}
                    color={theme.colors.text}
                    action={handleOpenCamera}
                    mx={12}
                    haptics="Light"
                />

                <BaseIcon
                    name={"wallet-outline"}
                    size={24}
                    bg={theme.colors.secondary}
                    action={goToWalletManagement}
                    haptics="Light"
                    testID="HomeScreen_WalletManagementButton"
                />
            </BaseView>

            {RenderCameraModal}
        </BaseView>
    )
})
