import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import Animated, { LinearTransition } from "react-native-reanimated"
import { BaseButton, BaseText, BaseView } from "~Components/Base"
import { ColorThemeType, VTHO } from "~Constants"
import { useThemedStyles, useVns } from "~Hooks"
import { useI18nContext } from "~i18n"
import { LocalAccountWithDevice } from "~Model"
import { AddressUtils } from "~Utils"

type Props = {
    selectedDelegationAccount?: LocalAccountWithDevice
    selectedDelegationUrl?: string
    onDelegateClicked: () => void
    delegationToken: string
}

export const SelectedDelegation = ({
    selectedDelegationAccount,
    selectedDelegationUrl,
    onDelegateClicked,
    delegationToken,
}: Props) => {
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
                <BaseText typographyFont="bodySemiBold" color={theme.colors.subtitle} numberOfLines={1}>
                    {name || AddressUtils.humanAddress(selectedDelegationAccount.address)}
                </BaseText>
            )

        if (selectedDelegationUrl)
            return (
                <BaseText
                    numberOfLines={1}
                    color={theme.colors.subtitle}
                    typographyFont="bodySemiBold"
                    flexShrink={1}
                    ellipsizeMode="middle">
                    {`${delegationUrlParsed?.host}${delegationUrlParsed?.pathname}`}
                </BaseText>
            )
        return (
            <BaseText color={theme.colors.subtitle} typographyFont="bodySemiBold">
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
    ])

    const disabled = useMemo(() => delegationToken !== VTHO.symbol, [delegationToken])

    const buttonStyles = useMemo(() => {
        if (disabled)
            return {
                bgColor: theme.colors.cardButton.disabled.background,
                textColor: theme.colors.cardButton.disabled.text,
            }

        return {
            bgColor: theme.colors.cardButton.background,
            textColor: theme.colors.cardButton.text,
        }
    }, [
        disabled,
        theme.colors.cardButton.background,
        theme.colors.cardButton.disabled.background,
        theme.colors.cardButton.disabled.text,
        theme.colors.cardButton.text,
    ])

    return (
        <Animated.View style={styles.root} layout={LinearTransition}>
            <BaseView flexDirection="column" flex={1}>
                <BaseText typographyFont="captionMedium" color={theme.colors.textLightish}>
                    {LL.DELEGATION_FEE()}
                </BaseText>
                {renderOption}
            </BaseView>
            <BaseButton
                variant="solid"
                style={styles.cardButton}
                px={12}
                py={8}
                action={onDelegateClicked}
                testID="DELEGATE_OPEN"
                disabled={disabled}
                {...buttonStyles}>
                {LL.DELEGATE()}
            </BaseButton>
        </Animated.View>
    )
}

const baseStyles = (theme: ColorThemeType) => {
    return StyleSheet.create({
        cardButton: {
            borderColor: theme.colors.cardButton.border,
            borderWidth: 1,
            backgroundColor: theme.colors.cardButton.background,
            gap: 8,
            flexBasis: "35%",
            flexShrink: 1,
        },
        root: {
            width: "100%",
            paddingVertical: 12,
            paddingHorizontal: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
        },
    })
}
