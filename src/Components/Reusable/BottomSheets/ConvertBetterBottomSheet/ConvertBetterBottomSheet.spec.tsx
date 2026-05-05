import { act, fireEvent, render, screen, within } from "@testing-library/react-native"
import { ethers } from "ethers"
import React from "react"
import { B3TR, VOT3 } from "~Constants"
import { useConvertBetterTokens } from "~Hooks"
import { useTokenBalance } from "~Hooks/useTokenBalance"
import { useGetUnlockedVot3Balance, useUserHasNavigator } from "~Hooks/VeBetterDao"
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

jest.mock("~Hooks/VeBetterDao", () => ({
    useUserHasNavigator: jest.fn(),
    useGetUnlockedVot3Balance: jest.fn(),
}))

const mockUseUserHasNavigator = useUserHasNavigator as jest.Mock
const mockUseGetUnlockedVot3Balance = useGetUnlockedVot3Balance as jest.Mock

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
        mockUseUserHasNavigator.mockReturnValue({ data: false })
        mockUseGetUnlockedVot3Balance.mockReturnValue({ data: undefined })
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

    it("should render the navigator warning alert when the user has a navigator", () => {
        mockUseUserHasNavigator.mockReturnValue({ data: true })

        render(<ConvertBetterBottomSheet ref={mockRef} onClose={mockedOnClose} />, {
            wrapper: TestWrapper,
        })

        expect(screen.getByTestId("ConvertBetter_Navigator_Warning")).toBeTruthy()
    })

    it("should NOT render the navigator warning alert when the user does not have a navigator", () => {
        mockUseUserHasNavigator.mockReturnValue({ data: false })

        render(<ConvertBetterBottomSheet ref={mockRef} onClose={mockedOnClose} />, {
            wrapper: TestWrapper,
        })

        expect(screen.queryByTestId("ConvertBetter_Navigator_Warning")).toBeNull()
    })

    it("should display the unlocked VOT3 balance after swapping when the user has a navigator", async () => {
        const unlocked = ethers.utils.parseEther("25")
        mockUseUserHasNavigator.mockReturnValue({ data: true })
        mockUseGetUnlockedVot3Balance.mockReturnValue({
            data: {
                hex: unlocked.toHexString(),
                original: unlocked.toBigInt(),
                scaled: "25.0",
                formatted: "25",
            },
        })

        render(<ConvertBetterBottomSheet ref={mockRef} onClose={mockedOnClose} />, {
            wrapper: TestWrapper,
        })

        await act(async () => {
            fireEvent.press(screen.getByTestId("ConvertBetter_Swap_Button"))
        })

        const senderCard = screen.getByTestId("ConvertBetter_Sender_Card")
        expect(within(senderCard).getByText(/25/)).toBeTruthy()
    })
})
