import { renderHook } from "@testing-library/react-hooks"
import { TestHelpers, TestWrapper } from "~Test"
import { useSmartWallet } from "~Hooks/useSmartWallet"

import { useWalletDeletion } from "./useWalletDeletion"
import { selectDevices, useAppSelector } from "~Storage/Redux"
import { WalletAccount } from "~Model"
import { CryptoUtils, AddressUtils } from "~Utils"

const { device1, device2, hdnode1, smartWalletDevice } = TestHelpers.data

const account1: WalletAccount = {
    alias: "Account 1",
    rootAddress: device1.rootAddress,
    address: AddressUtils.getAddressFromXPub(CryptoUtils.xPubFromHdNode(hdnode1), 0),
    index: 0,
    visible: true,
}
const account2: WalletAccount = {
    alias: "Account 2",
    rootAddress: device2.rootAddress,
    address: AddressUtils.getAddressFromXPub(CryptoUtils.xPubFromHdNode(hdnode1), 1),
    index: 1,
    visible: true,
}

const smartWalletAccount: WalletAccount = {
    alias: "Smart Wallet",
    rootAddress: smartWalletDevice.rootAddress,
    address: "0x0000000000000000000000000000000000000003",
    index: 0,
    visible: true,
}

jest.mock("~Hooks/useSmartWallet", () => ({
    useSmartWallet: jest.fn(),
}))

const mockLogout = jest.fn()

describe("useWalletDeletion", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should remove the wallet from the device", async () => {
        ;(useSmartWallet as jest.Mock).mockReturnValue({
            logout: mockLogout,
        })
        const { result, waitFor } = renderHook(
            () => {
                return {
                    deleteWalletHook: useWalletDeletion(device1),
                    devices: useAppSelector(selectDevices),
                }
            },
            {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState: {
                        accounts: {
                            accounts: [account1, account2],
                            selectedAccount: account1.address,
                        },
                        devices: [device1, device2],
                    },
                },
            },
        )

        result.current.deleteWalletHook.deleteWallet()

        await waitFor(() => {
            expect(mockLogout).not.toHaveBeenCalled()
            expect(result.current.devices.length).toEqual(1)
            expect(result.current.devices[0].rootAddress).toEqual(device2.rootAddress)
        })
    })

    it("should not remove the wallet if is the only device", async () => {
        ;(useSmartWallet as jest.Mock).mockReturnValue({
            logout: mockLogout,
        })
        const { result } = renderHook(() => useWalletDeletion(device2), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    accounts: {
                        accounts: [account2],
                        selectedAccount: account2.address,
                    },
                    devices: [device2],
                },
            },
        })

        await expect(async () => {
            await result.current.deleteWallet()
        }).rejects.toThrow("Cannot delete the last device!")
    })

    it("should delete a smart wallet", async () => {
        ;(useSmartWallet as jest.Mock).mockReturnValue({
            logout: mockLogout,
        })
        const { result, waitFor } = renderHook(
            () => {
                return {
                    deleteWalletHook: useWalletDeletion(smartWalletDevice),
                    devices: useAppSelector(selectDevices),
                }
            },
            {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState: {
                        accounts: {
                            accounts: [smartWalletAccount, account1],
                            selectedAccount: smartWalletAccount.address,
                        },
                        devices: [smartWalletDevice, device1],
                    },
                },
            },
        )

        result.current.deleteWalletHook.deleteWallet()

        await waitFor(() => {
            expect(mockLogout).toHaveBeenCalled()
            expect(result.current.devices.length).toEqual(1)
            expect(result.current.devices[0].rootAddress).toEqual(device1.rootAddress)
        })
    })
})
