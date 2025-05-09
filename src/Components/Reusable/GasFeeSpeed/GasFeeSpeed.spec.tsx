import { act, fireEvent, render, screen } from "@testing-library/react-native"
import { ethers } from "ethers"
import React from "react"
import { GasPriceCoefficient } from "~Constants"
import { TransactionFeesResult } from "~Hooks/useTransactionFees"
import { TestWrapper } from "~Test"
import { BigNutils } from "~Utils"
import { GasFeeSpeed } from "./GasFeeSpeed"

describe("GasFeeSpeed", () => {
    const options: TransactionFeesResult = {
        "0": {
            estimatedFee: BigNutils(ethers.utils.parseEther("0.21").toString()),
            maxFee: BigNutils(ethers.utils.parseEther("0.21").toString()),
            priorityFee: BigNutils("0"),
        },
        "127": {
            estimatedFee: BigNutils(ethers.utils.parseEther("0.31").toString()),
            maxFee: BigNutils(ethers.utils.parseEther("0.31").toString()),
            priorityFee: BigNutils("0"),
        },
        "255": {
            estimatedFee: BigNutils(ethers.utils.parseEther("0.41").toString()),
            maxFee: BigNutils(ethers.utils.parseEther("0.41").toString()),
            priorityFee: BigNutils("0"),
        },
    }
    it.each([GasPriceCoefficient.REGULAR, GasPriceCoefficient.MEDIUM, GasPriceCoefficient.HIGH])(
        "should render correctly: %d",
        opt => {
            render(
                <GasFeeSpeed
                    options={options}
                    selectedFeeOption={opt}
                    gasUpdatedAt={Date.now()}
                    onRefreshFee={jest.fn()}
                    setSelectedFeeOption={jest.fn()}
                    isGalactica={false}
                />,
                { wrapper: TestWrapper },
            )

            expect(screen.getByTestId("LEGACY_ESTIMATED_FEE")).toHaveTextContent(
                ethers.utils.formatEther(options[opt].estimatedFee.toString),
            )
        },
    )

    it.each([GasPriceCoefficient.REGULAR, GasPriceCoefficient.MEDIUM, GasPriceCoefficient.HIGH])(
        "should select option correctly: %d",
        opt => {
            const setSelectedFeeOption = jest.fn()
            render(
                <GasFeeSpeed
                    options={options}
                    selectedFeeOption={GasPriceCoefficient.REGULAR}
                    gasUpdatedAt={Date.now()}
                    onRefreshFee={jest.fn()}
                    setSelectedFeeOption={setSelectedFeeOption}
                    isGalactica={false}
                />,
                { wrapper: TestWrapper },
            )

            act(() => {
                fireEvent.press(screen.getByTestId("GAS_FEE_SPEED_EDIT"))
            })

            act(() => {
                fireEvent.press(screen.getByTestId(`button-${opt}`))
            })

            expect(screen.getByTestId("LEGACY_ESTIMATED_FEE_BS")).toHaveTextContent(
                `${ethers.utils.formatEther(options[opt].estimatedFee.toString)} VTHO`,
            )

            act(() => {
                fireEvent.press(screen.getByTestId("GAS_FEE_BOTTOM_SHEET_APPLY"))
            })

            expect(setSelectedFeeOption).toHaveBeenCalledWith(opt)
        },
    )
})
