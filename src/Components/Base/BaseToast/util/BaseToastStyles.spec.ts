import { ColorTheme } from "~Common"
import {
    errorToastStyles,
    infoToastStyles,
    successToastStyles,
    warningToastStyles,
} from "./BaseToastStyles"
import { COLORS } from "~Common/Theme"
import { Dimensions } from "react-native"

describe("successToastStyles", () => {
    it("should generate the correct styles for a light theme", () => {
        const lightTheme = ColorTheme("light")

        const styles = successToastStyles(lightTheme)

        expect(styles.container.borderLeftColor).toBe(
            lightTheme.isDark ? COLORS.DARK_GREEN_ALERT : COLORS.PASTEL_GREEN,
        )
        expect(styles.container.borderRadius).toBe(16)
        expect(styles.container.backgroundColor).toBe(
            lightTheme.isDark ? COLORS.DARK_GREEN_ALERT : COLORS.PASTEL_GREEN,
        )
        expect(styles.container.width).toBe(Dimensions.get("window").width - 40)

        expect(styles.contentContainer.flexDirection).toBe("row")
        expect(styles.contentContainer.alignItems).toBe("center")
        expect(styles.contentContainer.justifyContent).toBe("flex-start")
        expect(styles.contentContainer.paddingHorizontal).toBe(16)
        expect(styles.contentContainer.paddingVertical).toBe(16)
        expect(styles.contentContainer.backgroundColor).toBe(
            lightTheme.isDark ? COLORS.DARK_GREEN_ALERT : COLORS.PASTEL_GREEN,
        )
        expect(styles.contentContainer.borderRadius).toBe(16)
        expect(styles.contentContainer.width).toBe(
            Dimensions.get("window").width - 40,
        )

        expect(styles.textContainer.flexDirection).toBe("row")
        expect(styles.textContainer.alignItems).toBe("center")
        expect(styles.textContainer.flexWrap).toBe("wrap")
    })

    it("should generate the correct styles for a dark theme", () => {
        const darkTheme = ColorTheme("dark")

        const styles = successToastStyles(darkTheme)

        expect(styles.container.borderLeftColor).toBe(
            darkTheme.isDark ? COLORS.DARK_GREEN_ALERT : COLORS.PASTEL_GREEN,
        )
        expect(styles.container.borderRadius).toBe(16)
        expect(styles.container.backgroundColor).toBe(
            darkTheme.isDark ? COLORS.DARK_GREEN_ALERT : COLORS.PASTEL_GREEN,
        )
        expect(styles.container.width).toBe(Dimensions.get("window").width - 40)

        expect(styles.contentContainer.flexDirection).toBe("row")
        expect(styles.contentContainer.alignItems).toBe("center")
        expect(styles.contentContainer.justifyContent).toBe("flex-start")
        expect(styles.contentContainer.paddingHorizontal).toBe(16)
        expect(styles.contentContainer.paddingVertical).toBe(16)
        expect(styles.contentContainer.backgroundColor).toBe(
            darkTheme.isDark ? COLORS.DARK_GREEN_ALERT : COLORS.PASTEL_GREEN,
        )
        expect(styles.contentContainer.borderRadius).toBe(16)
        expect(styles.contentContainer.width).toBe(
            Dimensions.get("window").width - 40,
        )

        expect(styles.textContainer.flexDirection).toBe("row")
        expect(styles.textContainer.alignItems).toBe("center")
        expect(styles.textContainer.flexWrap).toBe("wrap")
    })
})

describe("errorToastStyles", () => {
    it("should generate the correct styles for a light theme", () => {
        const lightTheme = ColorTheme("light")

        const styles = errorToastStyles(lightTheme)

        expect(styles.container.borderLeftColor).toBe(
            lightTheme.isDark ? COLORS.DARK_RED_ALERT : COLORS.PASTEL_RED,
        )
        expect(styles.container.borderRadius).toBe(16)
        expect(styles.container.backgroundColor).toBe(
            lightTheme.isDark ? COLORS.DARK_RED_ALERT : COLORS.PASTEL_RED,
        )
        expect(styles.container.width).toBe(Dimensions.get("window").width - 40)

        expect(styles.contentContainer.flexDirection).toBe("row")
        expect(styles.contentContainer.alignItems).toBe("center")
        expect(styles.contentContainer.justifyContent).toBe("flex-start")
        expect(styles.contentContainer.paddingHorizontal).toBe(16)
        expect(styles.contentContainer.paddingVertical).toBe(16)
        expect(styles.contentContainer.backgroundColor).toBe(
            lightTheme.isDark ? COLORS.DARK_RED_ALERT : COLORS.PASTEL_RED,
        )
        expect(styles.contentContainer.borderRadius).toBe(16)
        expect(styles.contentContainer.width).toBe(
            Dimensions.get("window").width - 40,
        )

        expect(styles.textContainer.flexDirection).toBe("row")
        expect(styles.textContainer.alignItems).toBe("center")
        expect(styles.textContainer.flexWrap).toBe("wrap")
    })

    it("should generate the correct styles for a dark theme", () => {
        const darkTheme = ColorTheme("dark")

        const styles = errorToastStyles(darkTheme)

        expect(styles.container.borderLeftColor).toBe(
            darkTheme.isDark ? COLORS.DARK_RED_ALERT : COLORS.PASTEL_RED,
        )
        expect(styles.container.borderRadius).toBe(16)
        expect(styles.container.backgroundColor).toBe(
            darkTheme.isDark ? COLORS.DARK_RED_ALERT : COLORS.PASTEL_RED,
        )
        expect(styles.container.width).toBe(Dimensions.get("window").width - 40)

        expect(styles.contentContainer.flexDirection).toBe("row")
        expect(styles.contentContainer.alignItems).toBe("center")
        expect(styles.contentContainer.justifyContent).toBe("flex-start")
        expect(styles.contentContainer.paddingHorizontal).toBe(16)
        expect(styles.contentContainer.paddingVertical).toBe(16)
        expect(styles.contentContainer.backgroundColor).toBe(
            darkTheme.isDark ? COLORS.DARK_RED_ALERT : COLORS.PASTEL_RED,
        )
        expect(styles.contentContainer.borderRadius).toBe(16)
        expect(styles.contentContainer.width).toBe(
            Dimensions.get("window").width - 40,
        )

        expect(styles.textContainer.flexDirection).toBe("row")
        expect(styles.textContainer.alignItems).toBe("center")
        expect(styles.textContainer.flexWrap).toBe("wrap")
    })
})

describe("warningToastStyles", () => {
    it("should generate the correct styles for a light theme", () => {
        const lightTheme = ColorTheme("light")

        const styles = warningToastStyles(lightTheme)

        expect(styles.container.borderLeftColor).toBe(
            lightTheme.isDark ? COLORS.DARK_ORANGE_ALERT : COLORS.PASTEL_ORANGE,
        )
        expect(styles.container.borderRadius).toBe(16)
        expect(styles.container.backgroundColor).toBe(
            lightTheme.isDark ? COLORS.DARK_ORANGE_ALERT : COLORS.PASTEL_ORANGE,
        )
        expect(styles.container.width).toBe(Dimensions.get("window").width - 40)

        expect(styles.contentContainer.flexDirection).toBe("row")
        expect(styles.contentContainer.alignItems).toBe("center")
        expect(styles.contentContainer.justifyContent).toBe("flex-start")
        expect(styles.contentContainer.paddingHorizontal).toBe(16)
        expect(styles.contentContainer.paddingVertical).toBe(16)
        expect(styles.contentContainer.backgroundColor).toBe(
            lightTheme.isDark ? COLORS.DARK_ORANGE_ALERT : COLORS.PASTEL_ORANGE,
        )
        expect(styles.contentContainer.borderRadius).toBe(16)
        expect(styles.contentContainer.width).toBe(
            Dimensions.get("window").width - 40,
        )

        expect(styles.textContainer.flexDirection).toBe("row")
        expect(styles.textContainer.alignItems).toBe("center")
        expect(styles.textContainer.flexWrap).toBe("wrap")
    })

    it("should generate the correct styles for a dark theme", () => {
        const darkTheme = ColorTheme("dark")

        const styles = warningToastStyles(darkTheme)

        expect(styles.container.borderLeftColor).toBe(
            darkTheme.isDark ? COLORS.DARK_ORANGE_ALERT : COLORS.PASTEL_ORANGE,
        )
        expect(styles.container.borderRadius).toBe(16)
        expect(styles.container.backgroundColor).toBe(
            darkTheme.isDark ? COLORS.DARK_ORANGE_ALERT : COLORS.PASTEL_ORANGE,
        )
        expect(styles.container.width).toBe(Dimensions.get("window").width - 40)

        expect(styles.contentContainer.flexDirection).toBe("row")
        expect(styles.contentContainer.alignItems).toBe("center")
        expect(styles.contentContainer.justifyContent).toBe("flex-start")
        expect(styles.contentContainer.paddingHorizontal).toBe(16)
        expect(styles.contentContainer.paddingVertical).toBe(16)
        expect(styles.contentContainer.backgroundColor).toBe(
            darkTheme.isDark ? COLORS.DARK_ORANGE_ALERT : COLORS.PASTEL_ORANGE,
        )
        expect(styles.contentContainer.borderRadius).toBe(16)
        expect(styles.contentContainer.width).toBe(
            Dimensions.get("window").width - 40,
        )

        expect(styles.textContainer.flexDirection).toBe("row")
        expect(styles.textContainer.alignItems).toBe("center")
        expect(styles.textContainer.flexWrap).toBe("wrap")
    })
})

describe("infoToastStyles", () => {
    it("should generate the correct styles for a light theme", () => {
        const lightTheme = ColorTheme("light")

        const styles = infoToastStyles(lightTheme)

        expect(styles.container.borderLeftColor).toBe(
            lightTheme.isDark ? COLORS.PURPLE : COLORS.WHITE,
        )
        expect(styles.container.borderRadius).toBe(16)
        expect(styles.container.backgroundColor).toBe(
            lightTheme.isDark ? COLORS.PURPLE : COLORS.WHITE,
        )
        expect(styles.container.width).toBe(Dimensions.get("window").width - 40)

        expect(styles.contentContainer.flexDirection).toBe("row")
        expect(styles.contentContainer.alignItems).toBe("center")
        expect(styles.contentContainer.justifyContent).toBe("flex-start")
        expect(styles.contentContainer.paddingHorizontal).toBe(16)
        expect(styles.contentContainer.paddingVertical).toBe(16)
        expect(styles.contentContainer.backgroundColor).toBe(
            lightTheme.isDark ? COLORS.PURPLE : COLORS.WHITE,
        )
        expect(styles.contentContainer.borderRadius).toBe(16)
        expect(styles.contentContainer.width).toBe(
            Dimensions.get("window").width - 40,
        )

        expect(styles.textContainer.flexDirection).toBe("row")
        expect(styles.textContainer.alignItems).toBe("center")
        expect(styles.textContainer.flexWrap).toBe("wrap")
    })

    it("should generate the correct styles for a dark theme", () => {
        const darkTheme = ColorTheme("dark")

        const styles = infoToastStyles(darkTheme)

        expect(styles.container.borderLeftColor).toBe(
            darkTheme.isDark ? COLORS.PURPLE : COLORS.WHITE,
        )
        expect(styles.container.borderRadius).toBe(16)
        expect(styles.container.backgroundColor).toBe(
            darkTheme.isDark ? COLORS.PURPLE : COLORS.WHITE,
        )
        expect(styles.container.width).toBe(Dimensions.get("window").width - 40)

        expect(styles.contentContainer.flexDirection).toBe("row")
        expect(styles.contentContainer.alignItems).toBe("center")
        expect(styles.contentContainer.justifyContent).toBe("flex-start")
        expect(styles.contentContainer.paddingHorizontal).toBe(16)
        expect(styles.contentContainer.paddingVertical).toBe(16)
        expect(styles.contentContainer.backgroundColor).toBe(
            darkTheme.isDark ? COLORS.PURPLE : COLORS.WHITE,
        )
        expect(styles.contentContainer.borderRadius).toBe(16)
        expect(styles.contentContainer.width).toBe(
            Dimensions.get("window").width - 40,
        )

        expect(styles.textContainer.flexDirection).toBe("row")
        expect(styles.textContainer.alignItems).toBe("center")
        expect(styles.textContainer.flexWrap).toBe("wrap")
    })
})
