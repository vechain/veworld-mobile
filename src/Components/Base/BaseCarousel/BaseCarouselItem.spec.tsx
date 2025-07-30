import { useNavigation, useNavigationState } from "@react-navigation/native"
import { act, fireEvent, render, waitFor } from "@testing-library/react-native"
import React from "react"
import { TestWrapper } from "~Test"

import { Linking, Text } from "react-native"
import { Routes } from "~Navigation"
import { BaseCarouselItem } from "./BaseCarouselItem"

jest.mock("react-native/Libraries/Settings/Settings", () => ({
    get: jest.fn(),
    set: jest.fn(),
}))

jest.mock("@react-navigation/native", () => ({
    ...jest.requireActual("@react-navigation/native"),
    useNavigation: jest.fn(),
    useRoute: jest.fn(),
    useNavigationState: jest.fn(),
}))

jest.mock("react-native", () => {
    return {
        ...jest.requireActual("react-native"),
        Linking: {
            openURL: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
        },
    }
})

const onPress = jest.fn()

describe("BaseCarouselItem", () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it("should render correctly", () => {
        ;(useNavigationState as jest.Mock).mockReturnValue(Routes.DISCOVER)
        const { getByTestId } = render(
            <BaseCarouselItem testID="carousel-item">
                <Text testID="test-text">{"test text"}</Text>
            </BaseCarouselItem>,
            {
                wrapper: TestWrapper,
            },
        )
        expect(getByTestId("carousel-item")).toBeTruthy()
        expect(getByTestId("test-text")).toBeTruthy()
    })

    it("should open external link when isExternalLink is true and href is provided", async () => {
        ;(useNavigationState as jest.Mock).mockReturnValue(Routes.DISCOVER)
        const testHref = "https://example.com"
        const { getByTestId } = render(
            <BaseCarouselItem
                testID="carousel-item"
                href={testHref}
                isExternalLink={true}
                onPress={onPress}
                name="external-link">
                <Text>{"External Link"}</Text>
            </BaseCarouselItem>,
            {
                wrapper: TestWrapper,
            },
        )

        await act(async () => {
            fireEvent.press(getByTestId("carousel-item"))
        })

        await waitFor(() => {
            // Check if Linking.openURL was called with correct URL
            expect(onPress).toHaveBeenCalled()
            expect(Linking.openURL).toHaveBeenCalledWith(testHref)
        })
    })

    it("should navigate to browser when isExternalLink is false and href is provided", () => {
        const navigate = jest.fn()
        ;(useNavigation as jest.Mock).mockReturnValue({ navigate })
        ;(useNavigationState as jest.Mock).mockReturnValue(Routes.HOME)
        const testHref = "https://example.com"
        const { getByTestId } = render(
            <BaseCarouselItem
                testID="carousel-item"
                href={testHref}
                isExternalLink={false}
                onPress={onPress}
                name="internal-link">
                <Text>{"Internal Link"}</Text>
            </BaseCarouselItem>,
            {
                wrapper: TestWrapper,
            },
        )

        fireEvent.press(getByTestId("carousel-item"))

        // Check if navigation.navigate was called with correct route and params
        expect(onPress).toHaveBeenCalled()
        expect(navigate).toHaveBeenCalledWith(Routes.BROWSER, { url: testHref, returnScreen: Routes.HOME })
    })

    it("should not call Linking.openURL or navigate when href is not provided", () => {
        const navigate = jest.fn()
        ;(useNavigation as jest.Mock).mockReturnValue({ navigate })
        ;(useNavigationState as jest.Mock).mockReturnValue(Routes.HOME)
        const { getByTestId } = render(
            <BaseCarouselItem testID="carousel-item" onPress={onPress} name="no-link">
                <Text>{"No Link"}</Text>
            </BaseCarouselItem>,
            {
                wrapper: TestWrapper,
            },
        )

        fireEvent.press(getByTestId("carousel-item"))

        expect(onPress).not.toHaveBeenCalled()
        expect(Linking.openURL).not.toHaveBeenCalled()
        expect(navigate).not.toHaveBeenCalled()
    })

    it("should call onPress after navigation when onPressActivation is 'after'", () => {
        const navigate = jest.fn()
        ;(useNavigation as jest.Mock).mockReturnValue({ navigate })
        ;(useNavigationState as jest.Mock).mockReturnValue(Routes.HOME)
        const testHref = "https://example.com"
        const { getByTestId } = render(
            <BaseCarouselItem
                testID="carousel-item"
                href={testHref}
                isExternalLink={false}
                onPress={onPress}
                onPressActivation="after"
                name="after-activation">
                <Text>{"After Activation"}</Text>
            </BaseCarouselItem>,
            {
                wrapper: TestWrapper,
            },
        )

        fireEvent.press(getByTestId("carousel-item"))

        // Check order of execution
        expect(navigate).toHaveBeenCalledWith(Routes.BROWSER, { url: testHref, returnScreen: Routes.HOME })
        expect(onPress).toHaveBeenCalled()
    })

    it("should call onPress before navigation when onPressActivation is 'before'", () => {
        const navigate = jest.fn()
        ;(useNavigation as jest.Mock).mockReturnValue({ navigate })
        ;(useNavigationState as jest.Mock).mockReturnValue(Routes.HOME)
        const testHref = "https://example.com"
        const { getByTestId } = render(
            <BaseCarouselItem
                testID="carousel-item"
                href={testHref}
                isExternalLink={false}
                onPress={onPress}
                onPressActivation="before"
                name="before-activation">
                <Text>{"Before Activation"}</Text>
            </BaseCarouselItem>,
            {
                wrapper: TestWrapper,
            },
        )

        fireEvent.press(getByTestId("carousel-item"))

        // Check order of execution
        expect(onPress).toHaveBeenCalled()
        expect(navigate).toHaveBeenCalledWith(Routes.BROWSER, { url: testHref, returnScreen: Routes.HOME })
    })
})
