import { StyleSheet } from "react-native"
import { COLORS, ColorThemeType } from "~Constants"
import { typography } from "~Constants/Theme"

const { defaults: defaultTypography } = typography

export const cloudBackupPasswordStyle = (theme: ColorThemeType) =>
    StyleSheet.create({
        rootContainer: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        keyIcon: {
            color: theme.colors.text,
        },
        containerPassword: {
            flexDirection: "row",
            alignItems: "center",
            borderColor: COLORS.GREY_200,
            borderWidth: 1,
            borderRadius: 8,
            paddingRight: 8,
            backgroundColor: COLORS.WHITE,
        },
        inputPassword: {
            flex: 1,
            backgroundColor: theme.colors.transparent,
            color: COLORS.GREY_600,
            borderRadius: 8,
            fontSize: defaultTypography.body.fontSize,
            fontFamily: defaultTypography.body.fontFamily,
            lineHeight: defaultTypography.subTitle.lineHeight,
        },
        toggleIcon: {
            marginRight: 4,
        },
    })
