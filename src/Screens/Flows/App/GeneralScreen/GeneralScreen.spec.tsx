import React from "react"
import { TestWrapper } from "~Test"
import { GeneralScreen } from "./GeneralScreen"
import { render, screen } from "@testing-library/react-native"

const findElement = async () =>
    await screen.findByText("General", {}, { timeout: 5000 })

describe("GeneralScreen", () => {
    it("should render correctly", async () => {
        render(<GeneralScreen />, {
            wrapper: TestWrapper,
        })
        await findElement()
    })
})
