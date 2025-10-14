import { renderHook } from "@testing-library/react-hooks"
import { useAddressScanTarget } from "./useAddressScanTarget"
import { useUriScanTarget } from "./useUriScanTarget"
import { useWalletConnectScanTarget } from "./useWalletConnectScanTarget"
import { useScanTargets } from "./useScanTargets"
import { ScanTarget } from "~Constants"
import { ethers } from "ethers"

jest.mock("./useAddressScanTarget", () => ({ useAddressScanTarget: jest.fn() }))
jest.mock("./useUriScanTarget", () => ({ useUriScanTarget: jest.fn() }))
jest.mock("./useVnsScanTarget", () => ({ useVnsScanTarget: jest.fn() }))
jest.mock("./useWalletConnectScanTarget", () => ({ useWalletConnectScanTarget: jest.fn() }))

describe("useScanTargets", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe("VNS", () => {
        it("should not call VNS if the data does not contain .vet", async () => {
            const onScanVns = jest.fn()
            const { result } = renderHook(() => useScanTargets({ targets: [ScanTarget.VNS], onScanVns }))

            await result.current("test.vot")

            expect(onScanVns).not.toHaveBeenCalled()
        })
        it("should call VNS if the data contains .vet", async () => {
            const onScanVns = jest.fn()
            const { result } = renderHook(() => useScanTargets({ targets: [ScanTarget.VNS], onScanVns }))

            await result.current("test.vet")

            expect(onScanVns).toHaveBeenCalled()
        })
    })
    describe("Address", () => {
        it("should not call Address if the data is not a valid address", async () => {
            const onScanAddress = jest.fn()
            const { result } = renderHook(() => useScanTargets({ targets: [ScanTarget.ADDRESS], onScanAddress }))

            await result.current("0x001")

            expect(onScanAddress).not.toHaveBeenCalled()
        })
        it("should call Address if the data is a valid address", async () => {
            const onScanAddress = jest.fn()
            const { result } = renderHook(() => useScanTargets({ targets: [ScanTarget.ADDRESS], onScanAddress }))

            await result.current(ethers.Wallet.createRandom().address)

            expect(onScanAddress).toHaveBeenCalled()
        })
        it("should call the default fn if onScanAddress is not defined", async () => {
            const fn = jest.fn().mockReturnValue(false)
            ;(useAddressScanTarget as jest.Mock).mockReturnValue(fn)
            const { result } = renderHook(() => useScanTargets({ targets: [ScanTarget.ADDRESS] }))

            await result.current(ethers.Wallet.createRandom().address)

            expect(fn).toHaveBeenCalled()
        })
    })
    describe("WC", () => {
        it("should not call WC if the data is not a valid WC Uri", async () => {
            const onScanWalletConnect = jest.fn()
            const { result } = renderHook(() =>
                useScanTargets({ targets: [ScanTarget.WALLET_CONNECT], onScanWalletConnect }),
            )

            await result.current("https://vechain.org")

            expect(onScanWalletConnect).not.toHaveBeenCalled()
        })
        it("should call WC if the data is a valid WC Uri", async () => {
            const onScanWalletConnect = jest.fn()
            const { result } = renderHook(() =>
                useScanTargets({ targets: [ScanTarget.WALLET_CONNECT], onScanWalletConnect }),
            )

            await result.current("wc://wc/@2?symKey=1&relay-protocol=1")

            expect(onScanWalletConnect).toHaveBeenCalled()
        })
        it("should call the default fn if onScanWalletConnect is not defined", async () => {
            const fn = jest.fn().mockReturnValue(false)
            ;(useWalletConnectScanTarget as jest.Mock).mockReturnValue(fn)
            const { result } = renderHook(() => useScanTargets({ targets: [ScanTarget.WALLET_CONNECT] }))

            await result.current("wc://wc/@2?symKey=1&relay-protocol=1")

            expect(fn).toHaveBeenCalled()
        })
    })

    describe("Url", () => {
        it("should not call Url if the data is not a valid HTTPS Url", async () => {
            const onScanUrl = jest.fn()
            const { result } = renderHook(() => useScanTargets({ targets: [ScanTarget.HTTPS_URL], onScanUrl }))

            await result.current("http://vechain.org")

            expect(onScanUrl).not.toHaveBeenCalled()
        })
        it("should call Url if the data is a valid Url", async () => {
            const onScanUrl = jest.fn()
            const { result } = renderHook(() => useScanTargets({ targets: [ScanTarget.HTTPS_URL], onScanUrl }))

            await result.current("https://vechain.org")

            expect(onScanUrl).toHaveBeenCalled()
        })
        it("should call the default fn if onScanUrl is not defined", async () => {
            const fn = jest.fn().mockReturnValue(false)
            ;(useUriScanTarget as jest.Mock).mockReturnValue(fn)
            const { result } = renderHook(() => useScanTargets({ targets: [ScanTarget.HTTPS_URL] }))

            await result.current("https://vechain.org")

            expect(fn).toHaveBeenCalled()
        })
    })
})
