import React from "react"
import { TestHelpers, TestWrapper } from "~Test"
import { fireEvent, screen } from "@testing-library/react-native"
import { useVns } from "~Hooks/useVns"
import { Routes } from "~Navigation"
import { ClaimUsername } from "./ClaimUsername"

const { smartWalletDevice } = TestHelpers.data

jest.mock("~Hooks/useVns", () => ({
    ...jest.requireActual("~Hooks/useVns"),
    useVns: jest.fn(),
}))

type Props = React.ComponentProps<typeof ClaimUsername>

const navigate = jest.fn()
const registerSubdomain = jest.fn()

const smartAccountAddress = "0x5555555555555555555555555555555555555555"
const smartWalletState = {
    accounts: {
        accounts: [
            {
                address: smartAccountAddress,
                alias: "Smart Account",
                index: 0,
                rootAddress: smartWalletDevice.rootAddress,
                visible: true,
            },
        ],
        selectedAccount: smartAccountAddress,
    },
    devices: [smartWalletDevice],
}

const renderScreen = (preloadedState = {}) =>
    TestHelpers.render.renderComponentWithProps(
        <ClaimUsername
            {...({
                navigation: { navigate, replace: jest.fn(), goBack: jest.fn() },
                route: { key: "key", name: Routes.CLAIM_USERNAME },
            } as unknown as Props)}
        />,
        { wrapper: TestWrapper, initialProps: { preloadedState } },
    )

const claim = async (subdomain: string) => {
    fireEvent.changeText(screen.getByPlaceholderText("Write your username"), subdomain)
    await screen.findByText("Available to claim", {}, { timeout: 2000 })
    fireEvent.press(screen.getByText("Confirm"))
}

describe("ClaimUsername", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(useVns as jest.Mock).mockReturnValue({
            isSubdomainAvailable: jest.fn().mockResolvedValue(true),
            registerSubdomain,
        })
    })

    it("sends smart wallets to the paid confirmation screen", async () => {
        renderScreen(smartWalletState)

        expect(screen.getByText(/A small network fee applies when claiming\./)).toBeVisible()

        await claim("alice")

        expect(navigate).toHaveBeenCalledWith(Routes.CLAIM_USERNAME_CONFIRM, { subdomain: "alice" })
        expect(registerSubdomain).not.toHaveBeenCalled()
    })

    it("keeps the free sponsored claim for local wallets", async () => {
        renderScreen()

        expect(screen.getByText(/The claiming is free of charge\./)).toBeVisible()

        await claim("alice")

        expect(navigate).not.toHaveBeenCalled()
    })
})
