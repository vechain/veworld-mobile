import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { memo, useCallback } from "react"
import { VeWorldLogoSVG } from "~Assets"
import { BaseIcon, BaseSpacer, BaseText, BaseView, HeaderStyleV2 } from "~Components"
import { NetworkSwitcherContextMenu } from "~Components/Reusable/ContextMenu"
import { SelectedNetworkViewer } from "~Components/Reusable/SelectedNetworkViewer"
import { ScanTarget } from "~Constants"
import { useBlockchainNetwork, useCameraBottomSheet, useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { RootStackParamListHome, Routes, TabStackParamList } from "~Navigation"

type Navigation = NativeStackNavigationProp<TabStackParamList, "HomeStack"> &
    NativeStackNavigationProp<RootStackParamListHome, Routes.HOME>

export const Header = memo(() => {
    const theme = useTheme()
    const nav = useNavigation<Navigation>()
    const { LL } = useI18nContext()
    const { isMainnet } = useBlockchainNetwork()

    const { RenderCameraModal, handleOpenOnlyScanCamera } = useCameraBottomSheet({
        targets: [ScanTarget.WALLET_CONNECT, ScanTarget.ADDRESS, ScanTarget.HTTPS_URL],
    })

    const goToWalletManagement = useCallback(() => {
        nav.navigate(Routes.WALLET_MANAGEMENT)
    }, [nav])

    const goToChooseNetwork = useCallback(() => {
        nav.navigate(Routes.SETTINGS_NETWORK)
    }, [nav])

    return (
        <BaseView w={100} style={HeaderStyleV2}>
            <BaseView flexDirection="row" alignItems="center" alignSelf="center">
                <VeWorldLogoSVG height={32} width={32} color={theme.colors.veworldLogo} />
                <BaseSpacer width={8} />
                <BaseText typographyFont="subTitleSemiBold" testID="veworld-homepage">
                    {LL.VEWORLD()}
                </BaseText>
            </BaseView>

            <BaseView flexDirection="row">
                <BaseIcon
                    p={4}
                    name={"icon-qr-code"}
                    size={22}
                    color={theme.colors.text}
                    action={handleOpenOnlyScanCamera}
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
                <NetworkSwitcherContextMenu>
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
                </NetworkSwitcherContextMenu>
            </BaseView>

            {RenderCameraModal}
        </BaseView>
    )
})
