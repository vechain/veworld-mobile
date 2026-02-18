import { renderHook } from "@testing-library/react-hooks"
import { ethers } from "ethers"
import { defaultTestNetwork, TEST_B3TR_ADDRESS, VET, VTHO } from "~Constants"
import abi from "~Generated/abi"
import { Balance, DEVICE_TYPE } from "~Model"
import { RootState } from "~Storage/Redux/Types"
import { TestWrapper } from "~Test"
import { BigNutils } from "~Utils"
import { useIsEnoughGas } from "./useIsEnoughGas"
import { useMultipleTokensBalance } from "~Hooks/useTokenBalance"

const createPreloadedState = (): Partial<RootState> => {
    const userAddress = ethers.Wallet.createRandom().address
    return {
        networks: {
            customNetworks: [],
            hardfork: {},
            isNodeError: false,
            selectedNetwork: defaultTestNetwork.id,
            showConversionOtherNets: false,
            showTestNetTag: false,
        },
        accounts: {
            accounts: [
                {
                    address: userAddress,
                    alias: "TEST",
                    index: 0,
                    rootAddress: userAddress,
                    visible: true,
                    hasAttemptedClaim: false,
                },
            ],
            selectedAccount: userAddress,
        },
        devices: [
            {
                alias: "TEST",
                index: 0,
                rootAddress: userAddress,
                wallet: userAddress,
                type: DEVICE_TYPE.LOCAL_MNEMONIC,
                position: 0,
            },
        ],
    }
}

const balanceMocker = (balances: Record<"VET" | "VTHO" | "B3TR", string>) => {
    return {
        data: [
            { tokenAddress: VET.address, balance: balances.VET, isHidden: false, timeUpdated: Date.now().toString() },
            {
                tokenAddress: TEST_B3TR_ADDRESS,
                balance: balances.B3TR,
                isHidden: false,
                timeUpdated: Date.now().toString(),
            },
            { tokenAddress: VTHO.address, balance: balances.VTHO, isHidden: false, timeUpdated: Date.now().toString() },
        ] satisfies Balance[],
    }
}

jest.mock("~Hooks/useTokenBalance", () => ({ useMultipleTokensBalance: jest.fn() }))

describe("useIsEnoughGas", () => {
    it("should return true if user has enough VTHO & tx is delegated", () => {
        ;(useMultipleTokensBalance as jest.Mock).mockReturnValue(
            balanceMocker({
                VET: "1",
                B3TR: "1",
                VTHO: "1",
            }),
        )
        const { result } = renderHook(
            () =>
                useIsEnoughGas({
                    selectedToken: "VTHO",
                    transactionOutputs: [],
                    origin: "0x0",
                    isDelegated: true,
                    allFeeOptions: { B3TR: BigNutils(""), VTHO: BigNutils("0"), VET: BigNutils("0") },
                    isLoadingFees: false,
                }),
            {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState: createPreloadedState(),
                },
            },
        )

        expect(result.current.hasEnoughBalance).toBe(true)
    })
    it("should return true if user has enough VTHO & tx is not delegated", () => {
        ;(useMultipleTokensBalance as jest.Mock).mockReturnValue(
            balanceMocker({
                VET: "1",
                B3TR: "1",
                VTHO: "1",
            }),
        )
        const { result } = renderHook(
            () =>
                useIsEnoughGas({
                    selectedToken: "VTHO",

                    transactionOutputs: [],
                    origin: "0x0",
                    isDelegated: false,
                    allFeeOptions: { B3TR: BigNutils("0"), VTHO: BigNutils("0"), VET: BigNutils("0") },
                    isLoadingFees: false,
                }),
            {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState: createPreloadedState(),
                },
            },
        )

        expect(result.current.hasEnoughBalance).toBe(true)
    })
    it("should return false if user doesn't have enough VTHO & tx is not delegated", () => {
        ;(useMultipleTokensBalance as jest.Mock).mockReturnValue(
            balanceMocker({
                VET: "1",
                B3TR: "1",
                VTHO: "1",
            }),
        )
        const { result } = renderHook(
            () =>
                useIsEnoughGas({
                    selectedToken: "VTHO",

                    transactionOutputs: [],
                    origin: "0x0",
                    isDelegated: false,
                    allFeeOptions: { B3TR: BigNutils("0"), VTHO: BigNutils("2"), VET: BigNutils("0") },
                    isLoadingFees: false,
                }),
            {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState: createPreloadedState(),
                },
            },
        )

        expect(result.current.hasEnoughBalance).toBe(false)
    })
    it("should return true if user doesn't have enough VTHO & tx is delegated", () => {
        ;(useMultipleTokensBalance as jest.Mock).mockReturnValue(
            balanceMocker({
                VET: "0",
                B3TR: "0",
                VTHO: "1",
            }),
        )
        const { result } = renderHook(
            () =>
                useIsEnoughGas({
                    selectedToken: "VTHO",

                    transactionOutputs: [],
                    origin: "0x0",
                    isDelegated: true,
                    allFeeOptions: { B3TR: BigNutils("0"), VTHO: BigNutils("2"), VET: BigNutils("0") },
                    isLoadingFees: false,
                }),
            {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState: createPreloadedState(),
                },
            },
        )

        expect(result.current.hasEnoughBalance).toBe(true)
    })
    it("should return true if user has exactly 0 VTHO & tx is delegated", () => {
        ;(useMultipleTokensBalance as jest.Mock).mockReturnValue(
            balanceMocker({
                VET: "0",
                B3TR: "0",
                VTHO: "0",
            }),
        )
        const { result } = renderHook(
            () =>
                useIsEnoughGas({
                    selectedToken: "VTHO",
                    transactionOutputs: [],
                    origin: "0x0",
                    isDelegated: true,
                    allFeeOptions: { B3TR: BigNutils("0"), VTHO: BigNutils("2"), VET: BigNutils("0") },
                    isLoadingFees: false,
                }),
            {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState: createPreloadedState(),
                },
            },
        )

        expect(result.current.hasEnoughBalance).toBe(true)
    })
    it("should return false if user doesn't have enough B3TR & tx is delegated", () => {
        ;(useMultipleTokensBalance as jest.Mock).mockReturnValue(
            balanceMocker({
                VET: "1",
                B3TR: "1",
                VTHO: "1",
            }),
        )
        const { result } = renderHook(
            () =>
                useIsEnoughGas({
                    selectedToken: "B3TR",

                    transactionOutputs: [],
                    origin: "0x0",
                    isDelegated: true,
                    allFeeOptions: { B3TR: BigNutils("2"), VTHO: BigNutils("0"), VET: BigNutils("0") },
                    isLoadingFees: false,
                }),
            {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState: createPreloadedState(),
                },
            },
        )

        expect(result.current.hasEnoughBalance).toBe(false)
    })
    it("should return true if user has enough B3TR & tx is delegated", () => {
        ;(useMultipleTokensBalance as jest.Mock).mockReturnValue(
            balanceMocker({
                VET: "1",
                B3TR: "3",
                VTHO: "1",
            }),
        )
        const { result } = renderHook(
            () =>
                useIsEnoughGas({
                    selectedToken: "B3TR",

                    transactionOutputs: [],
                    origin: "0x0",
                    isDelegated: true,
                    allFeeOptions: { B3TR: BigNutils("2"), VTHO: BigNutils("0"), VET: BigNutils("0") },
                    isLoadingFees: false,
                }),
            {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState: createPreloadedState(),
                },
            },
        )

        expect(result.current.hasEnoughBalance).toBe(true)
    })
    it("should return true if user has enough to cover clauses + fee", () => {
        ;(useMultipleTokensBalance as jest.Mock).mockReturnValue(
            balanceMocker({
                VET: "1",
                B3TR: "13",
                VTHO: "1",
            }),
        )
        const origin = ethers.Wallet.createRandom().address
        const { result } = renderHook(
            () =>
                useIsEnoughGas({
                    selectedToken: "B3TR",
                    transactionOutputs: [
                        {
                            transfers: [],
                            events: [
                                {
                                    address: TEST_B3TR_ADDRESS,
                                    ...new ethers.utils.Interface([
                                        abi["Transfer(indexed address,indexed address,uint256)"],
                                    ]).encodeEventLog("Transfer", [origin, ethers.Wallet.createRandom().address, "10"]),
                                },
                            ],
                        },
                    ],
                    origin,
                    allFeeOptions: { B3TR: BigNutils("2"), VTHO: BigNutils("0"), VET: BigNutils("0") },
                    isLoadingFees: false,
                    isDelegated: false,
                }),
            {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState: createPreloadedState(),
                },
            },
        )

        expect(result.current.hasEnoughBalance).toBe(true)
    })
    it("should return true if user has enough to cover clauses (but not fees) if using VTHO & tx is delegated", () => {
        ;(useMultipleTokensBalance as jest.Mock).mockReturnValue(
            balanceMocker({
                VET: "1",
                B3TR: "1",
                VTHO: "10",
            }),
        )
        const origin = ethers.Wallet.createRandom().address

        const { result } = renderHook(
            () =>
                useIsEnoughGas({
                    selectedToken: "VTHO",
                    transactionOutputs: [
                        {
                            transfers: [],
                            events: [
                                {
                                    address: VTHO.address,
                                    ...new ethers.utils.Interface([
                                        abi["Transfer(indexed address,indexed address,uint256)"],
                                    ]).encodeEventLog("Transfer", [origin, ethers.Wallet.createRandom().address, "10"]),
                                },
                            ],
                        },
                    ],
                    origin,
                    allFeeOptions: { B3TR: BigNutils("0"), VTHO: BigNutils("0"), VET: BigNutils("5") },
                    isLoadingFees: false,
                    isDelegated: true,
                }),
            {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState: createPreloadedState(),
                },
            },
        )

        expect(result.current.hasEnoughBalance).toBe(true)
    })
    it("should return false for smart wallet if user doesn't have enough VTHO to cover fees", () => {
        ;(useMultipleTokensBalance as jest.Mock).mockReturnValue(
            balanceMocker({
                VET: "0",
                B3TR: "0",
                VTHO: "1",
            }),
        )
        const { result } = renderHook(
            () =>
                useIsEnoughGas({
                    selectedToken: "VTHO",
                    transactionOutputs: [],
                    origin: "0x0",
                    isDelegated: true,
                    allFeeOptions: { B3TR: BigNutils("0"), VTHO: BigNutils("2"), VET: BigNutils("0") },
                    isLoadingFees: false,
                    isSmartWallet: true,
                }),
            {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState: createPreloadedState(),
                },
            },
        )

        expect(result.current.hasEnoughBalance).toBe(false)
    })
    it("should return true for smart wallet when gas fee is sponsored by delegator", () => {
        ;(useMultipleTokensBalance as jest.Mock).mockReturnValue(
            balanceMocker({
                VET: "0",
                B3TR: "0",
                VTHO: "1",
            }),
        )
        const { result } = renderHook(
            () =>
                useIsEnoughGas({
                    selectedToken: "VTHO",
                    transactionOutputs: [],
                    origin: "0x0",
                    isDelegated: true,
                    isGasFeeSponsored: true,
                    allFeeOptions: { B3TR: BigNutils("0"), VTHO: BigNutils("2"), VET: BigNutils("0") },
                    isLoadingFees: false,
                    isSmartWallet: true,
                }),
            {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState: createPreloadedState(),
                },
            },
        )

        expect(result.current.hasEnoughBalance).toBe(true)
    })
    it("should return true for smart wallet if user has enough VTHO to cover fees when delegated", () => {
        ;(useMultipleTokensBalance as jest.Mock).mockReturnValue(
            balanceMocker({
                VET: "0",
                B3TR: "0",
                VTHO: "3",
            }),
        )
        const { result } = renderHook(
            () =>
                useIsEnoughGas({
                    selectedToken: "VTHO",
                    transactionOutputs: [],
                    origin: "0x0",
                    isDelegated: true,
                    allFeeOptions: { B3TR: BigNutils("0"), VTHO: BigNutils("2"), VET: BigNutils("0") },
                    isLoadingFees: false,
                    isSmartWallet: true,
                }),
            {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState: createPreloadedState(),
                },
            },
        )

        expect(result.current.hasEnoughBalance).toBe(true)
    })
    it("should return false if user has enough to cover clauses (but not fees) if using B3TR & tx is delegated", () => {
        ;(useMultipleTokensBalance as jest.Mock).mockReturnValue(
            balanceMocker({
                VET: "1",
                B3TR: "10",
                VTHO: "1",
            }),
        )
        const origin = ethers.Wallet.createRandom().address

        const { result } = renderHook(
            () =>
                useIsEnoughGas({
                    selectedToken: "B3TR",
                    transactionOutputs: [
                        {
                            transfers: [],
                            events: [
                                {
                                    address: TEST_B3TR_ADDRESS,
                                    ...new ethers.utils.Interface([
                                        abi["Transfer(indexed address,indexed address,uint256)"],
                                    ]).encodeEventLog("Transfer", [origin, ethers.Wallet.createRandom().address, "10"]),
                                },
                            ],
                        },
                    ],
                    origin,

                    allFeeOptions: { B3TR: BigNutils("2"), VTHO: BigNutils("0"), VET: BigNutils("0") },
                    isLoadingFees: false,
                    isDelegated: true,
                }),
            {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState: createPreloadedState(),
                },
            },
        )

        expect(result.current.hasEnoughBalance).toBe(false)
    })
})
