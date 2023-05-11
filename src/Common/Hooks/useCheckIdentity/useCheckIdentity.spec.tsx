import React from "react"
import { renderHook, act } from "@testing-library/react-hooks"
import { useCheckIdentity } from "./useCheckIdentity"
import { useWalletSecurity } from "../useWalletSecurity"
import { TestWrapper } from "~Test"
import { useDisclosure } from "../useDisclosure"
import { BiometricsUtils } from "~Common/Utils"
import { render } from "@testing-library/react-native"

jest.mock("../useWalletSecurity", () => ({
    useWalletSecurity: jest.fn(),
}))

jest.mock("../useDisclosure", () => ({
    useDisclosure: jest.fn(),
}))
;(useDisclosure as jest.Mock).mockReturnValue({
    isOpen: jest.fn(),
    onOpen: jest.fn(),
    onClose: jest.fn(),
})
describe("useCheckIdentity", () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    describe("Biometrics enabled", () => {
        it("does not call onIdentityConfirmed when biometric is wrong", async () => {
            const onIdentityConfirmed = jest.fn()
            const { result, waitForNextUpdate } = renderHook(
                () => useCheckIdentity({ onIdentityConfirmed }),
                { wrapper: TestWrapper },
            )

            ;(useWalletSecurity as jest.Mock).mockReturnValue({
                isWalletSecurityBiometrics: true,
            })
            await waitForNextUpdate()

            jest.spyOn(
                BiometricsUtils,
                "authenticateWithBiometrics",
            ).mockResolvedValue({
                success: false,
                error: "error",
            })

            await act(async () => {
                await result.current.checkIdentityBeforeOpening()
            })

            expect(onIdentityConfirmed).not.toHaveBeenCalled()
        })

        it("calls onIdentityConfirmed without password when biometric is correct", async () => {
            const onIdentityConfirmed = jest.fn()
            const { result, waitForNextUpdate } = renderHook(
                () => useCheckIdentity({ onIdentityConfirmed }),
                { wrapper: TestWrapper },
            )

            ;(useWalletSecurity as jest.Mock).mockReturnValue({
                isWalletSecurityBiometrics: true,
            })
            await waitForNextUpdate()

            jest.spyOn(
                BiometricsUtils,
                "authenticateWithBiometrics",
            ).mockResolvedValue({
                success: true,
            })

            await act(async () => {
                await result.current.checkIdentityBeforeOpening()
            })
            expect(onIdentityConfirmed).toHaveBeenCalledWith()
        })
    })

    describe("Biometrics disabled", () => {
        it("opens password prompt when biometrics is not enabled", async () => {
            const { result, waitForNextUpdate } = renderHook(
                () => useCheckIdentity({ onIdentityConfirmed: jest.fn() }),
                { wrapper: TestWrapper },
            )

            ;(useWalletSecurity as jest.Mock).mockReturnValue({
                isWalletSecurityBiometrics: false,
            })
            await waitForNextUpdate()
            await act(async () => {
                await result.current.checkIdentityBeforeOpening()
            })

            expect(result.current.openPasswordPrompt).toHaveBeenCalledTimes(1)
        })

        it("calls onIdentityConfirmed with password when password prompt is successful", async () => {
            const password = "password123"
            const mockedOnIdentityConfirmed = jest.fn()
            const { result, waitForNextUpdate } = renderHook(
                () =>
                    useCheckIdentity({
                        onIdentityConfirmed: mockedOnIdentityConfirmed,
                    }),
                { wrapper: TestWrapper },
            )
            await waitForNextUpdate()
            ;(useWalletSecurity as jest.Mock).mockReturnValue({
                isWalletSecurityBiometrics: true,
            })
            await act(async () => {
                await result.current.onPasswordSuccess(password)
            })

            expect(result.current.closePasswordPrompt).toHaveBeenCalledTimes(1)
            expect(mockedOnIdentityConfirmed).toHaveBeenCalledWith(password)
        })

        it("should render correctly ConfirmIdentityBottomSheet", async () => {
            const { result, waitForNextUpdate } = renderHook(
                () => useCheckIdentity({ onIdentityConfirmed: jest.fn() }),
                { wrapper: TestWrapper },
            )
            await waitForNextUpdate()
            const { ConfirmIdentityBottomSheet } = result.current
            render(<ConfirmIdentityBottomSheet />, { wrapper: TestWrapper })
        })
    })
})
