import { act, fireEvent, render, screen } from "@testing-library/react-native"
import React, { PropsWithChildren } from "react"
import { TestWrapper } from "~Test"
import { DappWithDetails } from "./DappWithDetails"

jest.mock("react-native", () => ({
    ...jest.requireActual("react-native"),
    LayoutAnimation: { configureNext: jest.fn(), Types: {}, Properties: {} },
}))

const Wrapper = ({ children }: PropsWithChildren) => (
    <TestWrapper
        preloadedState={{
            discovery: {
                featured: [
                    {
                        amountOfNavigations: 0,
                        createAt: Date.now(),
                        href: "https://vechain.org",
                        isCustom: false,
                        name: "Test dApp",
                    },
                ],
                bannerInteractions: {},
                connectedApps: [],
                custom: [],
                favorites: [],
                hasOpenedDiscovery: true,
                tabsManager: {
                    currentTabId: null,
                    tabs: [],
                },
            },
        }}>
        {children}
    </TestWrapper>
)

describe("DappWithDetails", () => {
    it("should render correctly", () => {
        render(<DappWithDetails appName="Test dApp" appUrl="https://vechain.org" />, { wrapper: Wrapper })

        expect(screen.getByTestId("DAPP_WITH_DETAILS_NAME")).toHaveTextContent("Test dApp")
        expect(screen.getByTestId("DAPP_WITH_DETAILS_URL")).toHaveTextContent("https://vechain.org")
        expect(screen.queryByTestId("DAPP_DETAILS_NOT_VERIFIED_WARNING")).toBeNull()
    })
    it("should open up details if button is clicked", async () => {
        render(<DappWithDetails appName="Test dApp" appUrl="https://vechain.org" />, { wrapper: Wrapper })

        const btn = screen.getByTestId("DAPP_WITH_DETAILS_DETAILS_BTN")
        expect(btn).toHaveTextContent("Details")
        await act(() => {
            fireEvent.press(btn)
        })
        expect(btn).toHaveTextContent("Hide")
    })
    it("should show warning if the url is not of a dapp and showDappWarning is true", () => {
        render(<DappWithDetails appName="Test dApp" appUrl="https://mainnet.vechain.org" showDappWarning />, {
            wrapper: Wrapper,
        })

        expect(screen.getByTestId("DAPP_DETAILS_NOT_VERIFIED_WARNING")).toBeVisible()
    })
})
