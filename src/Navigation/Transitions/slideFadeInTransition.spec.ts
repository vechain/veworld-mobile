import { StackCardInterpolationProps } from "@react-navigation/stack"
import { Animated } from "react-native"
import { isIOS } from "~Utils/PlatformUtils/PlatformUtils"
import { slideFadeInTransition } from "./slideFadeInTransition"

jest.mock("~Utils/PlatformUtils/PlatformUtils", () => ({
    ...jest.requireActual("~Utils/PlatformUtils/PlatformUtils"),
    isIOS: jest.fn(),
}))

const value = (v: unknown) => (typeof v === "number" ? v : (v as { __getValue: () => number }).__getValue())

const coveredCardTransform = () => {
    const progress = (v: number) => ({ progress: new Animated.Value(v) })
    const { cardStyle } = slideFadeInTransition({
        current: progress(1),
        next: progress(1),
        layouts: { screen: { width: 400, height: 1000 } },
    } as unknown as StackCardInterpolationProps)
    const [{ translateY }, { scale }] = (cardStyle as { transform: [{ translateY: unknown }, { scale: unknown }] })
        .transform
    return { translateY: value(translateY), scale: value(scale) }
}

describe("slideFadeInTransition", () => {
    it("pushes the covered card back on iOS", () => {
        jest.mocked(isIOS).mockReturnValue(true)
        expect(coveredCardTransform()).toEqual({ translateY: 800, scale: 0.7 })
    })

    it("leaves the covered card in place on Android", () => {
        jest.mocked(isIOS).mockReturnValue(false)
        expect(coveredCardTransform()).toEqual({ translateY: 0, scale: 1 })
    })
})
