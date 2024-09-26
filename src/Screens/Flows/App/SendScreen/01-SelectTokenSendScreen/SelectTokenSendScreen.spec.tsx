import { render, screen } from "@testing-library/react-native"
import React from "react"
import { TestWrapper } from "~Test"
import { SelectTokenSendScreen } from "./01-SelectTokenSendScreen"

const findElement = async () => await screen.findByTestId("Select_Token_Send_Screen", {}, { timeout: 5000 })

describe("SelectTokenSendScreen", () => {
    it("should render correctly", async () => {
        render(<SelectTokenSendScreen />, {
            wrapper: TestWrapper,
        })
        await findElement()
    })
})
