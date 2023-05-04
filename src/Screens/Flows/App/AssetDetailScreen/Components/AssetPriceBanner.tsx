import React, { useMemo } from "react"
import Animated, {
    useAnimatedProps,
    useAnimatedStyle,
    useDerivedValue,
} from "react-native-reanimated"
import {
    TextInputProps,
    TextInput,
    TextProps as RNTextProps,
    StyleSheet,
} from "react-native"
import { ColorThemeType, FormattingUtils, useThemedStyles } from "~Common"
import { BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import {
    useLineChartDatetime,
    useLineChartPrice,
    useLineChartRelativeChange,
} from "../Hooks/usePrice"

import { typography } from "~Common/Theme"
import { TokenWithCompleteInfo } from "~Model"
import { selectCurrencySymbol, useAppSelector } from "~Storage/Redux"
const { ...otherTypography } = typography

export const AssetPriceBanner = ({
    token,
}: {
    token?: TokenWithCompleteInfo
}) => {
    const { LL } = useI18nContext()
    const currency = useAppSelector(selectCurrencySymbol)
    const datetime = useLineChartDatetime()
    const { formatted: formattedPrice } = useLineChartPrice()
    const { value: priceChangeValue, formatted: formattedPriceChange } =
        useLineChartRelativeChange({})

    const { styles, theme } = useThemedStyles(baseStyles)

    const isPositive24hChange = useMemo(
        () => (token?.change || 0) > 0,
        [token?.change],
    )

    const change24h = useMemo(
        () =>
            (isPositive24hChange ? "+" : "") +
            FormattingUtils.humanNumber(token?.change || 0) +
            "%",
        [isPositive24hChange, token?.change],
    )

    const icon = useDerivedValue(() => (priceChangeValue.value > 0 ? "+" : "-"))
    const changeStyles = useAnimatedStyle(() => ({
        color:
            priceChangeValue.value > 0
                ? theme.colors.success
                : theme.colors.danger,
    }))

    return (
        <BaseView flexDirection="row" justifyContent="space-between" w={100}>
            <BaseView
                style={styles.textContainer}
                justifyContent="space-between">
                <BaseText typographyFont="body">{LL.COMMON_PRICE()}</BaseText>
                <BaseView flexDirection="row" alignItems="baseline">
                    {token ? (
                        <>
                            <BaseText typographyFont="largeTitle">
                                {currency}
                            </BaseText>
                            <BaseText typographyFont="largeTitle">
                                {token.rate?.toFixed(5)}
                            </BaseText>
                        </>
                    ) : (
                        <BaseAnimatedText
                            text={formattedPrice}
                            style={styles.textBigTitle}
                        />
                    )}
                </BaseView>
            </BaseView>

            <BaseView
                alignItems="flex-end"
                style={styles.textContainer}
                justifyContent="space-between">
                <BaseAnimatedText
                    text={datetime.formatted}
                    style={{ color: theme.colors.text }}
                />

                <BaseView flexDirection="row">
                    {token ? (
                        <>
                            <BaseText
                                typographyFont="title"
                                color={
                                    isPositive24hChange
                                        ? theme.colors.success
                                        : theme.colors.danger
                                }>
                                {change24h}
                            </BaseText>
                        </>
                    ) : (
                        <>
                            <BaseAnimatedText
                                text={icon}
                                style={[changeStyles, styles.textTitle]}
                            />
                            <BaseAnimatedText
                                text={formattedPriceChange}
                                style={[changeStyles, styles.textTitle]}
                            />
                        </>
                    )}
                </BaseView>
            </BaseView>
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        textContainer: {
            height: 56,
        },
        textBigTitle: {
            color: theme.colors.primary,
            fontSize: otherTypography.fontSize[32],
            fontWeight: "700",
            fontFamily: otherTypography.fontFamily["Inter-Bold"],
        },
        textTitle: {
            fontSize: otherTypography.fontSize[22],
            fontWeight: "700",
            fontFamily: otherTypography.fontFamily["Inter-Bold"],
        },
    })

// base animated text component using a TextInput
// forked from https://github.com/wcandillon/react-native-redash/blob/master/src/ReText.tsx
Animated.addWhitelistedNativeProps({ text: true })

interface TextProps extends Omit<TextInputProps, "value" | "style"> {
    text: Animated.SharedValue<string>
    style?: Animated.AnimateProps<RNTextProps>["style"]
}

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput)
export const BaseAnimatedText = (props: TextProps): JSX.Element => {
    const { style, text, ...rest } = props
    const animatedProps = useAnimatedProps(() => {
        return {
            text: text.value,
            // Here we use any because the text prop is not available in the type
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any
    })

    return (
        <AnimatedTextInput
            editable={false}
            style={[style || undefined]}
            underlineColorAndroid="transparent"
            value={text.value}
            {...rest}
            {...{ animatedProps }}
        />
    )
}
// end of forked from https://github.com/wcandillon/react-native-redash/blob/master/src/ReText.tsx
