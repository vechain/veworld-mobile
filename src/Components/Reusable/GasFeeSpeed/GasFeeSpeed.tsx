import moment from "moment"
import { PropsWithChildren, default as React, useCallback, useState } from "react"
import { StyleSheet } from "react-native"
import Animated, { LinearTransition } from "react-native-reanimated"
import { useInterval } from "usehooks-ts"
import { BaseCard } from "~Components/Base"
import { ColorThemeType, GasPriceCoefficient, VTHO } from "~Constants"
import { useBottomSheetModal, useThemedStyles } from "~Hooks"
import { TransactionFeesResult } from "~Hooks/useTransactionFees/useTransactionFees"
import { wrapFunctionComponent } from "~Utils/ReanimatedUtils/Reanimated"
import { EditSpeedSection } from "./EditSpeedSection"
import { GalacticaEstimation } from "./GalacticaEstimation"
import { GasFeeSpeedBottomSheet } from "./GasFeeSpeedBottomSheet"
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
}: PropsWithChildren<Props>) => {
    const { styles } = useThemedStyles(baseStyles)

    const { onClose, onOpen, ref } = useBottomSheetModal()

    const [secondsRemaining, setSecondsRemaining] = useState(10)

    const intervalFn = useCallback(() => {
        const seconds = Math.floor(moment(gasUpdatedAt).add(10, "seconds").diff(moment(), "seconds"))
        setSecondsRemaining(seconds <= 0 ? 0 : seconds)
    }, [gasUpdatedAt])

    useInterval(intervalFn, 200)

    const onDelegationTokenClicked = useCallback(() => {
        setDelegationToken("")
    }, [setDelegationToken])

    return (
        <AnimatedBaseCard
            containerStyle={styles.cardContainer}
            style={styles.card}
            layout={LinearTransition.duration(300)}>
            {isGalactica && delegationToken === VTHO.symbol ? (
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
                        onDelegationTokenClicked={onDelegationTokenClicked}
                    />
                </>
            ) : (
                <>
                    {delegationToken !== VTHO.symbol && (
                        <EditSpeedSection
                            onOpen={onOpen}
                            selectedFeeOption={selectedFeeOption}
                            speedChangeEnabled={speedChangeEnabled}
                        />
                    )}
                    <LegacyEstimation
                        options={options}
                        selectedFeeOption={selectedFeeOption}
                        onDelegationTokenClicked={onDelegationTokenClicked}
                    />
                </>
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
    )
}

const baseStyles = (theme: ColorThemeType) => {
    return StyleSheet.create({
        section: {
            padding: 16,
        },
        cardContainer: {
            backgroundColor: theme.colors.assetDetailsCard.background,
            marginTop: 16,
        },
        card: {
            flexDirection: "column",
            padding: 0,
        },
    })
}
