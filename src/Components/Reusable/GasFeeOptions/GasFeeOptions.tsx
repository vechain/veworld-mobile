import React, { useCallback, useMemo } from "react"
import { StyleSheet, ViewProps } from "react-native"
import Animated, { AnimatedProps, FadeIn, FadeInLeft, FadeInRight, FadeOut } from "react-native-reanimated"
import { BaseButtonGroupHorizontal, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { GasFeeOption, GasPriceCoefficient, VTHO } from "~Constants"
import { useTheme } from "~Hooks"
import { useFormatFiat } from "~Hooks/useFormatFiat"
import { useI18nContext } from "~i18n"
import { BaseButtonGroupHorizontalType } from "~Model"
import { DelegationType } from "~Model/Delegation"
import { BigNutils, BigNumberUtils } from "~Utils"

type Props = {
    setSelectedFeeOption: (option: string) => void
    selectedDelegationOption: DelegationType
    loadingGas: boolean
    selectedFeeOption: string
    gasFeeOptions: Record<GasPriceCoefficient, GasFeeOption>
    isThereEnoughGas: boolean
    txCostTotal: string
    totalBalance: string
    isDelegated?: boolean
}

export const GasFeeOptions = ({
    setSelectedFeeOption,
    selectedDelegationOption,
    selectedFeeOption,
    gasFeeOptions,
    isThereEnoughGas,
    txCostTotal,
    totalBalance,
    isDelegated,
}: Props) => {
    const theme = useTheme()
    const { LL } = useI18nContext()

    const { formatValue } = useFormatFiat()

    const gasFeeButtons: Array<BaseButtonGroupHorizontalType> = useMemo(() => {
        return [
            {
                id: String(GasPriceCoefficient.REGULAR),
                label: LL.SEND_FEE_REGULAR(),
                icon: "icon-person-standing",
            },
            {
                id: String(GasPriceCoefficient.MEDIUM),
                label: LL.SEND_FEE_MEDIUM(),
                icon: "icon-car",
            },
            {
                id: String(GasPriceCoefficient.HIGH),
                label: LL.SEND_FEE_HIGH(),
                icon: "icon-airplay",
            },
        ]
    }, [LL])

    const handleSelectFeeOption = useCallback(
        (button: BaseButtonGroupHorizontalType) => {
            setSelectedFeeOption(button.id)
        },
        [setSelectedFeeOption],
    )

    const computedGasDifference = useMemo(() => BigNutils(txCostTotal).minus(totalBalance), [totalBalance, txCostTotal])

    if (selectedDelegationOption === DelegationType.URL) {
        return (
            <>
                <BaseSpacer height={12} />
                <BaseSpacer height={0.5} width="100%" background={theme.colors.textDisabled} />
                <BaseSpacer height={12} />

                <BaseView flexDirection="row" justifyContent="space-between">
                    <GasDetailsView />

                    <GasWarningView
                        entering={FadeIn.duration(300)}
                        exiting={FadeOut.duration(300)}
                        isDelegattion={selectedDelegationOption === DelegationType.URL}
                    />
                </BaseView>

                <BaseSpacer height={6} />
            </>
        )
    } else {
        return (
            <>
                <BaseSpacer height={12} />
                <BaseSpacer height={0.5} width="100%" background={theme.colors.textDisabled} />
                <BaseSpacer height={12} />

                <BaseView flexDirection="row" justifyContent="space-between">
                    {/* Show when there is enough gas OR when the user is delegating to another account*/}
                    {isThereEnoughGas || isDelegated ? (
                        <GasDetailsView
                            entering={FadeInLeft.springify(300).mass(1)}
                            exiting={FadeOut.springify(300).mass(1)}
                        />
                    ) : null}
                    {/* Show when there is not enough gas AND the user is not delegating to another account*/}
                    {!isThereEnoughGas && !isDelegated ? (
                        <GasWarningView
                            entering={FadeInRight.springify(300).mass(1)}
                            exiting={FadeOut.springify(300).mass(1)}
                            computedGasDifference={computedGasDifference}
                        />
                    ) : null}
                </BaseView>

                <BaseSpacer height={6} />

                <BaseView pt={8}>
                    <BaseButtonGroupHorizontal
                        selectedButtonIds={[selectedFeeOption]}
                        buttons={gasFeeButtons}
                        action={handleSelectFeeOption}
                        renderButton={(button, textColor) => (
                            <BaseView justifyContent="center" alignItems="center" flexDirection="row">
                                {button.icon && <BaseIcon size={18} name={button.icon} color={textColor} />}
                                <BaseView px={5}>
                                    <BaseText color={textColor} typographyFont="smallButtonPrimary">
                                        {button.label}
                                    </BaseText>
                                    <BaseSpacer height={4} />
                                    <BaseText color={textColor} typographyFont="smallCaptionMedium">
                                        {formatValue(
                                            parseFloat(gasFeeOptions[Number(button.id) as GasPriceCoefficient].gasFee),
                                        )}{" "}
                                        {VTHO.symbol}
                                    </BaseText>
                                </BaseView>
                            </BaseView>
                        )}
                    />
                </BaseView>
            </>
        )
    }
}

interface IGasWarningView extends AnimatedProps<ViewProps> {
    isDelegattion?: boolean
    computedGasDifference?: BigNumberUtils
}

function GasWarningView(props: IGasWarningView) {
    const { ...animatedViewProps } = props
    const theme = useTheme()
    const { LL } = useI18nContext()

    const notEnoughGasWarning = useMemo(
        () =>
            LL.SEND_INSUFFICIENT_VTHO() +
            " " +
            BigNutils(props.computedGasDifference?.toString ?? "0")
                .toHuman(VTHO.decimals)
                .toTokenFormat_string(2),
        [LL, props.computedGasDifference],
    )

    return (
        <Animated.View {...animatedViewProps}>
            <BaseView flexDirection="row">
                <BaseIcon
                    name="icon-alert-circle"
                    color={props.isDelegattion ? theme.colors.success : theme.colors.danger}
                    size={16}
                />
                <BaseSpacer width={4} />
                <BaseText
                    typographyFont="buttonSecondary"
                    color={props.isDelegattion ? theme.colors.success : theme.colors.danger}>
                    {props.isDelegattion ? LL.SEND_DELEGATED_FEES() : notEnoughGasWarning}
                </BaseText>
            </BaseView>
        </Animated.View>
    )
}

interface IGasDetailsView extends AnimatedProps<ViewProps> {}

function GasDetailsView(props: IGasDetailsView) {
    const { ...animatedViewProps } = props

    const { LL } = useI18nContext()
    return (
        <Animated.View style={baseStyles.animatedViewCOntainer} {...animatedViewProps}>
            <BaseText typographyFont="buttonSecondary">{LL.SEND_GAS_FEE()}</BaseText>
        </Animated.View>
    )
}

const baseStyles = StyleSheet.create({
    animatedViewCOntainer: {
        marginRight: 4,
    },
})
