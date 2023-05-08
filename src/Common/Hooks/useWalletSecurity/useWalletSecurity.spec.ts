import { renderHook } from "@testing-library/react-hooks"
import { useWalletSecurity } from "./useWalletSecurity"
import { UserSelectedSecurityLevel } from "~Model"
import { useAppSelector } from "~Storage/Redux"
import { useBiometrics } from "../useBiometrics"

jest.mock("../useBiometrics")
jest.mock("~Storage/Redux")

describe("useWalletSecurity", () => {
    let mockBiometrics: any
    let mockUserSelectedSecurity: any

    it("should return the correct wallet security for biometrics", () => {
        mockBiometrics = {
            accessControl: true,
        }
        mockUserSelectedSecurity = UserSelectedSecurityLevel.BIOMETRIC
        ;(useBiometrics as jest.Mock).mockReturnValue(mockBiometrics)
        ;(useAppSelector as jest.Mock).mockReturnValue(mockUserSelectedSecurity)
        const { result } = renderHook(() => useWalletSecurity())
        expect(result.current.isWalletSecurityBiometrics).toBeTruthy()
        expect(result.current.isWalletSecurityPassword).toBeFalsy()
        expect(result.current.isWalletSecurityNone).toBeFalsy()
    })

    it("should return the correct wallet security for password", () => {
        mockUserSelectedSecurity = UserSelectedSecurityLevel.PASSWORD
        ;(useAppSelector as jest.Mock).mockReturnValue(mockUserSelectedSecurity)
        const { result } = renderHook(() => useWalletSecurity())
        expect(result.current.isWalletSecurityBiometrics).toBeFalsy()
        expect(result.current.isWalletSecurityPassword).toBeTruthy()
        expect(result.current.isWalletSecurityNone).toBeFalsy()
    })

    it("should return the correct wallet security for none", () => {
        mockUserSelectedSecurity = UserSelectedSecurityLevel.NONE
        ;(useAppSelector as jest.Mock).mockReturnValue(mockUserSelectedSecurity)
        const { result } = renderHook(() => useWalletSecurity())
        expect(result.current.isWalletSecurityBiometrics).toBeFalsy()
        expect(result.current.isWalletSecurityPassword).toBeFalsy()
        expect(result.current.isWalletSecurityNone).toBeTruthy()
    })
})
