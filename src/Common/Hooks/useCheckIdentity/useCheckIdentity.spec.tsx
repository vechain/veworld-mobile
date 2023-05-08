import React from "react"
import { renderHook, act } from "@testing-library/react-hooks"
import { useCheckIdentity } from "./useCheckIdentity"
import { Wallet } from "~Model"
import { useWalletSecurity } from "../useWalletSecurity"
import { TestWrapper } from "~Test"
import { useDisclosure } from "../useDisclosure"
import { CryptoUtils } from "~Common/Utils"
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
    const mnemonic = [
        "nut",
        "glue",
        "card",
        "dry",
        "patrol",
        "glass",
        "rebel",
        "carry",
        "spatial",
        "approve",
        "design",
        "blur",
    ]
    const wallet: Wallet = {
        mnemonic,
        nonce: "0x37a9d367c3d4889cde7d5dd940d0be489bbc9ff0db60c6ac1c37f1b8cec99f878c82496287efd1580be497ddd557a56ce920b8e8270acee0ab5f9c231ee6b63692f78db8e8e9cc0c8bdb2819083c84ae6b9d93bf5aac9f59119722739c15dad2a86d17841793c352585875d07e8a8477f446f66f05de987b4536b07834158fff",
        rootAddress: "0xec954b8e81777354d0a35111d83373b9ec171c64",
    }

    afterEach(() => {
        jest.clearAllMocks()
    })

    it("calls onIdentityConfirmed with decrypted wallet when wallet is decrypted successfully", async () => {
        const onIdentityConfirmed = jest.fn()
        const { result, waitForNextUpdate } = renderHook(
            () => useCheckIdentity({ onIdentityConfirmed }),
            { wrapper: TestWrapper },
        )

        ;(useWalletSecurity as jest.Mock).mockReturnValue({
            isWalletSecurityBiometrics: true,
        })
        await waitForNextUpdate()
        jest.spyOn(CryptoUtils, "decryptWallet").mockResolvedValue({
            encryptionKey: "",
            decryptedWallet: wallet,
        })
        await act(async () => {
            await result.current.checkIdentityBeforeOpening()
        })
        expect(onIdentityConfirmed).toHaveBeenCalledWith(wallet)
    })

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

    it("calls decryptWallet with password when password prompt is successful", async () => {
        const password = "password123"
        const { result, waitForNextUpdate } = renderHook(
            () => useCheckIdentity({ onIdentityConfirmed: jest.fn() }),
            { wrapper: TestWrapper },
        )
        await waitForNextUpdate()
        ;(useWalletSecurity as jest.Mock).mockReturnValue({
            isWalletSecurityBiometrics: true,
        })
        jest.spyOn(CryptoUtils, "decryptWallet").mockResolvedValue({
            encryptionKey: "",
            decryptedWallet: wallet,
        })
        await act(async () => {
            await result.current.onPasswordSuccess(password)
        })

        expect(result.current.closePasswordPrompt).toHaveBeenCalledTimes(1)
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
