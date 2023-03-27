jest.mock("~Test", () => ({
    ...jest.requireActual("~Test"),
    getTheme: () => "dark",
}))
import { TestWrapper } from "~Test"
import React from "react"
import { render, screen, waitFor } from "@testing-library/react-native"
import { BaseIcon } from "./BaseIcon"

describe("BaseIcon", () => {
    it("render correctly on dark theme", async () => {
        const mockAction = jest.fn()

        render(
            <BaseIcon
                testID="BaseIcon"
                name="star"
                bg="red"
                size={32}
                m={10}
                p={10}
                action={mockAction}
                disabled
            />,
            {
                wrapper: TestWrapper,
            },
        )
        await waitFor(() => expect(screen.getByTestId("BaseIcon")).toBeTruthy())

        expect(screen.getByTestId("BaseIcon")).toBeVisible()
    })
})
