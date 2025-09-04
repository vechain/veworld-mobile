import { renderHook } from "@testing-library/react-hooks"
import { TestWrapper } from "~Test"

import { useTransactionFees } from "./useTransactionFees"
import { GasPriceCoefficient } from "~Constants"
import { ethers } from "ethers"
import { BigNutils } from "~Utils"
import { useLegacyFees } from "./useLegacyFees"
import { useGalacticaFees } from "./useGalacticaFees"

jest.mock("./useLegacyFees")
jest.mock("./useGalacticaFees")

const mockedOptions = {
    [GasPriceCoefficient.REGULAR]: {
        estimatedFee: BigNutils("1"),
        maxFee: BigNutils("2"),
        priorityFee: BigNutils("0"),
    },
    [GasPriceCoefficient.MEDIUM]: {
        estimatedFee: BigNutils("3"),
        maxFee: BigNutils("4"),
        priorityFee: BigNutils("0"),
    },
    [GasPriceCoefficient.HIGH]: {
        estimatedFee: BigNutils("5"),
        maxFee: BigNutils("6"),
        priorityFee: BigNutils("0"),
    },
}

const mockedLegacyTxOptions = {
    [GasPriceCoefficient.REGULAR]: {
        gasPriceCoef: 0,
    },
    [GasPriceCoefficient.MEDIUM]: {
        gasPriceCoef: 127,
    },
    [GasPriceCoefficient.HIGH]: {
        gasPriceCoef: 255,
    },
}

const mockedGalacticaTxOptions = {
    [GasPriceCoefficient.REGULAR]: {
        maxFeePerGas: "0",
        maxPriorityFeePerGas: "0",
    },
    [GasPriceCoefficient.MEDIUM]: {
        maxFeePerGas: "127",
        maxPriorityFeePerGas: "127",
    },
    [GasPriceCoefficient.HIGH]: {
        maxFeePerGas: "255",
        maxPriorityFeePerGas: "255",
    },
}

const gasObj = {
    baseGasPrice: "0",
    caller: ethers.Wallet.createRandom().address,
    gas: 1000,
    reverted: false,
    revertReason: "",
    vmError: "",
    outputs: [],
}

describe("useTransactionFees", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it("should render correctly for legacy txs", () => {
        ;(useLegacyFees as jest.Mock).mockReturnValue({
            isLoading: false,
            options: mockedOptions,
            txOptions: mockedLegacyTxOptions,
            isFirstTimeLoading: false,
        })
        ;(useGalacticaFees as jest.Mock).mockReturnValue({
            isLoading: false,
            options: {},
            txOptions: {},
            maxPriorityFee: BigNutils("0"),
            dataUpdatedAt: Date.now(),
            isBaseFeeRampingUp: false,
            speedChangeEnabled: false,
            isFirstTimeLoading: false,
        })

        const { result } = renderHook(
            () =>
                useTransactionFees({
                    coefficient: GasPriceCoefficient.MEDIUM,
                    gas: gasObj,
                    isGalactica: false,
                }),
            { wrapper: TestWrapper },
        )

        expect(result.current).toStrictEqual({
            dataUpdatedAt: expect.any(Number),
            estimatedFee: BigNutils("3"),
            isLoading: false,
            maxFee: BigNutils("4"),
            options: mockedOptions,
            txOptions: mockedLegacyTxOptions,
            speedChangeEnabled: false,
            maxPriorityFee: BigNutils("0"),
            isBaseFeeRampingUp: false,
            isFirstTimeLoading: false,
        })
    })

    it("should render correctly for galactica txs", () => {
        ;(useLegacyFees as jest.Mock).mockReturnValue({
            isLoading: false,
            options: {},
            txOptions: {},
            isFirstTimeLoading: false,
        })
        ;(useGalacticaFees as jest.Mock).mockReturnValue({
            isLoading: false,
            options: mockedOptions,
            txOptions: mockedGalacticaTxOptions,
            maxPriorityFee: BigNutils("1"),
            dataUpdatedAt: Date.now(),
            isBaseFeeRampingUp: false,
            speedChangeEnabled: false,
            isFirstTimeLoading: false,
        })

        const { result } = renderHook(
            () =>
                useTransactionFees({
                    coefficient: GasPriceCoefficient.MEDIUM,
                    gas: gasObj,
                    isGalactica: true,
                }),
            { wrapper: TestWrapper },
        )

        expect(result.current).toStrictEqual({
            dataUpdatedAt: expect.any(Number),
            estimatedFee: BigNutils("3"),
            isLoading: false,
            maxFee: BigNutils("4"),
            options: mockedOptions,
            txOptions: mockedGalacticaTxOptions,
            speedChangeEnabled: false,
            maxPriorityFee: BigNutils("1"),
            isBaseFeeRampingUp: false,
            isFirstTimeLoading: false,
        })
    })
})
