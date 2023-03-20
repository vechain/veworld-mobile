import React, { useCallback, useState } from "react"
import { StyleSheet } from "react-native"
import { useAppReset, useTheme } from "~Common"
import {
    BaseButton,
    BaseIcon,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    CheckBoxWithText,
} from "~Components"
import { getConfig, useRealm } from "~Storage"
import { useI18nContext } from "~i18n"

export const ResetAppScreen = () => {
    const appReset = useAppReset()
    const { LL } = useI18nContext()
    const { store } = useRealm()
    const theme = useTheme()

    const [IsChecked, setIsChecked] = useState(false)

    const onBackPress = useCallback(() => {
        store.write(() => {
            const config = getConfig(store)
            if (config) config.isResettingApp = false
        })
    }, [store])

    return (
        <BaseSafeArea grow={1}>
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
                        text={LL.BTN_RESET_APP_CHECKBOX()}
                        checkAction={setIsChecked}
                    />

                    <BaseButton
                        action={appReset}
                        w={100}
                        px={20}
                        title={LL.BTN_RESET_APP().toUpperCase()}
                        disabled={!IsChecked}
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
