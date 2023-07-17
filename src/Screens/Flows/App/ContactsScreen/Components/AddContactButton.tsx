import React from "react"
import { StyleSheet } from "react-native"
import { useTheme } from "~Hooks"
import { COLORS } from "~Constants"
import { BaseButton, BaseIcon, BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"

type Props = {
    onPress: () => void
}

export const AddContactButton: React.FC<Props> = ({ onPress }) => {
    const theme = useTheme()

    const { LL } = useI18nContext()

    return (
        <>
            <BaseButton
                haptics="Light"
                action={onPress}
                bgColor={theme.colors.secondary}
                style={baseStyles.plusContactButton}
                w={40}>
                <BaseView alignItems="center">
                    <BaseIcon
                        my={8}
                        size={55}
                        name="plus"
                        color={COLORS.DARK_PURPLE}
                    />
                    <BaseText
                        py={5}
                        typographyFont="bodyMedium"
                        color={COLORS.DARK_PURPLE}>
                        {LL.BTN_CREATE_CONTACT()}
                    </BaseText>
                </BaseView>
            </BaseButton>
            <BaseText pt={15} typographyFont="body">
                {LL.SB_CONTACT_LIST_EMPTY()}
            </BaseText>
            <BaseText pt={5} typographyFont="body">
                {LL.SB_CREATE_ONE()}
            </BaseText>
        </>
    )
}

const baseStyles = StyleSheet.create({
    plusContactButton: {
        justifyContent: "center",
        flexDirection: "column",
    },
})
