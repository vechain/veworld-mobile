import { renderHook } from "@testing-library/react-hooks"
import { useTransactionFees } from "./useTransactionFees"
import { GasPriceCoefficient } from "~Constants"
import { ethers } from "ethers"
import { BigNutils } from "~Utils"

describe("useTransactionFees", () => {
    it("should render correctly", () => {
        const { result } = renderHook(() =>
            useTransactionFees({
                coefficient: GasPriceCoefficient.MEDIUM,
                gas: {
                    baseGasPrice: "0",
                    caller: ethers.Wallet.createRandom().address,
                    gas: 1000,
                    reverted: false,
                    revertReason: "",
                    vmError: "",
                },
            }),
        )

        expect(result.current).toStrictEqual({
            dataUpdatedAt: expect.any(Number),
            estimatedFee: BigNutils("0"),
            gasPriceCoef: 127,
            isLoading: false,
            maxFee: BigNutils("0"),
            options: {
                0: {
                    estimatedFee: BigNutils("0"),
                    maxFee: BigNutils("0"),
                    priorityFee: BigNutils("0"),
                },
                127: {
                    estimatedFee: BigNutils("0"),
                    maxFee: BigNutils("0"),
                    priorityFee: BigNutils("0"),
                },
                255: {
                    estimatedFee: BigNutils("0"),
                    maxFee: BigNutils("0"),
                    priorityFee: BigNutils("0"),
                },
            },
            priorityFee: BigNutils("0"),
        })
    })

    it.each([GasPriceCoefficient.REGULAR, GasPriceCoefficient.MEDIUM, GasPriceCoefficient.HIGH])(
        "should have gasPriceCoef based on selected option %s",
        coefficient => {
            const { result } = renderHook(() =>
                useTransactionFees({
                    coefficient,
                    gas: {
                        baseGasPrice: "0",
                        caller: ethers.Wallet.createRandom().address,
                        gas: 1000,
                        reverted: false,
                        revertReason: "",
                        vmError: "",
                    },
                }),
            )

            expect(result.current.gasPriceCoef).toBe(coefficient)
        },
    )
})
