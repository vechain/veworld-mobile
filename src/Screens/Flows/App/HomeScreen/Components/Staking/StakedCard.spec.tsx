import { render } from "@testing-library/react-native"
import { ethers } from "ethers"
import React from "react"
import { DelegationStatus, NodeInfo } from "~Model/Staking"
import { TestWrapper } from "~Test"
import { StakedCard } from "./StakedCard"

describe("StakedCard", () => {
    const mockNodes: NodeInfo[] = [
        {
            nodeId: "1",
            nodeLevel: 1,
            xNodeOwner: "0x123",
            isLegacyNode: false,
            vetAmountStaked: ethers.utils.parseEther("1000").toString(),
            accumulatedRewards: "0",
            delegationStatus: DelegationStatus.ACTIVE,
            validatorId: "0x1234567890abcdef",
        },
    ]

    it("should render the component with owner data", async () => {
        const { findByText } = render(<StakedCard nodes={mockNodes} isOwner={true} isLoading={false} />, {
            wrapper: TestWrapper,
        })

        const totalLockedLabel = await findByText("Total locked")
        expect(totalLockedLabel).toBeOnTheScreen()
    })

    it("should render VET symbol with balance", async () => {
        const { findByText } = render(<StakedCard nodes={mockNodes} isOwner={true} isLoading={false} />, {
            wrapper: TestWrapper,
        })

        const tokenSymbol = await findByText("VET")
        expect(tokenSymbol).toBeOnTheScreen()
    })

    it("should render managing tag when user is not owner", async () => {
        const { findByText } = render(<StakedCard nodes={mockNodes} isOwner={false} isLoading={false} />, {
            wrapper: TestWrapper,
        })

        const managingLabel = await findByText("Managing")
        expect(managingLabel).toBeOnTheScreen()
    })

    it("should not render card when no nodes and not loading", () => {
        const { queryByTestId } = render(<StakedCard nodes={[]} isOwner={true} isLoading={false} />, {
            wrapper: TestWrapper,
        })

        // Component should not render the touchable container when no nodes and not loading
        expect(queryByTestId("staked-card-container")).toBeNull()
    })

    it("should render loading state", async () => {
        const { findByTestId } = render(<StakedCard nodes={mockNodes} isOwner={true} isLoading={true} />, {
            wrapper: TestWrapper,
        })

        // The skeleton loader should be present when loading
        const skeleton = await findByTestId("stargate-locked-value-skeleton")
        expect(skeleton).toBeOnTheScreen()
    })
})
