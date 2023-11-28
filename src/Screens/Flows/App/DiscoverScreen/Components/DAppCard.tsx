import React, { memo, useMemo } from "react"
import { Image, StyleProp, StyleSheet, ViewStyle } from "react-native"
import { useThemedStyles } from "~Hooks"
import { DiscoveryDApp } from "~Constants"
import { BaseIcon, BaseSpacer, BaseText, BaseTouchableBox, BaseView } from "~Components"
import {
    addBookmark,
    removeBookmark,
    selectCustomDapps,
    selectFavoritesDapps,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"

type Props = {
    dapp: DiscoveryDApp
    onPress: (dapp: DiscoveryDApp) => void
    containerStyle?: StyleProp<ViewStyle>
}

export const DAppCard: React.FC<Props> = memo(({ onPress, dapp, containerStyle }: Props) => {
    const { styles, theme } = useThemedStyles(baseStyles)

    const favourites = useAppSelector(selectFavoritesDapps)
    const custom = useAppSelector(selectCustomDapps)
    const dispatch = useAppDispatch()

    const isBookMarked = useMemo(() => {
        return favourites.some(fav => fav.href === dapp.href) || custom.some(fav => fav.href === dapp.href)
    }, [favourites, custom, dapp])

    const onBookmarkPress = () => {
        if (isBookMarked) {
            dispatch(removeBookmark(dapp))
        } else {
            dispatch(addBookmark(dapp))
        }
    }

    return (
        <BaseView w={100} flexDirection="row" style={containerStyle}>
            <BaseTouchableBox
                haptics="Light"
                action={() => onPress(dapp)}
                justifyContent="space-between"
                containerStyle={styles.container}>
                <BaseView flexDirection="row" style={styles.card} flex={1} pr={10}>
                    {dapp.image && <DAppIcon imageSource={dapp.image} size={40} />}

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
            </BaseTouchableBox>
            <BaseSpacer width={12} />
            <BaseIcon
                onPress={onBookmarkPress}
                name={isBookMarked ? "bookmark" : "bookmark-outline"}
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
        nameText: {
            fontWeight: "bold",
            fontSize: 16,
        },
        description: {
            fontSize: 12,
        },
    })

type IconProps = {
    imageSource: object
    size: number
}

const DAppIcon: React.FC<IconProps> = memo(({ imageSource, size }: IconProps) => {
    return (
        <BaseView>
            <Image
                source={imageSource}
                style={{
                    height: size,
                    width: size,
                }}
            />
        </BaseView>
    )
})
