import React, { memo, useMemo } from "react"
import { StyleSheet } from "react-native"
import { useTheme } from "~Hooks"
import { BaseCard, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { Contact } from "~Model"
import { AddressUtils } from "~Utils"

type Props = {
    contact: Contact
}

export const ContactDetailBox: React.FC<Props> = memo(({ contact }) => {
    const theme = useTheme()
    const contactNameOrAddress = useMemo(() => {
        return contact.domain ?? AddressUtils.humanAddress(contact.address, 4, 6)
    }, [contact])

    return (
        <BaseCard testID={`${contact.alias}-contact-box`} style={styles.card}>
            <BaseView flexDirection="column">
                <BaseText typographyFont="button">{contact.alias}</BaseText>
                <BaseSpacer height={4} />
                <BaseText fontSize={10} typographyFont="smallCaptionRegular">
                    {contactNameOrAddress}
                </BaseText>
            </BaseView>
            <BaseView style={styles.rightSubContainer}>
                <BaseIcon color={theme.colors.primary} size={24} name={"pencil"} />
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
