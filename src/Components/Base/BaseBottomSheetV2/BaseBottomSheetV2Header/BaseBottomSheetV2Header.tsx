import React from "react"
import { BaseIcon, BaseIconProps } from "~Components/Base/BaseIcon"
import { BaseText, BaseTextProps } from "~Components/Base/BaseText"
import { BaseView, BaseViewProps } from "~Components/Base/BaseView"
import { COLORS } from "~Constants"
import { useTheme } from "~Hooks"
import { BaseBottomSheetV2HeaderButton } from "./BaseBottomSheetV2HeaderButton"

const BaseBottomSheetV2HeaderRoot = (props: BaseViewProps) => {
    return <BaseView flexDirection="row" alignItems="center" justifyContent="space-between" {...props} />
}

const BaseBottomSheetV2HeaderLeftRoot = (props: BaseViewProps) => {
    return <BaseView flexDirection="column" gap={8} {...props} />
}

const BaseBottomSheetV2HeaderTitleRoot = (props: BaseViewProps) => {
    return <BaseView flexDirection="row" alignItems="center" gap={12} {...props} />
}

const BaseBottomSheetV2HeaderIcon = (props: BaseIconProps) => {
    const theme = useTheme()
    return <BaseIcon color={theme.isDark ? COLORS.WHITE : COLORS.PRIMARY_900} size={20} {...props} />
}

const BaseBottomSheetV2HeaderTitle = (props: BaseTextProps) => {
    return <BaseText typographyFont="subTitleSemiBold" {...props} />
}

const BaseBottomSheetV2HeaderDescription = (props: BaseTextProps) => {
    const theme = useTheme()
    return <BaseText typographyFont="body" color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_600} {...props} />
}

export const BaseBottomSheetV2Header = {
    Root: BaseBottomSheetV2HeaderRoot,
    Left: BaseBottomSheetV2HeaderLeftRoot,
    TitleRoot: BaseBottomSheetV2HeaderTitleRoot,
    Icon: BaseBottomSheetV2HeaderIcon,
    Title: BaseBottomSheetV2HeaderTitle,
    Description: BaseBottomSheetV2HeaderDescription,
    Button: BaseBottomSheetV2HeaderButton,
}
