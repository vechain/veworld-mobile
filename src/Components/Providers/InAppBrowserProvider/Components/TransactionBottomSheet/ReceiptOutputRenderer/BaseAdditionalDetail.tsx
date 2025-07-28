import React, { ReactNode, useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseButton, BaseIcon, BaseText, BaseTextProps, BaseView, BaseViewProps } from "~Components/Base"
import { COLORS } from "~Constants"
import { useCopyClipboard, useTheme, useThemedStyles, useVns } from "~Hooks"
import { useI18nContext } from "~i18n"
import { AddressUtils } from "~Utils"

const HexValue = ({ value }: { value: string }) => {
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
            textColor={theme.isDark ? COLORS.WHITE : COLORS.PRIMARY_600}
            variant="ghost"
            size="sm"
            px={0}
            py={0}
            typographyFont="captionMedium"
            title={formattedValue}
            action={() => onCopyToClipboard(value, LL.COMMON_LBL_ADDRESS())}
            rightIcon={
                <BaseIcon
                    name="icon-copy"
                    color={theme.isDark ? COLORS.WHITE : COLORS.PRIMARY_600}
                    size={12}
                    style={styles.hexValueIcon}
                />
            }
        />
    )
}

const StringValue = ({
    value,
    ...props
}: { value: string } & Omit<BaseTextProps, "children" | "color" | "typographyFont">) => {
    const theme = useTheme()

    return (
        <BaseText typographyFont="captionMedium" color={theme.isDark ? COLORS.WHITE : COLORS.GREY_800} {...props}>
            {value}
        </BaseText>
    )
}

const BaseAdditionalDetail = ({
    label,
    value,
    direction = "row",
    testID,
}: {
    label: string
    value: ReactNode
    direction?: "row" | "column"
    testID?: string
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
        <BaseView w={100} testID={testID} {...props}>
            <BaseText typographyFont="smallCaptionMedium" color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500}>
                {label}
            </BaseText>
            {typeof value === "string" ? <StringValue value={value} /> : value}
        </BaseView>
    )
}

BaseAdditionalDetail.HexValue = HexValue
BaseAdditionalDetail.StringValue = StringValue

const baseStyles = () =>
    StyleSheet.create({
        hexValueIcon: {
            marginLeft: 4,
        },
    })

export { BaseAdditionalDetail }
