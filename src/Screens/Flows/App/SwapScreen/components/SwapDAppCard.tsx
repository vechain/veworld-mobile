import React from "react"
import { ImageStyle, StyleProp, Image, StyleSheet } from "react-native"
import { BaseView, BaseTouchable, BaseText, BaseSpacer } from "~Components"
import { DiscoveryDApp } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { DAppUtils } from "~Utils"

type Props = {
    dapp: DiscoveryDApp
    onDAppPress: (dapp: DiscoveryDApp) => void
}

const IMAGE_SIZE = 48

export const SwapDAppCard = ({ dapp, onDAppPress }: Props) => {
    const { theme, styles } = useThemedStyles(baseStyles)
    return (
        <BaseView flexDirection="row" flex={1} bg={theme.colors.background} px={16}>
            <BaseTouchable style={[styles.card]} onPress={() => onDAppPress(dapp)}>
                <BaseView flexDirection="row" flex={1} pr={10}>
                    <Image
                        source={{
                            uri: dapp.id
                                ? DAppUtils.getAppHubIconUrl(dapp.id)
                                : `${process.env.REACT_APP_GOOGLE_FAVICON_URL}${dapp.href}`,
                        }}
                        style={[{ height: IMAGE_SIZE, width: IMAGE_SIZE }, styles.icon] as StyleProp<ImageStyle>}
                        resizeMode="contain"
                    />
                    <BaseSpacer width={12} />
                    <BaseView flex={1}>
                        <BaseText
                            ellipsizeMode="tail"
                            numberOfLines={1}
                            typographyFont="bodySemiBold"
                            color={theme.colors.assetDetailsCard.title}>
                            {dapp.name}
                        </BaseText>
                        <BaseSpacer height={4} />
                        <BaseText
                            ellipsizeMode="tail"
                            numberOfLines={1}
                            typographyFont="caption"
                            color={theme.colors.assetDetailsCard.text}>
                            {dapp.desc ? dapp.desc : dapp.href}
                        </BaseText>
                    </BaseView>
                </BaseView>
            </BaseTouchable>
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        card: {
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            height: 60,
        },
        touchableContainer: {
            width: 40,
            height: 40,
            alignItems: "center",
            justifyContent: "center",
        },
        icon: {
            borderRadius: 4,
            overflow: "hidden",
        },
        nameText: {
            fontWeight: "bold",
            fontSize: 16,
        },
        description: {
            fontSize: 12,
        },
    })
