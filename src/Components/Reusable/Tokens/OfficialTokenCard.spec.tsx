import React from "react"
import { render, screen } from "@testing-library/react-native"
import { OfficialTokenCard } from "./OfficialTokenCard"
import { TestWrapper } from "~Test"
import { VET } from "~Constants"

const mockedAction = jest.fn()

describe("OfficialTokenCard", () => {
    it("should render", async () => {
        render(<OfficialTokenCard token={VET} action={mockedAction} />, { wrapper: TestWrapper })

        const tokenCard = await screen.findByTestId("VET")
        expect(tokenCard).toBeOnTheScreen()
        expect(tokenCard).toHaveTextContent(VET.symbol)
    })
})
