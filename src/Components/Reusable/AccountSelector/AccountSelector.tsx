import React from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseText, BaseTouchable } from "~Components/Base"
import { COLORS } from "~Constants"
import { useThemedStyles, useVns } from "~Hooks"
import { AccountWithDevice, WatchedAccount } from "~Model"
import AddressUtils from "~Utils/AddressUtils"
import { AccountIcon } from "../Account/AccountIcon"

type Props = {
    account: AccountWithDevice | WatchedAccount
    variant?: "short" | "long"
    disabled?: boolean
    onPress: () => void
}

export const AccountSelector = ({ account, variant = "short", disabled, onPress }: Props) => {
    const { styles } = useThemedStyles(baseStyles)
    const { name: vnsName, address: vnsAddress } = useVns({
        name: "",
        address: account.address,
    })
    return (
        <BaseTouchable style={[styles.root, disabled ? styles.disabled : styles.enabled]} onPress={onPress}>
            <AccountIcon address={account.address} size={24} />
            {variant === "long" && (
                <BaseText typographyFont="bodyMedium" color={COLORS.GREY_800}>
                    {vnsName || AddressUtils.humanAddress(vnsAddress || account.address)}
                </BaseText>
            )}
            <BaseIcon name="icon-arrow-left-right" color={COLORS.GREY_500} size={16} />
        </BaseTouchable>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        root: {
            padding: 8,
            flexDirection: "row",
            gap: 8,
            borderRadius: 8,
        },
        enabled: {
            borderWidth: 1,
            borderColor: COLORS.GREY_200,
            backgroundColor: COLORS.WHITE,
        },
        disabled: {
            backgroundColor: COLORS.GREY_100,
        },
    })
