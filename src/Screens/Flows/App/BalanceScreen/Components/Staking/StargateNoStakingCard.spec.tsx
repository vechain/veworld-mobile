import { fireEvent, render, screen } from "@testing-library/react-native"
import React from "react"
import { STARGATE_DAPP_URL_HOME_BANNER } from "~Constants"
import { useBrowserNavigation } from "~Hooks/useBrowserSearch"
import { useStargateStats } from "~Hooks/useStargateStats"
import { TestHelpers, TestWrapper } from "~Test"
import { StargateNoStakingCard } from "./StargateNoStakingCard"
import { useValidators } from "~Hooks/useValidators"

const { mockedValidators } = TestHelpers.data

jest.mock("~Hooks/useBrowserSearch", () => ({
    useBrowserNavigation: jest.fn(),
}))

jest.mock("~Hooks/useStargateStats", () => ({
    useStargateStats: jest.fn(),
}))

jest.mock("~Hooks/useValidators", () => ({
    useValidators: jest.fn(),
}))

describe("StargateNoStackingCard", () => {
    beforeEach(() => {
        jest.restoreAllMocks()
    })

    it("should render", () => {
        ;(useBrowserNavigation as jest.Mock).mockReturnValue({ navigateToBrowser: jest.fn() })
        ;(useValidators as jest.Mock).mockImplementation(() => ({
            data: mockedValidators,
            isLoading: false,
        }))
        ;(useStargateStats as jest.Mock).mockImplementation(() => ({
            data: {
                totalSupply: "12816",
                totalVetStaked: {
                    total: "6318030000000000000000000000",
                },
                rewardsDistributed: "526381931206666467000000000",
                vthoPerDay: "326381931206666467000000000",
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
        ;(useValidators as jest.Mock).mockImplementation(() => ({
            data: mockedValidators,
            isLoading: false,
        }))
        ;(useStargateStats as jest.Mock).mockImplementation(() => ({
            data: {
                totalSupply: "12816",
                totalVetStaked: {
                    total: "6318030000000000000000000000",
                },
                rewardsDistributed: "526381931206666467000000000",
                vthoPerDay: "326381931206666467000000000",
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
        expect(totalStaked.findByProps({ testID: "STATS_CARD_VALUE" })).toHaveTextContent("6.4B")

        expect(totalSupply).toBeOnTheScreen()
        expect(totalSupply.findByProps({ testID: "STATS_CARD_VALUE" })).toHaveTextContent("12.8K")

        expect(rewardsDistributed).toBeOnTheScreen()
        expect(rewardsDistributed.findByProps({ testID: "STATS_CARD_VALUE" })).toHaveTextContent("526.4M")

        expect(rewardsGeneration).toBeOnTheScreen()
        expect(rewardsGeneration.findByProps({ testID: "STATS_CARD_VALUE" })).toHaveTextContent("326.4M")
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
