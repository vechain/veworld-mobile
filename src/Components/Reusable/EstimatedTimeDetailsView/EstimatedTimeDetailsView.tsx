import React, { useMemo } from "react"
import { BaseSpacer, BaseText } from "~Components/Base"
import { GasPriceCoefficient } from "~Constants"
import { useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"

export function EstimatedTimeDetailsView({ selectedFeeOption }: Readonly<{ selectedFeeOption: string }>) {
    const { LL } = useI18nContext()
    const theme = useTheme()

    const computeEstimatedTime = useMemo(() => {
        switch (selectedFeeOption) {
            case GasPriceCoefficient.REGULAR.toString():
                return LL.SEND_LESS_THAN_1_MIN()
            case GasPriceCoefficient.MEDIUM.toString():
                return LL.SEND_LESS_THAN_30_SECONDS()
            case GasPriceCoefficient.HIGH.toString():
                return LL.SEND_LESS_THAN_A_MOMENT()
            default:
                return LL.SEND_LESS_THAN_1_MIN()
        }
    }, [LL, selectedFeeOption])

    return (
        <>
            <BaseSpacer height={12} />
            <BaseSpacer height={0.5} width={"100%"} background={theme.colors.textDisabled} />
            <BaseSpacer height={12} />
            <BaseText typographyFont="buttonSecondary">{LL.SEND_ESTIMATED_TIME()}</BaseText>
            <BaseSpacer height={6} />
            <BaseText typographyFont="subSubTitle">{computeEstimatedTime}</BaseText>
        </>
    )
}
