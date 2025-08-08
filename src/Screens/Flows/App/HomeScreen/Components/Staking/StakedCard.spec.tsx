import { render } from "@testing-library/react-native"
import { ethers } from "ethers"
import React from "react"
import { useUserNodes } from "~Hooks/Staking/useUserNodes"
import { useUserStargateNfts } from "~Hooks/Staking/useUserStargateNfts"
import { TestWrapper } from "~Test"
import { StakedCard } from "./StakedCard"
import { AccountWithDevice } from "~Model"

jest.mock("~Hooks/Staking/useUserNodes", () => ({
    useUserNodes: jest.fn(),
}))

jest.mock("~Hooks/Staking/useUserStargateNfts", () => ({
    useUserStargateNfts: jest.fn(),
}))

describe("StakedCard", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it("should render the component", async () => {
        ;(useUserNodes as jest.Mock).mockReturnValue({
            stargateNodes: [{}],
            isLoading: false,
        })
        ;(useUserStargateNfts as jest.Mock).mockReturnValue({
            ownedStargateNfts: [],
            isLoading: false,
        })
        const { findByText } = render(<StakedCard account={{} as AccountWithDevice} />, {
            wrapper: TestWrapper,
        })

        const stakingLabel = await findByText("Staking")
        expect(stakingLabel).toBeOnTheScreen()
    })

    it("should render the component with balance", async () => {
        ;(useUserNodes as jest.Mock).mockReturnValue({
            stargateNodes: [{}],
            isLoading: false,
        })
        ;(useUserStargateNfts as jest.Mock).mockReturnValue({
            ownedStargateNfts: [
                {
                    vetAmountStaked: ethers.utils.parseEther("1").toString(),
                },
            ],
            isLoading: false,
        })
        const { findByText } = render(<StakedCard account={{} as AccountWithDevice} />, {
            wrapper: TestWrapper,
        })

        const tokenSymbol = await findByText("VET")

        expect(tokenSymbol).toBeOnTheScreen()
    })
})
