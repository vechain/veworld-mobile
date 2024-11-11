import React, { useMemo } from "react"
import { ToastAddress } from "../BaseToast"
import { ToastStyles } from "../util"
import { BaseIcon, BaseText, BaseView } from "~Components"
import { useThemedStyles, useVns } from "~Hooks"
import { selectAccountByAddress, useAppSelector } from "~Storage/Redux"
import { formatAlias } from "~Utils/FormattingUtils/FormattingUtils"
import { humanAddress } from "~Utils/AddressUtils/AddressUtils"
import { StyleSheet } from "react-native"

type Props = {
    addresses: ToastAddress
    styles: ToastStyles["addressesTextColor"]
}

export const ToastAddressesContent: React.FC<Props> = ({ addresses, styles }) => {
    const { styles: themedStyles } = useThemedStyles(baseStyles)
    const senderAccount = useAppSelector(state => selectAccountByAddress(state, addresses.sender))
    const recipientAccount = useAppSelector(state => selectAccountByAddress(state, addresses.recipient ?? ""))

    const { name: senderName } = useVns({ address: addresses.sender, name: "" })
    const { name: recipientName } = useVns({ address: addresses.recipient, name: "" })

    const senderTitle = useMemo(() => {
        if (senderAccount) return formatAlias(senderName ? senderName : senderAccount.alias, 18, 6, 8)
        if (senderName) return formatAlias(senderName, 18, 6, 8)
        return humanAddress(addresses.sender, 4, 6)
    }, [addresses.sender, senderAccount, senderName])

    const recipientTitle = useMemo(() => {
        if (!addresses.recipient) return ""
        if (recipientAccount) return formatAlias(recipientName ? recipientName : recipientAccount.alias, 18, 6, 8)
        if (recipientName) return formatAlias(recipientName, 18, 6, 8)
        return humanAddress(addresses.recipient, 4, 6)
    }, [addresses.recipient, recipientAccount, recipientName])

    return (
        <BaseView style={themedStyles.addressesContainer}>
            <BaseText typographyFont="caption" color={styles} fontSize={12}>
                {senderTitle}
            </BaseText>
            {addresses.recipient ? (
                <>
                    <BaseIcon name="arrow-right" color={styles} size={12} />
                    <BaseText typographyFont="caption" color={styles} fontSize={12}>
                        {recipientTitle}
                    </BaseText>
                </>
            ) : null}
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        addressesContainer: {
            flex: 1,
            flexDirection: "row",
            gap: 4,
            marginBottom: 4,
        },
    })
