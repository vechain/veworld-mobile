import { StyleSheet } from "react-native"
import React, { useCallback } from "react"
import { useI18nContext } from "~i18n"
import {
    BaseIcon,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
} from "~Components"
import { useTheme } from "~Common"
import { useNavigation } from "@react-navigation/native"

export const AddCustomNodeScreen = () => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    const nav = useNavigation()

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
                <BaseText typographyFont="title">
                    {LL.BTN_ADD_CUSTOM_NODE()}
                </BaseText>
                <BaseSpacer height={24} />
                <BaseText typographyFont="button" pb={8}>
                    {LL.NETWORK_ADD_CUSTOM_NODE_SB()}
                </BaseText>
                <BaseText typographyFont="captionRegular">
                    {LL.NETWORK_ADD_CUSTOM_NODE_SB_DESC()}
                </BaseText>
                <BaseSpacer height={24} />
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
