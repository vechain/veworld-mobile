import { render, screen } from "@testing-library/react-native"
import React from "react"
import { useValidatorDetails } from "~Hooks"
import { TestWrapper } from "~Test"
import { StargateCarouselItemAPY } from "./StargateCarouselItemAPY"

jest.mock("~Hooks/Staking/useValidatorDetails", () => ({
    useValidatorDetails: jest.fn(),
}))

describe("StargateCarouselItemAPY", () => {
    it("should show - if no validator", () => {
        ;(useValidatorDetails as jest.Mock).mockReturnValue({ data: null })

        render(<StargateCarouselItemAPY validatorId={null} levelName="Dawn" />, { wrapper: TestWrapper })

        expect(screen.getByTestId("STARGATE_CAROUSEL_ITEM_VALUE_APY_VALUE")).toHaveTextContent("-")
    })

    it("should show value if validator", () => {
        ;(useValidatorDetails as jest.Mock).mockReturnValue({ data: { nftYieldsNextCycle: { Dawn: 1.74 } } })

        render(<StargateCarouselItemAPY validatorId={"0x0"} levelName="Dawn" />, { wrapper: TestWrapper })

        expect(screen.getByTestId("STARGATE_CAROUSEL_ITEM_VALUE_APY_VALUE")).toHaveTextContent("1.7")
    })
})
