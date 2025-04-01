import React, { memo } from "react"
import { Image, ImageStyle, StyleProp, StyleSheet } from "react-native"
import { BaseIcon, BaseSpacer, BaseText, BaseTouchable, BaseView } from "~Components"
import { DiscoveryDApp } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { DAppUtils } from "~Utils"

type Props = {
    dapp: DiscoveryDApp
    isEditMode: boolean
    isActive: boolean
    onDAppPress: (dapp: DiscoveryDApp) => void
    onMorePress: (dapp: DiscoveryDApp) => void
}

const IMAGE_SIZE = 48

export const FavoriteDAppCard: React.FC<Props> = memo(
    ({ dapp, isEditMode, isActive, onDAppPress, onMorePress }: Props) => {
        const { styles, theme } = useThemedStyles(baseStyles)

        const getIconName = () => {
            return !isEditMode ? "icon-more-vertical" : "icon-grip-horizontal"
        }

        return (
            <BaseView flexDirection="row" flex={1}>
                <BaseTouchable disabled={isEditMode || isActive} style={styles.card} onPress={() => onDAppPress(dapp)}>
                    <BaseView flexDirection="row" flex={1} pr={10}>
                        <Image
                            source={{
                                uri: dapp.id
                                    ? DAppUtils.getAppHubIconUrl(dapp.id)
                                    : `${process.env.REACT_APP_GOOGLE_FAVICON_URL}${dapp.href}`,
                            }}
                            style={
                                [
                                    { height: IMAGE_SIZE, width: IMAGE_SIZE, backgroundColor: theme.colors.card },
                                    styles.icon,
                                ] as StyleProp<ImageStyle>
                            }
                            resizeMode="contain"
                        />
                        <BaseSpacer width={12} />
                        <BaseView flex={1}>
                            <BaseText ellipsizeMode="tail" numberOfLines={1} style={styles.nameText}>
                                {dapp.name}
                            </BaseText>
                            <BaseSpacer height={4} />
                            <BaseText ellipsizeMode="tail" numberOfLines={1} style={styles.description}>
                                {dapp.desc ? dapp.desc : dapp.href}
                            </BaseText>
                        </BaseView>
                    </BaseView>
                </BaseTouchable>
                <BaseSpacer width={12} />
                <BaseIcon
                    disabled={isActive}
                    onPress={() => onMorePress(dapp)}
                    name={getIconName()}
                    color={theme.colors.text}
                    size={24}
                />
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
            height: 60,
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
