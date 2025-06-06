import { ColorValue, Dimensions, ViewStyle } from "react-native"
import { COLORS, ColorThemeType } from "~Constants"

// Define the ToastStyles type
export type ToastStyles = {
    container: ViewStyle
    contentContainer: ViewStyle
    textContainer: ViewStyle
    iconColor: ColorValue
    textColor?: string
    addressesTextColor?: string
}

const generateShadowStyle = (theme: ColorThemeType) =>
    !theme.isDark
        ? {
              shadowOffset: {
                  width: 0,
                  height: 0,
              },
              shadowOpacity: 0.16,
              shadowRadius: 16,
              shadowColor: "#0B0043",
          }
        : undefined

/**
 * Helper function to generate toast styles based on theme and colors.
 *
 * @param {ColorThemeType} theme - The color theme object.
 * @param {string} darkColor - The color to be used in dark mode.
 * @param {string} lightColor - The color to be used in light mode.
 * @param {string} iconColor - The color to be used for the icon.
 * @param {string} textColor - The color to be used for the text.
 * @returns {ToastStyles} The generated toast styles object.
 */
const generateToastStyles = (
    theme: ColorThemeType,
    darkColor: string,
    lightColor: string,
    iconColor: string,
    textColor?: string,
    addressesTextColor: string = COLORS.GREY_600,
): ToastStyles => ({
    container: {
        borderLeftColor: theme.isDark ? darkColor : lightColor,
        borderRadius: 8,
        backgroundColor: theme.isDark ? darkColor : lightColor,
        width: Dimensions.get("window").width - 40,
        ...generateShadowStyle(theme),
    },
    contentContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: theme.isDark ? darkColor : lightColor,
        borderRadius: 8,
        width: Dimensions.get("window").width - 40,
    },
    textContainer: {
        flexDirection: "column",
        alignItems: "flex-start",
    },
    addressesTextColor: addressesTextColor,
    textColor: textColor,
    iconColor: iconColor,
})

/**
 * Generates success toast styles based on the color theme.
 *
 * @param {ColorThemeType} theme - The color theme object.
 * @returns {ToastStyles} The generated success toast styles object.
 */
export const successToastStyles = (theme: ColorThemeType): ToastStyles =>
    generateToastStyles(theme, COLORS.GREEN_100, COLORS.GREEN_50, COLORS.GREEN_500, COLORS.GREEN_700)

/**
 * Generates error toast styles based on the color theme.
 *
 * @param {ColorThemeType} theme - The color theme object.
 * @returns {ToastStyles} The generated error toast styles object.
 */
export const errorToastStyles = (theme: ColorThemeType): ToastStyles =>
    generateToastStyles(theme, COLORS.RED_100, COLORS.RED_50, COLORS.RED_500, COLORS.RED_700)

/**
 * Generates warning toast styles based on the color theme.
 *
 * @param {ColorThemeType} theme - The color theme object.
 * @returns {ToastStyles} The generated warning toast styles object.
 */
export const warningToastStyles = (theme: ColorThemeType): ToastStyles =>
    generateToastStyles(theme, COLORS.ORANGE_100, COLORS.ORANGE_50, COLORS.ORANGE_500, COLORS.ORANGE_700)

/**
 * Generates info toast styles based on the color theme.
 *
 * @param {ColorThemeType} theme - The color theme object.
 * @returns {ToastStyles} The generated info toast styles object.
 */
export const infoToastStyles = (theme: ColorThemeType): ToastStyles =>
    generateToastStyles(theme, COLORS.BLUE_100, COLORS.BLUE_50, COLORS.MEDIUM_BLUE, COLORS.MEDIUM_BLUE)
