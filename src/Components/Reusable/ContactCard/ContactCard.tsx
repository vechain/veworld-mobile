import React, { memo } from "react"
import { StyleProp, ViewStyle } from "react-native"
import { AddressUtils } from "~Utils"
import { BaseCard, BaseSpacer, BaseText, BaseView } from "~Components"
import { Contact } from "~Model"
import { WithVns } from "~Utils/VnsUtils"

type Props = {
    contact: Contact
    onPress: (contact: Contact) => void
    selected?: boolean
    containerStyle?: StyleProp<ViewStyle>
}

export const ContactCard = memo(({ contact, onPress, selected, containerStyle }: Props) => {
    return (
        <BaseCard
            containerStyle={containerStyle}
            onPress={() => onPress(contact)}
            selected={selected}
            testID={`${contact.alias}-contact-box`}>
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
        </BaseCard>
    )
})
