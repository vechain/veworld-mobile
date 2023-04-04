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
    onPressDelete: (address: string) => void
    onPressEdit: (address: string) => void
}
export const ContactDetailBox: React.FC<Props> = memo(
    ({ contact, onPressDelete, onPressEdit }) => {
        const theme = useTheme()

        return (
            <BaseView w={100} flexDirection="row">
                <BaseTouchableBox
                    action={() => onPressEdit(contact.address)}
                    justifyContent="space-between"
                    containerStyle={baseStyles.container}>
                    <BaseView flexDirection="column">
                        <BaseText style={baseStyles.alias}>
                            {contact.alias}
                        </BaseText>
                        <BaseSpacer height={4} />
                        <BaseText style={baseStyles.address} fontSize={10}>
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
                            action={() => onPressEdit(contact.address)}
                        />
                    </BaseView>
                </BaseTouchableBox>
                <BaseIcon
                    size={24}
                    style={baseStyles.deleteIcon}
                    name={"trash-can-outline"}
                    bg={theme.colors.secondary}
                    action={() => onPressDelete(contact.address)}
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
