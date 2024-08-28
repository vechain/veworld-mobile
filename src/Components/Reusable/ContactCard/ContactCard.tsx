import React, { memo } from "react"
import { StyleProp, ViewStyle } from "react-native"
import { BaseCard, BaseSpacer, BaseText, BaseView } from "~Components"
import { useVns } from "~Hooks"
import { Contact } from "~Model"

type Props = {
    contact: Contact
    onPress: (contact: Contact) => void
    selected?: boolean
    containerStyle?: StyleProp<ViewStyle>
}

export const ContactCard = memo(({ contact, onPress, selected, containerStyle }: Props) => {
    const { name: vnsName, address: vnsAddress } = useVns({
        name: "",
        address: contact.address,
    })

    return (
        <BaseCard
            containerStyle={containerStyle}
            onPress={() => onPress(contact)}
            selected={selected}
            testID={`${contact.alias}-contact-box`}>
            <BaseView flexDirection="column">
                <BaseText typographyFont="button">{contact.alias}</BaseText>
                <BaseSpacer height={4} />
                <BaseText fontSize={10} typographyFont="smallCaptionRegular">
                    {vnsName || vnsAddress}
                </BaseText>
            </BaseView>
        </BaseCard>
    )
})
