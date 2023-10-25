import React, { useCallback, useMemo } from "react"

import {
    BaseButtonGroupHorizontal,
    BaseIcon,
    BaseSkeleton,
    BaseSpacer,
    BaseText,
    BaseView,
} from "~Components"
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
    vthoBalance: string
}

export const GasFeeOptions = ({
    setSelectedFeeOption,
    selectedDelegationOption,
    loadingGas,
    selectedFeeOption,
    gasFeeOptions,
    isThereEnoughGas,
    vthoBalance,
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
                                flexDirection="row">
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
                        <BaseSpacer height={10} />
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
}
