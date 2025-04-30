import React from "react"
import { StyleSheet } from "react-native"
import { BaseButton, BaseCard, BaseSpacer, BaseText, BaseView } from "~Components/Base"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { LocalAccountWithDevice } from "~Model"
import { AccountCard } from "../AccountCard"

type Props = {
    selectedDelegationAccount?: LocalAccountWithDevice
    selectedDelegationUrl?: string
    onDelegateClicked: () => void
}

export const SelectedDelegation = ({ selectedDelegationAccount, selectedDelegationUrl, onDelegateClicked }: Props) => {
    const { theme, styles } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()

    if (selectedDelegationAccount)
        return (
            <>
                <BaseSpacer height={16} />
                <AccountCard account={selectedDelegationAccount} />
            </>
        )

    if (selectedDelegationUrl)
        return (
            <>
                <BaseSpacer height={16} />
                <BaseCard>
                    <BaseText py={8}>{selectedDelegationUrl}</BaseText>
                </BaseCard>
            </>
        )

    return (
        <BaseView w={100} px={16} pb={16}>
            <BaseView
                alignItems="center"
                flexDirection="row"
                bg={theme.colors.editSpeedBs.result.background}
                pt={8}
                pb={8}
                pr={8}
                pl={12}
                w={100}
                justifyContent="space-between"
                borderRadius={8}>
                <BaseText typographyFont="bodyMedium" color={theme.colors.textLight}>
                    {LL.DELEGATION_NO_FEE()}
                </BaseText>
                <BaseButton
                    variant="solid"
                    bgColor={theme.colors.cardButton.background}
                    style={styles.cardButton}
                    px={12}
                    py={8}
                    textColor={theme.colors.cardButton.text}
                    action={onDelegateClicked}>
                    {LL.DELEGATE()}
                </BaseButton>
            </BaseView>
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) => {
    return StyleSheet.create({
        cardButton: {
            borderColor: theme.colors.cardButton.border,
            borderWidth: 1,
            backgroundColor: theme.colors.cardButton.background,
            gap: 8,
        },
    })
}
