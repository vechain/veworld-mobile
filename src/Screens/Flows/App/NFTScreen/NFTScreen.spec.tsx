import React from "react"
import { TestWrapper } from "~Test"
import { NFTScreen } from "./NFTScreen"
import { render, screen } from "@testing-library/react-native"

const findElement = async () =>
    await screen.findByTestId("NFT_Screen", {}, { timeout: 10000 })

describe("NFTScreen", () => {
    it("should render correctly", async () => {
        render(<NFTScreen />, {
            wrapper: TestWrapper,
        })
        await findElement()

        screen.debug()
    }, 10000)
})
