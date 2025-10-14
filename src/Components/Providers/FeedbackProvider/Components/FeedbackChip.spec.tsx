import React from "react"
import { TestWrapper } from "~Test"
import { render, screen } from "@testing-library/react-native"
import { FeedbackChip } from "./FeedbackChip"
import { FeedbackSeverity, FeedbackType } from "../Model"

describe("FeedbackChip", () => {
    it("should render the chip with the correct label", () => {
        render(
            <FeedbackChip
                feedbackData={{
                    severity: FeedbackSeverity.INFO,
                    type: FeedbackType.ALERT,
                    message: "Test",
                }}
                onDismiss={jest.fn()}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        const chip = screen.getByTestId("FEEDBACK_CHIP")
        const icon = screen.getByTestId(`FEEDBACK_CHIP_ICON_${FeedbackSeverity.INFO}`)
        const message = screen.getByTestId("FEEDBACK_CHIP_MESSAGE")

        expect(chip).toBeVisible()
        expect(icon).toBeVisible()
        expect(message).toBeVisible()
        expect(message).toHaveTextContent("Test")
        expect(chip).toBeVisible()
    })

    it.each([FeedbackSeverity.SUCCESS, FeedbackSeverity.WARNING, FeedbackSeverity.ERROR, FeedbackSeverity.INFO])(
        "should render the chip with the correct icon based on severity: %s",
        severity => {
            render(
                <FeedbackChip
                    feedbackData={{
                        severity: severity,
                        type: FeedbackType.ALERT,
                        message: "Test",
                    }}
                    onDismiss={jest.fn()}
                />,
                {
                    wrapper: TestWrapper,
                },
            )

            const icon = screen.getByTestId(`FEEDBACK_CHIP_ICON_${severity}`)

            expect(icon).toBeVisible()
        },
    )

    it("should render the chip with the correct icon when loading", () => {
        render(
            <FeedbackChip
                feedbackData={{ severity: FeedbackSeverity.LOADING, type: FeedbackType.ALERT, message: "Test" }}
                onDismiss={jest.fn()}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        const loadingIcon = screen.getByTestId("FEEDBACK_CHIP_LOADING_ICON")
        const closeButton = screen.getByTestId("FEEDBACK_CHIP_CLOSE_BUTTON")
        const message = screen.getByTestId("FEEDBACK_CHIP_MESSAGE")

        expect(loadingIcon).toBeVisible()
        expect(closeButton).toBeVisible()
        expect(message).toBeVisible()
        expect(message).toHaveTextContent("Test")
    })

    it("should render the close button with the correct icon when permanent", () => {
        render(
            <FeedbackChip
                feedbackData={{ severity: FeedbackSeverity.ERROR, type: FeedbackType.PERMANENT, message: "Test" }}
                onDismiss={jest.fn()}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        const chip = screen.getByTestId("FEEDBACK_CHIP")
        const closeButton = screen.getByTestId("FEEDBACK_CHIP_CLOSE_BUTTON")
        expect(chip).toBeVisible()
        expect(closeButton).toBeVisible()
    })
})
