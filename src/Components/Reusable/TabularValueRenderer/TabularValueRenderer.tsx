import React, { ReactNode, useMemo, useState } from "react"
import { StyleProp, StyleSheet, ViewStyle } from "react-native"
import { BaseButton, BaseIcon, BaseText, BaseTextProps, BaseView, BaseViewProps } from "~Components/Base"
import { COLORS, TFonts } from "~Constants"
import { useCopyClipboard, useTheme, useThemedStyles, useVns } from "~Hooks"
import { useI18nContext } from "~i18n"
import { AddressUtils } from "~Utils"

const HexValue = ({
    value,
    testID,
    textColor,
    iconColor,
    typographyFont = "bodyMedium",
}: {
    value: string
    /**
     * Text color of the button.
     * @default COLORS.WHITE in dark mode
     * COLORS.PRIMARY_600 in light mode
     */
    textColor?: string
    /**
     * Color of the button copy icon.
     * @default COLORS.WHITE in dark mode
     * COLORS.PRIMARY_600 in light mode
     */
    iconColor?: string
    /**
     * Typography font
     * @default 'bodyMedium'
     */
    typographyFont?: TFonts
    testID?: string
}) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const { onCopyToClipboard } = useCopyClipboard()

    const isAddress = useMemo(() => {
        return AddressUtils.isValid(value)
    }, [value])

    const { name } = useVns({
        address: isAddress ? value : "",
        name: "",
    })

    const formattedValue = useMemo(() => {
        if (name) return name
        if (value.length < 10) return value
        return AddressUtils.humanAddress(value)
    }, [name, value])

    return (
        <BaseButton
            textColor={textColor ?? (theme.isDark ? COLORS.WHITE : COLORS.PRIMARY_600)}
            variant="ghost"
            size="sm"
            px={0}
            py={0}
            typographyFont={typographyFont}
            title={formattedValue}
            action={() => onCopyToClipboard(value, LL.COMMON_LBL_VALUE())}
            textTestID={testID}
            rightIcon={
                <BaseIcon
                    name="icon-copy"
                    color={iconColor ?? (theme.isDark ? COLORS.WHITE : COLORS.PRIMARY_600)}
                    size={12}
                    style={styles.hexValueIcon}
                />
            }
        />
    )
}

const StringValue = ({ value, style, ...props }: { value: string } & Omit<BaseTextProps, "children">) => {
    const theme = useTheme()
    const [height, setHeight] = useState<number>()

    return (
        <BaseText
            typographyFont="bodyMedium"
            color={theme.isDark ? COLORS.WHITE : COLORS.GREY_800}
            onLayout={e => {
                // Please, do not change this behaviour. It's the only way to make it work for long strings.
                if (e.nativeEvent.layout.height === 0) return
                setHeight(e.nativeEvent.layout.height)
            }}
            style={[{ height }, style]}
            {...props}>
            {value}
        </BaseText>
    )
}

const TabularValueRenderer = ({
    label,
    value,
    direction = "row",
    testID,
    style,
    labelTextColor,
}: {
    /**
     * Value label. If a string is passed, it'll be wrapped in a {@link BaseText}, otherwise the component will be rendered
     */
    label: ReactNode
    /**
     * Text color of the label.
     * @default COLORS.GREY_300 in dark mode
     * COLORS.GREY_500 in light mode
     */
    labelTextColor?: string
    value: ReactNode
    direction?: "row" | "column"
    testID?: string
    style?: StyleProp<ViewStyle>
}) => {
    const theme = useTheme()
    const props = useMemo((): BaseViewProps => {
        switch (direction) {
            case "row":
                return { flexDirection: "row", justifyContent: "space-between", gap: 32 }
            case "column":
                return { flexDirection: "column", gap: 4 }
        }
    }, [direction])
    return (
        <BaseView w={100} testID={testID} style={style} {...props}>
            {typeof label === "string" ? (
                <BaseText
                    typographyFont="captionMedium"
                    color={labelTextColor ?? (theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500)}>
                    {label}
                </BaseText>
            ) : (
                label
            )}

            {typeof value === "string" ? <StringValue value={value} /> : value}
        </BaseView>
    )
}

TabularValueRenderer.HexValue = HexValue
TabularValueRenderer.StringValue = StringValue

const baseStyles = () =>
    StyleSheet.create({
        hexValueIcon: {
            marginLeft: 4,
        },
    })

export { TabularValueRenderer }
