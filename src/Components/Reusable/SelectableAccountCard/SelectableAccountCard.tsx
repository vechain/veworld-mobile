import { default as React, useCallback, useEffect, useMemo } from "react"
import { StyleProp, StyleSheet, TouchableOpacity, ViewProps, ViewStyle } from "react-native"
import Animated, {
    interpolate,
    interpolateColor,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated"
import { AccountIcon, BaseSkeleton, BaseText, BaseView } from "~Components"
import { COLORS, ColorThemeType, typography, VET, VTHO } from "~Constants"
import { useThemedStyles, useVns } from "~Hooks"
import { useSimplifiedTokenBalance } from "~Hooks/useTokenBalance"
import { useTotalFiatBalance } from "~Hooks/useTotalFiatBalance"
import { AccountWithDevice, WatchedAccount } from "~Model"
import { selectBalanceVisible, selectCurrency, useAppSelector } from "~Storage/Redux"
import { AddressUtils, BigNutils } from "~Utils"
import FontUtils from "~Utils/FontUtils"

type Props<TAccountType extends AccountWithDevice | WatchedAccount = AccountWithDevice> = {
    account: TAccountType
    onPress?: (account: TAccountType) => void
    selected?: boolean
    containerStyle?: StyleProp<ViewStyle>
    balanceToken?: "VTHO" | "VET" | "FIAT"
    disabled?: boolean
    onAnimationFinished?: () => void
} & Pick<ViewProps, "testID" | "children">

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity)

export const SelectableAccountCard = <TAccountType extends AccountWithDevice | WatchedAccount = AccountWithDevice>({
    account,
    onPress,
    selected,
    containerStyle,
    testID,
    children,
    balanceToken = "VET",
    disabled,
    onAnimationFinished,
}: Props<TAccountType>) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const currency = useAppSelector(selectCurrency)
    const { data: vetBalance } = useSimplifiedTokenBalance({
        tokenAddress: VET.address,
        address: account.address,
        enabled: balanceToken === "VET",
    })
    const { data: vthoBalance } = useSimplifiedTokenBalance({
        tokenAddress: VTHO.address,
        address: account.address,
        enabled: balanceToken === "VTHO",
    })
    const { renderedBalance: renderedFiatBalance, isLoading } = useTotalFiatBalance({
        address: account.address,
        enabled: balanceToken === "FIAT",
    })
    const isBalanceVisible = useAppSelector(selectBalanceVisible)
    const { name: vnsName, address: vnsAddress } = useVns({
        name: "",
        address: account.address,
    })
    const selectedAnimationValue = useSharedValue(Number(selected ?? false))
    //`useSharedValue` instead of `useRef` due to this bug on react-native-reanimated
    //https://github.com/software-mansion/react-native-reanimated/issues/3670
    const userClicked = useSharedValue(false)

    useEffect(() => {
        selectedAnimationValue.value = withTiming(Number(selected ?? false), {}, finished => {
            "worklet"
            if (finished && userClicked.value && onAnimationFinished) {
                userClicked.value = false
                runOnJS(onAnimationFinished)()
            }
        })
    }, [onAnimationFinished, selected, selectedAnimationValue, userClicked, userClicked.value])

    const balance = useMemo(() => {
        if (!isBalanceVisible) {
            return "••••"
        }

        if (balanceToken === "FIAT") return renderedFiatBalance

        return BigNutils(balanceToken === "VET" ? vetBalance : vthoBalance)
            .toHuman(VET.decimals)
            .toTokenFormat_string(2)
    }, [balanceToken, isBalanceVisible, renderedFiatBalance, vetBalance, vthoBalance])

    const rootAnimatedStyles = useAnimatedStyle(() => {
        const selectedColor = theme.isDark ? COLORS.LIME_GREEN : COLORS.PRIMARY_800
        const borderColor = interpolateColor(selectedAnimationValue.value, [0, 1], ["transparent", selectedColor])
        const paddingVertical = interpolate(selectedAnimationValue.value, [0, 1], [12, 20])
        if (selected)
            return {
                borderWidth: withTiming(2),
                borderColor,
                paddingHorizontal: withTiming(12),
                paddingVertical,
            }
        return {
            borderWidth: withTiming(1),
            borderColor,
            paddingHorizontal: withTiming(12),
            paddingVertical,
        }
    }, [selected, theme.isDark])

    const textAnimatedStyles = useAnimatedStyle(() => {
        const baseTypography = typography.defaults.captionSemiBold
        const selectedTypography = typography.defaults.bodySemiBold

        const unselectedColor = theme.isDark ? COLORS.GREY_100 : COLORS.PRIMARY_800

        const color = interpolateColor(selectedAnimationValue.value, [0, 1], [unselectedColor, theme.colors.title])
        const fontSize = FontUtils.fontWorklet(
            interpolate(selectedAnimationValue.value, [0, 1], [baseTypography.fontSize, selectedTypography.fontSize]),
        )

        if (selected)
            return {
                fontFamily: selectedTypography.fontFamily,
                fontSize,
                fontWeight: selectedTypography.fontWeight,
                color: color,
            }

        return {
            fontFamily: baseTypography.fontFamily,
            fontSize,
            fontWeight: baseTypography.fontWeight,
            color: color,
        }
    }, [selected, theme.colors.title, theme.isDark])

    const _onPress = useCallback(() => {
        userClicked.value = true
        onPress?.(account)
    }, [account, onPress, userClicked])

    return (
        <BaseView w={100} flexDirection="row" style={containerStyle}>
            <AnimatedTouchableOpacity
                disabled={disabled}
                testID={testID}
                onPress={_onPress}
                style={[styles.container, rootAnimatedStyles, containerStyle]}
                accessibilityValue={{ text: selected ? "selected" : "not selected" }}>
                <BaseView flexDirection="row" gap={12} alignItems="center" flex={1}>
                    <AccountIcon account={account} size={32} />
                    <BaseView flexDirection="column" gap={4}>
                        <Animated.Text numberOfLines={1} style={textAnimatedStyles}>
                            {vnsName || account.alias}
                        </Animated.Text>
                        <BaseText
                            typographyFont="captionRegular"
                            color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_500}>
                            {AddressUtils.humanAddress(vnsAddress || account.address)}
                        </BaseText>
                    </BaseView>
                </BaseView>
                <BaseView flexDirection="column">
                    {isLoading ? (
                        <BaseSkeleton
                            animationDirection="horizontalLeft"
                            boneColor={theme.colors.skeletonBoneColor}
                            highlightColor={theme.colors.skeletonHighlightColor}
                            width={40}
                            height={14}
                        />
                    ) : (
                        <BaseText
                            color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600}
                            typographyFont="captionMedium"
                            align="right">
                            {balance}
                        </BaseText>
                    )}

                    <BaseText
                        color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500}
                        typographyFont="captionMedium"
                        align="right">
                        {balanceToken === "FIAT" ? currency : balanceToken}
                    </BaseText>
                </BaseView>
                {children}
            </AnimatedTouchableOpacity>
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            flex: 1,
            alignItems: "center",
            flexDirection: "row",
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.isDark ? theme.colors.transparent : COLORS.GREY_200,
            gap: 12,
            //New
            justifyContent: "space-between",
            backgroundColor: theme.colors.card,
        },
        selectedContainer: {
            borderWidth: 2,
            borderColor: theme.isDark ? COLORS.LIME_GREEN : COLORS.PRIMARY_800,
        },
        innerTouchable: {
            borderRadius: 8,
        },
    })
