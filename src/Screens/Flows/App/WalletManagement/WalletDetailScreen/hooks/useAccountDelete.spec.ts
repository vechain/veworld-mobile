import { act, renderHook, cleanup } from "@testing-library/react-hooks"
import { useAccountDelete } from "./useAccountDelete"
import { TestWrapper, TestHelpers } from "~Test"
import { CryptoUtils, AddressUtils } from "~Utils"
import { AccountWithDevice } from "~Model"
import { selectAccounts, useAppSelector } from "~Storage/Redux"

const { device1, device2, hdnode1, hdnode2 } = TestHelpers.data

const mockAccountWithDevice1: AccountWithDevice = {
    alias: "Account 1",
    rootAddress: device1.rootAddress,
    address: AddressUtils.getAddressFromXPub(CryptoUtils.xPubFromHdNode(hdnode1), 0),
    index: 0,
    visible: true,
    device: device1,
}

const mockAccountWithDevice2: AccountWithDevice = {
    alias: "Account 1",
    rootAddress: device2.rootAddress,
    address: AddressUtils.getAddressFromXPub(CryptoUtils.xPubFromHdNode(hdnode2), 1),
    index: 1,
    visible: true,
    device: device2,
}

const mockAccountWithDevice3: AccountWithDevice = {
    alias: "Account 2",
    rootAddress: device1.rootAddress,
    address: AddressUtils.getAddressFromXPub(CryptoUtils.xPubFromHdNode(hdnode1), 1),
    index: 1,
    visible: true,
    device: device1,
}

describe("useAccountDelete", () => {
    beforeEach(() => {
        jest.clearAllMocks()

        // Cleanup the hook renderer
        cleanup()
    })

    it("should delete the account", async () => {
        const { result, waitFor } = renderHook(
            () => {
                return {
                    hook: useAccountDelete(),
                    allAccounts: useAppSelector(selectAccounts),
                }
            },
            {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState: {
                        accounts: {
                            accounts: [mockAccountWithDevice1, mockAccountWithDevice2, mockAccountWithDevice3],
                            selectedAccount: mockAccountWithDevice1.address,
                        },
                        devices: [device1, device2],
                    },
                },
            },
        )

        await act(async () => {
            result.current.hook.setAccountToRemove(mockAccountWithDevice3)
        })

        result.current.hook.deleteAccount()

        await waitFor(() => {
            expect(result.current.allAccounts.length).toEqual(2)
            expect(result.current.allAccounts[0].address).toEqual(mockAccountWithDevice1.address)
        })
    })

    it("should not delete the selected account and throw an error", async () => {
        const { result } = renderHook(
            () => {
                return {
                    hook: useAccountDelete(),
                    allAccounts: useAppSelector(selectAccounts),
                }
            },
            {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState: {
                        accounts: {
                            accounts: [mockAccountWithDevice1, mockAccountWithDevice2, mockAccountWithDevice3],
                            selectedAccount: mockAccountWithDevice1.address,
                        },
                        devices: [device1, device2],
                    },
                },
            },
        )

        await act(async () => {
            result.current.hook.setAccountToRemove(mockAccountWithDevice1)
        })

        expect(() => {
            result.current.hook.deleteAccount()
        }).toThrow("Cannot delete the selected account")
    })

    it("should not delete anything if not account provided", async () => {
        const { result } = renderHook(
            () => {
                return {
                    hook: useAccountDelete(),
                    allAccounts: useAppSelector(selectAccounts),
                }
            },
            {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState: {
                        accounts: {
                            accounts: [mockAccountWithDevice1, mockAccountWithDevice2, mockAccountWithDevice3],
                            selectedAccount: mockAccountWithDevice1.address,
                        },
                        devices: [device1, device2],
                    },
                },
            },
        )

        result.current.hook.deleteAccount()

        expect(result.current.allAccounts.length).toEqual(3)
        expect(result.current.allAccounts[0].address).toEqual(mockAccountWithDevice1.address)
    })

    it("should not delete the only account", async () => {
        const { result } = renderHook(
            () => {
                return {
                    hook: useAccountDelete(),
                    allAccounts: useAppSelector(selectAccounts),
                }
            },
            {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState: {
                        accounts: {
                            accounts: [mockAccountWithDevice1, mockAccountWithDevice2, mockAccountWithDevice3],
                            selectedAccount: mockAccountWithDevice1.address,
                        },
                        devices: [device1, device2],
                    },
                },
            },
        )

        await act(async () => {
            result.current.hook.setAccountToRemove(mockAccountWithDevice2)
        })

        result.current.hook.deleteAccount()

        expect(result.current.allAccounts.length).toEqual(3)
        expect(result.current.allAccounts[0].address).toEqual(mockAccountWithDevice1.address)
        expect(result.current.allAccounts[1].address).toEqual(mockAccountWithDevice2.address)
    })
})
