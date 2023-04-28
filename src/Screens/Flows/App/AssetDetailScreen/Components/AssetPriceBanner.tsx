import React, { useMemo } from "react"
import Animated, { useAnimatedProps } from "react-native-reanimated"
import {
    useLineChartDatetime,
    useLineChartPrice,
} from "react-native-wagmi-charts"
import {
    TextInputProps,
    TextInput,
    TextProps as RNTextProps,
} from "react-native"
import { FormattingUtils, useTheme } from "~Common"
import { BaseText, BaseView } from "~Components"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import { useI18nContext } from "~i18n"

type Props = {
    change: number
}

export const AssetPriceBanner = ({ change }: Props) => {
    const { LL } = useI18nContext()
    const currency = useAppSelector(selectCurrency)
    const theme = useTheme()
    const datetime = useLineChartDatetime()
    const price = useLineChartPrice({ precision: 6 })

    const isPositive24hChange = useMemo(() => (change || 0) > 0, [change])

    const change24h = useMemo(
        () =>
            (isPositive24hChange ? "+" : "") +
            FormattingUtils.humanNumber(change || 0) +
            "%",
        [isPositive24hChange, change],
    )

    return (
        <BaseView flexDirection="row" justifyContent="space-between" w={100}>
            <BaseView>
                <BaseText typographyFont="body">{LL.COMMON_PRICE()}</BaseText>
                <BaseView flexDirection="row" alignItems="baseline">
                    <BaseAnimatedText
                        text={price.value}
                        // style={{ color: theme.colors.primary, fontSize: 24 }}
                    />
                    <BaseText typographyFont="captionRegular">
                        {currency}
                    </BaseText>
                </BaseView>
            </BaseView>

            <BaseView alignItems="flex-end">
                <BaseAnimatedText text={datetime.formatted} />

                <BaseText
                    typographyFont="title"
                    color={
                        isPositive24hChange
                            ? theme.colors.success
                            : theme.colors.danger
                    }>
                    {change24h}
                </BaseText>
            </BaseView>
        </BaseView>
    )
}

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
