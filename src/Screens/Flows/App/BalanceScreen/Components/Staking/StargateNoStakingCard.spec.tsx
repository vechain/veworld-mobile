import React from "react"
import { TestWrapper } from "~Test"
import { fireEvent, render, screen } from "@testing-library/react-native"
import { StargateNoStakingCard } from "./StargateNoStakingCard"
import { useBrowserNavigation } from "~Hooks/useBrowserSearch"
import { STARGATE_DAPP_URL_HOME_BANNER } from "~Constants"
import { useStargateStats } from "~Hooks/useStargateStats"

jest.mock("~Hooks/useBrowserSearch", () => ({
    useBrowserNavigation: jest.fn(),
}))

jest.mock("~Hooks/useStargateStats", () => ({
    useStargateStats: jest.fn(),
}))

describe("StargateNoStackingCard", () => {
    beforeEach(() => {
        jest.restoreAllMocks()
    })

    it("should render", () => {
        ;(useBrowserNavigation as jest.Mock).mockReturnValue({ navigateToBrowser: jest.fn() })
        ;(useStargateStats as jest.Mock).mockImplementation(() => ({
            data: {
                totalSupply: {
                    total: 12816,
                },
                totalVetStaked: {
                    total: "6318030000000000000000000000",
                },
                rewardsDistributed: "526381931206666467000000000",
                vthoPerDay: 1181630.68475904,
            },
            isLoading: false,
            error: undefined,
            isError: false,
        }))
        render(<StargateNoStakingCard />, {
            wrapper: TestWrapper,
        })

        expect(screen.getByTestId("STARGATE_NO_STAKING_CARD")).toBeOnTheScreen()
    })

    it("should render the stats cards", () => {
        ;(useBrowserNavigation as jest.Mock).mockReturnValue({ navigateToBrowser: jest.fn() })
        ;(useStargateStats as jest.Mock).mockImplementation(() => ({
            data: {
                totalSupply: {
                    total: 12816,
                },
                totalVetStaked: {
                    total: "6318030000000000000000000000",
                },
                rewardsDistributed: "526381931206666467000000000",
                vthoPerDay: 1181630.68475904,
            },
            isLoading: false,
        }))

        render(<StargateNoStakingCard />, {
            wrapper: TestWrapper,
        })

        const totalStaked = screen.getByTestId("STATS_CARD_TOTAL STAKED")
        const totalSupply = screen.getByTestId("STATS_CARD_TOTAL SUPPLY")
        const rewardsDistributed = screen.getByTestId("STATS_CARD_REWARDS DISTRIBUTED")
        const rewardsGeneration = screen.getByTestId("STATS_CARD_REWARDS GENERATION")

        expect(totalStaked).toBeOnTheScreen()
        expect(totalStaked.findByProps({ testID: "STATS_CARD_VALUE" })).toHaveTextContent("6.3B")

        expect(totalSupply).toBeOnTheScreen()
        expect(totalSupply.findByProps({ testID: "STATS_CARD_VALUE" })).toHaveTextContent("12.8K")

        expect(rewardsDistributed).toBeOnTheScreen()
        expect(rewardsDistributed.findByProps({ testID: "STATS_CARD_VALUE" })).toHaveTextContent("526.4M")

        expect(rewardsGeneration).toBeOnTheScreen()
        expect(rewardsGeneration.findByProps({ testID: "STATS_CARD_VALUE" })).toHaveTextContent("1.2M")
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
