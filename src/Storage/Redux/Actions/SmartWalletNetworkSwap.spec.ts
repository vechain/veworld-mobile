import { configureStore } from "@reduxjs/toolkit"
import { DEVICE_TYPE, SmartWalletDevice } from "~Model"
import { AccountSlice, AccountSliceState } from "../Slices/Account"
import { DeviceSlice, initialDeviceState } from "../Slices/Device"
import { swapSmartWalletNetwork, handleSmartWalletNetworkSwap } from "./SmartWalletNetworkSwap"

const MAINNET_ADDRESS = "0xf077b491b355e64048ce21e3a6fc4751eeea77fa"
const TESTNET_ADDRESS = "0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2"

const smartWalletDevice: SmartWalletDevice = {
    alias: "Smart Wallet",
    rootAddress: MAINNET_ADDRESS,
    type: DEVICE_TYPE.SMART_WALLET,
    index: 0,
    position: 0,
}

const smartWalletAccount = {
    alias: "Smart Account",
    address: MAINNET_ADDRESS,
    rootAddress: MAINNET_ADDRESS,
    index: -1,
    visible: true,
}

const localDevice = {
    alias: "Local Wallet",
    rootAddress: "0x1111111111111111111111111111111111111111",
    type: DEVICE_TYPE.LOCAL_MNEMONIC as const,
    index: 1,
    position: 1,
    wallet: "{}",
    xPub: { publicKey: "pub", chainCode: "chain" },
}

const localAccount = {
    alias: "Local Account",
    address: "0x1111111111111111111111111111111111111111",
    rootAddress: "0x1111111111111111111111111111111111111111",
    index: 0,
    visible: true,
}

const createStore = (
    devices: typeof initialDeviceState = [smartWalletDevice],
    accounts: AccountSliceState = { accounts: [smartWalletAccount], selectedAccount: MAINNET_ADDRESS },
) =>
    configureStore({
        reducer: {
            devices: DeviceSlice.reducer,
            accounts: AccountSlice.reducer,
        },
        preloadedState: {
            devices,
            accounts,
        },
    })

describe("swapSmartWalletNetwork action", () => {
    describe("DeviceSlice extraReducers", () => {
        it("should swap rootAddress and store old address as rootTestnetAddress", () => {
            const store = createStore()

            store.dispatch(
                swapSmartWalletNetwork({
                    oldRootAddress: MAINNET_ADDRESS,
                    newRootAddress: TESTNET_ADDRESS,
                }),
            )

            const device = store.getState().devices[0] as SmartWalletDevice
            expect(device.rootAddress).toBe(TESTNET_ADDRESS)
            expect(device.rootTestnetAddress).toBe(MAINNET_ADDRESS)
        })

        it("should be a no-op if device not found", () => {
            const store = createStore([])

            store.dispatch(
                swapSmartWalletNetwork({
                    oldRootAddress: MAINNET_ADDRESS,
                    newRootAddress: TESTNET_ADDRESS,
                }),
            )

            expect(store.getState().devices).toHaveLength(0)
        })

        it("should not affect non-smart-wallet devices", () => {
            const store = createStore([localDevice, smartWalletDevice])

            store.dispatch(
                swapSmartWalletNetwork({
                    oldRootAddress: MAINNET_ADDRESS,
                    newRootAddress: TESTNET_ADDRESS,
                }),
            )

            expect(store.getState().devices[0].rootAddress).toBe(localDevice.rootAddress)
            expect(store.getState().devices[1].rootAddress).toBe(TESTNET_ADDRESS)
        })

        it("should handle round-trip swap (mainnet -> testnet -> mainnet)", () => {
            const store = createStore()

            // First swap: mainnet -> testnet
            store.dispatch(
                swapSmartWalletNetwork({
                    oldRootAddress: MAINNET_ADDRESS,
                    newRootAddress: TESTNET_ADDRESS,
                }),
            )

            let device = store.getState().devices[0] as SmartWalletDevice
            expect(device.rootAddress).toBe(TESTNET_ADDRESS)
            expect(device.rootTestnetAddress).toBe(MAINNET_ADDRESS)

            // Second swap: testnet -> mainnet
            store.dispatch(
                swapSmartWalletNetwork({
                    oldRootAddress: TESTNET_ADDRESS,
                    newRootAddress: MAINNET_ADDRESS,
                }),
            )

            device = store.getState().devices[0] as SmartWalletDevice
            expect(device.rootAddress).toBe(MAINNET_ADDRESS)
            expect(device.rootTestnetAddress).toBe(TESTNET_ADDRESS)
        })
    })

    describe("AccountSlice extraReducers", () => {
        it("should update account rootAddress and address for smart wallet accounts", () => {
            const store = createStore()

            store.dispatch(
                swapSmartWalletNetwork({
                    oldRootAddress: MAINNET_ADDRESS,
                    newRootAddress: TESTNET_ADDRESS,
                }),
            )

            const account = store.getState().accounts.accounts[0]
            expect(account.rootAddress).toBe(TESTNET_ADDRESS)
            expect(account.address).toBe(TESTNET_ADDRESS)
        })

        it("should update selectedAccount when it matches the old address", () => {
            const store = createStore()

            store.dispatch(
                swapSmartWalletNetwork({
                    oldRootAddress: MAINNET_ADDRESS,
                    newRootAddress: TESTNET_ADDRESS,
                }),
            )

            expect(store.getState().accounts.selectedAccount).toBe(TESTNET_ADDRESS)
        })

        it("should not update selectedAccount when it does not match", () => {
            const store = createStore([smartWalletDevice, localDevice], {
                accounts: [smartWalletAccount, localAccount],
                selectedAccount: localAccount.address,
            })

            store.dispatch(
                swapSmartWalletNetwork({
                    oldRootAddress: MAINNET_ADDRESS,
                    newRootAddress: TESTNET_ADDRESS,
                }),
            )

            expect(store.getState().accounts.selectedAccount).toBe(localAccount.address)
        })

        it("should not affect accounts belonging to other devices", () => {
            const store = createStore([smartWalletDevice, localDevice], {
                accounts: [smartWalletAccount, localAccount],
                selectedAccount: MAINNET_ADDRESS,
            })

            store.dispatch(
                swapSmartWalletNetwork({
                    oldRootAddress: MAINNET_ADDRESS,
                    newRootAddress: TESTNET_ADDRESS,
                }),
            )

            const otherAccount = store.getState().accounts.accounts[1]
            expect(otherAccount.rootAddress).toBe(localAccount.rootAddress)
            expect(otherAccount.address).toBe(localAccount.address)
        })
    })

    describe("atomicity", () => {
        it("should update both device and accounts in a single dispatch", () => {
            const store = createStore()

            store.dispatch(
                swapSmartWalletNetwork({
                    oldRootAddress: MAINNET_ADDRESS,
                    newRootAddress: TESTNET_ADDRESS,
                }),
            )

            const state = store.getState()
            const device = state.devices[0] as SmartWalletDevice
            const account = state.accounts.accounts[0]

            // Both should be updated and in sync
            expect(device.rootAddress).toBe(TESTNET_ADDRESS)
            expect(account.rootAddress).toBe(TESTNET_ADDRESS)
            expect(account.address).toBe(TESTNET_ADDRESS)
            expect(state.accounts.selectedAccount).toBe(TESTNET_ADDRESS)
        })
    })
})

describe("handleSmartWalletNetworkSwap thunk", () => {
    it("should dispatch swap when address differs", () => {
        const store = createStore()

        store.dispatch(handleSmartWalletNetworkSwap(TESTNET_ADDRESS) as any)

        const device = store.getState().devices[0] as SmartWalletDevice
        expect(device.rootAddress).toBe(TESTNET_ADDRESS)
    })

    it("should be a no-op when address is the same", () => {
        const store = createStore()

        store.dispatch(handleSmartWalletNetworkSwap(MAINNET_ADDRESS) as any)

        const device = store.getState().devices[0] as SmartWalletDevice
        expect(device.rootAddress).toBe(MAINNET_ADDRESS)
        expect(device.rootTestnetAddress).toBeUndefined()
    })

    it("should be a no-op when no smart wallet device exists", () => {
        const store = createStore([localDevice], { accounts: [localAccount], selectedAccount: localAccount.address })

        store.dispatch(handleSmartWalletNetworkSwap(TESTNET_ADDRESS) as any)

        expect(store.getState().devices[0].rootAddress).toBe(localDevice.rootAddress)
    })
})
