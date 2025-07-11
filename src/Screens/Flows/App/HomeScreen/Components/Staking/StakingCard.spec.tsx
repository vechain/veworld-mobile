import React from "react"
import { render } from "@testing-library/react-native"
import { StakedCard } from "./StakedCard"
import { TestWrapper } from "~Test"

describe("StakingCard", () => {
    it("should render the component", async () => {
        const { findByText } = render(<StakedCard />, {
            wrapper: TestWrapper,
        })

        const stakingLabel = await findByText("Staking")
        expect(stakingLabel).toBeOnTheScreen()
    })

    it("should render the component with balance", async () => {
        const { findByText } = render(<StakedCard />, {
            wrapper: TestWrapper,
        })

        const tokenSymbol = await findByText("VET")
        const totalLockedText = await findByText("Total locked")

        expect(tokenSymbol).toBeOnTheScreen()
        expect(totalLockedText).toBeOnTheScreen()
    })
})
