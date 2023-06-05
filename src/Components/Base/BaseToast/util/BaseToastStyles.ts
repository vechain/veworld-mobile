import { ColorValue, Dimensions, ViewStyle } from "react-native"
import { COLORS, ColorThemeType } from "~Common/Theme"

// Define the ToastStyles type
export type ToastStyles = {
    container: ViewStyle
    contentContainer: ViewStyle
    textContainer: ViewStyle
    iconColor: ColorValue
}

/**
 * Helper function to generate toast styles based on theme and colors.
 *
 * @param {ColorThemeType} theme - The color theme object.
 * @param {string} darkColor - The color to be used in dark mode.
 * @param {string} lightColor - The color to be used in light mode.
 * @param {string} iconColor - The color to be used for the icon.
 * @returns {ToastStyles} The generated toast styles object.
 */
const generateToastStyles = (
    theme: ColorThemeType,
    darkColor: string,
    lightColor: string,
    iconColor: string,
): ToastStyles => ({
    container: {
        borderLeftColor: theme.isDark ? darkColor : lightColor,
        borderRadius: 16,
        backgroundColor: theme.isDark ? darkColor : lightColor,
        width: Dimensions.get("window").width - 40,
    },
    contentContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingLeft: 16,
        paddingRight: 32,
        paddingVertical: 16,
        backgroundColor: theme.isDark ? darkColor : lightColor,
        borderRadius: 16,
        width: Dimensions.get("window").width - 40,
    },
    textContainer: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
    },
    iconColor: iconColor,
})

/**
 * Generates success toast styles based on the color theme.
 *
 * @param {ColorThemeType} theme - The color theme object.
 * @returns {ToastStyles} The generated success toast styles object.
 */
export const successToastStyles = (theme: ColorThemeType): ToastStyles =>
    generateToastStyles(
        theme,
        COLORS.PASTEL_GREEN,
        COLORS.DARK_GREEN_ALERT,
        theme.colors.successMedium,
    )

/**
 * Generates error toast styles based on the color theme.
 *
 * @param {ColorThemeType} theme - The color theme object.
 * @returns {ToastStyles} The generated error toast styles object.
 */
export const errorToastStyles = (theme: ColorThemeType): ToastStyles =>
    generateToastStyles(
        theme,
        COLORS.PASTEL_RED,
        COLORS.DARK_RED_ALERT,
        theme.colors.error,
    )

/**
 * Generates warning toast styles based on the color theme.
 *
 * @param {ColorThemeType} theme - The color theme object.
 * @returns {ToastStyles} The generated warning toast styles object.
 */
export const warningToastStyles = (theme: ColorThemeType): ToastStyles =>
    generateToastStyles(
        theme,
        COLORS.PASTEL_ORANGE,
        COLORS.DARK_ORANGE_ALERT,
        theme.colors.warning,
    )

/**
 * Generates info toast styles based on the color theme.
 *
 * @param {ColorThemeType} theme - The color theme object.
 * @returns {ToastStyles} The generated info toast styles object.
 */
export const infoToastStyles = (theme: ColorThemeType): ToastStyles =>
    generateToastStyles(theme, COLORS.WHITE, COLORS.PURPLE, theme.colors.info)
