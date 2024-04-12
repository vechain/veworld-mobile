import React, { memo } from "react"
import { StyleSheet } from "react-native"
import { useTheme } from "~Hooks"
import { AddressUtils } from "~Utils"
import { BaseCard, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { Contact } from "~Model"
import { WithVns } from "~Utils/VnsUtils"

type Props = {
    contact: Contact
}

export const ContactDetailBox: React.FC<Props> = memo(({ contact }) => {
    const theme = useTheme()

    return (
        <BaseCard testID={`${contact.alias}-contact-box`} style={styles.card}>
            <BaseView flexDirection="column">
                <BaseText typographyFont="button">{contact.alias}</BaseText>
                <BaseSpacer height={4} />
                <WithVns
                    address={contact.address}
                    children={({ vnsName, vnsAddress }) => (
                        <BaseText fontSize={10} typographyFont="smallCaptionRegular">
                            {vnsName || AddressUtils.humanAddress(vnsAddress ?? contact.address, 4, 6)}
                        </BaseText>
                    )}
                />
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
