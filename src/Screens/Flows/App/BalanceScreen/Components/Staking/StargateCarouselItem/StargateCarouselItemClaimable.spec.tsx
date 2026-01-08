import { render, screen } from "@testing-library/react-native"
import { ethers } from "ethers"
import React from "react"
import { useStargateClaimableRewards } from "~Hooks/useStargateClaimableRewards"
import { TestWrapper } from "~Test"
import { StargateCarouselItemClaimable } from "./StargateCarouselItemClaimable"

jest.mock("~Hooks/useStargateClaimableRewards", () => ({
    useStargateClaimableRewards: jest.fn(),
}))

describe("StargateCarouselItemClaimable", () => {
    it("should show the claimable value", () => {
        ;(useStargateClaimableRewards as jest.Mock).mockReturnValue({ data: ethers.utils.parseEther("1.5") })

        render(<StargateCarouselItemClaimable nodeId="1" />, { wrapper: TestWrapper })

        expect(screen.getByTestId("STARGATE_CAROUSEL_ITEM_VALUE_CLAIMABLE_VALUE")).toHaveTextContent("1.5")
    })
})
