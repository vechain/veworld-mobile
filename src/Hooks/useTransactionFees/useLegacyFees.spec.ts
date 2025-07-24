import { renderHook } from "@testing-library/react-hooks"
import { useLegacyFees } from "./useLegacyFees"
import { GasPriceCoefficient } from "~Constants"
import { BigNutils } from "~Utils"
import { ethers } from "ethers"

describe("useLegacyFees", () => {
    it("should render correctly", () => {
        const { result } = renderHook(() =>
            useLegacyFees({
                gas: {
                    baseGasPrice: ethers.utils.parseEther("1").toString(),
                    caller: ethers.Wallet.createRandom().address,
                    gas: 1000,
                    reverted: false,
                    revertReason: "",
                    vmError: "",
                },
            }),
        )

        expect(result.current).toStrictEqual({
            txOptions: {
                [GasPriceCoefficient.REGULAR]: {
                    gasPriceCoef: 0,
                },
                [GasPriceCoefficient.MEDIUM]: {
                    gasPriceCoef: 127,
                },
                [GasPriceCoefficient.HIGH]: {
                    gasPriceCoef: 255,
                },
            },
            options: {
                [GasPriceCoefficient.REGULAR]: {
                    estimatedFee: BigNutils("1000000000000000000000"),
                    maxFee: BigNutils("1000000000000000000000"),
                    priorityFee: BigNutils("0"),
                },
                [GasPriceCoefficient.MEDIUM]: {
                    estimatedFee: BigNutils("1498039215686274509000"),
                    maxFee: BigNutils("1498039215686274509000"),
                    priorityFee: BigNutils("0"),
                },
                [GasPriceCoefficient.HIGH]: {
                    estimatedFee: BigNutils("2000000000000000000000"),
                    maxFee: BigNutils("2000000000000000000000"),
                    priorityFee: BigNutils("0"),
                },
            },
            isLoading: false,
            isFirstTimeLoading: false,
        })
    })
})
