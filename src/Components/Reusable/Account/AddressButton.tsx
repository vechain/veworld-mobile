import React, { useCallback, useMemo } from "react"
import { FormattingUtils, useTheme } from "~Common"
import { BaseButton, BaseIcon } from "~Components/Base"
import { Alert } from "react-native"
import * as Clipboard from "expo-clipboard"

const { humanAddress } = FormattingUtils

type Props = {
    address: string
}
export const AddressButton: React.FC<Props> = ({ address }) => {
    const theme = useTheme()

    const onCopyToClipboard = useCallback(async () => {
        await Clipboard.setStringAsync(address)
        Alert.alert("Success!", "Address copied to clipboard")
    }, [address])

    const color = useMemo(
        () => (theme.isDark ? theme.colors.text : theme.colors.primary),
        [theme],
    )
    return (
        <BaseButton
            textColor={color}
            size="sm"
            radius={1000}
            fontSize={10}
            bgColor={theme.colors.primaryReversed}
            title={humanAddress(address, 5, 4)}
            action={onCopyToClipboard}
            rightIcon={<BaseIcon name="copy-outline" color={color} size={12} />}
        />
    )
}
