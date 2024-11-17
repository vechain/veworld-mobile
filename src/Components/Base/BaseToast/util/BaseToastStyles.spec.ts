import { errorToastStyles, infoToastStyles, successToastStyles, warningToastStyles } from "./BaseToastStyles"
import { COLORS, ColorTheme } from "~Constants"
import { Dimensions } from "react-native"

describe("successToastStyles", () => {
    it("should generate the correct styles for a light theme", () => {
        const lightTheme = ColorTheme("light")

        const styles = successToastStyles(lightTheme)

        expect(styles.container.borderLeftColor).toBe(lightTheme.isDark ? COLORS.GREEN_100 : COLORS.GREEN_50)
        expect(styles.container.borderRadius).toBe(8)
        expect(styles.container.backgroundColor).toBe(lightTheme.isDark ? COLORS.GREEN_100 : COLORS.GREEN_50)
        expect(styles.container.width).toBe(Dimensions.get("window").width - 40)

        expect(styles.contentContainer.flexDirection).toBe("row")
        expect(styles.contentContainer.alignItems).toBe("flex-start")
        expect(styles.contentContainer.justifyContent).toBe("flex-start")
        expect(styles.contentContainer.paddingHorizontal).toBe(12)
        expect(styles.contentContainer.paddingVertical).toBe(12)
        expect(styles.contentContainer.backgroundColor).toBe(lightTheme.isDark ? COLORS.GREEN_100 : COLORS.GREEN_50)
        expect(styles.contentContainer.borderRadius).toBe(8)
        expect(styles.contentContainer.width).toBe(Dimensions.get("window").width - 40)

        expect(styles.textContainer.flexDirection).toBe("column")
        expect(styles.textContainer.alignItems).toBe("flex-start")
    })

    it("should generate the correct styles for a dark theme", () => {
        const darkTheme = ColorTheme("dark")

        const styles = successToastStyles(darkTheme)

        expect(styles.container.borderLeftColor).toBe(darkTheme.isDark ? COLORS.GREEN_100 : COLORS.GREEN_50)
        expect(styles.container.borderRadius).toBe(8)
        expect(styles.container.backgroundColor).toBe(darkTheme.isDark ? COLORS.GREEN_100 : COLORS.GREEN_50)
        expect(styles.container.width).toBe(Dimensions.get("window").width - 40)

        expect(styles.contentContainer.flexDirection).toBe("row")
        expect(styles.contentContainer.alignItems).toBe("flex-start")
        expect(styles.contentContainer.justifyContent).toBe("flex-start")
        expect(styles.contentContainer.paddingHorizontal).toBe(12)
        expect(styles.contentContainer.paddingVertical).toBe(12)
        expect(styles.contentContainer.backgroundColor).toBe(darkTheme.isDark ? COLORS.GREEN_100 : COLORS.GREEN_50)
        expect(styles.contentContainer.borderRadius).toBe(8)
        expect(styles.contentContainer.width).toBe(Dimensions.get("window").width - 40)

        expect(styles.textContainer.flexDirection).toBe("column")
        expect(styles.textContainer.alignItems).toBe("flex-start")
    })
})

describe("errorToastStyles", () => {
    it("should generate the correct styles for a light theme", () => {
        const lightTheme = ColorTheme("light")

        const styles = errorToastStyles(lightTheme)

        expect(styles.container.borderLeftColor).toBe(lightTheme.isDark ? COLORS.RED_100 : COLORS.RED_50)
        expect(styles.container.borderRadius).toBe(8)
        expect(styles.container.backgroundColor).toBe(lightTheme.isDark ? COLORS.RED_100 : COLORS.RED_50)
        expect(styles.container.width).toBe(Dimensions.get("window").width - 40)

        expect(styles.contentContainer.flexDirection).toBe("row")
        expect(styles.contentContainer.alignItems).toBe("flex-start")
        expect(styles.contentContainer.justifyContent).toBe("flex-start")
        expect(styles.contentContainer.paddingHorizontal).toBe(12)
        expect(styles.contentContainer.paddingVertical).toBe(12)
        expect(styles.contentContainer.backgroundColor).toBe(lightTheme.isDark ? COLORS.RED_100 : COLORS.RED_50)
        expect(styles.contentContainer.borderRadius).toBe(8)
        expect(styles.contentContainer.width).toBe(Dimensions.get("window").width - 40)

        expect(styles.textContainer.flexDirection).toBe("column")
        expect(styles.textContainer.alignItems).toBe("flex-start")
    })

    it("should generate the correct styles for a dark theme", () => {
        const darkTheme = ColorTheme("dark")

        const styles = errorToastStyles(darkTheme)

        expect(styles.container.borderLeftColor).toBe(darkTheme.isDark ? COLORS.RED_100 : COLORS.RED_50)
        expect(styles.container.borderRadius).toBe(8)
        expect(styles.container.backgroundColor).toBe(darkTheme.isDark ? COLORS.RED_100 : COLORS.RED_50)
        expect(styles.container.width).toBe(Dimensions.get("window").width - 40)

        expect(styles.contentContainer.flexDirection).toBe("row")
        expect(styles.contentContainer.alignItems).toBe("flex-start")
        expect(styles.contentContainer.justifyContent).toBe("flex-start")
        expect(styles.contentContainer.paddingHorizontal).toBe(12)
        expect(styles.contentContainer.paddingVertical).toBe(12)
        expect(styles.contentContainer.backgroundColor).toBe(darkTheme.isDark ? COLORS.RED_100 : COLORS.RED_50)
        expect(styles.contentContainer.borderRadius).toBe(8)
        expect(styles.contentContainer.width).toBe(Dimensions.get("window").width - 40)

        expect(styles.textContainer.flexDirection).toBe("column")
        expect(styles.textContainer.alignItems).toBe("flex-start")
    })
})

describe("warningToastStyles", () => {
    it("should generate the correct styles for a light theme", () => {
        const lightTheme = ColorTheme("light")

        const styles = warningToastStyles(lightTheme)

        expect(styles.container.borderLeftColor).toBe(lightTheme.isDark ? COLORS.ORANGE_100 : COLORS.ORANGE_50)
        expect(styles.container.borderRadius).toBe(8)
        expect(styles.container.backgroundColor).toBe(lightTheme.isDark ? COLORS.ORANGE_100 : COLORS.ORANGE_50)
        expect(styles.container.width).toBe(Dimensions.get("window").width - 40)

        expect(styles.contentContainer.flexDirection).toBe("row")
        expect(styles.contentContainer.alignItems).toBe("flex-start")
        expect(styles.contentContainer.justifyContent).toBe("flex-start")
        expect(styles.contentContainer.paddingHorizontal).toBe(12)
        expect(styles.contentContainer.paddingVertical).toBe(12)
        expect(styles.contentContainer.backgroundColor).toBe(lightTheme.isDark ? COLORS.ORANGE_100 : COLORS.ORANGE_50)
        expect(styles.contentContainer.borderRadius).toBe(8)
        expect(styles.contentContainer.width).toBe(Dimensions.get("window").width - 40)

        expect(styles.textContainer.flexDirection).toBe("column")
        expect(styles.textContainer.alignItems).toBe("flex-start")
    })

    it("should generate the correct styles for a dark theme", () => {
        const darkTheme = ColorTheme("dark")

        const styles = warningToastStyles(darkTheme)

        expect(styles.container.borderLeftColor).toBe(darkTheme.isDark ? COLORS.ORANGE_100 : COLORS.ORANGE_50)
        expect(styles.container.borderRadius).toBe(8)
        expect(styles.container.backgroundColor).toBe(darkTheme.isDark ? COLORS.ORANGE_100 : COLORS.ORANGE_50)
        expect(styles.container.width).toBe(Dimensions.get("window").width - 40)

        expect(styles.contentContainer.flexDirection).toBe("row")
        expect(styles.contentContainer.alignItems).toBe("flex-start")
        expect(styles.contentContainer.justifyContent).toBe("flex-start")
        expect(styles.contentContainer.paddingHorizontal).toBe(12)
        expect(styles.contentContainer.paddingVertical).toBe(12)
        expect(styles.contentContainer.backgroundColor).toBe(darkTheme.isDark ? COLORS.ORANGE_100 : COLORS.ORANGE_50)
        expect(styles.contentContainer.borderRadius).toBe(8)
        expect(styles.contentContainer.width).toBe(Dimensions.get("window").width - 40)

        expect(styles.textContainer.flexDirection).toBe("column")
        expect(styles.textContainer.alignItems).toBe("flex-start")
    })
})

describe("infoToastStyles", () => {
    it("should generate the correct styles for a light theme", () => {
        const lightTheme = ColorTheme("light")

        const styles = infoToastStyles(lightTheme)

        expect(styles.container.borderLeftColor).toBe(lightTheme.isDark ? COLORS.BLUE_100 : COLORS.BLUE_50)
        expect(styles.container.borderRadius).toBe(8)
        expect(styles.container.backgroundColor).toBe(lightTheme.isDark ? COLORS.BLUE_100 : COLORS.BLUE_50)
        expect(styles.container.width).toBe(Dimensions.get("window").width - 40)

        expect(styles.contentContainer.flexDirection).toBe("row")
        expect(styles.contentContainer.alignItems).toBe("flex-start")
        expect(styles.contentContainer.justifyContent).toBe("flex-start")
        expect(styles.contentContainer.paddingHorizontal).toBe(12)
        expect(styles.contentContainer.paddingVertical).toBe(12)
        expect(styles.contentContainer.backgroundColor).toBe(lightTheme.isDark ? COLORS.BLUE_100 : COLORS.BLUE_50)
        expect(styles.contentContainer.borderRadius).toBe(8)
        expect(styles.contentContainer.width).toBe(Dimensions.get("window").width - 40)

        expect(styles.textContainer.flexDirection).toBe("column")
        expect(styles.textContainer.alignItems).toBe("flex-start")
    })

    it("should generate the correct styles for a dark theme", () => {
        const darkTheme = ColorTheme("dark")

        const styles = infoToastStyles(darkTheme)

        expect(styles.container.borderLeftColor).toBe(darkTheme.isDark ? COLORS.BLUE_100 : COLORS.BLUE_50)
        expect(styles.container.borderRadius).toBe(8)
        expect(styles.container.backgroundColor).toBe(darkTheme.isDark ? COLORS.BLUE_100 : COLORS.BLUE_50)
        expect(styles.container.width).toBe(Dimensions.get("window").width - 40)

        expect(styles.contentContainer.flexDirection).toBe("row")
        expect(styles.contentContainer.alignItems).toBe("flex-start")
        expect(styles.contentContainer.justifyContent).toBe("flex-start")
        expect(styles.contentContainer.paddingHorizontal).toBe(12)
        expect(styles.contentContainer.paddingVertical).toBe(12)
        expect(styles.contentContainer.backgroundColor).toBe(darkTheme.isDark ? COLORS.BLUE_100 : COLORS.BLUE_50)
        expect(styles.contentContainer.borderRadius).toBe(8)
        expect(styles.contentContainer.width).toBe(Dimensions.get("window").width - 40)

        expect(styles.textContainer.flexDirection).toBe("column")
        expect(styles.textContainer.alignItems).toBe("flex-start")
    })
})
