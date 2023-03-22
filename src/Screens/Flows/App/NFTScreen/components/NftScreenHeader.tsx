import React from "react"
import { StyleSheet } from "react-native"
import { useTheme } from "~Common"
import { BaseIcon, BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"

export const NftScreenHeader = () => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    return (
        <BaseView flexDirection="row" mx={20}>
            <BaseText typographyFont="largeTitle">{LL.TITLE_NFTS()}</BaseText>
            <BaseView flexDirection="row">
                <BaseIcon
                    color={theme.colors.text}
                    name="tray-arrow-up"
                    size={24}
                />

                <BaseIcon
                    // color={theme.colors.text}
                    action={() => {}}
                    style={baseStyles.sendIcon}
                    bg={theme.colors.primary}
                    name="send-outline"
                    size={24}
                />

                <BaseIcon
                    // color={theme.colors.text}
                    action={() => {}}
                    style={baseStyles.receiveIcon}
                    bg={theme.colors.primary}
                    name="arrow-down"
                    size={24}
                />
            </BaseView>
        </BaseView>
    )
}

const baseStyles = StyleSheet.create({
    sendIcon: {
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
        marginLeft: 16,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    receiveIcon: {
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        marginLeft: 2,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
})
