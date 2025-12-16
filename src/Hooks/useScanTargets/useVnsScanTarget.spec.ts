import { renderHook } from "@testing-library/react-hooks"
import { defaultMainNetwork } from "~Constants"
import { ethers } from "ethers"
import { TestWrapper } from "~Test"

import { queryClient } from "~Api/QueryProvider"
import { useVns } from "~Hooks/useVns"
import { useVnsScanTarget } from "./useVnsScanTarget"

jest.mock("~Hooks/useVns", () => ({
    ...jest.requireActual("~Hooks/useVns"),
    useVns: jest.fn(),
}))

describe("useVnsScanTarget", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()
    })
    it("should use the cached vns, if exists (vet domain)", async () => {
        ;(useVns as jest.Mock).mockReturnValue({})
        const address = ethers.Wallet.createRandom().address
        queryClient.setQueryData(["vns_names", defaultMainNetwork.genesis.id], [{ address, name: "test.vet" }])
        const { result } = renderHook(() => useVnsScanTarget(), { wrapper: TestWrapper })

        const r = await result.current("test.vet")
        expect(r).toBeDefined()
        expect(r?.name).toBe("test.vet")
        expect(r?.address).toBe(address)
    })
    it("should use the cached vns, if exists (address)", async () => {
        ;(useVns as jest.Mock).mockReturnValue({})
        const address = ethers.Wallet.createRandom().address
        queryClient.setQueryData(["vns_names", defaultMainNetwork.genesis.id], [{ address, name: "test.vet" }])
        const { result } = renderHook(() => useVnsScanTarget(), { wrapper: TestWrapper })

        const r = await result.current(address)
        expect(r).toBeDefined()
        expect(r?.name).toBe("test.vet")
        expect(r?.address).toBe(address)
    })
    it("should try to get address from vet domain", async () => {
        const address = ethers.Wallet.createRandom().address
        const getVnsAddress = jest.fn().mockImplementation(v => {
            if (v === "test.vet") return address
            return ethers.constants.AddressZero
        })
        ;(useVns as jest.Mock).mockReturnValue({
            getVnsAddress,
        })
        const { result } = renderHook(() => useVnsScanTarget(), { wrapper: TestWrapper })

        const r1 = await result.current("test.vet")
        expect(r1).toBeDefined()
        expect(r1?.name).toBe("test.vet")
        expect(r1?.address).toBe(address.toLowerCase())

        const r2 = await result.current("test1.vet")
        expect(r2).not.toBeDefined()
    })

    it("should try to get vet domain from address", async () => {
        const address = ethers.Wallet.createRandom().address
        const getVnsName = jest.fn().mockImplementation(async v => {
            if (v === address) return [{ name: "test.vet" }]
            return []
        })
        ;(useVns as jest.Mock).mockReturnValue({
            getVnsName,
        })
        const { result } = renderHook(() => useVnsScanTarget(), { wrapper: TestWrapper })

        const r1 = await result.current(address)
        expect(r1).toBeDefined()
        expect(r1?.name).toBe("test.vet")
        expect(r1?.address).toBe(address.toLowerCase())

        const r2 = await result.current(ethers.Wallet.createRandom().address)
        expect(r2).not.toBeDefined()
    })
})
