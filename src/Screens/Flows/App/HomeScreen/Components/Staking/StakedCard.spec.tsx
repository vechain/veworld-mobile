import { render } from "@testing-library/react-native"
import { ethers } from "ethers"
import React from "react"
import { TestWrapper } from "~Test"
import { StakedCard } from "./StakedCard"
import { NodeInfo, NftData } from "~Model/Staking"

describe("StakedCard", () => {
    const mockNodes: NodeInfo[] = [
        {
            nodeId: "1",
            nodeLevel: 1,
            xNodeOwner: "0x123",
            isXNodeHolder: true,
            isXNodeDelegated: false,
            isXNodeDelegator: true,
            isXNodeDelegatee: false,
            delegatee: "",
            isLegacyNode: false,
        },
    ]

    const mockNfts: NftData[] = [
        {
            tokenId: "1",
            levelId: "1",
            vetAmountStaked: ethers.utils.parseEther("1000").toString(),
            isDelegated: false,
            claimableRewards: "0",
            accumulatedRewards: "0",
        },
    ]

    it("should render the component with owner data", async () => {
        const { findByText } = render(
            <StakedCard nodes={mockNodes} nfts={mockNfts} isOwner={true} isLoading={false} />,
            {
                wrapper: TestWrapper,
            },
        )

        const totalLockedLabel = await findByText("Total locked")
        expect(totalLockedLabel).toBeOnTheScreen()
    })

    it("should render VET symbol with balance", async () => {
        const { findByText } = render(
            <StakedCard nodes={mockNodes} nfts={mockNfts} isOwner={true} isLoading={false} />,
            {
                wrapper: TestWrapper,
            },
        )

        const tokenSymbol = await findByText("VET")
        expect(tokenSymbol).toBeOnTheScreen()
    })

    it("should render managing tag when user is not owner", async () => {
        const { findByText } = render(
            <StakedCard nodes={mockNodes} nfts={mockNfts} isOwner={false} isLoading={false} />,
            {
                wrapper: TestWrapper,
            },
        )

        const managingLabel = await findByText("Managing")
        expect(managingLabel).toBeOnTheScreen()
    })

    it("should not render card when no nodes and not loading", () => {
        const { queryByTestId } = render(<StakedCard nodes={[]} nfts={[]} isOwner={true} isLoading={false} />, {
            wrapper: TestWrapper,
        })

        // Component should not render the touchable container when no nodes and not loading
        expect(queryByTestId("staked-card-container")).toBeNull()
    })

    it("should render loading state", async () => {
        const { findByTestId } = render(
            <StakedCard nodes={mockNodes} nfts={mockNfts} isOwner={true} isLoading={true} />,
            {
                wrapper: TestWrapper,
            },
        )

        // The skeleton loader should be present when loading
        const skeleton = await findByTestId("stargate-locked-value-skeleton")
        expect(skeleton).toBeOnTheScreen()
    })
})
