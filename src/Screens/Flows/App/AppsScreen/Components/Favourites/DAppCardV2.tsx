import React, { useEffect } from "react"
import { StyleSheet, TouchableOpacity } from "react-native"
import Animated, { ZoomIn, ZoomOut } from "react-native-reanimated"
import { BaseIcon, BaseText, BaseTouchable, BaseView, DAppIcon, DappIconSize } from "~Components"
import { COLORS, DiscoveryDApp, TFonts } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useShakeAnimation } from "~Hooks/useShakeAnimation"
import { useAppLogo } from "~Hooks/useAppLogo"

const ACTIVE_CARD_OPACITY = 0.4

type Props = {
    dapp: DiscoveryDApp
    /**
     * Show the dapp name.
     * @default false
     */
    showDappTitle?: boolean
    onPress: () => void
    /**
     * Long press handler for drag-and-drop
     */
    onLongPress?: () => void
    /**
     * Whether the card is in edit mode (shaking with X icon)
     * @default false
     */
    isEditMode?: boolean
    /**
     * Whether the card is being actively dragged
     * @default false
     */
    isActive?: boolean
    /**
     * Callback when X icon is pressed to remove the dapp
     */
    onRemove?: () => void
    /**
     * Animation direction for shake effect
     * 1 = start left to right, -1 = start right to left
     * @default 1
     */
    animationDirection?: 1 | -1
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
    onLongPress,
    isEditMode = false,
    isActive = false,
    onRemove,
    animationDirection = 1,
    showDappTitle = false,
    iconSize = 64,
    iconBg,
    typographyFont = "bodyMedium",
}: Props) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const textColor = theme.isDark ? COLORS.WHITE : COLORS.GREY_800
    const { animatedStyles, startShaking, stopShaking } = useShakeAnimation({ direction: animationDirection })

    const iconUri = useAppLogo({ app: dapp })

    useEffect(() => {
        if (isEditMode) {
            startShaking()
        } else {
            stopShaking()
        }
    }, [isEditMode, startShaking, stopShaking])

    return (
        <Animated.View
            entering={ZoomIn}
            exiting={ZoomOut}
            style={[animatedStyles, styles.container, isActive && styles.activeCard]}>
            <BaseTouchable
                testID={`dapp-card-${dapp.id}`}
                style={[styles.rootContainer, { width: iconSize }]}
                onPress={onPress}
                onLongPress={onLongPress}>
                <DAppIcon size={iconSize} uri={iconUri} fallbackBg={iconBg} />
                {showDappTitle && (
                    <BaseText numberOfLines={1} typographyFont={typographyFont} color={textColor}>
                        {dapp.name}
                    </BaseText>
                )}
            </BaseTouchable>

            {isEditMode && onRemove && !isActive && (
                <TouchableOpacity
                    testID={`dapp-card-remove-${dapp.id}`}
                    style={styles.removeButton}
                    onPress={onRemove}
                    activeOpacity={0.7}>
                    <BaseView style={styles.removeIconContainer}>
                        <BaseIcon name="icon-minus" size={12} color={COLORS.WHITE} />
                    </BaseView>
                </TouchableOpacity>
            )}
        </Animated.View>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        container: {
            position: "relative",
        },
        rootContainer: {
            justifyContent: "center",
            flexDirection: "column",
            gap: 12,
        },
        tag: {
            textTransform: "capitalize",
        },
        removeButton: {
            position: "absolute",
            top: -6,
            right: -6,
            zIndex: 10,
        },
        removeIconContainer: {
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: COLORS.DARK_PURPLE,
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 2,
            borderColor: COLORS.WHITE,
        },
        activeCard: {
            opacity: ACTIVE_CARD_OPACITY,
        },
    })
