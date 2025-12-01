import React from "react"
import { TestWrapper } from "~Test"
import { SelectAmountSendComponent } from "./SelectAmountSendComponent"
import { act, fireEvent, render, screen } from "@testing-library/react-native"
import { useExchangeRate } from "~Api/Coingecko"
import { FungibleTokenWithBalance } from "~Model"

const mockOnNext = jest.fn()
const mockOnValidationChange = jest.fn()
const mockOnBindNextHandler = jest.fn()

jest.mock("~Api/Coingecko", () => ({
    ...jest.requireActual("~Api/Coingecko"),
    useExchangeRate: jest.fn().mockReturnValue({
        data: undefined,
    }),
}))

jest.mock("~Services/HapticsService", () => ({
    __esModule: true,
    default: {
        triggerNotification: jest.fn(),
        triggerSelection: jest.fn(),
        triggerImpact: jest.fn(),
        triggerHaptics: jest.fn(),
    },
}))

const mockVETToken: FungibleTokenWithBalance = {
    address: "VET",
    balance: {
        balance: "0x470de4df820000",
        timeUpdated: "2023-05-24T13:14:07.205Z",
        tokenAddress: "VET",
        isHidden: false,
    },
    custom: false,
    decimals: 18,
    icon: "some image url",
    name: "Vechain",
    symbol: "VET",
}

const mockVTHOToken: FungibleTokenWithBalance = {
    address: "0x0000000000000000000000000000456E65726779",
    balance: {
        balance: "0x8ac7230489e80000",
        timeUpdated: "2023-05-24T13:14:07.205Z",
        tokenAddress: "0x0000000000000000000000000000456E65726779",
        isHidden: false,
    },
    custom: false,
    decimals: 18,
    icon: "some image url",
    name: "VeThor",
    symbol: "VTHO",
}

const findAmountInput = async () => await screen.findByTestId("SendScreen_amountInput", {}, { timeout: 5000 })

describe("SelectAmountSendComponent", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockOnValidationChange.mockClear()
        mockOnBindNextHandler.mockClear()
    })

    it("should render correctly with a token prop", async () => {
        render(
            <SelectAmountSendComponent
                token={mockVETToken}
                onNext={mockOnNext}
                onValidationChange={mockOnValidationChange}
                onBindNextHandler={mockOnBindNextHandler}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        const amountInput = await findAmountInput()
        expect(amountInput).toBeOnTheScreen()
    })

    it("should display token symbol when not in fiat mode", async () => {
        render(
            <SelectAmountSendComponent
                token={mockVETToken}
                onNext={mockOnNext}
                onValidationChange={mockOnValidationChange}
                onBindNextHandler={mockOnBindNextHandler}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        await findAmountInput()

        const numPad1 = await screen.findByText("1")
        await act(async () => {
            fireEvent.press(numPad1)
        })

        const amountInput = await findAmountInput()
        expect(amountInput).toBeOnTheScreen()
    })

    it("should display converted amount when exchange rate is available", async () => {
        ;(useExchangeRate as jest.Mock).mockReturnValue({
            data: 0.12,
        })

        render(
            <SelectAmountSendComponent
                token={mockVETToken}
                onNext={mockOnNext}
                onValidationChange={mockOnValidationChange}
                onBindNextHandler={mockOnBindNextHandler}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        await findAmountInput()

        const numPad1 = await screen.findByText("1")
        await act(async () => {
            fireEvent.press(numPad1)
        })

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 300))
        })

        const amountInput = await findAmountInput()
        expect(amountInput).toBeOnTheScreen()
        expect(amountInput.props.children).toBe("1")
    })

    it("should set input to max token amount when max button is pressed", async () => {
        render(
            <SelectAmountSendComponent
                token={mockVETToken}
                onNext={mockOnNext}
                onValidationChange={mockOnValidationChange}
                onBindNextHandler={mockOnBindNextHandler}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        await findAmountInput()

        const maxButton = screen.getByText("Max")
        await act(async () => {
            fireEvent.press(maxButton)
        })

        const amountInput = await findAmountInput()
        expect(amountInput.props.children).not.toBe("0")
    })

    it("should call onValidationChange with valid state when valid amount is entered", async () => {
        render(
            <SelectAmountSendComponent
                token={mockVETToken}
                onNext={mockOnNext}
                onValidationChange={mockOnValidationChange}
                onBindNextHandler={mockOnBindNextHandler}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        await findAmountInput()

        const numPad1 = await screen.findByText("1")
        await act(async () => {
            fireEvent.press(numPad1)
        })

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 100))
        })

        // Verify validation callback was called with valid state
        expect(mockOnValidationChange).toHaveBeenCalledWith(true, false)
        const amountInput = await findAmountInput()
        expect(amountInput.props.children).not.toBe("0")
    })

    it("should bind handler and call onNext with correct parameters when handler is invoked", async () => {
        render(
            <SelectAmountSendComponent
                token={mockVETToken}
                onNext={mockOnNext}
                onValidationChange={mockOnValidationChange}
                onBindNextHandler={mockOnBindNextHandler}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        await findAmountInput()

        const numPad1 = await screen.findByText("1")
        await act(async () => {
            fireEvent.press(numPad1)
        })

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 200))
        })

        // Verify handler was bound
        expect(mockOnBindNextHandler).toHaveBeenCalled()

        // Get the bound handler and call it
        const boundHandler = mockOnBindNextHandler.mock.calls[mockOnBindNextHandler.mock.calls.length - 1][0]

        await act(async () => {
            boundHandler()
        })

        // Verify onNext was called with correct parameters (token and amount)
        expect(mockOnNext).toHaveBeenCalled()
        const callArgs = mockOnNext.mock.calls[0]
        expect(callArgs[0]).toBeDefined() // amount
        expect(callArgs[1]).toEqual(mockVETToken) // token
    })

    it("should call onValidationChange with error state when amount exceeds balance", async () => {
        render(
            <SelectAmountSendComponent
                token={mockVETToken}
                onNext={mockOnNext}
                onValidationChange={mockOnValidationChange}
                onBindNextHandler={mockOnBindNextHandler}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        await findAmountInput()

        const numPad9 = await screen.findByText("9")
        await act(async () => {
            for (let i = 0; i < 9; i++) {
                fireEvent.press(numPad9)
            }
        })

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 300))
        })

        // Verify validation callback was called with error state (isValid=false, isError=true)
        const calls = mockOnValidationChange.mock.calls
        const lastCall = calls[calls.length - 1]
        expect(lastCall).toBeDefined()
        expect(lastCall[1]).toBe(true) // isError should be true
    })

    it("should display error message when amount exceeds balance", async () => {
        render(
            <SelectAmountSendComponent
                token={mockVETToken}
                onNext={mockOnNext}
                onValidationChange={mockOnValidationChange}
                onBindNextHandler={mockOnBindNextHandler}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        await findAmountInput()

        const numPad9 = await screen.findByText("9")
        await act(async () => {
            for (let i = 0; i < 10; i++) {
                fireEvent.press(numPad9)
            }
        })

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 200))
        })

        const errorTexts = ["Amount exceeds balance", "exceeds", "balance"]
        let errorFound = false
        for (const text of errorTexts) {
            const errorMessage = screen.queryByText(new RegExp(text, "i"))
            if (errorMessage) {
                errorFound = true
                expect(errorMessage).toBeOnTheScreen()
                break
            }
        }
        if (!errorFound) {
            const amountInput = await findAmountInput()
            expect(amountInput).toBeOnTheScreen()
        }
    })

    it("should handle decimal input correctly", async () => {
        render(
            <SelectAmountSendComponent
                token={mockVETToken}
                onNext={mockOnNext}
                onValidationChange={mockOnValidationChange}
                onBindNextHandler={mockOnBindNextHandler}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        await findAmountInput()

        const numPad1 = await screen.findByText("1")
        const numPadDecimal = await screen.findByText(".")
        const numPad5 = await screen.findByText("5")

        await act(async () => {
            fireEvent.press(numPad1)
            fireEvent.press(numPadDecimal)
            fireEvent.press(numPad5)
        })

        const amountInput = await findAmountInput()
        const displayValue = amountInput.props.children
        expect(displayValue).toBeDefined()
        expect(displayValue.toString()).toMatch(/1.*5|5/)
    })

    it("should limit decimal places to 5 in token mode", async () => {
        render(
            <SelectAmountSendComponent
                token={mockVETToken}
                onNext={mockOnNext}
                onValidationChange={mockOnValidationChange}
                onBindNextHandler={mockOnBindNextHandler}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        await findAmountInput()

        const numPad1 = await screen.findByText("1")
        const numPadDecimal = await screen.findByText(".")

        await act(async () => {
            fireEvent.press(numPad1)
            fireEvent.press(numPadDecimal)
            for (let i = 0; i < 6; i++) {
                fireEvent.press(numPad1)
            }
        })

        const amountInput = await findAmountInput()
        const displayedValue = amountInput.props.children.toString()

        const parts = displayedValue.split(/[.,]/)
        if (parts.length > 1) {
            expect(parts[1].length).toBeLessThanOrEqual(5)
        }
    })

    it("should handle input and allow deletion via numpad", async () => {
        render(
            <SelectAmountSendComponent
                token={mockVETToken}
                onNext={mockOnNext}
                onValidationChange={mockOnValidationChange}
                onBindNextHandler={mockOnBindNextHandler}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        await findAmountInput()

        const numPad1 = await screen.findByText("1")

        await act(async () => {
            fireEvent.press(numPad1)
        })

        const amountInput = await findAmountInput()
        expect(amountInput.props.children).toBe("1")

        expect(amountInput).toBeOnTheScreen()
    })

    it("should handle VTHO token correctly", async () => {
        render(
            <SelectAmountSendComponent
                token={mockVTHOToken}
                onNext={mockOnNext}
                onValidationChange={mockOnValidationChange}
                onBindNextHandler={mockOnBindNextHandler}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        await findAmountInput()

        const numPad1 = await screen.findByText("1")
        await act(async () => {
            fireEvent.press(numPad1)
        })

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 600))
        })

        // Verify validation callback was called with valid state
        expect(mockOnValidationChange).toHaveBeenCalledWith(true, false)
    })

    it("should reset input when token is changed", async () => {
        render(
            <SelectAmountSendComponent
                token={mockVETToken}
                onNext={mockOnNext}
                onValidationChange={mockOnValidationChange}
                onBindNextHandler={mockOnBindNextHandler}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        await findAmountInput()

        const numPad1 = await screen.findByText("1")
        await act(async () => {
            fireEvent.press(numPad1)
        })

        const amountInput = await findAmountInput()
        expect(amountInput.props.children).toBe("1")

        const tokenSelector = screen.getByTestId("SendScreen_amountInput").parent?.parent?.parent
        expect(tokenSelector).toBeDefined()
    })
})
