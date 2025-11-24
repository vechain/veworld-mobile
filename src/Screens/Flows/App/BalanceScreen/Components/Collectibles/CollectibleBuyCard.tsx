import { useNavigation } from "@react-navigation/native"
import React, { useCallback } from "react"
import { Image, ImageStyle, Pressable, StyleSheet } from "react-native"
import { CollectiblesEmptyState } from "~Assets"
import { BaseIcon, BaseText } from "~Components"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { DappTypeV2 } from "~Screens/Flows/App/AppsScreen/Components/Ecosystem/types"

export const CollectibleBuyCard = () => {
    const { LL } = useI18nContext()
    const { styles } = useThemedStyles(baseStyles)
    const nav = useNavigation()
    const handlePress = useCallback(() => {
        nav.navigate(Routes.APPS_STACK, {
            screen: Routes.APPS,
            params: {
                filter: DappTypeV2.NFTS,
            },
        })
    }, [nav])
    return (
        <Pressable testID={"COLLECTIBLE_BUY_CARD"} style={styles.root} onPress={handlePress}>
            <Image source={CollectiblesEmptyState} style={styles.image as ImageStyle} resizeMode="contain" />
            <BaseIcon name="icon-shopping-cart" color={COLORS.WHITE} size={16} />
            <BaseText typographyFont="smallCaptionSemiBold" color={COLORS.WHITE}>
                {LL.BUY_NEW_COLLECTIBLES()}
            </BaseText>
        </Pressable>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        root: {
            borderRadius: 12,
            position: "relative",
            flex: 1,
            overflow: "hidden",
            aspectRatio: 0.8791,
            maxWidth: "50%",
            backgroundColor: COLORS.PURPLE,
            gap: 8,
            padding: 16,
            alignItems: "center",
        },
        image: {
            flex: 1,
        },
    })
