import React from "react"
import { act, fireEvent, render, screen } from "@testing-library/react-native"
import { TestWrapper } from "~Test"
import { ImportFromCloudScreen } from "./ImportFromCloudScreen"
import { DerivationPath } from "~Constants"
import { CloudKitWallet } from "~Model"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"

const mockCloudKitWallet: CloudKitWallet = {
    data: "ekwejrfvdskfjsdkvjckxjlkdsfls",
    rootAddress: "0x1234",
    walletType: "cloud",
    salt: "123",
    firstAccountAddress: "0x1234",
    creationDate: 123,
    derivationPath: DerivationPath.VET,
}

jest.mock("@react-navigation/native", () => ({
    ...jest.requireActual("@react-navigation/native"),
    useNavigation: jest.fn(),
    useRoute: jest.fn(() => ({
        params: {
            wallets: [mockCloudKitWallet],
        },
    })),
}))

jest.mock("~Hooks/useCloudBackup", () => ({
    useCloudBackup: jest.fn(() => ({
        getAllWalletFromCloud: jest.fn(),
        isCloudAvailable: true,
    })),
}))

jest.mock("~Hooks/useVns", () => ({
    useVns: jest.fn(() => ({
        ...jest.requireActual("~Hooks/useVns"),
        getVnsName: jest.fn().mockResolvedValue([{ name: "test.vet", address: "0x1234" }]),
    })),
}))

describe("ImportFromCloudScreen", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should render correctly", () => {
        render(<ImportFromCloudScreen />, {
            wrapper: TestWrapper,
        })

        expect(screen.getByTestId("IMPORT_FROM_CLOUD_LIST")).toBeOnTheScreen()
        expect(screen.getByText("0x1234")).toBeOnTheScreen()
    })

    it("should call onPress when pressed", () => {
        const navigate = jest.fn()
        ;(useNavigation as jest.Mock).mockReturnValue({
            navigate,
            getState: jest.fn(),
        })
        render(<ImportFromCloudScreen />, {
            wrapper: TestWrapper,
        })

        expect(screen.getByTestId("IMPORT_FROM_CLOUD_LIST")).toBeOnTheScreen()
        expect(screen.getByText("0x1234")).toBeOnTheScreen()

        act(() => {
            fireEvent.press(screen.getByTestId("IMPORT_FROM_CLOUD_WALLET_CARD_0x1234"))
        })

        expect(screen.getByTestId("IMPORT_FROM_CLOUD_CONTINUE_BUTTON")).not.toBeDisabled()

        act(() => {
            fireEvent.press(screen.getByTestId("IMPORT_FROM_CLOUD_CONTINUE_BUTTON"))
        })

        expect(navigate).toHaveBeenCalledWith(Routes.IMPORT_MNEMONIC_BACKUP_PASSWORD, { wallet: mockCloudKitWallet })
    })
})
