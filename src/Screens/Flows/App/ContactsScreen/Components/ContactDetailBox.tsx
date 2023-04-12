import React, { memo, useCallback } from "react"
import { StyleSheet } from "react-native"
import { FormattingUtils, useSwipeable, useTheme } from "~Common"
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

        const RenderRight = useCallback(() => {
            return (
                <BaseView
                    w={"100%"}
                    borderRadius={15}
                    alignItems="center"
                    justifyContent="flex-end"
                    flexDirection="row"
                    bg={theme.colors.danger}
                    px={15}>
                    <BaseIcon
                        color={theme.colors.card}
                        size={20}
                        name={"trash-can-outline"}
                        action={() =>
                            onEditPress(contact.alias, contact.address)
                        }
                    />
                </BaseView>
            )
        }, [
            contact.address,
            contact.alias,
            onEditPress,
            theme.colors.card,
            theme.colors.danger,
        ])

        const onSwipeableOpen = useCallback(() => {
            onDeletePress(contact.address)
        }, [contact.address, onDeletePress])

        const { renderSwipeable } = useSwipeable({
            renderRightActions: RenderRight,
            onSwipeEnded: onSwipeableOpen,
        })

        return renderSwipeable(
            <BaseTouchableBox
                action={() => onEditPress(contact.alias, contact.address)}
                justifyContent="space-between"
                containerStyle={baseStyles.container}
                delayPressIn={100}>
                <BaseView flexDirection="column">
                    <BaseText typographyFont="button">{contact.alias}</BaseText>
                    <BaseSpacer height={4} />
                    <BaseText
                        fontSize={10}
                        typographyFont="smallCaptionRegular">
                        {FormattingUtils.humanAddress(contact.address, 4, 6)}
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
            </BaseTouchableBox>,
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
    leftSwipeBox: {
        flexDirection: "row",
        alignItems: "flex-end",
        paddingLeft: 16,
    },
    swipeableContainer: { width: "100%" },
    underlayContainer: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
})
