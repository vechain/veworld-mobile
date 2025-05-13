import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseButton, BaseText, BaseView } from "~Components/Base"
import { ColorThemeType } from "~Constants"
import { useThemedStyles, useVns } from "~Hooks"
import { useI18nContext } from "~i18n"
import { LocalAccountWithDevice } from "~Model"
import { AddressUtils } from "~Utils"

type Props = {
    selectedDelegationAccount?: LocalAccountWithDevice
    selectedDelegationUrl?: string
    onDelegateClicked: () => void
}

export const SelectedDelegation = ({ selectedDelegationAccount, selectedDelegationUrl, onDelegateClicked }: Props) => {
    const { theme, styles } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()

    const { name } = useVns({
        address: selectedDelegationAccount?.address,
        name: "",
    })

    const delegationUrlParsed = useMemo(() => {
        if (!selectedDelegationUrl) return
        return new URL(selectedDelegationUrl)
    }, [selectedDelegationUrl])

    const renderOption = useMemo(() => {
        if (selectedDelegationAccount)
            return (
                <BaseView flexDirection="column" gap={4}>
                    <BaseText typographyFont="captionMedium" color={theme.colors.textLight}>
                        {LL.DELEGATION_FEE()}
                    </BaseText>
                    <BaseText typographyFont="bodySemiBold" color={theme.colors.subtitle} numberOfLines={1}>
                        {name || AddressUtils.humanAddress(selectedDelegationAccount.address)}
                    </BaseText>
                </BaseView>
            )

        if (selectedDelegationUrl)
            return (
                <BaseView flexDirection="column" gap={4} flex={1}>
                    <BaseText typographyFont="captionMedium" color={theme.colors.textLight}>
                        {LL.DELEGATION_FEE()}
                    </BaseText>
                    <BaseText
                        numberOfLines={1}
                        color={theme.colors.subtitle}
                        typographyFont="bodySemiBold"
                        flexShrink={1}
                        ellipsizeMode="middle">
                        {`${delegationUrlParsed?.host}${delegationUrlParsed?.pathname}`}
                    </BaseText>
                </BaseView>
            )
        return (
            <BaseText typographyFont="bodyMedium" color={theme.colors.textLight}>
                {LL.DELEGATION_NO_FEE()}
            </BaseText>
        )
    }, [
        LL,
        delegationUrlParsed?.host,
        delegationUrlParsed?.pathname,
        name,
        selectedDelegationAccount,
        selectedDelegationUrl,
        theme.colors.subtitle,
        theme.colors.textLight,
    ])

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
                justifyContent="space-between"
                borderRadius={8}
                gap={12}>
                {renderOption}
                <BaseButton
                    variant="solid"
                    bgColor={theme.colors.cardButton.background}
                    style={styles.cardButton}
                    px={12}
                    py={8}
                    textColor={theme.colors.cardButton.text}
                    action={onDelegateClicked}
                    testID="DELEGATE_OPEN">
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
