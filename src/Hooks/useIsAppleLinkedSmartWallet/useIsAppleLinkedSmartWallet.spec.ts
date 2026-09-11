import { renderHook } from "@testing-library/react-hooks"
import { DEVICE_TYPE } from "~Model"
import { RootState } from "~Storage/Redux/Types"
import { setPlatform, TestWrapper } from "~Test"

import { useIsAppleLinkedSmartWallet } from "./useIsAppleLinkedSmartWallet"

const SMART_ROOT = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
const LOCAL_ROOT = "0x90d70a5d0e9ce28336f7d45990b9c63c0a4142g0"

const smartDevice = (linkedProviders?: ("google" | "apple")[]) => ({
    alias: "Smart Wallet",
    index: 0,
    rootAddress: SMART_ROOT,
    type: DEVICE_TYPE.SMART_WALLET,
    position: 0,
    linkedProviders,
})

const localDevice = {
    alias: "Local Wallet",
    index: 0,
    rootAddress: LOCAL_ROOT,
    type: DEVICE_TYPE.LOCAL_MNEMONIC,
    position: 1,
}

/**
 * The local device is always kept: it is the one backing TestWrapper's default selected account,
 * and the account/device join throws when an account has no matching device.
 */
const buildState = (smartDevices: any[]): Partial<RootState> => ({
    devices: [...smartDevices, localDevice],
    balances: { mainnet: {}, testnet: {}, other: {}, solo: {} },
})

const renderForDevices = (smartDevices: any[]) => {
    const { result } = renderHook(() => useIsAppleLinkedSmartWallet(), {
        wrapper: TestWrapper,
        initialProps: { preloadedState: buildState(smartDevices) },
    })
    return result
}

describe("useIsAppleLinkedSmartWallet", () => {
    beforeEach(() => {
        setPlatform("ios")
    })

    it("should return true when a smart wallet has apple linked", () => {
        expect(renderForDevices([smartDevice(["apple"])]).current).toBe(true)
    })

    it("should return true when a smart wallet has both apple and google linked", () => {
        expect(renderForDevices([smartDevice(["google", "apple"])]).current).toBe(true)
    })

    it("should return false when the only smart wallet has google linked", () => {
        expect(renderForDevices([smartDevice(["google"])]).current).toBe(false)
    })

    it("should return true on iOS when linkedProviders has not synced yet", () => {
        expect(renderForDevices([smartDevice([])]).current).toBe(true)
    })

    it("should return true on iOS when linkedProviders is missing", () => {
        expect(renderForDevices([smartDevice(undefined)]).current).toBe(true)
    })

    it("should return false on Android when linkedProviders has not synced yet", () => {
        setPlatform("android")
        expect(renderForDevices([smartDevice([])]).current).toBe(false)
    })

    it("should return false when there are no smart wallets", () => {
        expect(renderForDevices([]).current).toBe(false)
    })
})
