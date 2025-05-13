import { useQuery } from "@tanstack/react-query"
import { renderHook } from "@testing-library/react-hooks"
import { useGalacticaFees } from "./useGalacticaFees"
import { ethers } from "ethers"
import { BigNumberUtils, BigNutils } from "~Utils"
import { TestWrapper } from "~Test"
import { GasPriceCoefficient } from "~Constants"

jest.mock("@tanstack/react-query", () => ({
    ...jest.requireActual("@tanstack/react-query"),
    useQuery: jest.fn(),
}))

const mocked = <T extends (...args: any) => any>(fn: T): jest.Mock<ReturnType<T>, Parameters<T>> => {
    return fn as unknown as jest.Mock<ReturnType<T>, Parameters<T>>
}

const mockRewards = [
    [`0x${BigInt(10).toString(16)}`, `0x${BigInt(20).toString(16)}`, `0x${BigInt(30).toString(16)}`],
    [`0x${BigInt(10).toString(16)}`, `0x${BigInt(20).toString(16)}`, `0x${BigInt(30).toString(16)}`],
    [`0x${BigInt(10).toString(16)}`, `0x${BigInt(20).toString(16)}`, `0x${BigInt(30).toString(16)}`],
    [`0x${BigInt(10).toString(16)}`, `0x${BigInt(20).toString(16)}`, `0x${BigInt(30).toString(16)}`],
    [`0x${BigInt(10).toString(16)}`, `0x${BigInt(20).toString(16)}`, `0x${BigInt(30).toString(16)}`],
]

describe("useGalacticaFees", () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })
    it("should render correctly", () => {
        mocked(useQuery).mockReturnValue({
            isFetching: false,
            data: {
                maxPriorityFee: `0x${
                    BigNutils(ethers.utils.parseUnits("1", "gwei").toString()).multiply("0.05").decimals(0).toHex
                }`,
                feeHistory: {
                    baseFeePerGas: [
                        ethers.utils.parseUnits("1", "gwei").toHexString(),
                        ethers.utils.parseUnits("1", "gwei").toHexString(),
                        ethers.utils.parseUnits("1", "gwei").toHexString(),
                        ethers.utils.parseUnits("1", "gwei").toHexString(),
                        ethers.utils.parseUnits("1", "gwei").toHexString(),
                    ],
                    reward: mockRewards,
                },
            },
            dataUpdatedAt: Date.now(),
        } as any)

        const { result } = renderHook(
            () => useGalacticaFees({ isGalactica: true, blockId: "0x00000001", gas: { gas: 21000 } as any }),
            { wrapper: TestWrapper },
        )

        expect(result.current).toStrictEqual({
            dataUpdatedAt: expect.any(Number),
            isBaseFeeRampingUp: false,
            speedChangeEnabled: false,
            options: {
                [GasPriceCoefficient.REGULAR]: {
                    estimatedFee: BigNutils("21000000210000"),
                    maxFee: BigNutils("21420000210000"),
                    priorityFee: BigNutils("210000"),
                },
                [GasPriceCoefficient.MEDIUM]: {
                    estimatedFee: BigNutils("21000000420000"),
                    maxFee: BigNutils("21630000420000"),
                    priorityFee: BigNutils("420000"),
                },
                [GasPriceCoefficient.HIGH]: {
                    estimatedFee: BigNutils("21000000630000"),
                    maxFee: BigNutils("21966000630000"),
                    priorityFee: BigNutils("630000"),
                },
            },
            txOptions: {
                [GasPriceCoefficient.REGULAR]: {
                    maxFeePerGas: "1020000010",
                    maxPriorityFeePerGas: "10",
                },
                [GasPriceCoefficient.MEDIUM]: {
                    maxFeePerGas: "1030000020",
                    maxPriorityFeePerGas: "20",
                },
                [GasPriceCoefficient.HIGH]: {
                    maxFeePerGas: "1046000030",
                    maxPriorityFeePerGas: "30",
                },
            },
            maxPriorityFee: BigNutils("50000000"),
            isLoading: false,
        })
    })

    it("should return isBaseFeeRampingUp as true if the base fee increase is over threshold", () => {
        const baseFeeArray = Array.from({ length: 5 }, (_, idx) => idx)
            .reduce<BigNumberUtils[]>(acc => {
                if (acc.length === 0) return [BigNutils(ethers.utils.parseUnits("1", "gwei").toString())]
                return [...acc, acc.at(-1)!.clone().multiply("1.02")]
            }, [])
            .map(u => `0x${u.toHex}`)
        mocked(useQuery).mockReturnValue({
            isFetching: false,
            data: {
                maxPriorityFee: `0x${
                    BigNutils(ethers.utils.parseUnits("1", "gwei").toString()).multiply("0.05").decimals(0).toHex
                }`,
                feeHistory: {
                    baseFeePerGas: baseFeeArray,
                    reward: mockRewards,
                },
            },
            dataUpdatedAt: Date.now(),
        } as any)
        const { result } = renderHook(
            () => useGalacticaFees({ isGalactica: true, blockId: "0x00000001", gas: { gas: 21000 } as any }),
            { wrapper: TestWrapper },
        )

        expect(result.current.isBaseFeeRampingUp).toBe(true)
    })

    it("should return speedChangeEnabled as true if the base fee increase is over threshold", () => {
        const baseFeeArray = Array.from({ length: 5 }, (_, idx) => idx)
            .reduce<BigNumberUtils[]>(acc => {
                if (acc.length === 0) return [BigNutils(ethers.utils.parseUnits("1", "gwei").toString())]
                return [...acc, acc.at(-1)!.clone().multiply("1.02")]
            }, [])
            .map(u => `0x${u.toHex}`)
        mocked(useQuery).mockReturnValue({
            isFetching: false,
            data: {
                maxPriorityFee: `0x${
                    BigNutils(ethers.utils.parseUnits("1", "gwei").toString()).multiply("0.05").decimals(0).toHex
                }`,
                feeHistory: {
                    baseFeePerGas: baseFeeArray,
                    reward: mockRewards,
                },
            },
            dataUpdatedAt: Date.now(),
        } as any)
        const { result } = renderHook(
            () => useGalacticaFees({ isGalactica: true, blockId: "0x00000001", gas: { gas: 21000 } as any }),
            { wrapper: TestWrapper },
        )

        expect(result.current.speedChangeEnabled).toBe(true)
    })
})
