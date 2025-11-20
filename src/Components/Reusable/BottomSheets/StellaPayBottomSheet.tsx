import React, { RefObject, useCallback, useMemo, useState } from "react"
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
import { useBottomSheetModal } from "~Hooks"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { useBrowserTab } from "~Hooks/useBrowserTab"
import { selectCurrentScreen, setHideStellaPayBottomSheet, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { CheckBoxWithText } from "../CheckBoxWithText"

type Props = {}

export const StellaPayBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(({}, ref) => {
    const [isChecked, setIsChecked] = useState(false)

    const currentRoute = useAppSelector(selectCurrentScreen)

    const dispatch = useAppDispatch()
    const { styles } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()
    const { navigateWithTab } = useBrowserTab()
    const nav = useNavigation<NativeStackNavigationProp<RootStackParamListHome>>()
    const { onClose } = useBottomSheetModal({ externalRef: ref as RefObject<BottomSheetModalMethods> })

    const returnScreen = useMemo(() => {
        switch (currentRoute) {
            case Routes.HOME:
                return Routes.HOME
            case Routes.APPS:
                return Routes.APPS
            default:
                return Routes.HOME
        }
    }, [currentRoute])

    const optionsItems = useMemo(
        () =>
            [
                {
                    icon: "icon-vebetter",
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

    const onClick = useCallback(async () => {
        await navigateWithTab({
            url: "https://vebetter.stellapay.io/",
            title: "Stella Pay",
            navigationFn: url => nav.navigate(Routes.BROWSER, { url, returnScreen: returnScreen }),
        })

        if (isChecked) {
            dispatch(setHideStellaPayBottomSheet(true))
        }

        onClose()
    }, [navigateWithTab, onClose, nav, returnScreen, isChecked, dispatch])

    const onDismiss = useCallback(() => {
        if (isChecked) {
            dispatch(setHideStellaPayBottomSheet(true))
        }
    }, [isChecked, dispatch])

    return (
        <BaseBottomSheet
            ref={ref}
            snapPoints={["92%"]}
            backgroundStyle={styles.bottomSheet}
            onDismiss={onDismiss}
            handleColor={COLORS.DARK_PURPLE_DISABLED}>
            <BaseView flex={1} flexDirection="column" gap={24} alignItems="center" justifyContent="space-between">
                <BaseView flex={1} flexDirection="column" gap={24} alignItems="center">
                    <BaseView flexDirection="column" gap={12} alignItems="center">
                        <BaseText typographyFont="subTitleSemiBold" color={COLORS.WHITE}>
                            {LL.STELLA_PAY_BOTTOM_SHEET_TITLE()}
                        </BaseText>
                        <StellaPayLogoSVG width={100} height={20} color={COLORS.WHITE} />
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
                            <BaseView key={item.title} flexDirection="row" gap={16} alignItems="flex-start">
                                <BaseView bg={COLORS.PURPLE_DISABLED} px={12} py={12} borderRadius={100}>
                                    <BaseIcon name={item.icon} size={16} color={COLORS.LIME_GREEN} />
                                </BaseView>
                                <BaseView flexDirection="column" gap={4} alignItems="flex-start">
                                    <BaseText typographyFont="bodySemiBold" color={COLORS.LIME_GREEN}>
                                        {item.title}
                                    </BaseText>
                                    <BaseText typographyFont="captionMedium" color={COLORS.GREY_100}>
                                        {item.description}
                                    </BaseText>
                                </BaseView>
                            </BaseView>
                        ))}
                    </BaseView>
                </BaseView>

                <BaseView flexDirection="column" gap={16} w={100}>
                    <BaseButton
                        w={100}
                        style={styles.button}
                        bgColor={COLORS.LIME_GREEN}
                        textColor={COLORS.PURPLE}
                        rightIcon={<BaseIcon name="icon-arrow-right" size={24} color={COLORS.PURPLE} />}
                        action={onClick}>
                        {LL.STELLA_PAY_BOTTOM_SHEET_GET_YOUR_FREE_CARD()}
                    </BaseButton>
                    <CheckBoxWithText
                        isChecked={isChecked}
                        text={LL.STELLA_PAY_BOTTOM_SHEET_DONT_SHOW_AGAIN()}
                        checkAction={setIsChecked}
                        testID="stella-pay-bottom-sheet-dont-show-again-checkbox"
                        fontColor={COLORS.WHITE}
                        checkBoxColor={COLORS.WHITE}
                        style={styles.checkbox}
                        font="bodyMedium"
                    />
                </BaseView>
            </BaseView>
        </BaseBottomSheet>
    )
})

const baseStyles = () =>
    StyleSheet.create({
        bottomSheet: {
            backgroundColor: COLORS.PURPLE,
        },
        image: {
            width: 219,
            height: 182,
        },
        button: {
            justifyContent: "center",
            gap: 12,
        },
        checkbox: {
            justifyContent: "center",
        },
    })
