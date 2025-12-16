import { render, screen } from "@testing-library/react-native"
import React from "react"
import { useVns } from "~Hooks/useVns"
import { AccountWithDevice } from "~Model"
import { TestHelpers, TestWrapper } from "~Test"
import { AddressUtils } from "~Utils"
import { AccountSelector } from "./AccountSelector"

const { device1 } = TestHelpers.data

jest.mock("~Hooks/useVns")

const mockAccountWithDevice1: AccountWithDevice = {
    alias: "Account 1",
    rootAddress: device1.rootAddress,
    address: device1.rootAddress,
    index: 0,
    visible: true,
    device: device1,
}

describe("AccountSelector", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it("should work with short variant", () => {
        ;(useVns as jest.Mock).mockReturnValue({ name: "", address: "" })
        render(<AccountSelector variant="short" account={mockAccountWithDevice1} changeable={false} />, {
            wrapper: TestWrapper,
        })

        expect(screen.queryByTestId("ACCOUNT_SELECTOR_TEXT")).toBeNull()
    })
    it("should show the humanized address if no VNS is available", () => {
        ;(useVns as jest.Mock).mockReturnValue({ name: "", address: "" })
        render(<AccountSelector variant="long" account={mockAccountWithDevice1} changeable={false} />, {
            wrapper: TestWrapper,
        })

        expect(screen.queryByTestId("ACCOUNT_SELECTOR_TEXT")).toHaveTextContent(
            AddressUtils.humanAddress(mockAccountWithDevice1.address),
        )
    })
    it("should show VNS if is available", () => {
        ;(useVns as jest.Mock).mockReturnValue({ name: "VNS TEST", address: "" })
        render(<AccountSelector variant="long" account={mockAccountWithDevice1} changeable={false} />, {
            wrapper: TestWrapper,
        })

        expect(screen.queryByTestId("ACCOUNT_SELECTOR_TEXT")).toHaveTextContent("VNS TEST")
    })
})
