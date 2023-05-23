import { BaseActivityIndicator } from "./BaseActivityIndicator"
import { TestWrapper } from "~Test"
import React from "react"
import { render, screen } from "@testing-library/react-native"

const mockedOnHide = jest.fn()

describe("BaseActivityIndicator", () => {
    it("should render correctly - visible", async () => {
        render(
            <BaseActivityIndicator isVisible={true} onHide={mockedOnHide} />,
            {
                wrapper: TestWrapper,
            },
        )

        const activityIndicator = await screen.findByTestId(
            "activity-indicator",
        )
        expect(activityIndicator).toBeVisible()
    })

    it("should render correctly - not visible", async () => {
        render(
            <BaseActivityIndicator isVisible={false} onHide={mockedOnHide} />,
            {
                wrapper: TestWrapper,
            },
        )

        const activityIndicator = await screen.queryByTestId(
            "activity-indicator",
        )
        expect(activityIndicator).toBeNull()
    })

    it("should render correctly - with text", async () => {
        render(
            <BaseActivityIndicator
                isVisible={true}
                text={"TestText"}
                onHide={mockedOnHide}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        await screen.findByTestId("activity-indicator")
        await screen.findByText("TestText")
    })
})
