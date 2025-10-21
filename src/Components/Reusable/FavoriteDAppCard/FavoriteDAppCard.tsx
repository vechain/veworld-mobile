import React, { memo } from "react"
import { Image, ImageStyle, StyleProp, StyleSheet } from "react-native"
import { ScaleDecorator, ShadowDecorator } from "react-native-draggable-flatlist"
import { BaseIcon, BaseSpacer, BaseText, BaseTouchable, BaseView } from "~Components"
import { DiscoveryDApp } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useAppLogo } from "~Hooks/useAppLogo"
import FontUtils from "~Utils/FontUtils"

type Props = {
    dapp: DiscoveryDApp
    isEditMode: boolean
    isActive: boolean
    onPress: (dapp: DiscoveryDApp) => void
    onLongPress: (dapp: DiscoveryDApp) => void
    onRightActionPress: (dapp: DiscoveryDApp) => void
    onRightActionLongPress?: (dapp: DiscoveryDApp) => void
}

const IMAGE_SIZE = 48

export const FavoriteDAppCard: React.FC<Props> = memo(
    ({ dapp, isEditMode, isActive, onPress, onLongPress, onRightActionPress, onRightActionLongPress }: Props) => {
        const { styles, theme } = useThemedStyles(baseStyles)

        const appLogo = useAppLogo({ app: dapp })

        return (
            <ScaleDecorator activeScale={1.05}>
                <ShadowDecorator elevation={1} radius={4} opacity={0.2} color={theme.colors.backgroundReversed}>
                    <BaseView flexDirection="row" flex={1} bg={theme.colors.background} px={16} mb={16}>
                        <BaseTouchable
                            disabled={isEditMode || isActive}
                            style={[styles.card]}
                            onPress={() => onPress(dapp)}
                            onLongPress={() => onLongPress?.(dapp)}>
                            <BaseView flexDirection="row" flex={1} pr={10}>
                                <Image
                                    source={{
                                        uri: appLogo,
                                    }}
                                    style={
                                        [
                                            { height: IMAGE_SIZE, width: IMAGE_SIZE },
                                            styles.icon,
                                        ] as StyleProp<ImageStyle>
                                    }
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
                                        typographyFont="captionMedium"
                                        color={theme.colors.assetDetailsCard.text}>
                                        {dapp.desc ? dapp.desc : dapp.href}
                                    </BaseText>
                                </BaseView>
                            </BaseView>
                        </BaseTouchable>
                        <BaseTouchable
                            disabled={isActive}
                            onLongPress={() => onRightActionLongPress?.(dapp)}
                            onPress={() => onRightActionPress(dapp)}
                            style={styles.touchableContainer}>
                            {isEditMode ? (
                                <BaseIcon name="icon-grip-horizontal" color={theme.colors.text} size={20} />
                            ) : (
                                <BaseIcon name="icon-more-vertical" color={theme.colors.text} size={20} />
                            )}
                        </BaseTouchable>
                    </BaseView>
                </ShadowDecorator>
            </ScaleDecorator>
        )
    },
)

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
