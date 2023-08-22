import React, { memo } from "react"
import { StyleSheet } from "react-native"
import { useThemedStyles } from "~Hooks"
import { FormattingUtils } from "~Utils"
import {
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseTouchableBox,
    BaseView,
} from "~Components"
import { Contact } from "~Model"
import { ColorThemeType } from "~Constants"

type Props = {
    contact: Contact
    onEditPress: (name: string, address: string) => void
}

export const ContactDetailBox: React.FC<Props> = memo(
    ({ contact, onEditPress }) => {
        const { styles, theme } = useThemedStyles(baseStyles)

        return (
            <BaseView
                w={100}
                flexDirection="row"
                style={styles.touchableContainer}>
                <BaseTouchableBox
                    haptics="Light"
                    action={() => onEditPress(contact.alias, contact.address)}
                    justifyContent="space-between"
                    containerStyle={styles.container}
                    testID={`${contact.alias}-contact-box`}>
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
                    <BaseView style={styles.rightSubContainer}>
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

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
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
        touchableContainer: {
            backgroundColor: theme.colors.card,
            borderRadius: 16,
        },
    })
