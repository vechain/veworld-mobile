import React from "react"
import { TestWrapper } from "~Test"
import { act, fireEvent, render, screen } from "@testing-library/react-native"
import { Transaction } from "@vechain/sdk-core"
import { showErrorToast, showInfoToast } from "~Components/Base/BaseToast/BaseToast"
import { getSubdomainClaimClauses } from "~Hooks/useVns"
import { useTransactionScreen } from "~Hooks/useTransactionScreen"
import { waitTransaction } from "~Hooks/useWaitTransaction/transactionWaiter"
import { NETWORK_TYPE } from "~Model"
import { Routes } from "~Navigation"
import { ClaimUsernameConfirm } from "./ClaimUsernameConfirm"

jest.mock("~Components/Base/BaseToast/BaseToast", () => ({
    ...jest.requireActual("~Components/Base/BaseToast/BaseToast"),
    showErrorToast: jest.fn(),
    showInfoToast: jest.fn(),
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

const PENDING_MESSAGE =
    "Your username is taking longer than usual to confirm. It will appear on your account once confirmed."

const dispatch = jest.fn()
const onSubmit = jest.fn()
const pressConfirm = () => fireEvent.press(screen.getByTestId("ClaimUsernameConfirm_Btn"))

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

const claimSent = () =>
    act(async () => {
        await getTransactionScreenProps().onTransactionSuccess({} as Transaction, "0x01")
    })

/** The stack after the screen's navigation reset, starting from Settings -> Claim -> Confirm */
const getRoutesAfterReset = () =>
    dispatch.mock.calls[0][0]({
        index: 2,
        routes: [{ name: Routes.SETTINGS }, { name: Routes.CLAIM_USERNAME }, { name: Routes.CLAIM_USERNAME_CONFIRM }],
    }).payload

describe("ClaimUsernameConfirm", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(useTransactionScreen as jest.Mock).mockReturnValue({
            onSubmit,
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

        await claimSent()

        expect(waitTransaction).toHaveBeenCalledWith("0x01", expect.anything())
        expect(getRoutesAfterReset()).toEqual(
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

        await claimSent()

        expect(dispatch).not.toHaveBeenCalled()
        expect(showErrorToast).toHaveBeenCalledWith({ text1: "Failed to create username" })
        pressConfirm()
        expect(onSubmit).toHaveBeenCalledTimes(1)
    })

    it("keeps Confirm locked while the claim is confirming", async () => {
        ;(waitTransaction as jest.Mock).mockReturnValue(new Promise(() => {}))
        renderScreen()

        act(() => {
            getTransactionScreenProps().onTransactionSuccess({} as Transaction, "0x01")
        })
        pressConfirm()

        expect(onSubmit).not.toHaveBeenCalled()
        expect(dispatch).not.toHaveBeenCalled()
    })

    it.each([
        ["times out", () => (waitTransaction as jest.Mock).mockResolvedValue(null)],
        ["cannot be checked", () => (waitTransaction as jest.Mock).mockRejectedValue(new Error("node unreachable"))],
    ])("leaves the claim flow without reporting a failure when confirmation %s", async (_, mockWait) => {
        mockWait()
        renderScreen()

        await claimSent()

        expect(showErrorToast).not.toHaveBeenCalled()
        expect(showInfoToast).toHaveBeenCalledWith({ text1: PENDING_MESSAGE })
        expect(getRoutesAfterReset()).toEqual(
            expect.objectContaining({ index: 0, routes: [{ name: Routes.SETTINGS }] }),
        )
    })
})
