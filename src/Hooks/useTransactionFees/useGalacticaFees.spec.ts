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
    [`0x${BigInt(10).toString(16)}`, `0x${BigInt(20).toString(16)}`, `0x${BigInt(30).toString(16)}`],
    [`0x${BigInt(10).toString(16)}`, `0x${BigInt(20).toString(16)}`, `0x${BigInt(30).toString(16)}`],
    [`0x${BigInt(10).toString(16)}`, `0x${BigInt(20).toString(16)}`, `0x${BigInt(30).toString(16)}`],
    ["0x0", "0x0", "0x0"],
]

function* bigNumberBuilder(
    initialArray: BigNumberUtils[],
    nextFn: (value: BigNumberUtils[]) => BigNumberUtils,
    maxLength: number,
) {
    let arr = initialArray
    for (let i = 0; i < maxLength; i++) {
        const newValue = nextFn(arr)
        arr.push(newValue)
        yield newValue
    }
}

const buildBaseFeeArray = ({
    decreaseOffset = 0,
    decreasePercentage = "0.125",
}: {
    decreaseOffset?: number
    decreasePercentage?: string
} = {}) => {
    const baseArray = Array.from({ length: 8 - decreaseOffset }, (_, idx) => idx).reduce<BigNumberUtils[]>(acc => {
        if (acc.length === 0) return [BigNutils(ethers.utils.parseUnits("1", "gwei").toString())]
        return [...acc, acc.at(-1)!.clone().multiply("1.02")]
    }, [])
    const decreaseArray = Array.from({ length: decreaseOffset }, (_, idx) => idx).reduce<BigNumberUtils[]>(acc => {
        if (acc.length === 0)
            return [
                baseArray.at(-1)?.clone().multiply(BigNutils("1").minus(decreasePercentage).toString) ??
                    BigNutils(ethers.utils.parseUnits("1", "gwei").toString()),
            ]
        return [...acc, acc.at(-1)!.clone().multiply(BigNutils("1").minus(decreasePercentage).toString)]
    }, [])

    return [...baseArray, ...decreaseArray].map(u => `0x${u.toBigInt.toString(16)}`)
}

describe("useGalacticaFees", () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })
    it("should render correctly", () => {
        mocked(useQuery).mockReturnValue({
            isFetching: false,
            isLoading: false,
            data: {
                maxPriorityFee: `0x${
                    BigNutils(ethers.utils.parseUnits("1", "gwei").toString()).multiply("0.05").decimals(0).toHex
                }`,
                feeHistory: {
                    baseFeePerGas: Array.from({ length: 9 }, () => ethers.utils.parseUnits("1", "gwei").toHexString()),
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
            isFirstTimeLoading: false,
        })
    })

    it("should return isBaseFeeRampingUp as true if the base fee increase is over threshold", () => {
        mocked(useQuery).mockReturnValue({
            isFetching: false,
            data: {
                maxPriorityFee: `0x${
                    BigNutils(ethers.utils.parseUnits("1", "gwei").toString()).multiply("0.05").decimals(0).toHex
                }`,
                feeHistory: {
                    baseFeePerGas: buildBaseFeeArray(),
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

    it.each([
        { values: buildBaseFeeArray(), expectedResult: true, description: "increase - no ramp down" },
        {
            values: buildBaseFeeArray({ decreaseOffset: 1 }),
            expectedResult: true,
            description: "ramp-up - 1 block ramp-down",
        },
        {
            values: buildBaseFeeArray({ decreaseOffset: 2 }),
            expectedResult: true,
            description: "ramp-up - 2 blocks ramp-down",
        },
        { values: buildBaseFeeArray({ decreaseOffset: 3 }), expectedResult: false, description: "ramp down 3 blocks" },
        { values: buildBaseFeeArray({ decreaseOffset: 4 }), expectedResult: false, description: "ramp down 4 blocks" },
        { values: buildBaseFeeArray({ decreaseOffset: 5 }), expectedResult: false, description: "ramp down 5 blocks" },
        { values: buildBaseFeeArray({ decreaseOffset: 6 }), expectedResult: false, description: "ramp down 6 blocks" },
        { values: buildBaseFeeArray({ decreaseOffset: 7 }), expectedResult: false, description: "ramp down 7 blocks" },
        { values: buildBaseFeeArray({ decreaseOffset: 8 }), expectedResult: false, description: "ramp down 8 blocks" },
        {
            values: Array.from({ length: 8 }, () => ethers.utils.parseEther("1").toHexString()),
            expectedResult: false,
            description: "stable",
        },
        {
            values: buildBaseFeeArray({ decreaseOffset: 5, decreasePercentage: "0.001" }),
            expectedResult: true,
            description: "ramp down, but not enough",
        },
        {
            values: [
                ...bigNumberBuilder(
                    [],
                    v => {
                        switch (v.length % 4) {
                            case 0:
                                return (
                                    v.at(-1)?.clone().multiply("1.02") ??
                                    BigNutils(ethers.utils.parseEther("1").toString())
                                )
                            case 1:
                                return v.at(-1)!.clone().multiply("1.02")
                            case 2:
                                return v.at(-1)!.clone().multiply("0.98")
                            case 3:
                                return v.at(-1)!.clone().multiply("0.98")
                            default:
                                throw new Error("IMPOSSIBLE")
                        }
                    },
                    8,
                ),
            ].map(u => `0x${u.toHex}`),
            expectedResult: false,
            description: "harmonic",
        },
    ])(
        "should return speedChangeEnabled correctly ($description) -> result: $expectedResult",
        ({ values, expectedResult }) => {
            mocked(useQuery).mockReturnValue({
                isFetching: false,
                data: {
                    maxPriorityFee: `0x${
                        BigNutils(ethers.utils.parseUnits("1", "gwei").toString()).multiply("0.05").decimals(0).toHex
                    }`,
                    feeHistory: {
                        baseFeePerGas: values,
                        reward: mockRewards,
                    },
                },
                dataUpdatedAt: Date.now(),
            } as any)
            const { result } = renderHook(
                () => useGalacticaFees({ isGalactica: true, blockId: "0x00000001", gas: { gas: 21000 } as any }),
                { wrapper: TestWrapper },
            )

            expect(result.current.speedChangeEnabled).toBe(expectedResult)
        },
    )

    it("should use the latest base fee but not reward", () => {
        mocked(useQuery).mockReturnValue({
            isFetching: false,
            isLoading: false,
            data: {
                maxPriorityFee: `0x${
                    BigNutils(ethers.utils.parseUnits("1", "gwei").toString()).multiply("0.05").decimals(0).toHex
                }`,
                feeHistory: {
                    baseFeePerGas: Array.from({ length: 8 }, () => "0x0").concat([
                        ethers.utils.parseUnits("1", "gwei").toHexString(),
                    ]),
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
            isBaseFeeRampingUp: true,
            speedChangeEnabled: true,
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
            isFirstTimeLoading: false,
        })
    })
})
