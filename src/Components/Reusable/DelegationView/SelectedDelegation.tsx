/* eslint-disable react-native/no-inline-styles */
import React, { useMemo } from "react"
import { StyleSheet, Text } from "react-native"
import { BaseButton, BaseText, BaseView } from "~Components/Base"
import { ColorThemeType, typography } from "~Constants"
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
                    <BaseView flexWrap="nowrap" flexDirection="row" alignItems="center">
                        <Text
                            style={{
                                color: theme.colors.passwordPlaceholder,
                                fontSize: typography.defaults.captionMedium.fontSize,
                                fontFamily: typography.defaults.captionMedium.fontFamily || "Inter-Regular",
                                fontWeight: typography.defaults.captionMedium
                                    .fontWeight as keyof typeof typography.fontWeight,
                                lineHeight: typography.defaults.captionMedium.lineHeight,
                            }}>
                            {delegationUrlParsed?.protocol}
                            {"//"}
                        </Text>
                        <Text
                            numberOfLines={1}
                            style={{
                                color: theme.colors.subtitle,
                                fontSize: typography.defaults.bodySemiBold.fontSize,
                                fontFamily: typography.defaults.bodySemiBold.fontFamily || "Inter-Regular",
                                fontWeight: typography.defaults.bodySemiBold
                                    .fontWeight as keyof typeof typography.fontWeight,
                                lineHeight: typography.defaults.bodySemiBold.lineHeight,
                                flexShrink: 1,
                            }}>{`${delegationUrlParsed?.host}${delegationUrlParsed?.pathname}`}</Text>
                    </BaseView>
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
        delegationUrlParsed?.protocol,
        name,
        selectedDelegationAccount,
        selectedDelegationUrl,
        theme.colors.passwordPlaceholder,
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
