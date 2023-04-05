import React, { memo } from "react"
import { StyleSheet } from "react-native"
import { FormattingUtils, useTheme } from "~Common"
import {
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseTouchableBox,
    BaseView,
} from "~Components"
import { Contact } from "~Model"

type Props = {
    contact: Contact
    onDeletePress: (address: string) => void
    onEditPress: (name: string, address: string) => void
}
export const ContactDetailBox: React.FC<Props> = memo(
    ({ contact, onDeletePress, onEditPress }) => {
        const theme = useTheme()

        return (
            <BaseView w={100} flexDirection="row">
                <BaseTouchableBox
                    action={() => onEditPress(contact.alias, contact.address)}
                    justifyContent="space-between"
                    containerStyle={baseStyles.container}>
                    <BaseView flexDirection="column">
                        <BaseText
                            style={baseStyles.alias}
                            typographyFont="button">
                            {contact.alias}
                        </BaseText>
                        <BaseSpacer height={4} />
                        <BaseText
                            style={baseStyles.address}
                            fontSize={10}
                            typographyFont="smallAddress">
                            {FormattingUtils.humanAddress(
                                contact.address,
                                4,
                                6,
                            )}
                        </BaseText>
                    </BaseView>
                    <BaseView style={baseStyles.rightSubContainer}>
                        <BaseIcon
                            color={theme.colors.primary}
                            size={20}
                            name={"pencil"}
                            action={() =>
                                onEditPress(contact.alias, contact.address)
                            }
                        />
                    </BaseView>
                </BaseTouchableBox>
                <BaseIcon
                    size={24}
                    style={baseStyles.deleteIcon}
                    name={"trash-can-outline"}
                    bg={theme.colors.secondary}
                    action={() => onDeletePress(contact.address)}
                />
            </BaseView>
        )
    },
)

const baseStyles = StyleSheet.create({
    alias: {
        opacity: 1,
    },
    address: {
        opacity: 0.7,
    },
    container: {
        flex: 1,
    },
    rightSubContainer: {
        flexDirection: "column",
        alignItems: "flex-end",
    },
    deleteIcon: { marginLeft: 16 },
})
