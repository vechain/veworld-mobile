import { renderHook } from "@testing-library/react-hooks"
import { usePasswordValidation } from "./usePasswordValidation"
import { CryptoUtils } from "~Utils"
import { selectPinValidationString } from "~Storage/Redux/Selectors"
import { useAppSelector } from "~Storage/Redux"

jest.mock("~Utils")
jest.mock("~Common/Constant")
jest.mock("~Common/Logger")
jest.mock("~Storage/Redux/Selectors")
jest.mock("~Storage/Redux")

describe("usePasswordValidation", () => {
    const mockedCryptoUtils = CryptoUtils as jest.Mocked<typeof CryptoUtils>

    const mockedUseAppSelector = useAppSelector as jest.MockedFunction<
        typeof useAppSelector
    >

    afterEach(() => {
        jest.resetAllMocks()
    })

    it("should return a function to validate the password", async () => {
        const decryptedString = "SUCCESS PASSWORD IS CORRECT"
        const userPassword = "password"

        mockedCryptoUtils.decrypt.mockReturnValue(decryptedString)

        const { result } = renderHook(() => usePasswordValidation())

        const { validatePassword } = result.current
        const isValid = await validatePassword(userPassword)
        expect(isValid).toBeTruthy()
        expect(mockedUseAppSelector).toHaveBeenCalledWith(
            selectPinValidationString,
        )
    })

    it("should return false if the decrypted string is not equal to the validation string", async () => {
        const encryptedString = "encrypted_string"
        const decryptedString = "wrong_string"
        const userPassword = "password"

        mockedUseAppSelector.mockReturnValue(encryptedString)
        mockedCryptoUtils.decrypt.mockReturnValue(decryptedString)

        const { result } = renderHook(() => usePasswordValidation())

        const { validatePassword } = result.current
        const isValid = await validatePassword(userPassword)

        expect(isValid).toBeFalsy()
        expect(mockedUseAppSelector).toHaveBeenCalledWith(
            selectPinValidationString,
        )
        expect(mockedCryptoUtils.decrypt).toHaveBeenCalledWith(
            encryptedString,
            userPassword,
        )
    })

    it("should return false if an error occurs during decryption", async () => {
        const encryptedString = "encrypted_string"
        const userPassword = "password"

        mockedUseAppSelector.mockReturnValue(encryptedString)
        mockedCryptoUtils.decrypt.mockImplementation(() => {
            throw new Error("Error")
        })

        const { result } = renderHook(() => usePasswordValidation())

        const { validatePassword } = result.current
        const isValid = await validatePassword(userPassword)

        expect(isValid).toBeFalsy()
        expect(mockedUseAppSelector).toHaveBeenCalledWith(
            selectPinValidationString,
        )
        expect(mockedCryptoUtils.decrypt).toHaveBeenCalledWith(
            encryptedString,
            userPassword,
        )
    })
})
