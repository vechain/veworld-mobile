import React from "react"
import { render, screen, fireEvent } from "@testing-library/react-native"
import { BaseChip } from "./BaseChip"
import { TestWrapper } from "~Test"

const onPressMock = jest.fn()

describe("BaseChip", () => {
    it("should render the chip with the correct label", () => {
        render(<BaseChip label="Test" active={false} onPress={onPressMock} />, {
            wrapper: TestWrapper,
        })

        const chip = screen.getByText("Test")
        expect(chip).toBeVisible()
    })

    it("should call onPress when clicked", () => {
        render(<BaseChip label="Test" active={false} onPress={onPressMock} />, {
            wrapper: TestWrapper,
        })

        const chip = screen.getByText("Test")
        fireEvent.press(chip)

        expect(onPressMock).toHaveBeenCalledTimes(1)
    })

    it("should have different styles when active", () => {
        const { rerender } = render(<BaseChip label="Test" active={false} onPress={onPressMock} />, {
            wrapper: TestWrapper,
        })

        // Get the inactive styles
        const inactiveText = screen.getByText("Test")
        const inactiveStyles = JSON.stringify(inactiveText.props.style)

        // Rerender with active=true
        rerender(<BaseChip label="Test" active={true} onPress={onPressMock} />)

        // Get the active styles
        const activeText = screen.getByText("Test")
        const activeStyles = JSON.stringify(activeText.props.style)

        // Styles should be different
        expect(activeStyles).not.toEqual(inactiveStyles)
    })
})
