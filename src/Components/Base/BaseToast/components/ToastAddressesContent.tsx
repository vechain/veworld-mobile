import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseText, BaseView } from "~Components"
import { useThemedStyles, useVns } from "~Hooks"
import { selectAccountByAddress, useAppSelector } from "~Storage/Redux"
import { humanAddress } from "~Utils/AddressUtils/AddressUtils"
import { formatAlias } from "~Utils/FormattingUtils/FormattingUtils"
import { ToastAddress } from "../BaseToast"
import { ToastStyles } from "../util"

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
        if (senderAccount && !senderName) return formatAlias(senderAccount.alias, 18, 6, 8)
        if (senderName) return formatAlias(senderName, 18, 6, 8)
        return humanAddress(addresses.sender)
    }, [addresses.sender, senderAccount, senderName])

    const recipientTitle = useMemo(() => {
        if (!addresses.recipient) return ""
        if (recipientAccount && !recipientName) return formatAlias(recipientAccount.alias, 18, 6, 8)
        if (recipientName) return formatAlias(recipientName, 18, 6, 8)
        return humanAddress(addresses.recipient)
    }, [addresses.recipient, recipientAccount, recipientName])

    return (
        <BaseView style={themedStyles.addressesContainer}>
            <BaseText testID="transactionAccountSender" typographyFont="caption" color={styles} fontSize={12}>
                {senderTitle}
            </BaseText>
            {recipientTitle ? (
                <>
                    <BaseIcon testID="transactionDirection" name="icon-arrow-right" color={styles} size={12} />
                    <BaseText
                        testID="transactionAccountRecipient"
                        typographyFont="caption"
                        color={styles}
                        fontSize={12}>
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
