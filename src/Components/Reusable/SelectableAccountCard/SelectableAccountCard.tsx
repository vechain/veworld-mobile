import { memo, default as React, useEffect, useMemo } from "react"
import { StyleProp, StyleSheet, TouchableOpacity, ViewProps, ViewStyle } from "react-native"
import Animated, {
    interpolateColor,
    LinearTransition,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated"
import { AccountIcon, BaseSkeleton, BaseText, BaseView, LedgerBadge } from "~Components"
import { COLORS, ColorThemeType, typography, VET } from "~Constants"
import { useThemedStyles, useVns } from "~Hooks"
import { useTotalFiatBalance } from "~Hooks/useTotalFiatBalance"
import { AccountWithDevice, DEVICE_TYPE } from "~Model"
import {
    selectBalanceVisible,
    selectCurrency,
    selectVetBalanceByAccount,
    selectVthoBalanceByAccount,
    useAppSelector,
} from "~Storage/Redux"
import { AddressUtils, BigNutils } from "~Utils"

type Props = {
    account: AccountWithDevice
    onPress?: (account: AccountWithDevice) => void
    selected?: boolean
    containerStyle?: StyleProp<ViewStyle>
    balanceToken?: "VTHO" | "VET" | "FIAT"
    onAnimationFinished?: () => void
} & Pick<ViewProps, "testID" | "children">

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity)

export const SelectableAccountCard = memo(
    ({
        account,
        onPress,
        selected,
        containerStyle,
        testID,
        children,
        balanceToken = "VET",
        onAnimationFinished,
    }: Props) => {
        const { styles, theme } = useThemedStyles(baseStyles)
        const currency = useAppSelector(selectCurrency)
        const vetBalance = useAppSelector(state => selectVetBalanceByAccount(state, account.address))
        const vthoBalance = useAppSelector(state => selectVthoBalanceByAccount(state, account.address))
        const { renderedBalance: renderedFiatBalance, isLoading } = useTotalFiatBalance({
            account,
            enabled: balanceToken === "FIAT",
        })
        const isBalanceVisible = useAppSelector(selectBalanceVisible)
        const { name: vnsName, address: vnsAddress } = useVns({
            name: "",
            address: account.address,
        })
        const selectedAnimationValue = useSharedValue(Number(selected ?? false))

        useEffect(() => {
            selectedAnimationValue.value = withTiming(Number(selected ?? false))
        }, [selected, selectedAnimationValue])

        const balance = useMemo(() => {
            if (!isBalanceVisible) {
                return "••••"
            }

            if (balanceToken === "FIAT") return renderedFiatBalance

            return BigNutils(balanceToken === "VET" ? vetBalance : vthoBalance)
                .toHuman(VET.decimals)
                .toTokenFormat_string(2)
        }, [balanceToken, isBalanceVisible, renderedFiatBalance, vetBalance, vthoBalance])

        const layoutTransition = useMemo(() => {
            return LinearTransition.duration(300).withCallback(finished => {
                "worklet"
                if (finished && onAnimationFinished) runOnJS(onAnimationFinished)()
            })
        }, [onAnimationFinished])

        const rootAnimatedStyles = useAnimatedStyle(() => {
            const selectedColor = theme.isDark ? COLORS.LIME_GREEN : COLORS.PRIMARY_800
            const borderColor = interpolateColor(selectedAnimationValue.value, [0, 1], ["transparent", selectedColor])
            if (selected)
                return {
                    borderWidth: withTiming(2),
                    borderColor,
                }
            return {
                borderWidth: withTiming(1),
                borderColor,
            }
        }, [selected, theme.isDark])

        const textAnimatedStyles = useAnimatedStyle(() => {
            const baseTypography = typography.defaults.captionSemiBold
            const selectedTypography = typography.defaults.bodySemiBold

            const unselectedColor = theme.isDark ? COLORS.GREY_100 : COLORS.PRIMARY_800

            const color = interpolateColor(selectedAnimationValue.value, [0, 1], [unselectedColor, theme.colors.title])

            if (selected)
                return {
                    fontFamily: selectedTypography.fontFamily,
                    fontSize: withTiming(selectedTypography.fontSize),
                    fontWeight: selectedTypography.fontWeight,
                    color: color,
                }

            return {
                fontFamily: baseTypography.fontFamily,
                fontSize: withTiming(baseTypography.fontSize),
                fontWeight: baseTypography.fontWeight,
                color: color,
            }
        }, [selected, theme.colors.title, theme.isDark])

        return (
            <BaseView w={100} flexDirection="row" style={containerStyle}>
                <AnimatedTouchableOpacity
                    testID={testID}
                    onPress={() => onPress?.(account)}
                    style={[styles.container, rootAnimatedStyles, containerStyle]}
                    accessibilityValue={{ text: selected ? "selected" : "not selected" }}
                    layout={layoutTransition}>
                    <BaseView flexDirection="row" gap={12} alignItems="center" flex={1}>
                        <AccountIcon address={account.address} size={40} />
                        <BaseView flexDirection="column" gap={4}>
                            <Animated.Text numberOfLines={1} style={textAnimatedStyles}>
                                {vnsName || account.alias}
                            </Animated.Text>
                            <BaseView flexDirection="row" gap={8}>
                                {account?.device?.type === DEVICE_TYPE.LEDGER && <LedgerBadge mr={8} />}
                                <BaseText
                                    typographyFont="captionRegular"
                                    color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_500}>
                                    {AddressUtils.humanAddress(vnsAddress || account.address)}
                                </BaseText>
                            </BaseView>
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
                            typographyFont="captionRegular"
                            align="right">
                            {balanceToken === "FIAT" ? currency : balanceToken}
                        </BaseText>
                    </BaseView>
                    {children}
                </AnimatedTouchableOpacity>
            </BaseView>
        )
    },
)

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
            padding: 16,
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
