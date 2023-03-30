import { TestWrapper } from "~Test"
import React from "react"
import { render, screen } from "@testing-library/react-native"
import { BaseCard } from "./BaseCard"

const baseCardTestId = "BaseCard"
const findBaseCard = async () =>
    await screen.findByTestId(baseCardTestId, { timeout: 5000 })

describe("BaseCard", () => {
    it("renders correctly", async () => {
        render(<BaseCard testID={baseCardTestId} />, {
            wrapper: TestWrapper,
        })

        const baseCard = await findBaseCard()
        expect(baseCard).toBeVisible()
    })
})
