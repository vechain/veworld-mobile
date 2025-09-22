import { screen } from "@testing-library/react-native"
import React from "react"
import { TestHelpers, TestWrapper } from "~Test"

import { useVns } from "~Hooks/useVns"

import { Header } from "./Header"

jest.mock("~Hooks/useVns", () => ({
    useVns: jest.fn(),
}))

describe("BalanceScreen -> Header", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it("should show the correct user", () => {
        ;(useVns as jest.Mock).mockReturnValue({ name: undefined })
        const qrCodeBottomSheetRef = {
            current: {
                present: jest.fn(),
            },
        }
        TestHelpers.render.renderComponentWithProps(
            <Header
                scrollY={{ value: 0 } as any}
                contentOffsetY={{ value: 0 } as any}
                qrCodeBottomSheetRef={qrCodeBottomSheetRef as any}
            />,
            { wrapper: TestWrapper },
        )

        expect(screen.getByTestId("BALANCE_HEADER_DISPLAY_USERNAME")).toHaveTextContent("Account 1")
        expect(screen.queryByTestId("BALANCE_HEADER_VIEW_ONLY")).toBeNull()
    })
    it("should show the vet domain if it is not veworld.vet", () => {
        ;(useVns as jest.Mock).mockReturnValue({ name: "test.vet" })
        const qrCodeBottomSheetRef = {
            current: {
                present: jest.fn(),
            },
        }
        TestHelpers.render.renderComponentWithProps(
            <Header
                scrollY={{ value: 0 } as any}
                contentOffsetY={{ value: 0 } as any}
                qrCodeBottomSheetRef={qrCodeBottomSheetRef as any}
            />,
            { wrapper: TestWrapper },
        )

        expect(screen.getByTestId("BALANCE_HEADER_DISPLAY_USERNAME")).toHaveTextContent("test.vet")
    })
    it("should show the subdomain if username contains veworld.vet", () => {
        ;(useVns as jest.Mock).mockReturnValue({ name: "test.veworld.vet" })
        const qrCodeBottomSheetRef = {
            current: {
                present: jest.fn(),
            },
        }
        TestHelpers.render.renderComponentWithProps(
            <Header
                scrollY={{ value: 0 } as any}
                contentOffsetY={{ value: 0 } as any}
                qrCodeBottomSheetRef={qrCodeBottomSheetRef as any}
            />,
            { wrapper: TestWrapper },
        )

        expect(screen.getByTestId("BALANCE_HEADER_DISPLAY_USERNAME")).toHaveTextContent("test")
    })
    it("should show view only when observed account", () => {
        ;(useVns as jest.Mock).mockReturnValue({ name: "test.veworld.vet" })
        const qrCodeBottomSheetRef = {
            current: {
                present: jest.fn(),
            },
        }
        TestHelpers.render.renderComponentWithProps(
            <Header
                scrollY={{ value: 0 } as any}
                contentOffsetY={{ value: 0 } as any}
                qrCodeBottomSheetRef={qrCodeBottomSheetRef as any}
            />,
            {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState: {
                        accounts: {
                            accounts: [TestHelpers.data.account5D1Observed],
                            selectedAccount: TestHelpers.data.account5D1Observed.address,
                        },
                    },
                },
            },
        )

        expect(screen.getByTestId("BALANCE_HEADER_VIEW_ONLY")).toBeVisible()
    })
})
