import React, { memo, useCallback } from "react"
import { StyleSheet, TouchableOpacityProps, ViewStyle } from "react-native"
import { BaseIcon, BaseSpacer, BaseText, BaseTouchableBox, BaseView, IconKey } from "~Components"
import { DiscoveryDApp } from "~Constants"
import { useDappBookmarking, useThemedStyles } from "~Hooks"
import { DAppUtils } from "~Utils"
import { DAppIcon } from "./DAppIcon"

type Props = {
    dapp: DiscoveryDApp
    onDAppPress: ({ href }: { href: string; custom?: boolean }) => void
    disabled?: boolean
    iconPressDisabled?: boolean
    iconName?: IconKey
    activeOpacity?: TouchableOpacityProps["activeOpacity"]
    opacity?: ViewStyle["opacity"]
    backgroundColor?: string
}

export const FavoriteDAppCard: React.FC<Props> = memo(
    ({
        onDAppPress,
        dapp,
        disabled = false,
        iconName,
        iconPressDisabled = false,
        activeOpacity,
        backgroundColor,
        opacity,
    }: Props) => {
        const { styles, theme } = useThemedStyles(baseStyles)

        const { isBookMarked, toggleBookmark } = useDappBookmarking(dapp.href, dapp?.name)

        const onPressCard = useCallback(() => {
            onDAppPress({ href: dapp.href })
        }, [dapp.href, onDAppPress])

        const getIconName = () => {
            if (iconName) {
                return iconName
            } else {
                return isBookMarked ? "icon-bookmark-minus" : "icon-bookmark-plus"
            }
        }

        return (
            <BaseTouchableBox
                haptics="Light"
                disabled={disabled}
                action={onPressCard}
                justifyContent="space-between"
                containerStyle={styles.container}
                activeOpacity={activeOpacity}
                bg={backgroundColor}
                opacity={opacity}>
                <BaseView flexDirection="row" style={styles.card} flex={1} pr={10}>
                    <DAppIcon
                        imageSource={{
                            uri: dapp.id
                                ? DAppUtils.getAppHubIconUrl(dapp.id)
                                : `${process.env.REACT_APP_GOOGLE_FAVICON_URL}${dapp.href}`,
                        }}
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
                    onPress={!iconPressDisabled ? toggleBookmark : undefined}
                    name={getIconName()}
                    color={theme.colors.text}
                    size={24}
                />
            </BaseTouchableBox>
        )
    },
)

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
