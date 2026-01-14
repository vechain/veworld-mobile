import { render, screen } from "@testing-library/react-native"
import React from "react"
import { useValidatorDetails } from "~Hooks"
import { TestWrapper } from "~Test"
import { StargateCarouselItemCycle } from "./StargateCarouselItemCycle"

jest.mock("~Hooks/Staking/useValidatorDetails", () => ({
    useValidatorDetails: jest.fn(),
}))

describe("StargateCarouselItemCycle", () => {
    it("should show - if no validator", () => {
        ;(useValidatorDetails as jest.Mock).mockReturnValue({ data: null })

        render(<StargateCarouselItemCycle validatorId={null} />, { wrapper: TestWrapper })

        expect(screen.getByTestId("STARGATE_CAROUSEL_ITEM_VALUE_CYCLE_DURATION_VALUE")).toHaveTextContent("-")
    })

    it("should show value if validator", () => {
        ;(useValidatorDetails as jest.Mock).mockReturnValue({ data: { cyclePeriodLength: 60480 } })

        render(<StargateCarouselItemCycle validatorId={"0x0"} />, { wrapper: TestWrapper })

        expect(screen.getByTestId("STARGATE_CAROUSEL_ITEM_VALUE_CYCLE_DURATION_VALUE")).toHaveTextContent("7 days")
    })
})
