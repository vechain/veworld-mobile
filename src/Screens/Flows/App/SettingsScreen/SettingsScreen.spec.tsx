import { render, screen } from "@testing-library/react-native"
import React from "react"
import { DEVICE_TYPE, WatchedAccount } from "~Model"
import { TestHelpers, TestWrapper } from "~Test"
import { SettingsScreen } from "./SettingsScreen"

jest.mock("@react-navigation/native", () => ({
    ...jest.requireActual("@react-navigation/native"),
    useScrollToTop: jest.fn(),
}))

describe("SettingsScreen", () => {
    it("should render correctly", async () => {
        render(<SettingsScreen />, {
            wrapper: TestWrapper,
        })
        expect(screen.getByTestId("General settings")).toBeVisible()
        expect(screen.getByTestId("Transactions")).toBeVisible()
    })
    it("should not render transactions menu in observed wallet", async () => {
        TestHelpers.render.renderComponentWithProps(<SettingsScreen />, {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    accounts: {
                        accounts: [
                            {
                                address: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                                alias: "Account 1",
                                index: 0,
                                rootAddress: "0x90d70a5d0e9ce28336f7d45990b9c63c0a4142g0",
                                visible: true,
                                type: DEVICE_TYPE.LOCAL_WATCHED,
                            } satisfies WatchedAccount,
                        ],
                        selectedAccount: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                    },
                },
            },
        })

        expect(screen.getByTestId("General settings")).toBeVisible()
        expect(screen.queryByTestId("Transactions")).toBeNull()
    })
})
