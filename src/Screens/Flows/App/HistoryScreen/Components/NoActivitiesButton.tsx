import React from "react"
import { StyleSheet } from "react-native"
import { useTheme } from "~Common"
import { COLORS } from "~Common/Theme"
import { BaseButton, BaseIcon, BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"

type Props = {
    onPress: () => void
}

export const NoActivitiesButton: React.FC<Props> = ({ onPress }) => {
    const theme = useTheme()

    const { LL } = useI18nContext()

    return (
        <>
            <BaseButton
                action={onPress}
                bgColor={theme.colors.secondary}
                style={baseStyles.plusContactButton}
                w={40}
                h={75}>
                <BaseView alignItems="center" pt={10}>
                    <BaseIcon
                        size={32}
                        name="send"
                        color={COLORS.DARK_PURPLE}
                    />
                    <BaseText
                        py={10}
                        typographyFont="bodyMedium"
                        color={COLORS.DARK_PURPLE}>
                        {LL.BTN_LETS_GET_SENDING()}
                    </BaseText>
                </BaseView>
            </BaseButton>
            <BaseText pt={15} typographyFont="body">
                {LL.SB_NO_TRANSACTIONS()}
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
