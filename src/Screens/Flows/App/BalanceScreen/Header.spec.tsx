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
    it("should show the humanized address if the alias is the standard alias", () => {
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

        expect(screen.getByTestId("BALANCE_HEADER_DISPLAY_USERNAME")).toHaveTextContent("0xCF1…957")
        expect(screen.queryByTestId("BALANCE_HEADER_VIEW_ONLY")).toBeNull()
    })
    it("should show the account alias if it is not standard", () => {
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
            {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState: {
                        accounts: {
                            accounts: [
                                {
                                    address: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                                    alias: "Test Account",
                                    index: 0,
                                    rootAddress: "0x90d70a5d0e9ce28336f7d45990b9c63c0a4142g0",
                                    visible: true,
                                },
                            ],
                            selectedAccount: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                        },
                    },
                },
            },
        )

        expect(screen.getByTestId("BALANCE_HEADER_DISPLAY_USERNAME")).toHaveTextContent("Test Account")
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
})
