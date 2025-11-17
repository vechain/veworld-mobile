import moment from "moment"
import { PropsWithChildren, default as React, useCallback, useState } from "react"
import { StyleProp, StyleSheet, ViewStyle } from "react-native"
import Animated, { LinearTransition } from "react-native-reanimated"
import { useInterval } from "usehooks-ts"
import { BaseCard } from "~Components/Base"
import { COLORS, ColorThemeType, GasPriceCoefficient } from "~Constants"
import { useBottomSheetModal, useThemedStyles } from "~Hooks"
import { TransactionFeesResult } from "~Hooks/useTransactionFees/useTransactionFees"
import { wrapFunctionComponent } from "~Utils/ReanimatedUtils/Reanimated"
import { EditSpeedSection } from "./EditSpeedSection"
import { GalacticaEstimation } from "./GalacticaEstimation"
import { GasFeeSpeedBottomSheet } from "./GasFeeSpeedBottomSheet"
import { GasFeeTokenBottomSheet } from "./GasFeeTokenBottomSheet"
import { LegacyEstimation } from "./LegacyEstimation"

type Props = {
    options: TransactionFeesResult
    setSelectedFeeOption: (value: GasPriceCoefficient) => void
    selectedFeeOption: GasPriceCoefficient
    gasUpdatedAt: number
    isGalactica?: boolean
    isBaseFeeRampingUp: boolean
    speedChangeEnabled: boolean
    delegationToken: string
    availableDelegationTokens: string[]
    setDelegationToken: (value: string) => void
    isEnoughBalance: boolean
    hasEnoughBalanceOnAny: boolean
    isFirstTimeLoadingFees: boolean
    hasEnoughBalanceOnToken: {
        [token: string]: boolean
    }
    containerStyle?: StyleProp<ViewStyle>
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
    delegationToken,
    setDelegationToken,
    availableDelegationTokens,
    isEnoughBalance,
    hasEnoughBalanceOnAny,
    isFirstTimeLoadingFees,
    hasEnoughBalanceOnToken,
    containerStyle,
}: PropsWithChildren<Props>) => {
    const { styles } = useThemedStyles(baseStyles)

    const { onClose: speedBsOnClose, onOpen: speedBsOnOpen, ref: speedBsRef } = useBottomSheetModal()
    const { onClose: tokenBsOnClose, onOpen: tokenBsOnOpen, ref: tokenBsRef } = useBottomSheetModal()

    const [secondsRemaining, setSecondsRemaining] = useState(10)

    const intervalFn = useCallback(() => {
        const seconds = Math.floor(moment(gasUpdatedAt).add(10, "seconds").diff(moment(), "seconds"))
        setSecondsRemaining(seconds <= 0 ? 0 : seconds)
    }, [gasUpdatedAt])

    useInterval(intervalFn, 200)

    return (
        <AnimatedBaseCard
            containerStyle={[styles.cardContainer, containerStyle]}
            style={styles.card}
            layout={LinearTransition.duration(300)}>
            {isGalactica ? (
                <>
                    <GalacticaEstimation
                        options={options}
                        selectedFeeOption={selectedFeeOption}
                        secondsRemaining={secondsRemaining}
                        onDelegationTokenClicked={tokenBsOnOpen}
                        selectedDelegationToken={delegationToken}
                        isEnoughBalance={isEnoughBalance}
                        hasEnoughBalanceOnAny={hasEnoughBalanceOnAny}
                        isFirstTimeLoadingFees={isFirstTimeLoadingFees}
                    />
                    <EditSpeedSection
                        onOpen={speedBsOnOpen}
                        selectedFeeOption={selectedFeeOption}
                        speedChangeEnabled={speedChangeEnabled}
                    />
                </>
            ) : (
                <LegacyEstimation
                    options={options}
                    selectedFeeOption={selectedFeeOption}
                    onDelegationTokenClicked={tokenBsOnOpen}
                    selectedDelegationToken={delegationToken}
                    isEnoughBalance={isEnoughBalance}
                    hasEnoughBalanceOnAny={hasEnoughBalanceOnAny}
                    isFirstTimeLoadingFees={isFirstTimeLoadingFees}
                />
            )}
            {children}
            <GasFeeSpeedBottomSheet
                ref={speedBsRef}
                options={options}
                selectedFeeOption={selectedFeeOption}
                setSelectedFeeOption={setSelectedFeeOption}
                onClose={speedBsOnClose}
                isGalactica={isGalactica}
                isBaseFeeRampingUp={isBaseFeeRampingUp}
                selectedDelegationToken={delegationToken}
            />
            <GasFeeTokenBottomSheet
                ref={tokenBsRef}
                availableTokens={availableDelegationTokens}
                onClose={tokenBsOnClose}
                selectedToken={delegationToken}
                setSelectedToken={setDelegationToken}
                hasEnoughBalanceOnToken={hasEnoughBalanceOnToken}
            />
        </AnimatedBaseCard>
    )
}

const baseStyles = (theme: ColorThemeType) => {
    return StyleSheet.create({
        section: {
            padding: 16,
        },
        cardContainer: {
            backgroundColor: theme.isDark ? COLORS.PURPLE : COLORS.WHITE,
            marginTop: 16,
        },
        card: {
            flexDirection: "column",
            padding: 0,
        },
    })
}
