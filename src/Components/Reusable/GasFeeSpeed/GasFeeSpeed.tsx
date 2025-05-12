import moment from "moment"
import { PropsWithChildren, default as React, useCallback, useState } from "react"
import { StyleSheet } from "react-native"
import Animated, { LinearTransition } from "react-native-reanimated"
import { useInterval } from "usehooks-ts"
import { BaseCard, BaseText, BaseView } from "~Components/Base"
import { ColorThemeType, GasPriceCoefficient } from "~Constants"
import { useBottomSheetModal, useThemedStyles } from "~Hooks"
import { TransactionFeesResult } from "~Hooks/useTransactionFees/useTransactionFees"
import { useI18nContext } from "~i18n"
import { wrapFunctionComponent } from "~Utils/ReanimatedUtils/Reanimated"
import { EditSpeedSection } from "./EditSpeedSection"
import { GalacticaEstimation } from "./GalacticaEstimation"
import { GasFeeSpeedBottomSheet } from "./GasFeeSpeedBottomSheet"
import { LegacyEstimation } from "./LegacyEstimation"

type Props = {
    options: TransactionFeesResult
    setSelectedFeeOption: (value: GasPriceCoefficient) => void
    selectedFeeOption: GasPriceCoefficient
    onRefreshFee: () => void
    gasUpdatedAt: number
    isGalactica?: boolean
    isBaseFeeRampingUp: boolean
    speedChangeEnabled: boolean
}

const AnimatedBaseCard = Animated.createAnimatedComponent(wrapFunctionComponent(BaseCard))

export const GasFeeSpeed = ({
    options,
    setSelectedFeeOption,
    selectedFeeOption,
    gasUpdatedAt,
    isGalactica,
    children,
    isBaseFeeRampingUp,
    speedChangeEnabled,
}: PropsWithChildren<Props>) => {
    const { LL } = useI18nContext()
    const { theme, styles } = useThemedStyles(baseStyles)

    const { onClose, onOpen, ref } = useBottomSheetModal()

    const [secondsRemaining, setSecondsRemaining] = useState(10)

    const intervalFn = useCallback(() => {
        const seconds = Math.floor(moment(gasUpdatedAt).add(10, "seconds").diff(moment(), "seconds"))
        setSecondsRemaining(seconds <= 0 ? 0 : seconds)
    }, [gasUpdatedAt])

    useInterval(intervalFn, 500)

    return (
        <BaseView flexDirection="column" gap={16} mt={16}>
            <BaseView
                w={100}
                justifyContent={isGalactica ? "space-between" : "flex-start"}
                alignItems="center"
                flexDirection="row">
                <BaseText typographyFont="subSubTitleBold" color={theme.colors.text}>
                    {LL.TRANSACTION_FEE()}
                </BaseText>
                {secondsRemaining <= 3 && isGalactica && (
                    <BaseView flexDirection="row" gap={4} alignItems="center">
                        <BaseText typographyFont="bodyMedium" color={theme.colors.textLight} lineHeight={20}>
                            {LL.UPDATING_IN()}
                        </BaseText>
                        <BaseText typographyFont="bodySemiBold" color={theme.colors.textLight} lineHeight={20}>
                            {LL.ONLY_SECONDS({ seconds: secondsRemaining })}
                        </BaseText>
                    </BaseView>
                )}
            </BaseView>
            <AnimatedBaseCard
                containerStyle={styles.cardContainer}
                style={styles.card}
                layout={LinearTransition.duration(300)}>
                {isGalactica ? (
                    <>
                        <EditSpeedSection
                            onOpen={onOpen}
                            selectedFeeOption={selectedFeeOption}
                            speedChangeEnabled={speedChangeEnabled}
                        />
                        <GalacticaEstimation
                            options={options}
                            selectedFeeOption={selectedFeeOption}
                            secondsRemaining={secondsRemaining}
                        />
                    </>
                ) : (
                    <LegacyEstimation options={options} selectedFeeOption={selectedFeeOption} />
                )}
                {children}
                <GasFeeSpeedBottomSheet
                    ref={ref}
                    options={options}
                    selectedFeeOption={selectedFeeOption}
                    setSelectedFeeOption={setSelectedFeeOption}
                    onClose={onClose}
                    isGalactica={isGalactica}
                    isBaseFeeRampingUp={isBaseFeeRampingUp}
                />
            </AnimatedBaseCard>
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) => {
    return StyleSheet.create({
        cardContainer: {
            backgroundColor: theme.colors.assetDetailsCard.background,
        },
        card: {
            flexDirection: "column",
            padding: 0,
        },
    })
}
