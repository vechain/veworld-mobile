import React, { memo, useMemo } from "react"
import { useCopyClipboard, useTheme } from "~Hooks"
import { AddressUtils } from "~Utils"
import { BaseButton, BaseIcon } from "~Components/Base"
import { StyleSheet } from "react-native"
import { useI18nContext } from "~i18n"

type Props = {
    address: string
}
export const AddressButton: React.FC<Props> = memo(({ address }) => {
    const theme = useTheme()
    const { LL } = useI18nContext()

    const { onCopyToClipboard } = useCopyClipboard()

    const color = useMemo(() => (theme.isDark ? theme.colors.text : theme.colors.primary), [theme])
    return (
        <BaseButton
            textColor={color}
            size="sm"
            radius={1000}
            fontSize={10}
            bgColor={theme.colors.primaryReversed}
            title={AddressUtils.humanAddress(address, 5, 4)}
            action={() => onCopyToClipboard(address, LL.COMMON_LBL_ADDRESS())}
            rightIcon={<BaseIcon name="icon-copy" color={color} size={12} style={baseStyles.marginLeft} />}
        />
    )
})

const baseStyles = StyleSheet.create({
    marginLeft: {
        marginLeft: 8,
    },
})
