import React, { memo, useMemo } from "react"
import { Image, StyleProp, StyleSheet, ViewStyle } from "react-native"
import { useThemedStyles } from "~Hooks"
import { ColorThemeType, CompatibleDApp } from "~Constants"
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
    dapp: CompatibleDApp
    onPress: (dapp: CompatibleDApp) => void
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
                    <DAppIcon imageSource={dapp.image} size={50} />
                    <BaseSpacer width={12} />
                    <BaseView flex={1}>
                        <BaseText ellipsizeMode="tail" numberOfLines={1}>
                            {dapp.name}
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
    imageSource: object | string
    size?: number
}

const DAppIcon: React.FC<IconProps> = memo(({ imageSource, size }: IconProps) => {
    return (
        <BaseView>
            <Image
                source={typeof imageSource === "string" ? { uri: imageSource } : imageSource}
                style={{ height: size, width: size }}
            />
        </BaseView>
    )
})
