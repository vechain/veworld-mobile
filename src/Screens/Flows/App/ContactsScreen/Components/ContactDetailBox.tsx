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
    onEditPress: (name: string, address: string) => void
}

export const ContactDetailBox: React.FC<Props> = memo(
    ({ contact, onEditPress }) => {
        const theme = useTheme()

        return (
            <BaseView w={100} flexDirection="row">
                <BaseTouchableBox
                    action={() => onEditPress(contact.alias, contact.address)}
                    justifyContent="space-between"
                    containerStyle={baseStyles.container}
                    activeOpacity={1}>
                    <BaseView flexDirection="column">
                        <BaseText typographyFont="button">
                            {contact.alias}
                        </BaseText>
                        <BaseSpacer height={4} />
                        <BaseText
                            fontSize={10}
                            typographyFont="smallCaptionRegular">
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
                            size={24}
                            name={"pencil"}
                            action={() =>
                                onEditPress(contact.alias, contact.address)
                            }
                        />
                    </BaseView>
                </BaseTouchableBox>
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
    leftSwipeBox: {
        flexDirection: "row",
        alignItems: "flex-end",
        paddingLeft: 16,
    },
})
