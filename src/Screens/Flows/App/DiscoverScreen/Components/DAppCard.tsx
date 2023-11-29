import React, { memo } from "react"
import { Image, StyleProp, StyleSheet, ViewStyle } from "react-native"
import { useDappBookmarking, useThemedStyles } from "~Hooks"
import { DiscoveryDApp } from "~Constants"
import { BaseIcon, BaseSpacer, BaseText, BaseTouchableBox, BaseView } from "~Components"

type Props = {
    dapp: DiscoveryDApp
    onPress: (dapp: DiscoveryDApp) => void
    containerStyle?: StyleProp<ViewStyle>
}

export const DAppCard: React.FC<Props> = memo(({ onPress, dapp, containerStyle }: Props) => {
    const { styles, theme } = useThemedStyles(baseStyles)

    const { isBookMarked, toggleBookmark } = useDappBookmarking(dapp.href, dapp?.name)

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
                onPress={toggleBookmark}
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
