import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"
import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useState } from "react"
import { StyleSheet } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useAppReset, useTheme } from "~Hooks"
import {
    BaseButton,
    BaseIcon,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    CheckBoxWithText,
} from "~Components"
import { useI18nContext } from "~i18n"

export const ResetAppScreen = () => {
    const appReset = useAppReset()
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const theme = useTheme()
    const tabbarHeight = useBottomTabBarHeight()
    const insets = useSafeAreaInsets()

    const bottomPadding = tabbarHeight - insets.bottom

    const [isChecked, setIsChecked] = useState(false)

    // navigate to reset app screen
    const onBackPress = useCallback(() => nav.goBack(), [nav])

    return (
        <BaseSafeArea grow={1} style={{ paddingBottom: bottomPadding }}>
            <BaseIcon
                style={baseStyles.backIcon}
                size={36}
                name="chevron-left"
                color={theme.colors.text}
                action={onBackPress}
            />

            <BaseSpacer height={12} />

            <BaseView
                alignItems="center"
                justifyContent="space-between"
                flexGrow={1}
                mx={20}>
                <BaseView alignSelf="flex-start">
                    <BaseText typographyFont="title">
                        {LL.TITLE_RESET_APP()}
                    </BaseText>

                    <BaseText typographyFont="bodyMedium" my={10}>
                        {LL.BD_CONFIRM_RESET()}
                    </BaseText>

                    <BaseText typographyFont="body" my={10}>
                        {LL.BD_RESET_APP_01()}
                    </BaseText>

                    <BaseText typographyFont="body" my={10}>
                        {LL.BD_RESET_APP_02()}
                    </BaseText>

                    <BaseText
                        typographyFont="body"
                        my={10}
                        color={theme.colors.danger}>
                        {LL.BD_RESET_APP_DISCLAIMER()}
                    </BaseText>
                </BaseView>

                <BaseView alignItems="center" w={100}>
                    <CheckBoxWithText
                        isChecked={isChecked}
                        text={LL.BTN_RESET_APP_CHECKBOX()}
                        checkAction={setIsChecked}
                        testID="reset-app-checkbox"
                    />

                    <BaseButton
                        haptics="Warning"
                        action={appReset}
                        w={100}
                        px={20}
                        title={LL.BTN_RESET_APP().toUpperCase()}
                        disabled={!isChecked}
                        bgColor={theme.colors.primary}
                    />
                </BaseView>
            </BaseView>

            <BaseSpacer height={40} />
        </BaseSafeArea>
    )
}

const baseStyles = StyleSheet.create({
    backIcon: {
        marginHorizontal: 8,
        alignSelf: "flex-start",
    },

    btnWidth: {
        width: 172,
    },

    iconMargin: {
        marginHorizontal: 12,
    },
})
