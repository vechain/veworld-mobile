import React from "react"
import { TestWrapper } from "~Test"
import { NFTScreen } from "./NFTScreen"
import { render, screen } from "@testing-library/react-native"

const findElement = async () =>
    await screen.findByText("NFTs", {}, { timeout: 20000 })

describe("NFTScreen", () => {
    it("should render correctly", async () => {
        render(<NFTScreen />, {
            wrapper: TestWrapper,
        })
        await findElement()
    }, 20000)
})
