import { renderHook } from "@testing-library/react-hooks"
<<<<<<< HEAD
import { useIsEnoughGas } from "./useIsEnoughGas"
import { TestWrapper } from "~Test"
import { BigNutils } from "~Utils"
import { B3TR, defaultTestNetwork, VTHO } from "~Constants"
import { RootState } from "~Storage/Redux/Types"
import { ethers } from "ethers"
import { DEVICE_TYPE } from "~Model"
import { Address, Clause, Token, Units } from "@vechain/sdk-core"
=======
import { ethers } from "ethers"
import { defaultTestNetwork, TEST_B3TR_ADDRESS, VTHO } from "~Constants"
import abi from "~Generated/abi"
import { DEVICE_TYPE } from "~Model"
import { RootState } from "~Storage/Redux/Types"
import { TestWrapper } from "~Test"
import { BigNutils } from "~Utils"
import { useIsEnoughGas } from "./useIsEnoughGas"
>>>>>>> main

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
<<<<<<< HEAD
                        tokenAddress: B3TR.address,
=======
                        tokenAddress: TEST_B3TR_ADDRESS,
>>>>>>> main
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

<<<<<<< HEAD
class B3TRToken extends Token {
    readonly tokenAddress = Address.of(B3TR.address)
    // 18 decimals
    readonly units: number = Units.wei
    readonly name = "B3TR"
    constructor(value: bigint, valueUnits?: Units) {
        super() // Pass a default value
        this.initialize(value, valueUnits) // Call the initialization method
    }
}

class VTHOToken extends Token {
    readonly tokenAddress = Address.of(VTHO.address)
    // 18 decimals
    readonly units: number = Units.wei
    readonly name = "VTHO"
    constructor(value: bigint, valueUnits?: Units) {
        super() // Pass a default value
        this.initialize(value, valueUnits) // Call the initialization method
    }
}

=======
>>>>>>> main
describe("useIsEnoughGas", () => {
    it("should return true if user has enough VTHO & tx is delegated", () => {
        const { result } = renderHook(
            () =>
                useIsEnoughGas({
                    selectedToken: "VTHO",
<<<<<<< HEAD
                    clauses: [],
=======
                    transactionOutputs: [],
                    origin: "0x0",
>>>>>>> main
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
<<<<<<< HEAD
                    clauses: [],
=======

                    transactionOutputs: [],
                    origin: "0x0",
>>>>>>> main
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
<<<<<<< HEAD
                    clauses: [],
=======

                    transactionOutputs: [],
                    origin: "0x0",
>>>>>>> main
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
<<<<<<< HEAD
                    clauses: [],
=======

                    transactionOutputs: [],
                    origin: "0x0",
>>>>>>> main
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
<<<<<<< HEAD
=======
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
>>>>>>> main
    it("should return false if user doesn't have enough B3TR & tx is delegated", () => {
        const { result } = renderHook(
            () =>
                useIsEnoughGas({
                    selectedToken: "B3TR",
<<<<<<< HEAD
                    clauses: [],
                    isDelegated: true,
                    allFeeOptions: { B3TR: BigNutils("1"), VTHO: BigNutils("0"), VET: BigNutils("0") },
=======

                    transactionOutputs: [],
                    origin: "0x0",
                    isDelegated: true,
                    allFeeOptions: { B3TR: BigNutils("2"), VTHO: BigNutils("0"), VET: BigNutils("0") },
>>>>>>> main
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
<<<<<<< HEAD
                    clauses: [],
=======

                    transactionOutputs: [],
                    origin: "0x0",
>>>>>>> main
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
<<<<<<< HEAD
=======
        const origin = ethers.Wallet.createRandom().address
>>>>>>> main
        const { result } = renderHook(
            () =>
                useIsEnoughGas({
                    selectedToken: "B3TR",
<<<<<<< HEAD
                    clauses: [
                        Clause.transferToken(
                            Address.of(ethers.Wallet.createRandom().address),
                            new B3TRToken(10n, Units.wei),
                        ),
                    ],
=======
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
>>>>>>> main
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
<<<<<<< HEAD
=======
        const origin = ethers.Wallet.createRandom().address

>>>>>>> main
        const { result } = renderHook(
            () =>
                useIsEnoughGas({
                    selectedToken: "B3TR",
<<<<<<< HEAD
                    clauses: [
                        Clause.transferToken(
                            Address.of(ethers.Wallet.createRandom().address),
                            new VTHOToken(10n, Units.wei),
                        ),
                    ],
=======
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
>>>>>>> main
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
<<<<<<< HEAD
=======
        const origin = ethers.Wallet.createRandom().address

>>>>>>> main
        const { result } = renderHook(
            () =>
                useIsEnoughGas({
                    selectedToken: "B3TR",
<<<<<<< HEAD
                    clauses: [
                        Clause.transferToken(
                            Address.of(ethers.Wallet.createRandom().address),
                            new VTHOToken(10n, Units.wei),
                        ),
                    ],
=======
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
>>>>>>> main

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
