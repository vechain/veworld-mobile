import { useNavigation } from "@react-navigation/native"
import React, { memo, useCallback } from "react"
import { useBlockchainNetwork, useCameraBottomSheet, useCopyClipboard, useTheme, useVisitedUrls } from "~Hooks"
import { BaseIcon, BaseSpacer, BaseText, BaseView, useWalletConnect } from "~Components"
import { useI18nContext } from "~i18n"
import { RootStackParamListHome, Routes, TabStackParamList } from "~Navigation"
import HapticsService from "~Services/HapticsService"
import { ERROR_EVENTS, HeaderStyle, ScanTarget } from "~Constants"
import { SelectedNetworkViewer } from "~Components/Reusable/SelectedNetworkViewer"
import { AddressUtils, debug, URIUtils, WalletConnectUtils } from "~Utils"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { VeWorldLogoDarkSVG, VeWorldLogoSVG } from "~Assets"

type Navigation = NativeStackNavigationProp<TabStackParamList, "HomeStack"> &
    NativeStackNavigationProp<RootStackParamListHome, Routes.HOME>

export const Header = memo(() => {
    const theme = useTheme()
    const nav = useNavigation<Navigation>()
    const { LL } = useI18nContext()
    const { addVisitedUrl } = useVisitedUrls()
    const { isMainnet } = useBlockchainNetwork()

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

    const goToChooseNetwork = useCallback(() => {
        nav.navigate(Routes.SETTINGS_NETWORK)
    }, [nav])

    return (
        <BaseView w={100} style={HeaderStyle}>
            <BaseView flexDirection="row" alignItems="center" alignSelf="center">
                {theme.isDark ? (
                    <VeWorldLogoDarkSVG height={32} width={32} />
                ) : (
                    <VeWorldLogoSVG height={32} width={32} />
                )}
                <BaseSpacer width={8} />
                <BaseText typographyFont="bodySemiBold" testID="veworld-homepage">
                    {LL.VEWORLD()}
                </BaseText>
            </BaseView>

            <BaseView flexDirection="row">
                <BaseIcon
                    p={4}
                    name={"icon-qr-code"}
                    size={22}
                    color={theme.colors.text}
                    action={handleOpenCamera}
                    haptics="Light"
                />
                <BaseSpacer width={8} />
                <BaseIcon
                    p={4}
                    name={"icon-wallet"}
                    size={24}
                    color={theme.colors.text}
                    action={goToWalletManagement}
                    haptics="Light"
                    testID="HomeScreen_WalletManagementButton"
                />
                <BaseSpacer width={8} />
                <SelectedNetworkViewer />
                {isMainnet && (
                    <BaseIcon
                        p={4}
                        name={"icon-globe"}
                        size={24}
                        color={theme.colors.text}
                        action={goToChooseNetwork}
                        haptics="Light"
                    />
                )}
            </BaseView>

            {RenderCameraModal}
        </BaseView>
    )
})
