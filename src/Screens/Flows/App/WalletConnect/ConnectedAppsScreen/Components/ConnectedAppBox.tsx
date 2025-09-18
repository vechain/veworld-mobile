import React, { memo, useMemo, useState } from "react"
import { StyleProp, StyleSheet } from "react-native"
import FastImage, { ImageStyle } from "react-native-fast-image"
import { BaseCard, BaseIcon, BaseText, BaseView } from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useDynamicAppLogo } from "~Hooks/useAppLogo"
import { DAppUtils } from "~Utils"
import { ConnectedApp } from "../ConnectedAppUtils"

type Props = {
    connectedApp: ConnectedApp
}

const IMAGE_SIZE = 64

export const ConnectedAppBox: React.FC<Props> = memo(({ connectedApp }: Props) => {
    const [loadFallback, setLoadFallback] = useState(false)
    const { styles, theme } = useThemedStyles(baseStyles)
    const fetchDynamicAppLogo = useDynamicAppLogo({ size: IMAGE_SIZE })

    const name = useMemo(() => {
        if (connectedApp.type === "in-app") {
            return connectedApp.app.name
        } else return connectedApp.session.peer.metadata.name
    }, [connectedApp])

    const description = useMemo(() => {
        if (connectedApp.type === "in-app") {
            return new URL(connectedApp.app.href).hostname
        } else return new URL(connectedApp.session.peer.metadata.url).hostname
    }, [connectedApp])

    const icon = useMemo(() => {
        if (connectedApp.type === "in-app") {
            return { uri: fetchDynamicAppLogo({ app: connectedApp.app }) }
        } else
            return {
                uri:
                    connectedApp.session.peer.metadata.icons[0] ??
                    DAppUtils.generateFaviconUrl(connectedApp.session.peer.metadata.url, { size: IMAGE_SIZE }),
            }
    }, [connectedApp, fetchDynamicAppLogo])

    return (
        <BaseCard style={styles.container}>
            <BaseView w={100} flexDirection="row" gap={24}>
                <BaseView style={styles.iconContainer}>
                    {loadFallback ? (
                        <BaseIcon
                            name="icon-globe"
                            size={32}
                            color={theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.GREY_400}
                            bg={theme.colors.label.background}
                            borderRadius={8}
                            style={styles.icon}
                            testID="CONNECTED_APP_FALLBACK_ICON"
                        />
                    ) : (
                        <FastImage
                            source={icon}
                            style={styles.dappImage as StyleProp<ImageStyle>}
                            onError={() => setLoadFallback(true)}
                            resizeMode="contain"
                            testID="CONNECTED_APP_IMAGE"
                        />
                    )}
                </BaseView>

                {/* Title & Desc */}
                <BaseView flex={1} justifyContent="center">
                    <BaseText
                        typographyFont="bodySemiBold"
                        testID="CONNECTED_APP_NAME"
                        color={theme.isDark ? COLORS.GREY_50 : COLORS.GREY_700}>
                        {name}
                    </BaseText>
                    <BaseText
                        typographyFont="captionMedium"
                        numberOfLines={2}
                        testID="CONNECTED_APP_DESCRIPTION"
                        color={theme.isDark ? COLORS.GREY_400 : COLORS.GREY_500}>
                        {description}
                    </BaseText>
                </BaseView>
            </BaseView>
        </BaseCard>
    )
})

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            width: "100%",
        },
        dappImage: {
            width: IMAGE_SIZE,
            height: IMAGE_SIZE,
        },
        iconContainer: {
            borderRadius: 8,
            overflow: "hidden",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.colors.card,
            width: IMAGE_SIZE,
            height: IMAGE_SIZE,
        },
        icon: {
            padding: 16,
        },
    })
