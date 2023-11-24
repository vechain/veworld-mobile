import React, { memo, useMemo } from "react"
import { Image, ImageSourcePropType, StyleProp, StyleSheet, ViewStyle } from "react-native"
import { useThemedStyles } from "~Hooks"
import { ColorThemeType, DiscoveryDApp } from "~Constants"
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
                <BaseView flexDirection="row" flex={1} pr={10}>
                    <DAppIcon imageSource={dapp.image} href={dapp.href} />
                    <BaseSpacer width={12} />
                    <BaseView flex={1}>
                        <BaseText ellipsizeMode="tail" numberOfLines={1}>
                            {dapp.name}
                        </BaseText>
                        <BaseText ellipsizeMode="tail" numberOfLines={1}>
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

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        wallet: {
            opacity: 0.7,
        },
        address: {
            opacity: 0.7,
        },
        container: {
            flex: 1,
        },
        selectedContainer: {
            borderWidth: 1,
            borderRadius: 16,
            borderColor: theme.colors.text,
        },
        rightSubContainer: {
            flexDirection: "column",
            alignItems: "flex-end",
        },
        eyeIcon: { marginLeft: 16, flex: 0.1 },
    })

type IconProps = {
    imageSource?: object
    href: string
}

const DAppIcon: React.FC<IconProps> = memo(({ imageSource, href }: IconProps) => {
    const source: ImageSourcePropType = useMemo(() => {
        if (imageSource) return imageSource

        try {
            const url = new URL(href)

            return {
                uri: `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent("https://" + url.hostname)}`,
            }
        } catch {
            return {
                uri: "",
            }
        }
    }, [imageSource, href])

    const imageStyle = useMemo(() => {
        if (imageSource)
            return {
                height: 50,
                width: 50,
            }

        return {
            height: 16,
            width: 16,
        }
    }, [imageSource])

    return (
        <BaseView>
            <Image source={source} style={imageStyle} />
        </BaseView>
    )
})
