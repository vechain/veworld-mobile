import { renderHook } from "@testing-library/react-hooks"
import { useWalletDeletion } from "./useWalletDeletion"
import { TestHelpers, TestWrapper } from "~Test"
import { selectDevices, useAppSelector } from "~Storage/Redux"
import { WalletAccount } from "~Model"
import { CryptoUtils, AddressUtils } from "~Utils"

const { device1, device2, hdnode1 } = TestHelpers.data

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

describe("useWalletDeletion", () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it("should remove the wallet from the device", async () => {
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
            expect(result.current.devices.length).toEqual(1)
            expect(result.current.devices[0].rootAddress).toEqual(device2.rootAddress)
        })
    })

    it("should not remove the wallet if is the only device", async () => {
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

        expect(() => {
            result.current.deleteWallet()
        }).toThrow("Cannot delete the last device!")
    })
})
