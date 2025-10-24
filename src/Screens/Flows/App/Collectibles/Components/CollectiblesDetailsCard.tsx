import React, { useMemo } from "react"
import { Linking, StyleSheet } from "react-native"
import { BaseButton, BaseIcon, BaseText, BaseView } from "~Components"
import { ColorThemeType } from "~Constants"
import { useFormatFiat, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { NftCollection } from "~Model"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { AddressUtils } from "~Utils"
import { ExplorerLinkType, getExplorerLink } from "~Utils/AddressUtils/AddressUtils"
import { formatDisplayNumber } from "~Utils/StandardizedFormatting"

type Props = {
    collectionMetadata: NftCollection | undefined
}

export const CollectiblesDetailsCard: React.FC<Props> = ({ collectionMetadata }) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const { LL } = useI18nContext()
    const { formatLocale } = useFormatFiat()

    const collectionDescription = useMemo(() => {
        return collectionMetadata?.description
    }, [collectionMetadata?.description])

    const collectionTotalSupply = useMemo(() => {
        if (!collectionMetadata?.totalSupply) return LL.COMMON_NOT_AVAILABLE()
        return formatDisplayNumber(collectionMetadata.totalSupply, {
            locale: formatLocale,
            useCompactNotation: false,
            forceDecimals: 0,
        })
    }, [collectionMetadata?.totalSupply, formatLocale, LL])

    const truncatedAddress = useMemo(() => {
        return AddressUtils.humanAddress(collectionMetadata?.address ?? "")
    }, [collectionMetadata?.address])

    return (
        <BaseView style={styles.root} p={24}>
            {collectionDescription && (
                <>
                    <BaseText
                        typographyFont="captionSemiBold"
                        mb={4}
                        color={theme.colors.collectibleDetailedCard.title}>
                        {LL.SB_DESCRIPTION()}
                    </BaseText>
                    <BaseText
                        typographyFont="buttonSecondary"
                        color={theme.colors.collectibleDetailedCard.description}
                        mb={24}
                        ellipsizeMode="tail">
                        {collectionDescription}
                    </BaseText>
                </>
            )}
            <BaseView flexDirection="row" justifyContent="space-between" gap={32}>
                <BaseView flex={1}>
                    <BaseText
                        typographyFont="captionSemiBold"
                        mb={4}
                        color={theme.colors.collectibleDetailedCard.title}>
                        {LL.CONTRACT_ADDRESS()}
                    </BaseText>
                    <BaseButton
                        variant="ghost"
                        px={0}
                        py={0}
                        action={() => {
                            Linking.openURL(
                                `${getExplorerLink(selectedNetwork, ExplorerLinkType.ACCOUNT)}/${
                                    collectionMetadata?.address
                                }`,
                            )
                        }}
                        typographyFont="buttonMedium"
                        fontWeight="500"
                        textColor={theme.colors.collectibleDetailedCard.address}
                        rightIcon={
                            <BaseIcon
                                name="icon-arrow-up-right"
                                size={16}
                                color={theme.colors.collectibleDetailedCard.address}
                            />
                        }>
                        {truncatedAddress}
                    </BaseButton>
                </BaseView>
                <BaseView flex={1}>
                    <BaseText
                        typographyFont="captionSemiBold"
                        mb={4}
                        color={theme.colors.collectibleDetailedCard.title}>
                        {LL.COMMON_TOTAL_SUPPLY()}
                    </BaseText>
                    <BaseText typographyFont="buttonSecondary" color={theme.colors.collectibleDetailedCard.description}>
                        {collectionTotalSupply}
                    </BaseText>
                </BaseView>
            </BaseView>
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            borderRadius: 12,
            backgroundColor: theme.colors.card,
            marginBottom: 8,
        },
    })
