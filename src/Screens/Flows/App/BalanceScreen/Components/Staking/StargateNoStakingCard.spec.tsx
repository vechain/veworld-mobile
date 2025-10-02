import React from "react"
import { TestWrapper } from "~Test"
import { fireEvent, render, screen } from "@testing-library/react-native"
import { StargateNoStakingCard } from "./StargateNoStakingCard"
import { useBrowserNavigation } from "~Hooks/useBrowserSearch"
import { STARGATE_DAPP_URL_HOME_BANNER } from "~Constants"

jest.mock("~Hooks/useBrowserSearch", () => ({
    useBrowserNavigation: jest.fn(),
}))

describe("StargateNoStackingCard", () => {
    beforeEach(() => {
        jest.restoreAllMocks()
    })

    it("should render", () => {
        ;(useBrowserNavigation as jest.Mock).mockReturnValue({ navigateToBrowser: jest.fn() })
        render(<StargateNoStakingCard />, {
            wrapper: TestWrapper,
        })

        expect(screen.getByTestId("STARGATE_NO_STAKING_CARD")).toBeOnTheScreen()
    })

    it("should navigate to browser when start staking button is pressed", () => {
        const navigateToBrowser = jest.fn()
        ;(useBrowserNavigation as jest.Mock).mockReturnValue({ navigateToBrowser })
        render(<StargateNoStakingCard />, {
            wrapper: TestWrapper,
        })

        fireEvent.press(screen.getByTestId("STARGATE_START_STAKING_BUTTON"))

        expect(navigateToBrowser).toHaveBeenCalledWith(STARGATE_DAPP_URL_HOME_BANNER)
    })
})
