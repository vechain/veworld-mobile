import React, { useMemo } from "react"
import { StyleSheet, TouchableOpacity } from "react-native"
import Animated, {
    interpolateColor,
    LinearTransition,
    useAnimatedStyle,
    withTiming,
    ZoomIn,
    ZoomOut,
} from "react-native-reanimated"
import { BaseIcon, BaseSkeleton, BaseSpacer, BaseText, BaseView } from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useTotalFiatBalance } from "~Hooks/useTotalFiatBalance"
import { useI18nContext } from "~i18n"
import { LedgerAccount } from "~Model"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import { AddressUtils } from "~Utils"

type Props = {
    account: LedgerAccount
    index: number
    isSelected: boolean
    onAccountClick: () => void
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity)

const LedgerAccountBox: React.FC<Props> = ({ account, index, isSelected, onAccountClick }) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const currency = useAppSelector(selectCurrency)

    const { renderedBalance: renderedFiatBalance, isLoading } = useTotalFiatBalance({
        address: account.address,
    })

    const containerAnimatedStyles = useAnimatedStyle(() => {
        const unselectedColor = theme.isDark ? COLORS.TRANSPARENT : COLORS.GREY_200
        const selectedColor = theme.isDark ? COLORS.LIME_GREEN : COLORS.PRIMARY_800
        return {
            borderWidth: withTiming(isSelected ? 2 : 1, { duration: 250 }),
            borderColor: interpolateColor(isSelected ? 1 : 0, [0, 1], [unselectedColor, selectedColor]),
        }
    }, [isSelected, theme.isDark])

    const textColor = useMemo(() => {
        const selectedColor = theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE
        const unselectedColor = theme.isDark ? COLORS.WHITE : COLORS.GREY_600
        return interpolateColor(isSelected ? 1 : 0, [0, 1], [unselectedColor, selectedColor])
    }, [isSelected, theme.isDark])

    return (
        <AnimatedTouchableOpacity
            testID={`LEDGER_ACCOUNT_BOX_${account.address}`}
            key={account.address}
            onPress={onAccountClick}
            activeOpacity={0.95}
            style={[styles.container, containerAnimatedStyles]}
            layout={LinearTransition}>
            <Animated.View style={styles.innerContainer} layout={LinearTransition}>
                <BaseView flexDirection="column" alignItems="flex-start">
                    <BaseText typographyFont="bodyMedium" color={textColor}>
                        {LL.WALLET_LABEL_ACCOUNT()} {index + 1}
                    </BaseText>
                    <BaseSpacer height={4} />
                    <BaseText typographyFont="captionMedium" color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_500}>
                        {AddressUtils.humanAddress(account.address)}
                    </BaseText>
                </BaseView>
                <Animated.View style={styles.fiatBalanceContainer} layout={LinearTransition}>
                    {isLoading ? (
                        <BaseSkeleton
                            animationDirection="horizontalLeft"
                            boneColor={theme.colors.skeletonBoneColor}
                            highlightColor={theme.colors.skeletonHighlightColor}
                            width={40}
                            height={14}
                        />
                    ) : (
                        <>
                            <BaseText
                                color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600}
                                typographyFont="caption"
                                align="right">
                                {renderedFiatBalance}
                            </BaseText>
                            <BaseText
                                color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600}
                                typographyFont="caption"
                                align="right">
                                {currency}
                            </BaseText>
                        </>
                    )}
                </Animated.View>
            </Animated.View>
            {isSelected && (
                <Animated.View entering={ZoomIn} exiting={ZoomOut} layout={LinearTransition}>
                    <BaseIcon name="icon-check" color={theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE} size={20} />
                </Animated.View>
            )}
        </AnimatedTouchableOpacity>
    )
}

export default LedgerAccountBox

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            borderRadius: 12,
            overflow: "hidden",
            backgroundColor: theme.colors.card,
            padding: 16,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
        },
        innerContainer: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flex: 1,
        },
        fiatBalanceContainer: {
            flexDirection: "column",
            alignItems: "flex-end",
            justifyContent: "center",
        },
    })
