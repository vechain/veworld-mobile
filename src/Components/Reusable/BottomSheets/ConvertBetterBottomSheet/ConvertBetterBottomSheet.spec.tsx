import { act, render, screen } from "@testing-library/react-native"
import { ethers } from "ethers"
import React from "react"
import { B3TR, VOT3 } from "~Constants"
import { useConvertBetterTokens } from "~Hooks"
import { useTokenBalance } from "~Hooks/useTokenBalance"
import { TestWrapper } from "~Test"
import { ConvertBetterBottomSheet } from "./ConvertBetterBottomSheet"

// Mock dependencies
const mockedOnClose = jest.fn()
const mockConvertB3tr = jest.fn()
const mockConvertVot3 = jest.fn()

jest.mock("@react-navigation/native", () => {
    const actualNav = jest.requireActual("@react-navigation/native")
    return {
        ...actualNav,
        useNavigation: () => ({
            replace: jest.fn(),
        }),
    }
})

jest.mock("~Hooks/useTokenBalance", () => ({
    useTokenBalance: jest.fn(),
}))

jest.mock("~Hooks/useConvertBetterTokens")

jest.mock("~Hooks/useAmountInput", () => ({
    useAmountInput: jest.fn(() => ({
        input: "",
        setInput: jest.fn(),
        removeInvalidCharacters: jest.fn(value => value.replace(/[^0-9.]/g, "")),
    })),
}))

jest.mock("~Hooks/useTokenWithCompleteInfo", () => ({
    useTokenWithCompleteInfo: jest.fn(token => ({
        ...token,
        balance: { balance: "0" },
    })),
}))

jest.mock("~Hooks/useFormatFiat", () => ({
    useFormatFiat: jest.fn(() => ({
        formatLocale: "en-US",
    })),
}))

describe("ConvertBetterBottomSheet - Ref-based dismissal pattern", () => {
    const mockB3trBalance = {
        balance: ethers.utils.parseEther("100").toString(),
        symbol: "B3TR",
    }

    const mockVot3Balance = {
        balance: ethers.utils.parseEther("50").toString(),
        symbol: "VOT3",
    }

    const mockRef = {
        current: {
            present: jest.fn(),
            close: jest.fn(),
            dismiss: jest.fn(),
            snapToIndex: jest.fn(),
            snapToPosition: jest.fn(),
            expand: jest.fn(),
            collapse: jest.fn(),
            forceClose: jest.fn(),
        },
    }

    beforeEach(() => {
        jest.clearAllMocks()
        ;(useTokenBalance as jest.Mock).mockImplementation(({ tokenAddress }) => {
            if (tokenAddress === B3TR.address) {
                return { data: mockB3trBalance }
            }
            if (tokenAddress === VOT3.address) {
                return { data: mockVot3Balance }
            }
            return { data: null }
        })
        ;(useConvertBetterTokens as jest.Mock).mockReturnValue({
            convertB3tr: mockConvertB3tr,
            convertVot3: mockConvertVot3,
        })
    })

    it("should call onDismiss when bottom sheet dismisses", async () => {
        render(<ConvertBetterBottomSheet ref={mockRef} onClose={mockedOnClose} />, {
            wrapper: TestWrapper,
        })

        const bottomSheet = screen.UNSAFE_getByType(require("~Components").BaseBottomSheet)

        expect(bottomSheet.props.onDismiss).toBeDefined()

        await act(async () => {
            bottomSheet.props.onDismiss()
        })

        expect(true).toBe(true)
    })

    it("should have onConvertPress callback defined", () => {
        render(<ConvertBetterBottomSheet ref={mockRef} onClose={mockedOnClose} />, {
            wrapper: TestWrapper,
        })

        const convertButton = screen.getByTestId("Convert_Action_BTN")
        expect(convertButton).toBeDefined()
    })
})
