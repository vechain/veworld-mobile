import React from "react"
import { TestHelpers, TestWrapper } from "~Test"

import { useIsVeBetterUser } from "~Hooks/useIsVeBetterUser"
import { useUserVeBetterStats } from "~Hooks/useUserVeBetterStats"

import { screen, within } from "@testing-library/react-native"
import { VeBetterDaoCard } from "./VeBetterDaoCard"

jest.mock("~Hooks/useIsVeBetterUser", () => ({ useIsVeBetterUser: jest.fn() }))
jest.mock("~Hooks/useUserVeBetterStats", () => ({ useUserVeBetterStats: jest.fn() }))

describe("VeBetterDaoCard", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it("should show the correct stats", () => {
        ;(useIsVeBetterUser as jest.Mock).mockReturnValue({ data: true })
        ;(useUserVeBetterStats as jest.Mock).mockReturnValue({
            data: {
                totalRewardAmount: "1",
                actionsRewarded: 1000,
                totalImpact: {
                    carbon: 1000,
                    water: 2000,
                    energy: 3000,
                    waste_mass: 0,
                    waste_items: 0,
                    waste_reduction: 0,
                    biodiversity: 0,
                    people: 0,
                    timber: 0,
                    plastic: 4000,
                    education_time: 0,
                    trees_planted: 0,
                    calories_burned: 0,
                    clean_energy_production_wh: 0,
                    sleep_quality_percentage: 0,
                },
                week: "3",
                month: "5",
            },
        })

        TestHelpers.render.renderComponentWithProps(<VeBetterDaoCard />, {
            wrapper: TestWrapper,
        })

        expect(within(screen.getByTestId("STATS_CARD_co2")).getByTestId("STATS_CARD_VALUE")).toHaveTextContent("1")
        expect(within(screen.getByTestId("STATS_CARD_co2")).getByTestId("STATS_CARD_UNIT")).toHaveTextContent("Kg")
        expect(within(screen.getByTestId("STATS_CARD_water")).getByTestId("STATS_CARD_VALUE")).toHaveTextContent("2")
        expect(within(screen.getByTestId("STATS_CARD_water")).getByTestId("STATS_CARD_UNIT")).toHaveTextContent("L")
        expect(within(screen.getByTestId("STATS_CARD_energy")).getByTestId("STATS_CARD_VALUE")).toHaveTextContent("3")
        expect(within(screen.getByTestId("STATS_CARD_energy")).getByTestId("STATS_CARD_UNIT")).toHaveTextContent("KWh")
        expect(within(screen.getByTestId("STATS_CARD_plastic")).getByTestId("STATS_CARD_VALUE")).toHaveTextContent("4")
        expect(within(screen.getByTestId("STATS_CARD_plastic")).getByTestId("STATS_CARD_UNIT")).toHaveTextContent("Kg")
        expect(screen.getByTestId("REWARDS_EARNED_WEEK_VALUE")).toHaveTextContent("3")
        expect(screen.getByTestId("REWARDS_EARNED_MONTH_VALUE")).toHaveTextContent("5")
        expect(screen.getByTestId("REWARDS_EARNED_TOTAL_VALUE")).toHaveTextContent("1")
    })

    it("should not show anything if is not VeBetter user", () => {
        ;(useIsVeBetterUser as jest.Mock).mockReturnValue({ data: false })
        ;(useUserVeBetterStats as jest.Mock).mockReturnValue({
            data: {
                totalRewardAmount: "0",
                actionsRewarded: 0,
                totalImpact: {},
            },
        })
        TestHelpers.render.renderComponentWithProps(<VeBetterDaoCard />, {
            wrapper: TestWrapper,
        })

        expect(screen.queryByTestId("VEBETTER_DAO_CARD")).toBeNull()
    })
})
