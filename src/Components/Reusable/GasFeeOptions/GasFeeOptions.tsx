import React, { useCallback, useMemo } from "react"
import { ViewProps } from "react-native"
import Animated, { AnimatedProps, FadeIn, FadeOut } from "react-native-reanimated"
import { BaseButtonGroupHorizontal, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { GasPriceCoefficient, VTHO } from "~Constants"
import { useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { BaseButtonGroupHorizontalType } from "~Model"
import { DelegationType } from "~Model/Delegation"

type Props = {
    setSelectedFeeOption: (option: string) => void
    selectedDelegationOption: DelegationType
    loadingGas: boolean
    selectedFeeOption: string
    gasFeeOptions: Record<GasPriceCoefficient, string>
    isThereEnoughGas: boolean
}

export const GasFeeOptions = ({
    setSelectedFeeOption,
    selectedDelegationOption,
    selectedFeeOption,
    gasFeeOptions,
    isThereEnoughGas,
}: Props) => {
    const theme = useTheme()
    const { LL } = useI18nContext()

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
        [setSelectedFeeOption],
    )

    if (selectedDelegationOption === DelegationType.URL) {
        return (
            <>
                <BaseView flexDirection="row">
                    <GasDetailsView />
                    <BaseText typographyFont="subSubTitle">{LL.SEND_DELEGATED_FEES()}</BaseText>
                </BaseView>
            </>
        )
    } else {
        return (
            <>
                <BaseSpacer height={12} />
                <BaseSpacer height={0.5} width={"100%"} background={theme.colors.textDisabled} />
                <BaseSpacer height={12} />

                <BaseView flexDirection="row" justifyContent="space-between">
                    <GasDetailsView />
                    {!isThereEnoughGas && (
                        <GasWarningView entering={FadeIn.duration(300)} exiting={FadeOut.duration(300)} />
                    )}
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
                                        {gasFeeOptions[Number(button.id) as GasPriceCoefficient]} {VTHO.symbol}
                                    </BaseText>
                                </BaseView>
                            </BaseView>
                        )}
                    />
                </BaseView>

                {/* {!isThereEnoughGas && <GasWarningView entering={FadeInUp} exiting={FadeOutUp} />} */}
            </>
        )
    }
}

interface IGasWarningView extends AnimatedProps<ViewProps> {}

function GasWarningView(_props: IGasWarningView) {
    const { ...animatedViewProps } = _props
    const theme = useTheme()
    const { LL } = useI18nContext()

    return (
        <Animated.View {...animatedViewProps}>
            <BaseView flexDirection="row">
                <BaseIcon name="alert-circle-outline" color={theme.colors.danger} size={16} />
                <BaseSpacer width={4} />
                <BaseText typographyFont="buttonSecondary" color={theme.colors.danger}>
                    {LL.SEND_INSUFFICIENT_VTHO()}
                    {"PLACEHOLDER"}
                </BaseText>
            </BaseView>
        </Animated.View>
    )
}

function GasDetailsView() {
    const { LL } = useI18nContext()
    return (
        <BaseView mr={4}>
            <BaseText typographyFont="buttonSecondary">{LL.SEND_GAS_FEE()}</BaseText>
        </BaseView>
    )
}
