import React from "react"
import { StyleSheet } from "react-native"
import Animated, { ZoomIn, ZoomOut } from "react-native-reanimated"
import { BaseText, BaseTouchable, DAppIcon, DappIconSize } from "~Components"
import { COLORS, DiscoveryDApp, TFonts } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useAppLogo } from "~Hooks/useAppLogo"

type Props = {
    dapp: DiscoveryDApp
    /**
     * Show the dapp name.
     * @default false
     */
    showDappTitle?: boolean
    onPress: () => void
    /**
     * Size of the icon/image.
     * @default 64
     */
    iconSize?: DappIconSize
    /**
     * Background color for the icon
     */
    iconBg?: string
    /**
     * Show the dapp title.
     * @default false
     */
    typographyFont?: TFonts
}

export const DAppCardV2 = ({
    dapp,
    onPress,
    showDappTitle = false,
    iconSize = 64,
    iconBg,
    typographyFont = "bodyMedium",
}: Props) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const textColor = theme.isDark ? COLORS.WHITE : COLORS.GREY_800

    const iconUri = useAppLogo({ app: dapp })

    return (
        <Animated.View entering={ZoomIn} exiting={ZoomOut}>
            <BaseTouchable
                testID={`dapp-card-${dapp.id}`}
                style={[styles.rootContainer, { width: iconSize }]}
                onPress={onPress}>
                <DAppIcon size={iconSize} uri={iconUri} fallbackBg={iconBg} />
                {showDappTitle && (
                    <BaseText numberOfLines={1} typographyFont={typographyFont} color={textColor}>
                        {dapp.name}
                    </BaseText>
                )}
            </BaseTouchable>
        </Animated.View>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        rootContainer: {
            justifyContent: "center",
            flexDirection: "column",
            gap: 12,
        },
        tag: {
            textTransform: "capitalize",
        },
    })
