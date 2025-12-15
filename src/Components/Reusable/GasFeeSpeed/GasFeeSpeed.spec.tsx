import { act, fireEvent, render, screen } from "@testing-library/react-native"
import { ethers } from "ethers"
import React, { PropsWithChildren } from "react"
import { B3TR, GasPriceCoefficient, VOT3, VTHO } from "~Constants"
import { TransactionFeesResult } from "~Hooks/useTransactionFees"
import { RootState } from "~Storage/Redux/Types"
import { TestWrapper } from "~Test"
import { BigNutils } from "~Utils"
import { GasFeeSpeed } from "./GasFeeSpeed"

const mockOfficialTokens = [
    {
        symbol: "VTHO",
        name: "Vethor",
        address: "0x0000000000000000000000000000456e65726779",
        decimals: 18,
        custom: false,
        icon: VTHO.icon,
        desc: "VTHO description from registry",
        links: {
            website: "https://www.vechain.org",
            twitter: "https://twitter.com/vechainofficial",
        },
    },
    {
        symbol: "B3TR",
        name: "B3TR",
        address: "0x5ef79995FE8a89e0812330E4378eB2660ceDe699",
        decimals: 18,
        custom: false,
        icon: B3TR.icon,
        desc: "B3TR description from registry",
        links: {
            website: "https://b3tr.com",
            twitter: "https://twitter.com/b3tr",
        },
    },
    {
        symbol: "VOT3",
        name: "VOT3",
        address: "0x76Ca782B59C74d088C7D2Cce2f211BC00836c602",
        decimals: 18,
        custom: false,
        icon: VOT3.icon,
        desc: "VOT3 description from registry",
        links: {
            website: "https://vot3.com",
        },
    },
]

const PreloadedWrapper = ({ children, preloadedState }: PropsWithChildren<{ preloadedState: Partial<RootState> }>) => {
    return (
        <TestWrapper
            preloadedState={{
                tokens: {
                    tokens: {
                        mainnet: {
                            custom: {},
                            officialTokens: mockOfficialTokens,
                            suggestedTokens: [],
                        },
                        testnet: {
                            custom: {},
                            officialTokens: [],
                            suggestedTokens: [],
                        },
                        other: {
                            custom: {},
                            officialTokens: [],
                            suggestedTokens: [],
                        },
                        solo: {
                            custom: {},
                            officialTokens: [],
                            suggestedTokens: [],
                        },
                    },
                },
                ...preloadedState,
            }}>
            {children}
        </TestWrapper>
    )
}

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
                    hasEnoughBalanceOnAny
                    isFirstTimeLoadingFees={false}
                    hasEnoughBalanceOnToken={{ VTHO: true }}
                />,
                { wrapper: PreloadedWrapper },
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
                    hasEnoughBalanceOnAny
                    isFirstTimeLoadingFees={false}
                    hasEnoughBalanceOnToken={{ VTHO: true }}
                />,
                { wrapper: PreloadedWrapper },
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
                hasEnoughBalanceOnAny
                isFirstTimeLoadingFees={false}
                hasEnoughBalanceOnToken={{ VTHO: true }}
            />,
            { wrapper: PreloadedWrapper },
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
                hasEnoughBalanceOnAny
                isFirstTimeLoadingFees={false}
                hasEnoughBalanceOnToken={{ VTHO: true }}
            />,
            { wrapper: PreloadedWrapper },
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
                hasEnoughBalanceOnAny
                isFirstTimeLoadingFees={false}
                hasEnoughBalanceOnToken={{ VTHO: true }}
            />,
            { wrapper: PreloadedWrapper },
        )

        expect(screen.queryByTestId("GAS_FEE_SPEED_EDIT")).toBeVisible()
    })
})
