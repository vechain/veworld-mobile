import React, { memo } from "react"
import { Image, ImageStyle, StyleProp, StyleSheet } from "react-native"

import { BaseIcon, BaseSpacer, BaseText, BaseTouchable, BaseView } from "~Components"
import { DiscoveryDApp } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useAppLogo } from "~Hooks/useAppLogo"

type Props = {
    dapp: DiscoveryDApp
    isEditMode: boolean
    isActive: boolean
    onPress: (dapp: DiscoveryDApp) => void
    onLongPress: (dapp: DiscoveryDApp) => void
    onRightActionPress: (dapp: DiscoveryDApp, isEditMode: boolean) => void
    onRightActionLongPress?: (dapp: DiscoveryDApp) => void
    px?: number
}

const IMAGE_SIZE = 64

export const FavoriteDAppCard: React.FC<Props> = memo(
    ({
        dapp,
        isEditMode,
        isActive,
        onPress,
        onLongPress,
        onRightActionPress,
        onRightActionLongPress,
        px = 0, // No outer padding needed since bottom sheet provides 20px + card provides 4px base
    }: Props) => {
        const { styles, theme } = useThemedStyles(baseStyles)

        const iconUri = useAppLogo({ app: dapp })

        return (
            <BaseView flexDirection="row" flex={1} px={px} mb={8}>
                <BaseView
                    flexDirection="row"
                    flex={1}
                    px={4}
                    bg={isActive ? theme.colors.actionBottomSheet.isActiveBackground : undefined}
                    style={isActive ? styles.activeContainer : undefined}>
                    <BaseTouchable
                        disabled={isEditMode || isActive}
                        style={[styles.card]}
                        onPress={() => onPress(dapp)}
                        onLongPress={() => onLongPress?.(dapp)}>
                        <BaseView flexDirection="row" alignItems="flex-start" flex={1} pr={10}>
                            <Image
                                source={{
                                    uri: iconUri,
                                }}
                                style={
                                    [{ height: IMAGE_SIZE, width: IMAGE_SIZE }, styles.icon] as StyleProp<ImageStyle>
                                }
                                resizeMode="contain"
                            />
                            <BaseSpacer width={24} />
                            <BaseView flex={1}>
                                <BaseText
                                    ellipsizeMode="tail"
                                    numberOfLines={1}
                                    typographyFont="subSubTitleSemiBold"
                                    color={theme.colors.assetDetailsCard.title}>
                                    {dapp.name}
                                </BaseText>
                                <BaseSpacer height={4} />
                                <BaseText
                                    numberOfLines={2}
                                    ellipsizeMode="tail"
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
                        onPress={() => onRightActionPress(dapp, isEditMode)}
                        style={styles.touchableContainer}>
                        {isEditMode ? (
                            <BaseIcon
                                name="icon-grip-horizontal"
                                color={theme.colors.actionBottomSheet.icon}
                                size={20}
                            />
                        ) : (
                            <BaseIcon
                                name="icon-star-on"
                                color={theme.colors.actionBottomSheet.favoriteIcon}
                                size={20}
                            />
                        )}
                    </BaseTouchable>
                </BaseView>
            </BaseView>
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
            paddingHorizontal: 4,
            paddingVertical: 8,
        },
        activeContainer: {
            borderRadius: 12,
        },
        touchableContainer: {
            width: 40,
            height: 40,
            alignItems: "center",
            justifyContent: "center",
        },
        icon: {
            borderRadius: 8,
            overflow: "hidden",
            width: 64,
            height: 64,
        },
        nameText: {
            fontWeight: "bold",
            fontSize: 16,
        },
        description: {
            fontSize: 12,
        },
    })
