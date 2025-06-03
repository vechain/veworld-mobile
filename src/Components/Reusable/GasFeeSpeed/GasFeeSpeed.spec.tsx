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
                    setSelectedFeeOption={jest.fn()}
                    isGalactica={false}
                    isBaseFeeRampingUp={false}
                    speedChangeEnabled={false}
                    availableDelegationTokens={["VTHO"]}
                    delegationToken="VTHO"
                    isEnoughBalance={true}
                    setDelegationToken={jest.fn()}
                />,
                { wrapper: TestWrapper },
            )

            expect(screen.getByTestId("LEGACY_ESTIMATED_FEE")).toHaveTextContent(
                ethers.utils.formatEther(options[opt].estimatedFee.toString),
            )
        },
    )

    it.each([GasPriceCoefficient.REGULAR, GasPriceCoefficient.MEDIUM, GasPriceCoefficient.HIGH])(
        "should select option correctly on galactica: %d",
        opt => {
            const setSelectedFeeOption = jest.fn()
            render(
                <GasFeeSpeed
                    options={options}
                    selectedFeeOption={GasPriceCoefficient.REGULAR}
                    gasUpdatedAt={Date.now()}
                    setSelectedFeeOption={setSelectedFeeOption}
                    isGalactica={true}
                    isBaseFeeRampingUp={false}
                    speedChangeEnabled={true}
                    availableDelegationTokens={["VTHO"]}
                    delegationToken="VTHO"
                    isEnoughBalance={true}
                    setDelegationToken={jest.fn()}
                />,
                { wrapper: TestWrapper },
            )

            act(() => {
                fireEvent.press(screen.getByTestId("GAS_FEE_SPEED_EDIT"))
            })

            act(() => {
                fireEvent.press(screen.getByTestId(`button-${opt}`))
            })

            expect(screen.getByTestId("GALACTICA_ESTIMATED_FEE_BS")).toHaveTextContent(
                `${ethers.utils.formatEther(options[opt].estimatedFee.toString)} VTHO`,
            )

            act(() => {
                fireEvent.press(screen.getByTestId("GAS_FEE_BOTTOM_SHEET_APPLY"))
            })

            expect(setSelectedFeeOption).toHaveBeenCalledWith(opt)
        },
    )

    it("should not see edit speed on legacy txs", () => {
        render(
            <GasFeeSpeed
                options={options}
                selectedFeeOption={GasPriceCoefficient.REGULAR}
                gasUpdatedAt={Date.now()}
                setSelectedFeeOption={jest.fn()}
                isGalactica={false}
                isBaseFeeRampingUp={false}
                speedChangeEnabled={false}
                availableDelegationTokens={["VTHO"]}
                delegationToken="VTHO"
                isEnoughBalance={true}
                setDelegationToken={jest.fn()}
            />,
            { wrapper: TestWrapper },
        )

        expect(screen.queryByTestId("GAS_FEE_SPEED_EDIT")).toBeNull()
    })

    it("should not see edit speed on galactica txs with speed change enabled set to false", () => {
        render(
            <GasFeeSpeed
                options={options}
                selectedFeeOption={GasPriceCoefficient.REGULAR}
                gasUpdatedAt={Date.now()}
                setSelectedFeeOption={jest.fn()}
                isGalactica={true}
                isBaseFeeRampingUp={false}
                speedChangeEnabled={false}
                availableDelegationTokens={["VTHO"]}
                delegationToken="VTHO"
                isEnoughBalance={true}
                setDelegationToken={jest.fn()}
            />,
            { wrapper: TestWrapper },
        )

        expect(screen.getByTestId("GAS_FEE_SPEED_EDIT")).not.toBeVisible()
    })

    it("should not see edit speed on galactica txs with speed change enabled set to true", () => {
        render(
            <GasFeeSpeed
                options={options}
                selectedFeeOption={GasPriceCoefficient.REGULAR}
                gasUpdatedAt={Date.now()}
                setSelectedFeeOption={jest.fn()}
                isGalactica={true}
                isBaseFeeRampingUp={false}
                speedChangeEnabled={true}
                availableDelegationTokens={["VTHO"]}
                delegationToken="VTHO"
                isEnoughBalance={true}
                setDelegationToken={jest.fn()}
            />,
            { wrapper: TestWrapper },
        )

        expect(screen.queryByTestId("GAS_FEE_SPEED_EDIT")).toBeVisible()
    })
})
