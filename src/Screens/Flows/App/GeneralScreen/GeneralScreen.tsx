import { useNavigation, useTheme } from "@react-navigation/native"
import React, { useCallback } from "react"
import { StyleSheet } from "react-native"
import {
    BaseIcon,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
} from "~Components"
import { useI18nContext } from "~i18n"
import { ChangeTheme } from "./Components/ChangeTheme"

export const GeneralScreen = () => {
    const nav = useNavigation()
    const theme = useTheme()
    const { LL } = useI18nContext()

    const goBack = useCallback(() => nav.goBack(), [nav])
    return (
        <BaseSafeArea grow={1}>
            <BaseIcon
                style={baseStyles.backIcon}
                size={36}
                name="chevron-left"
                color={theme.colors.text}
                action={goBack}
            />
            <BaseSpacer height={12} />
            <BaseView mx={20}>
                <BaseText typographyFont="title">{LL.TITLE_GENERAL()}</BaseText>
                <BaseSpacer height={24} />
                <ChangeTheme />
            </BaseView>
        </BaseSafeArea>
    )
}

const baseStyles = StyleSheet.create({
    backIcon: {
        marginHorizontal: 8,
        alignSelf: "flex-start",
    },
})
