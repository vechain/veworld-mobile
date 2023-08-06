import React from "react"
import { render, screen } from "@testing-library/react-native"
import { BaseCustomTokenIcon } from "./BaseCustomTokenIcon"
import { ColorUtils } from "~Utils"
import { COLORS } from "~Constants"
import { TestWrapper } from "~Test"

// Mock for ColorUtils.generateColor
jest.mock("~Utils/ColorUtils", () => ({
    generateColor: jest.fn(),
}))

const findByText = async (text: string) =>
    await screen.findByText(text, {}, { timeout: 5000 })

const findByTestId = async (testId: string) =>
    await screen.findByTestId(testId, {}, { timeout: 5000 })

describe("BaseCustomTokenIcon", () => {
    const tokenAddress = "0x1234...5678"
    const longTokenSymbol = "LONGSYMBOL"
    const shortTokenSymbol = "USD"

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it("renders correctly with provided tokenSymbol and tokenAddress", async () => {
        ;(ColorUtils.generateColor as jest.Mock).mockReturnValueOnce([
            "testString",
            true,
        ]) // Mock for isColorLight = true

        render(
            <BaseCustomTokenIcon
                tokenAddress={tokenAddress}
                tokenSymbol={shortTokenSymbol}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        const tokenSymbol = await findByText(shortTokenSymbol)
        expect(tokenSymbol).toBeVisible()
    })

    it("renders shortened tokenSymbol if length is greater than 4", async () => {
        ;(ColorUtils.generateColor as jest.Mock).mockReturnValueOnce([
            "testString",
            true,
        ]) // Mock for isColorLight = true

        render(
            <BaseCustomTokenIcon
                tokenAddress={tokenAddress}
                tokenSymbol={longTokenSymbol}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        const displayedText = await findByText(
            longTokenSymbol.substring(0, 4).toUpperCase(),
        )

        expect(displayedText).toBeVisible()
    })

    it("applies correct text color based on generated icon color", async () => {
        ;(ColorUtils.generateColor as jest.Mock).mockReturnValueOnce([
            "red",
            true,
        ]) // Mock for isColorLight = true

        render(
            <BaseCustomTokenIcon
                tokenAddress={tokenAddress}
                tokenSymbol={shortTokenSymbol}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        let displayedText = await findByText(shortTokenSymbol)

        expect(displayedText.props.color).toBe(COLORS.DARK_PURPLE)
        ;(ColorUtils.generateColor as jest.Mock).mockReturnValueOnce([
            "blue",
            false,
        ]) // Mock for isColorLight = false

        render(
            <BaseCustomTokenIcon
                tokenAddress={tokenAddress}
                tokenSymbol={shortTokenSymbol}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        displayedText = await findByText(shortTokenSymbol)

        expect(displayedText.props.color).toBe(COLORS.WHITE)
    })

    it("applies correct font size based on tokenSymbol length", async () => {
        ;(ColorUtils.generateColor as jest.Mock).mockReturnValueOnce([
            "testString",
            true,
        ]) // Mock for isColorLight = true

        render(
            <BaseCustomTokenIcon
                tokenAddress={tokenAddress}
                tokenSymbol={longTokenSymbol}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        let displayedText = await findByText(
            longTokenSymbol.substring(0, 4).toUpperCase(),
        )

        expect(displayedText.props.style[0].fontSize).toBe(10)
        ;(ColorUtils.generateColor as jest.Mock).mockReturnValueOnce([
            "testString",
            true,
        ]) // Mock for isColorLight = true

        render(
            <BaseCustomTokenIcon
                tokenAddress={tokenAddress}
                tokenSymbol={shortTokenSymbol}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        displayedText = await findByText(shortTokenSymbol)

        expect(displayedText.props.style[0].fontSize).toBe(14)
    })

    it("renders correctly with optional style prop", async () => {
        ;(ColorUtils.generateColor as jest.Mock).mockReturnValueOnce([
            "testString",
            true,
        ]) // Mock for isColorLight = true

        const customStyle = {
            width: 100,
            height: 100,
        }

        render(
            <BaseCustomTokenIcon
                tokenAddress={tokenAddress}
                tokenSymbol={shortTokenSymbol}
                style={customStyle}
                testID="base-custom-token-icon"
            />,
            {
                wrapper: TestWrapper,
            },
        )

        let component = await findByTestId("base-custom-token-icon")

        expect(component.props.style[1].width).toBe(100)
        expect(component.props.style[1].height).toBe(100)
    })
})
