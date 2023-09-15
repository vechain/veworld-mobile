import { renderHook } from "@testing-library/react-hooks"
import { useWalletSecurity } from "./useWalletSecurity"
import { useBiometrics } from "../useBiometrics"
import { useApplicationSecurity } from "~Components/Providers/EncryptedStorageProvider/ApplicationSecurityProvider"
import { SecurityLevelType } from "~Model"

jest.mock("../useBiometrics")
jest.mock("~Storage/Redux")

describe("useWalletSecurity", () => {
    let mockBiometrics: any

    it("should return the correct wallet security for biometrics", () => {
        mockBiometrics = {
            accessControl: true,
        }
        ;(useBiometrics as jest.Mock).mockReturnValue(mockBiometrics)
        const { result } = renderHook(() => useWalletSecurity())
        expect(result.current.isWalletSecurityBiometrics).toBeTruthy()
        expect(result.current.isWalletSecurityPassword).toBeFalsy()
        expect(result.current.isWalletSecurityNone).toBeFalsy()
    })

    it("should return the correct wallet security for password", () => {
        ;(useApplicationSecurity as jest.Mock).mockReturnValue({
            securityType: SecurityLevelType.SECRET,
        })

        const { result } = renderHook(() => useWalletSecurity())
        expect(result.current.isWalletSecurityBiometrics).toBeFalsy()
        expect(result.current.isWalletSecurityPassword).toBeTruthy()
        expect(result.current.isWalletSecurityNone).toBeFalsy()
    })

    it("should return the correct wallet security for none", () => {
        ;(useApplicationSecurity as jest.Mock).mockReturnValue({
            securityType: SecurityLevelType.NONE,
        })

        const { result } = renderHook(() => useWalletSecurity())
        expect(result.current.isWalletSecurityBiometrics).toBeFalsy()
        expect(result.current.isWalletSecurityPassword).toBeFalsy()
        expect(result.current.isWalletSecurityNone).toBeTruthy()
    })
})
