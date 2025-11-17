import React, { RefObject, useMemo } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { BaseBottomSheet, BaseText, BaseView, BaseButton, BaseIcon } from "~Components/Base"
import { StellaPayCard, StellaPayLogoSVG } from "~Assets"
import { useThemedStyles } from "~Hooks/useTheme"
import FastImage, { ImageStyle } from "react-native-fast-image"
import { COLORS } from "~Constants"
import { StyleSheet } from "react-native"
import { useI18nContext } from "~i18n"
import { useNavigation } from "@react-navigation/native"
import { RootStackParamListHome, Routes } from "~Navigation"
import { useBottomSheetModal, useBrowserNavigation } from "~Hooks"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"

type Props = {}

export const StellaPayBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(({}, ref) => {
    const { styles } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()
    const { navigateToBrowser } = useBrowserNavigation()
    const nav = useNavigation<NativeStackNavigationProp<RootStackParamListHome>>()

    const { onClose } = useBottomSheetModal({ externalRef: ref as RefObject<BottomSheetModalMethods> })

    const optionsItems = useMemo(
        () =>
            [
                {
                    icon: "icon-arrow-right",
                    title: LL.STELLA_PAY_BOTTOM_SHEET_EARN(),
                    description: LL.STELLA_PAY_BOTTOM_SHEET_EARN_DESCRIPTION(),
                },
                {
                    icon: "icon-credit-card",
                    title: LL.STELLA_PAY_BOTTOM_SHEET_GET_YOUR_FREE_CARD(),
                    description: LL.STELLA_PAY_BOTTOM_SHEET_GET_YOUR_FREE_CARD_DESCRIPTION(),
                },
                {
                    icon: "icon-coins",
                    title: LL.STELLA_PAY_BOTTOM_SHEET_SPEND(),
                    description: LL.STELLA_PAY_BOTTOM_SHEET_SPEND_DESCRIPTION(),
                },
            ] as const,
        [LL],
    )

    return (
        <BaseBottomSheet ref={ref} snapPoints={["92%"]} backgroundStyle={{ backgroundColor: COLORS.PURPLE }}>
            <BaseView flex={1} flexDirection="column" gap={24} alignItems="center" justifyContent="space-between">
                <BaseView flex={1} flexDirection="column" gap={24} alignItems="center">
                    <BaseView flexDirection="column" gap={12} alignItems="center">
                        <BaseText typographyFont="subTitleSemiBold">{LL.STELLA_PAY_BOTTOM_SHEET_TITLE()}</BaseText>
                        <StellaPayLogoSVG width={100} height={20} />
                    </BaseView>
                    <FastImage source={StellaPayCard} style={styles.image as ImageStyle} resizeMode="cover" />
                    <BaseView
                        flexDirection="column"
                        gap={20}
                        alignItems="flex-start"
                        alignSelf="flex-start"
                        justifyContent="flex-start"
                        px={24}>
                        {optionsItems.map(item => (
                            <BaseView key={item.title} flexDirection="row" gap={12} alignItems="flex-start">
                                <BaseView bg={COLORS.PURPLE_DISABLED} px={12} py={12} borderRadius={100}>
                                    <BaseIcon name={item.icon} size={16} color={COLORS.LIME_GREEN} />
                                </BaseView>
                                <BaseView flexDirection="column" gap={4} alignItems="flex-start">
                                    <BaseText typographyFont="bodySemiBold" color={COLORS.LIME_GREEN}>
                                        {item.title}
                                    </BaseText>
                                    <BaseText typographyFont="captionMedium">{item.description}</BaseText>
                                </BaseView>
                            </BaseView>
                        ))}
                    </BaseView>
                </BaseView>

                <BaseButton
                    w={100}
                    style={styles.button}
                    bgColor={COLORS.LIME_GREEN}
                    textColor={COLORS.PURPLE}
                    rightIcon={<BaseIcon name="icon-arrow-right" size={24} color={COLORS.PURPLE} />}
                    action={() => {
                        onClose()
                        navigateToBrowser("https://vebetter.stellapay.io/", url =>
                            nav.navigate(Routes.BROWSER, { url, returnScreen: Routes.HOME }),
                        )
                    }}>
                    {LL.STELLA_PAY_BOTTOM_SHEET_GET_YOUR_FREE_CARD()}
                </BaseButton>
            </BaseView>
        </BaseBottomSheet>
    )
})

const baseStyles = () =>
    StyleSheet.create({
        image: {
            width: 258,
            height: 215,
        },
        button: {
            justifyContent: "center",
            gap: 12,
        },
    })
