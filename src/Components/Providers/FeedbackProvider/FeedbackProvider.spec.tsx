import { act, render, screen } from "@testing-library/react-native"
import React from "react"
import { Text } from "react-native"
import { TestWrapper } from "~Test"

import { Feedback } from "./Events"

import { FeedbackProvider } from "./FeedbackProvider"

import { FeedbackSeverity, FeedbackType } from "./Model"

describe("FeedbackProvider", () => {
    it("should render the feedback provider", async () => {
        render(
            <FeedbackProvider>
                <Text>{"Test"}</Text>
            </FeedbackProvider>,
            {
                wrapper: TestWrapper,
            },
        )

        await act(() => {
            Feedback.show({
                severity: FeedbackSeverity.INFO,
                type: FeedbackType.ALERT,
                message: "Test",
            })
        })

        const chip = await screen.getByTestId("FEEDBACK_CHIP")
        expect(chip).toBeVisible()
        expect(chip).toHaveTextContent("Test")
    })
})
