import { act, renderHook } from "@testing-library/react-hooks"
import { useCheckIdentity } from "./useCheckIdentity"
import { useWalletSecurity } from "../useWalletSecurity"
import { TestWrapper } from "~Test"
import { useDisclosure } from "../useDisclosure"
import { BiometricsUtils } from "~Utils"

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
const allowAutoPassword = true

describe("useCheckIdentity", () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    describe("Biometrics enabled", () => {
        it("calls onIdentityConfirmed without password when biometric is correct", async () => {
            const onIdentityConfirmed = jest.fn()

            ;(useWalletSecurity as jest.Mock).mockReturnValue({
                isWalletSecurityBiometrics: true,
            })

            jest.spyOn(
                BiometricsUtils,
                "authenticateWithBiometrics",
            ).mockResolvedValue({
                success: true,
            })

            const { result } = renderHook(
                () =>
                    useCheckIdentity({
                        onIdentityConfirmed,
                        allowAutoPassword,
                    }),
                { wrapper: TestWrapper },
            )

            await act(async () => {
                await result.current.checkIdentityBeforeOpening()
            })
            expect(onIdentityConfirmed).toHaveBeenCalledWith()
        })
    })

    describe("Biometrics disabled", () => {
        it("opens password prompt when biometrics is not enabled", async () => {
            ;(useWalletSecurity as jest.Mock).mockReturnValue({
                isWalletSecurityBiometrics: false,
            })

            const { result } = renderHook(
                () =>
                    useCheckIdentity({
                        onIdentityConfirmed: jest.fn(),
                        allowAutoPassword,
                    }),
                { wrapper: TestWrapper },
            )

            await act(async () => {
                await result.current.checkIdentityBeforeOpening()
            })

            expect(result.current.openPasswordPrompt).toHaveBeenCalledTimes(1)
        })

        it("calls onIdentityConfirmed with password when password prompt is successful", async () => {
            const password = "password123"
            const mockedOnIdentityConfirmed = jest.fn()

            ;(useWalletSecurity as jest.Mock).mockReturnValue({
                isWalletSecurityBiometrics: true,
            })

            const { result } = renderHook(
                () =>
                    useCheckIdentity({
                        onIdentityConfirmed: mockedOnIdentityConfirmed,
                        allowAutoPassword,
                    }),
                { wrapper: TestWrapper },
            )

            await act(async () => {
                await result.current.onPasswordSuccess(password)
            })

            expect(result.current.closePasswordPrompt).toHaveBeenCalledTimes(1)
            expect(mockedOnIdentityConfirmed).toHaveBeenCalledWith(password)
        })
    })
})
