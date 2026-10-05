import React from "react"
import { TestWrapper } from "~Test"
import { render, screen } from "@testing-library/react-native"
import { Transaction } from "@vechain/sdk-core"
import { showErrorToast } from "~Components/Base/BaseToast/BaseToast"
import { getSubdomainClaimClauses } from "~Hooks/useVns"
import { useTransactionScreen } from "~Hooks/useTransactionScreen"
import { waitTransaction } from "~Hooks/useWaitTransaction/transactionWaiter"
import { NETWORK_TYPE } from "~Model"
import { Routes } from "~Navigation"
import { ClaimUsernameConfirm } from "./ClaimUsernameConfirm"

jest.mock("~Components/Base/BaseToast/BaseToast", () => ({
    ...jest.requireActual("~Components/Base/BaseToast/BaseToast"),
    showErrorToast: jest.fn(),
}))

jest.mock("~Components/Reusable/GasFeeSpeed/GasFeeSpeed", () => ({
    GasFeeSpeed: ({ children }: { children: React.ReactNode }) => children,
}))

jest.mock("~Hooks/useWaitTransaction/transactionWaiter", () => ({
    waitTransaction: jest.fn(),
}))

jest.mock("~Hooks/useTransactionScreen", () => ({
    useTransactionScreen: jest.fn(),
}))

type Props = React.ComponentProps<typeof ClaimUsernameConfirm>

const dispatch = jest.fn()

const renderScreen = () =>
    render(
        <ClaimUsernameConfirm
            {...({
                navigation: { dispatch, navigate: jest.fn(), goBack: jest.fn() },
                route: { key: "key", name: Routes.CLAIM_USERNAME_CONFIRM, params: { subdomain: "alice" } },
            } as unknown as Props)}
        />,
        { wrapper: TestWrapper },
    )

const getTransactionScreenProps = (): Parameters<typeof useTransactionScreen>[0] =>
    (useTransactionScreen as jest.Mock).mock.calls.at(-1)[0]

describe("ClaimUsernameConfirm", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(useTransactionScreen as jest.Mock).mockReturnValue({
            onSubmit: jest.fn(),
            isPasswordPromptOpen: false,
            isDisabledButtonState: false,
        })
    })

    it("asks the account to pay for the claim and set-name clauses", async () => {
        renderScreen()

        expect(await screen.findByText("alice.veworld.vet")).toBeVisible()
        expect(getTransactionScreenProps().clauses).toEqual(getSubdomainClaimClauses("alice", NETWORK_TYPE.MAIN))
    })

    it("replaces the claim screens with the success screen once the claim is mined", async () => {
        ;(waitTransaction as jest.Mock).mockResolvedValue({ reverted: false })
        renderScreen()

        await getTransactionScreenProps().onTransactionSuccess({} as Transaction, "0x01")

        expect(waitTransaction).toHaveBeenCalledWith("0x01", expect.anything())
        const getNewState = dispatch.mock.calls[0][0]
        const newState = getNewState({
            index: 2,
            routes: [
                { name: Routes.SETTINGS },
                { name: Routes.CLAIM_USERNAME },
                { name: Routes.CLAIM_USERNAME_CONFIRM },
            ],
        })
        expect(newState.payload).toEqual(
            expect.objectContaining({
                index: 1,
                routes: [
                    { name: Routes.SETTINGS },
                    { name: Routes.USERNAME_CLAIMED, params: { username: "alice.veworld.vet" } },
                ],
            }),
        )
        expect(showErrorToast).not.toHaveBeenCalled()
    })

    it("stays on the screen and shows an error when the claim reverts", async () => {
        ;(waitTransaction as jest.Mock).mockResolvedValue({ reverted: true })
        renderScreen()

        await getTransactionScreenProps().onTransactionSuccess({} as Transaction, "0x01")

        expect(dispatch).not.toHaveBeenCalled()
        expect(showErrorToast).toHaveBeenCalledWith({ text1: "Failed to create username" })
    })
})
