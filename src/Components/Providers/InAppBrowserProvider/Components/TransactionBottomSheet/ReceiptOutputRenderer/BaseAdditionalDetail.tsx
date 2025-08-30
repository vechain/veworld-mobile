import React, { ComponentProps } from "react"
import { TabularValueRenderer } from "~Components/Reusable/TabularValueRenderer"
import { COLORS } from "~Constants"
import { useTheme } from "~Hooks"

const HexValue = (
    props: Omit<
        ComponentProps<(typeof TabularValueRenderer)["HexValue"]>,
        "textColor" | "iconColor" | "typographyFont"
    >,
) => {
    const theme = useTheme()

    return (
        <TabularValueRenderer.HexValue
            textColor={theme.isDark ? COLORS.WHITE : COLORS.PRIMARY_600}
            iconColor={theme.isDark ? COLORS.WHITE : COLORS.PRIMARY_600}
            {...props}
        />
    )
}

const StringValue = ({
    ...props
}: Omit<ComponentProps<(typeof TabularValueRenderer)["StringValue"]>, "color" | "typographyFont">) => {
    const theme = useTheme()

    return (
        <TabularValueRenderer.StringValue
            typographyFont="bodyMedium"
            color={theme.isDark ? COLORS.WHITE : COLORS.GREY_800}
            {...props}
        />
    )
}

const BaseAdditionalDetail = ({
    direction = "row",
    ...props
}: Omit<ComponentProps<typeof TabularValueRenderer>, "label"> & { label: string }) => {
    return <TabularValueRenderer direction={direction} {...props} />
}

BaseAdditionalDetail.HexValue = HexValue
BaseAdditionalDetail.StringValue = StringValue

export { BaseAdditionalDetail }
