import React from "react"
import { render, screen, waitFor } from "@testing-library/react-native"
import { setPlatform, TestWrapper } from "~Test"
import { useCloudBackup } from "~Hooks/useCloudBackup"
import { SelfCustodyOptionsBottomSheet } from "./SelfCustodyOptionsBottomSheet"
import { CloudKitWallet } from "~Model"
import { DerivationPath } from "~Constants"

jest.mock("~Hooks/useCloudBackup", () => ({
    useCloudBackup: jest.fn(() => ({
        isCloudAvailable: true,
        getAllWalletFromCloud: jest.fn(),
    })),
}))

const mockCloudKitWallet: CloudKitWallet = {
    data: "ekwejrfvdskfjsdkvjckxjlkdsfls",
    rootAddress: "0x1234",
    walletType: "cloud",
    salt: "123",
    firstAccountAddress: "0x1234",
    creationDate: 123,
    derivationPath: DerivationPath.VET,
}

describe("SelfCustodyOptionsBottomSheet", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should render", () => {
        ;(useCloudBackup as jest.Mock).mockReturnValue({
            isCloudAvailable: true,
            getAllWalletFromCloud: jest.fn().mockResolvedValue([]),
        })

        const ref = {
            current: { present: jest.fn(), close: jest.fn() },
        }

        render(<SelfCustodyOptionsBottomSheet bsRef={ref as any} />, {
            wrapper: TestWrapper,
        })

        const cloudOption = screen.getByTestId("SELF_CUSTODY_OPTIONS_CLOUD")

        expect(screen.getByTestId("SELF_CUSTODY_OPTIONS_CREATE")).toBeOnTheScreen()
        expect(cloudOption).toBeOnTheScreen()
        expect(cloudOption).toBeDisabled()
        expect(screen.getByTestId("SELF_CUSTODY_OPTIONS_IMPORT")).toBeOnTheScreen()
        expect(screen.getByTestId("SELF_CUSTODY_OPTIONS_HARDWARE")).toBeOnTheScreen()
    })

    it("should have cloud option enabled if cloud backup is available", async () => {
        ;(useCloudBackup as jest.Mock).mockReturnValue({
            isCloudAvailable: true,
            getAllWalletFromCloud: jest.fn().mockResolvedValue([mockCloudKitWallet]),
        })

        const ref = {
            current: { present: jest.fn(), close: jest.fn() },
        }

        render(<SelfCustodyOptionsBottomSheet bsRef={ref as any} />, {
            wrapper: TestWrapper,
        })

        //Wait for the cloud option to be enabled because initialization is async
        await waitFor(() => {
            const cloudOption = screen.getByTestId("SELF_CUSTODY_OPTIONS_CLOUD")
            expect(cloudOption).toBeEnabled()
        })
    })

    it("should not have cloud option if platform is not iOS", async () => {
        setPlatform("android")
        ;(useCloudBackup as jest.Mock).mockReturnValue({
            isCloudAvailable: false,
            getAllWalletFromCloud: jest.fn(),
        })

        const ref = {
            current: { present: jest.fn(), close: jest.fn() },
        }

        render(<SelfCustodyOptionsBottomSheet bsRef={ref as any} />, {
            wrapper: TestWrapper,
        })

        expect(screen.queryByTestId("SELF_CUSTODY_OPTIONS_CLOUD")).not.toBeOnTheScreen()
    })
})
