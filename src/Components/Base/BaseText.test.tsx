import { TestWrapper } from "~Test"
import React from "react"
import { render, screen, waitFor } from "@testing-library/react-native"
import { BaseText } from "./BaseText"

describe("BaseText", () => {
    it("should render correctly with default props", async () => {
        const { getByTestId } = render(<BaseText testID="BaseText" />, {
            wrapper: TestWrapper,
        })
        await waitFor(() => expect(screen.getByTestId("BaseText")).toBeTruthy())
        const button = getByTestId("BaseText")
        expect(button).toBeTruthy()
    })

    it("should render correctly then italic", async () => {
        const { getByTestId } = render(
            <BaseText testID="BaseText" italic typographyFont="body" />,
            {
                wrapper: TestWrapper,
            },
        )
        await waitFor(() => expect(screen.getByTestId("BaseText")).toBeTruthy())
        const button = getByTestId("BaseText")
        expect(button).toBeTruthy()
    })
})
