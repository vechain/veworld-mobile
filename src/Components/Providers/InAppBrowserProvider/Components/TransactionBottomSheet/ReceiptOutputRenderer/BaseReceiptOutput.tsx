import React, { PropsWithChildren, ReactNode } from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseText, BaseTextProps, BaseView, BaseViewProps } from "~Components/Base"
import { COLORS, ColorThemeType } from "~Constants"
import { useTheme, useThemedStyles } from "~Hooks"
import { IconKey } from "~Model"
import { DappDetails } from "../../DappDetails"

type IconRendererProps = { iconKey?: IconKey } | { iconNode?: ReactNode }
type BaseReceiptOutputProps = PropsWithChildren<
    {
        expanded: boolean
        label: string
    } & IconRendererProps
>

const IconRenderer = (props: IconRendererProps) => {
    const { theme, styles } = useThemedStyles(baseStyles)
    if (!("iconKey" in props) && !("iconNode" in props)) return null
    if ("iconKey" in props && props.iconKey)
        return (
            <BaseIcon
                color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600}
                name={props.iconKey}
                style={styles.icon}
                size={12}
            />
        )
    return (props as any).iconNode
}

const ValueContainer = ({ alignSelf = "flex-end", flexShrink = 0, ...props }: BaseViewProps) => {
    return <BaseView alignSelf={alignSelf} flexShrink={flexShrink} {...props} />
}

const ValueMainText = ({ typographyFont = "bodySemiBold", align = "right", ...props }: BaseTextProps) => {
    const theme = useTheme()
    return (
        <BaseText
            typographyFont={typographyFont}
            color={theme.colors.assetDetailsCard.title}
            align={align}
            {...props}
        />
    )
}

const ValueSubText = ({ typographyFont = "captionMedium", align = "right", ...props }: BaseTextProps) => {
    const theme = useTheme()
    return (
        <BaseText typographyFont={typographyFont} color={theme.colors.assetDetailsCard.text} align={align} {...props} />
    )
}

const BaseReceiptOutput = ({ expanded, label, children, ...iconProps }: BaseReceiptOutputProps) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    return (
        <DappDetails show style={styles.root}>
            <BaseView flexDirection="row" gap={16} justifyContent="space-between" alignItems="center">
                <BaseView flexDirection="row" gap={12} flex={1}>
                    <IconRenderer {...iconProps} />
                    <BaseText typographyFont="captionMedium" color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600}>
                        {label}
                    </BaseText>
                </BaseView>
                {children}
            </BaseView>
            {expanded && <BaseText>EXPANDED</BaseText>}
        </DappDetails>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            gap: 0,
            flexDirection: "column",
        },
        icon: {
            backgroundColor: theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.GREY_100,
            padding: 6,
        },
    })

BaseReceiptOutput.ValueContainer = ValueContainer
BaseReceiptOutput.ValueMainText = ValueMainText
BaseReceiptOutput.ValueSubText = ValueSubText

export { BaseReceiptOutput }
