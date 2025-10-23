import React, { useMemo } from "react"
import { Linking, StyleSheet } from "react-native"
import { BaseButton, BaseIcon, BaseText, BaseView } from "~Components"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { selectCollectionWithContractAddress, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { AddressUtils } from "~Utils"
import { ExplorerLinkType, getExplorerLink } from "~Utils/AddressUtils/AddressUtils"

type Props = {
    address: string
    tokenId: string
}

export const CollectibleDetailedCard: React.FC<Props> = ({ address, tokenId: _tokenId }) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const { LL } = useI18nContext()

    const collection = useAppSelector(state => selectCollectionWithContractAddress(state, address))

    const collectionDescription = useMemo(() => {
        return collection?.description
    }, [collection?.description])

    const collectionTotalSupply = useMemo(() => {
        return collection?.totalSupply?.toString() || LL.COMMON_NOT_AVAILABLE()
    }, [collection?.totalSupply, LL])

    const truncatedAddress = useMemo(() => {
        return AddressUtils.humanAddress(address)
    }, [address])

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
                        numberOfLines={3}
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
                            Linking.openURL(`${getExplorerLink(selectedNetwork, ExplorerLinkType.ACCOUNT)}/${address}`)
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
