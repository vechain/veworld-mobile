import React from "react"
import { View } from "react-native"
import { screen } from "@testing-library/react-native"
import { useIsVeBetterUser } from "~Hooks/useIsVeBetterUser"
import { useShareVeBetterCard } from "~Hooks/useShareVeBetterCard"
import { TestHelpers, TestWrapper } from "~Test"
import { Tokens } from "./index"

jest.mock("~Hooks/useIsVeBetterUser", () => ({ useIsVeBetterUser: jest.fn() }))
jest.mock("~Hooks/useShareVeBetterCard", () => ({ useShareVeBetterCard: jest.fn() }))
jest.mock("../../Components/Tokens/AddTokensCard", () => ({
    AddTokensCard: () => null,
}))
jest.mock("../../Components/BannerCarousel", () => ({
    BannersCarousel: () => null,
}))
jest.mock("./TokensTopSection", () => ({
    TokensTopSection: () => null,
}))
jest.mock("../Activity/BalanceActivity", () => ({
    BalanceActivity: () => null,
}))
jest.mock("../../Components/VeBetterDao/VeBetterDaoCard", () => ({
    VeBetterDaoCard: React.forwardRef(() => <View testID="VEBETTER_DAO_CARD" />),
}))
jest.mock("../../Components/VeBetterDao/VeBetterDaoActionGroup", () => ({
    VeBetterDaoActionGroup: () => <View testID="VEBETTER_DAO_ACTION_GROUP" />,
}))

describe("Tokens", () => {
    const mockShareCard = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        ;(useShareVeBetterCard as jest.Mock).mockReturnValue({
            cardRef: { current: null },
            shareCard: mockShareCard,
            isSharing: false,
        })
    })

    describe("VeBetterDao section", () => {
        it("should render VeBetterDaoCard and VeBetterDaoActionGroup when user is a VeBetter user", () => {
            ;(useIsVeBetterUser as jest.Mock).mockReturnValue({ data: true })

            TestHelpers.render.renderComponentWithProps(<Tokens />, {
                wrapper: TestWrapper,
            })

            expect(screen.getByTestId("VEBETTER_DAO_CARD")).toBeTruthy()
            expect(screen.getByTestId("VEBETTER_DAO_ACTION_GROUP")).toBeTruthy()
        })

        it("should not render VeBetterDaoCard and VeBetterDaoActionGroup when user is not a VeBetter user", () => {
            ;(useIsVeBetterUser as jest.Mock).mockReturnValue({ data: false })

            TestHelpers.render.renderComponentWithProps(<Tokens />, {
                wrapper: TestWrapper,
            })

            expect(screen.queryByTestId("VEBETTER_DAO_CARD")).toBeNull()
            expect(screen.queryByTestId("VEBETTER_DAO_ACTION_GROUP")).toBeNull()
        })

        it("should not render VeBetterDaoCard when isEmptyStateShown is true even if user is a VeBetter user", () => {
            ;(useIsVeBetterUser as jest.Mock).mockReturnValue({ data: true })

            TestHelpers.render.renderComponentWithProps(<Tokens isEmptyStateShown={true} />, {
                wrapper: TestWrapper,
            })

            expect(screen.queryByTestId("VEBETTER_DAO_CARD")).toBeNull()
            expect(screen.queryByTestId("VEBETTER_DAO_ACTION_GROUP")).toBeNull()
        })
    })
})
