import React, { memo } from "react"
import { StyleSheet } from "react-native"
import { BaseCard, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { useTheme, useVns } from "~Hooks"
import { Contact } from "~Model"
import { AddressUtils } from "~Utils"

type Props = {
    contact: Contact
}

export const ContactDetailBox: React.FC<Props> = memo(({ contact }) => {
    const theme = useTheme()

    const { name: domain, address } = useVns({
        name: "",
        address: contact.address,
    })

    return (
        <BaseCard testID={`${contact.alias}-contact-box`} style={styles.card}>
            <BaseView flexDirection="column">
                <BaseText typographyFont="button">{contact.alias}</BaseText>
                <BaseSpacer height={4} />
                <BaseText fontSize={10} typographyFont="smallCaptionRegular">
                    {domain || AddressUtils.humanAddress(address || contact.address)}
                </BaseText>
            </BaseView>
            <BaseView style={styles.rightSubContainer}>
                <BaseIcon color={theme.colors.primary} size={24} name={"icon-pencil"} />
            </BaseView>
        </BaseCard>
    )
})

const styles = StyleSheet.create({
    card: {
        justifyContent: "space-between",
        alignItems: "center",
    },
    rightSubContainer: {
        flexDirection: "column",
        alignItems: "flex-end",
    },
    leftSwipeBox: {
        flexDirection: "row",
        alignItems: "flex-end",
        paddingLeft: 16,
    },
})
