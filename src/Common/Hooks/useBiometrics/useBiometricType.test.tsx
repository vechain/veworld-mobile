import { renderHook } from "@testing-library/react-hooks"
import { useBiometricType } from "./useBiometricType"
import { TestWrapper } from "~Test"
import { waitFor } from "@testing-library/react-native"

describe("useBiometricType", () => {
    const mockUseBiometrics = jest.fn()

    beforeAll(() => {
        jest.mock("./useBiometrics", () => ({
            useBiometrics: mockUseBiometrics,
        }))
    })

    afterAll(() => {
        jest.unmock("./useBiometrics")
    })

    it("should returns Biometrics", async () => {
        const { result } = renderHook(() => useBiometricType(), {
            wrapper: TestWrapper,
        })
        await waitFor(() => {
            return expect(result.current).toBeTruthy()
        })
        expect(result.current.currentSecurityLevel).toEqual("Biometrics")
    })
})
