import { render, screen } from "@testing-library/react-native"
import React from "react"
import { TestWrapper } from "~Test"

import { FungibleTokenWithBalance } from "~Model"
import { AddressUtils } from "~Utils"
import { useSendContext } from "../../Provider"

import { TokenReceiverCard } from "./TokenReceiverCard"

jest.mock("../Hooks", () => ({
    useCurrentExchangeRate: jest.fn().mockReturnValue("1"),
}))

jest.mock("../../Provider", () => ({
    useSendContext: jest.fn(),
}))

const createToken = (overrides: Partial<FungibleTokenWithBalance> = {}): FungibleTokenWithBalance =>
    ({
        address: "VET",
        balance: {
            accountAddress: "0xaccount",
            balance: "0x470de4df820000",
            genesisId: "0xgenesis",
            position: undefined,
            timeUpdated: "2023-05-24T13:14:07.205Z",
            tokenAddress: "VET",
            isHidden: false,
        },
        custom: false,
        decimals: 18,
        genesisId: "0xgenesis",
        icon: "icon",
        name: "Vechain",
        symbol: "VET",
        ...overrides,
    } as FungibleTokenWithBalance)

describe("TokenReceiverCard", () => {
    it("renders token amount, fiat value and receiver address", async () => {
        jest.mocked(useSendContext).mockReturnValue({
            flowState: {
                address: "0xreceiver",
                amount: "1.234",
                token: createToken(),
                amountInFiat: false,
                fiatAmount: undefined,
                initialExchangeRate: undefined,
            },
        } as any)
        const address = "0xreceiver"
        const formattedAddress = AddressUtils.humanAddress(address)

        render(<TokenReceiverCard />, {
            wrapper: TestWrapper,
        })

        const addressElement = await screen.findByText(formattedAddress, {}, { timeout: 5000 })
        expect(addressElement).toBeTruthy()
    })
})
