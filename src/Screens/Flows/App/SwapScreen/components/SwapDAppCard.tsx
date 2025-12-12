import React from "react"
import { StyleSheet } from "react-native"
import { BaseSpacer, BaseText, BaseTouchable, BaseView, DAppIcon } from "~Components"
import { DiscoveryDApp } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useAppLogo } from "~Hooks/useAppLogo"
import FontUtils from "~Utils/FontUtils"

type Props = {
    dapp: DiscoveryDApp
    onDAppPress: (dapp: DiscoveryDApp) => void
}

const IMAGE_SIZE = 48

export const SwapDAppCard = ({ dapp, onDAppPress }: Props) => {
    const { theme, styles } = useThemedStyles(baseStyles)

    const iconUri = useAppLogo({ app: dapp, size: IMAGE_SIZE })

    return (
        <BaseView flexDirection="row" flex={1} bg={theme.colors.background} px={16}>
            <BaseTouchable style={[styles.card]} onPress={() => onDAppPress(dapp)}>
                <BaseView flexDirection="row" flex={1} pr={10}>
                    <DAppIcon size={IMAGE_SIZE} uri={iconUri} />
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
                            typographyFont="captionRegular"
                            color={theme.colors.assetDetailsCard.text}>
                            {dapp.desc || dapp.href}
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
            fontSize: FontUtils.font(14),
        },
        description: {
            fontSize: FontUtils.font(12),
        },
    })
