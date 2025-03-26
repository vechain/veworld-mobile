import React, { memo } from "react"
import { Image, ImageStyle, StyleProp, StyleSheet } from "react-native"
import { BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { DiscoveryDApp } from "~Constants"
import { useDappBookmarking, useThemedStyles } from "~Hooks"
import { DAppUtils } from "~Utils"

type Props = {
    dapp: DiscoveryDApp
    isEditMode: boolean
    isActive: boolean
    onDAppPress: ({ href }: { href: string; custom?: boolean }) => void
}

const IMAGE_SIZE = 48

export const FavoriteDAppCard: React.FC<Props> = memo(({ dapp, isEditMode, isActive }: Props) => {
    const { styles, theme } = useThemedStyles(baseStyles)

    const { toggleBookmark } = useDappBookmarking(dapp.href, dapp?.name)

    const getIconName = () => {
        return !isEditMode ? "icon-more-vertical" : "icon-grip-horizontal"
    }

    return (
        <BaseView flexDirection="row" flex={1}>
            <BaseView flexDirection="row" style={styles.card} flex={1} pr={10}>
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
                    <BaseText ellipsizeMode="tail" numberOfLines={2} style={styles.description}>
                        {dapp.desc ? dapp.desc : dapp.href}
                    </BaseText>
                </BaseView>
            </BaseView>
            <BaseSpacer width={12} />
            <BaseIcon
                disabled={isActive}
                onPress={toggleBookmark}
                name={getIconName()}
                color={theme.colors.text}
                size={24}
            />
        </BaseView>
    )
})

const baseStyles = () =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        card: {
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
