import { renderHook } from "@testing-library/react-hooks"
import { ethers } from "ethers"
import { defaultTestNetwork, TEST_B3TR_ADDRESS, VTHO } from "~Constants"
import abi from "~Generated/abi"
import { DEVICE_TYPE } from "~Model"
import { RootState } from "~Storage/Redux/Types"
import { TestWrapper } from "~Test"
import { BigNutils } from "~Utils"
import { useIsEnoughGas } from "./useIsEnoughGas"

const createPreloadedState = (balance: string): Partial<RootState> => {
    const userAddress = ethers.Wallet.createRandom().address
    return {
        balances: {
            testnet: {
                [userAddress]: [
                    {
                        balance,
                        isHidden: false,
                        timeUpdated: new Date().toISOString(),
                        tokenAddress: VTHO.address,
                    },
                    {
                        balance,
                        isHidden: false,
                        timeUpdated: new Date().toISOString(),
                        tokenAddress: TEST_B3TR_ADDRESS,
                    },
                ],
            },
        } as any,
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

describe("useIsEnoughGas", () => {
    it("should return true if user has enough VTHO & tx is delegated", () => {
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
                    preloadedState: createPreloadedState("1"),
                },
            },
        )

        expect(result.current.hasEnoughBalance).toBe(true)
    })
    it("should return true if user has enough VTHO & tx is not delegated", () => {
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
                    preloadedState: createPreloadedState("1"),
                },
            },
        )

        expect(result.current.hasEnoughBalance).toBe(true)
    })
    it("should return false if user doesn't have enough VTHO & tx is not delegated", () => {
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
                    preloadedState: createPreloadedState("1"),
                },
            },
        )

        expect(result.current.hasEnoughBalance).toBe(false)
    })
    it("should return true if user doesn't have enough VTHO & tx is delegated", () => {
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
                    preloadedState: createPreloadedState("1"),
                },
            },
        )

        expect(result.current.hasEnoughBalance).toBe(true)
    })
    it("should return true if user has exactly 0 VTHO & tx is delegated", () => {
        const { result } = renderHook(
            () =>
                useIsEnoughGas({
                    selectedToken: "VTHO",
                    clauses: [],
                    isDelegated: true,
                    allFeeOptions: { B3TR: BigNutils("0"), VTHO: BigNutils("2"), VET: BigNutils("0") },
                    isLoadingFees: false,
                }),
            {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState: createPreloadedState("0"),
                },
            },
        )

        expect(result.current.hasEnoughBalance).toBe(true)
    })
    it("should return false if user doesn't have enough B3TR & tx is delegated", () => {
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
                    preloadedState: createPreloadedState("1"),
                },
            },
        )

        expect(result.current.hasEnoughBalance).toBe(false)
    })
    it("should return true if user has enough B3TR & tx is delegated", () => {
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
                    preloadedState: createPreloadedState("3"),
                },
            },
        )

        expect(result.current.hasEnoughBalance).toBe(true)
    })
    it("should return true if user has enough to cover clauses + fee", () => {
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
                    preloadedState: createPreloadedState("13"),
                },
            },
        )

        expect(result.current.hasEnoughBalance).toBe(true)
    })
    it("should return true if user has enough to cover clauses (but not fees) if using VTHO & tx is delegated", () => {
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
                                    address: VTHO.address,
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
                    preloadedState: createPreloadedState("10"),
                },
            },
        )

        expect(result.current.hasEnoughBalance).toBe(true)
    })
    it("should return false if user has enough to cover clauses (but not fees) if using B3TR & tx is delegated", () => {
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
                                    address: VTHO.address,
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
                    preloadedState: createPreloadedState("10"),
                },
            },
        )

        expect(result.current.hasEnoughBalance).toBe(true)
    })
})
