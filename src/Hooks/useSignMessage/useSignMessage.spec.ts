import { TestWrapper } from "~Test"
import { useSignMessage } from "./useSignMessage"
import { renderHook } from "@testing-library/react-hooks"
import { blake2b256 } from "thor-devkit"

jest.mock("axios")

jest.mock("~Components/Base/BaseToast/BaseToast", () => ({
    ...jest.requireActual("~Components/Base/BaseToast/BaseToast"),
    showSuccessToast: jest.fn(),
    showErrorToast: jest.fn(),
    showWarningToast: jest.fn(),
}))

describe("useSignMessage", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should render correctly", async () => {
        const messageToSign = blake2b256("message to sign")

        const { result, waitForNextUpdate } = renderHook(
            () =>
                useSignMessage({
                    hash: messageToSign,
                }),
            { wrapper: TestWrapper },
        )
        await waitForNextUpdate({
            timeout: 5000,
        })
        expect(result.current).toEqual({
            signMessage: expect.any(Function),
        })
    })
})
