import { TransactionClause } from "@vechain/sdk-core"
import { PropsWithChildren, default as React, ReactNode, useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseText, BaseTextProps, BaseView, BaseViewProps } from "~Components/Base"
import { COLORS, ColorThemeType } from "~Constants"
import { useTheme, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { IconKey } from "~Model"
import { ReceiptOutput } from "~Services/AbiService"
import { DappDetails } from "../../DappDetails"
import { BaseAdditionalDetail } from "./BaseAdditionalDetail"

type IconRendererProps = { iconKey?: IconKey; iconColor?: string; iconBg?: string } | { iconNode?: ReactNode }
type BaseReceiptOutputProps = PropsWithChildren<
    {
        expanded: boolean
        label: string
        labelColor?: string
        additionalDetails?: ReactNode
        output: ReceiptOutput
        clause: TransactionClause
        testID?: string
    } & IconRendererProps
>

export type ReceiptOutputProps<TName extends ReceiptOutput["name"]> = {
    expanded: boolean
    output: Extract<ReceiptOutput, { name: TName }>
    clause: TransactionClause
}

const IconRenderer = (props: IconRendererProps) => {
    const { theme, styles } = useThemedStyles(baseStyles)
    if (!("iconKey" in props) && !("iconNode" in props)) return null
    if ("iconKey" in props && props.iconKey)
        return (
            <BaseIcon
                color={props.iconColor ?? (theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600)}
                name={props.iconKey}
                style={[styles.icon, props.iconBg && { backgroundColor: props.iconBg }]}
                size={12}
            />
        )
    return (props as any).iconNode
}

const ValueContainer = ({ alignSelf = "flex-end", flexShrink = 0, ...props }: BaseViewProps) => {
    return <BaseView alignSelf={alignSelf} flexShrink={flexShrink} flex={1} {...props} />
}

const ValueMainText = ({ typographyFont = "bodySemiBold", align = "right", ...props }: BaseTextProps) => {
    const theme = useTheme()
    return (
        <BaseText
            typographyFont={typographyFont}
            color={theme.colors.assetDetailsCard.title}
            align={align}
            flex={1}
            numberOfLines={1}
            ellipsizeMode="middle"
            {...props}
        />
    )
}

const ValueSubText = ({ typographyFont = "captionMedium", align = "right", ...props }: BaseTextProps) => {
    const theme = useTheme()
    return (
        <BaseText
            typographyFont={typographyFont}
            color={theme.colors.assetDetailsCard.text}
            align={align}
            flex={1}
            numberOfLines={1}
            ellipsizeMode="middle"
            {...props}
        />
    )
}

const BaseReceiptOutput = ({
    expanded,
    label,
    labelColor,
    children,
    additionalDetails,
    output,
    clause,
    testID,
    ...iconProps
}: BaseReceiptOutputProps) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const rootStyles = useMemo(
        () => [styles.root, !expanded && { justifyContent: "center" as const, height: "100%" as const }],
        [expanded, styles.root],
    )
    return (
        <DappDetails show style={rootStyles} noAnimation testID={testID}>
            <BaseView
                flexDirection="row"
                gap={16}
                justifyContent="space-between"
                alignItems="center"
                pb={expanded ? 16 : 0}>
                <BaseView flexDirection="row" gap={12}>
                    <IconRenderer {...iconProps} />
                    <BaseText
                        typographyFont="bodyMedium"
                        color={labelColor ?? (theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600)}>
                        {label}
                    </BaseText>
                </BaseView>
                {children}
            </BaseView>
            {expanded && (
                <BaseView style={styles.additionalDetails} flexDirection="column">
                    <BaseAdditionalDetail
                        label={LL.ADDITIONAL_DETAIL_CLAUSE()}
                        value={`#${output.clauseIndex + 1}`}
                        testID="BASE_RECEIPT_CLAUSE_INDEX"
                    />
                    <BaseAdditionalDetail
                        label={LL.ADDITIONAL_DETAIL_TO()}
                        value={<BaseAdditionalDetail.HexValue value={clause.to ?? ""} testID="BASE_RECEIPT_TO" />}
                    />
                    <BaseAdditionalDetail
                        label={LL.ADDITIONAL_DETAIL_CONTRACT_DATA()}
                        value={
                            <BaseAdditionalDetail.HexValue
                                value={clause.data ?? "0x"}
                                testID="BASE_RECEIPT_CONTRACT_DATA"
                            />
                        }
                    />

                    {additionalDetails}

                    {clause.comment && (
                        <BaseAdditionalDetail
                            label={LL.ADDITIONAL_DETAIL_COMMENT()}
                            direction="column"
                            value={<BaseAdditionalDetail.StringValue value={clause.comment} numberOfLines={3} />}
                        />
                    )}
                </BaseView>
            )}
        </DappDetails>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            gap: 0,
            flexDirection: "column",
            paddingTop: 16,
        },
        additionalDetails: {
            borderTopWidth: 1,
            borderTopColor: theme.isDark ? COLORS.PURPLE : COLORS.GREY_100,
            gap: 12,
            paddingTop: 16,
        },
        icon: {
            backgroundColor: theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.GREY_100,
            padding: 6,
            borderRadius: 16,
        },
    })

BaseReceiptOutput.ValueContainer = ValueContainer
BaseReceiptOutput.ValueMainText = ValueMainText
BaseReceiptOutput.ValueSubText = ValueSubText

export { BaseReceiptOutput }
