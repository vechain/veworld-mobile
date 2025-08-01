import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseText, BaseTouchable } from "~Components/Base"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useVns } from "~Hooks/useVns"
import { AccountWithDevice, WatchedAccount } from "~Model"
import AddressUtils from "~Utils/AddressUtils"
import { AccountIcon } from "../Account/AccountIcon"

type Props = {
    account: AccountWithDevice | WatchedAccount
    variant?: "short" | "long"
    disabled?: boolean
} & (
    | {
          changeable: true
          onPress: () => void
      }
    | {
          changeable: false
      }
)

export const AccountSelector = ({ account, variant = "short", disabled, ...restProps }: Props) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const { name: vnsName, address: vnsAddress } = useVns({
        name: "",
        address: account.address,
    })
    const additionalProps = useMemo(() => {
        if (disabled || !restProps.changeable) return { disabled: true }
        return { onPress: restProps.onPress }
    }, [disabled, restProps])

    return (
        <BaseTouchable style={[styles.root, disabled ? styles.disabled : styles.enabled]} {...additionalProps}>
            <AccountIcon address={account.address} size={24} />
            {variant === "long" && (
                <BaseText typographyFont="bodyMedium" color={COLORS.GREY_800} testID="ACCOUNT_SELECTOR_TEXT">
                    {vnsName || AddressUtils.humanAddress(vnsAddress || account.address)}
                </BaseText>
            )}
            {restProps.changeable && (
                <BaseIcon
                    name="icon-arrow-left-right"
                    color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500}
                    size={16}
                />
            )}
        </BaseTouchable>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            padding: 8,
            flexDirection: "row",
            gap: 8,
            borderRadius: 8,
        },
        enabled: {
            borderWidth: 1,
            borderColor: theme.isDark ? COLORS.TRANSPARENT : COLORS.GREY_200,
            backgroundColor: theme.isDark ? COLORS.PURPLE : COLORS.WHITE,
        },
        disabled: {
            backgroundColor: COLORS.GREY_100,
        },
    })
