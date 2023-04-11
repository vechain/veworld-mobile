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
    contact?: Contact
    onPress: () => void
    rightIcon?: string
}
export const ContactBox: React.FC<Props> = memo(
    ({ contact, onPress, rightIcon }) => {
        const theme = useTheme()

        return (
            <BaseTouchableBox
                action={onPress}
                justifyContent="space-between"
                containerStyle={baseStyles.container}>
                <BaseView flexDirection="column">
                    <BaseText typographyFont="button">
                        {contact?.alias}
                    </BaseText>
                    <BaseSpacer height={4} />
                    <BaseText
                        fontSize={10}
                        typographyFont="smallCaptionRegular">
                        {!!contact &&
                            FormattingUtils.humanAddress(contact.address, 4, 6)}
                    </BaseText>
                </BaseView>
                {!!rightIcon && (
                    <BaseView style={baseStyles.rightSubContainer}>
                        <BaseIcon
                            color={theme.colors.primary}
                            size={20}
                            name={rightIcon}
                        />
                    </BaseView>
                )}
            </BaseTouchableBox>
        )
    },
)

type ContactBoxWithDeleteProps = Props & { onDeletePress: () => void }

export const ContactBoxWithDelete: React.FC<ContactBoxWithDeleteProps> = memo(
    ({ contact, onPress, onDeletePress }) => {
        const theme = useTheme()

        return (
            <BaseView mx={20}>
                <BaseView w={100} flexDirection="row">
                    <ContactBox
                        contact={contact}
                        onPress={onPress}
                        rightIcon="pencil"
                    />
                    <BaseIcon
                        size={24}
                        style={baseStyles.deleteIcon}
                        name={"trash-can-outline"}
                        bg={theme.colors.secondary}
                        action={onDeletePress}
                    />
                </BaseView>
            </BaseView>
        )
    },
)

const baseStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    rightSubContainer: {
        flexDirection: "column",
        alignItems: "flex-end",
    },
    deleteIcon: { marginLeft: 16 },
})
