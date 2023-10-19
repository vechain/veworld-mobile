import React, { useCallback, useMemo } from "react"
import { useTheme } from "~Hooks"
import { FormattingUtils, GasUtils } from "~Utils"
import { GasPriceCoefficient, VTHO } from "~Constants"
import {
    BaseButtonGroupHorizontal,
    BaseIcon,
    BaseSkeleton,
    BaseSpacer,
    BaseText,
    BaseView,
} from "~Components"
import {
    selectVthoTokenWithBalanceByAccount,
    useAppSelector,
} from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import { BaseButtonGroupHorizontalType, EstimateGasResult } from "~Model"
import { BigNumber } from "bignumber.js"
import { DelegationType } from "~Model/Delegation"
import { StyleSheet } from "react-native"

export const useRenderGas = ({
    loadingGas,
    selectedDelegationOption,
    gas,
    tokenSymbol,
    amount,
    accountAddress,
}: {
    loadingGas: boolean
    selectedDelegationOption: DelegationType
    gas: EstimateGasResult | undefined
    tokenSymbol?: string
    amount?: string
    accountAddress: string
}) => {
    const theme = useTheme()
    const { LL } = useI18nContext()

    const vtho = useAppSelector(state =>
        selectVthoTokenWithBalanceByAccount(state, accountAddress),
    )
    const [selectedFeeOption, setSelectedFeeOption] = React.useState<string>(
        String(GasPriceCoefficient.REGULAR),
    )

    const gasFeeButtons: Array<BaseButtonGroupHorizontalType> = useMemo(() => {
        return [
            {
                id: String(GasPriceCoefficient.REGULAR),
                label: LL.SEND_FEE_REGULAR(),
                icon: "walk",
            },
            {
                id: String(GasPriceCoefficient.MEDIUM),
                label: LL.SEND_FEE_MEDIUM(),
                icon: "car-outline",
            },
            {
                id: String(GasPriceCoefficient.HIGH),
                label: LL.SEND_FEE_HIGH(),
                icon: "airplane",
            },
        ]
    }, [LL])

    const handleSelectFeeOption = useCallback(
        (button: BaseButtonGroupHorizontalType) => {
            setSelectedFeeOption(button.id)
        },
        [],
    )

    const calculateFeeByCoefficient = useCallback(
        (coefficient: GasPriceCoefficient) =>
            GasUtils.gasToVtho({
                gas: new BigNumber(gas?.gas || 0),
                baseGasPrice: new BigNumber(gas?.baseGasPrice || "0"),
                gasPriceCoefficient: coefficient,
                decimals: 2,
            }),
        [gas?.baseGasPrice, gas?.gas],
    )

    const gasFeeOptions = useMemo(
        () => ({
            [GasPriceCoefficient.REGULAR]: calculateFeeByCoefficient(
                GasPriceCoefficient.REGULAR,
            ),
            [GasPriceCoefficient.MEDIUM]: calculateFeeByCoefficient(
                GasPriceCoefficient.MEDIUM,
            ),
            [GasPriceCoefficient.HIGH]: calculateFeeByCoefficient(
                GasPriceCoefficient.HIGH,
            ),
        }),
        [calculateFeeByCoefficient],
    )

    const vthoGasFee =
        gasFeeOptions[Number(selectedFeeOption) as GasPriceCoefficient]

    const vthoBalance = FormattingUtils.scaleNumberDown(
        vtho.balance.balance,
        vtho.decimals,
        2,
    )

    const isThereEnoughGas = useMemo(() => {
        let leftVtho = new BigNumber(vthoBalance)
        if (tokenSymbol === VTHO.symbol && amount) {
            leftVtho = leftVtho.minus(amount)
        }
        return vthoGasFee && leftVtho.gte(vthoGasFee)
    }, [amount, vthoGasFee, tokenSymbol, vthoBalance])

    const RenderGas = useCallback(() => {
        if (loadingGas) {
            return (
                <BaseSkeleton
                    animationDirection="horizontalLeft"
                    boneColor={theme.colors.skeletonBoneColor}
                    highlightColor={theme.colors.skeletonHighlightColor}
                    layout={[
                        {
                            flexDirection: "column",
                            alignItems: "flex-start",
                            width: "100%",
                            children: [
                                {
                                    width: "40%",
                                    height: 18,
                                },
                            ],
                        },
                    ]}
                />
            )
        }

        if (selectedDelegationOption === DelegationType.URL) {
            return (
                <BaseText typographyFont="subSubTitle">
                    {LL.SEND_DELEGATED_FEES()}
                </BaseText>
            )
        } else {
            return (
                <>
                    <BaseView pt={8}>
                        <BaseButtonGroupHorizontal
                            selectedButtonIds={[selectedFeeOption]}
                            buttons={gasFeeButtons}
                            action={handleSelectFeeOption}
                            renderButton={(button, textColor) => (
                                <BaseView
                                    justifyContent="center"
                                    alignItems="center"
                                    flexDirection="row"
                                    style={styles.button}>
                                    {button.icon && (
                                        <BaseIcon
                                            size={18}
                                            name={button.icon}
                                            color={textColor}
                                        />
                                    )}
                                    <BaseView px={5}>
                                        <BaseText
                                            color={textColor}
                                            typographyFont="smallButtonPrimary">
                                            {button.label}
                                        </BaseText>
                                        <BaseSpacer height={4} />
                                        <BaseText
                                            color={textColor}
                                            typographyFont="smallCaptionMedium">
                                            {
                                                gasFeeOptions[
                                                    Number(
                                                        button.id,
                                                    ) as GasPriceCoefficient
                                                ]
                                            }{" "}
                                            {VTHO.symbol}
                                        </BaseText>
                                    </BaseView>
                                </BaseView>
                            )}
                        />
                    </BaseView>

                    {!isThereEnoughGas && (
                        <>
                            <BaseSpacer height={8} />
                            <BaseView flexDirection="row">
                                <BaseIcon
                                    name="alert-circle-outline"
                                    color={theme.colors.danger}
                                    size={16}
                                />
                                <BaseSpacer width={4} />
                                <BaseText
                                    typographyFont="buttonSecondary"
                                    color={theme.colors.danger}>
                                    {LL.SEND_INSUFFICIENT_VTHO()} {vthoBalance}{" "}
                                    {VTHO.symbol}
                                </BaseText>
                            </BaseView>
                        </>
                    )}
                </>
            )
        }
    }, [
        loadingGas,
        selectedDelegationOption,
        theme.colors.skeletonBoneColor,
        theme.colors.skeletonHighlightColor,
        theme.colors.danger,
        LL,
        selectedFeeOption,
        gasFeeButtons,
        handleSelectFeeOption,
        isThereEnoughGas,
        vthoBalance,
        gasFeeOptions,
    ])

    return {
        RenderGas,
        isThereEnoughGas,
        vthoGasFee,
        vthoBalance,
        gasPriceCoef: Number(selectedFeeOption),
    }
}

const styles = StyleSheet.create({
    button: {
        marginBottom: -5,
    },
})
