import { PropsWithChildren, default as React, useMemo, useState } from "react"
import { Image, ImageStyle, StyleProp, StyleSheet, TouchableOpacity } from "react-native"
import Animated, { LinearTransition, useAnimatedStyle, withTiming } from "react-native-reanimated"
import { BaseIcon, BaseText } from "~Components"
import { BaseView } from "~Components/Base/BaseView"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { wrapFunctionComponent } from "~Utils/ReanimatedUtils/Reanimated"
import { X2EAppDetails } from "./X2EAppDetails"

const AnimatedBaseView = Animated.createAnimatedComponent(wrapFunctionComponent(BaseView))

type Props = PropsWithChildren<{
    name: string
    icon: string
    desc?: string
    category?: string
    /**
     * True if the details should be visible by default, false otherwise. Defaults to false
     */
    isDefaultVisible?: boolean
}>

export const X2EAppWithDetails = ({
    name,
    icon,
    desc,
    category = "Food & Drinks",
    children,
    isDefaultVisible = false,
}: Props) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const [loadFallback, setLoadFallback] = useState(false)
    const [showDetails, setShowDetails] = useState(isDefaultVisible)

    const toggleDetails = () => {
        setShowDetails(prev => !prev)
    }

    const containerStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: showDetails
                ? withTiming(theme.colors.assetDetailsCard.background, { duration: 100 })
                : withTiming(theme.colors.card, { duration: 0 }),
            borderRadius: showDetails ? withTiming(24, { duration: 100 }) : withTiming(0, { duration: 100 }),
        }
    }, [showDetails])

    const padding = useMemo(() => {
        return showDetails ? 24 : 0
    }, [showDetails])

    return (
        <AnimatedBaseView
            flexDirection="column"
            layout={LinearTransition.duration(300)}
            style={[styles.mainContainer, containerStyle]}>
            <TouchableOpacity activeOpacity={0.7} onPress={toggleDetails} testID="X2E_APP_WITH_DETAILS_ROW">
                <BaseView justifyContent="center">
                    {showDetails && (
                        <BaseView style={styles.chevron}>
                            <BaseIcon name="icon-chevron-up" size={16} color={theme.colors.label.text} />
                        </BaseView>
                    )}
                </BaseView>
                <AnimatedBaseView
                    flexDirection="row"
                    style={{ padding: padding }}
                    layout={LinearTransition.duration(100)}>
                    <BaseView flexDirection="row" gap={24} flex={1}>
                        <Image
                            source={
                                loadFallback
                                    ? require("~Assets/Img/dapp-fallback.png")
                                    : {
                                          uri: icon,
                                      }
                            }
                            style={[{ height: 64, width: 64 }, styles.icon] as StyleProp<ImageStyle>}
                            onError={() => setLoadFallback(true)}
                            resizeMode="contain"
                        />
                        <BaseView flexDirection="column" gap={4} pr={100} overflow="hidden">
                            <BaseText
                                typographyFont={showDetails ? "subTitleSemiBold" : "subSubTitleSemiBold"}
                                numberOfLines={1}
                                color={theme.colors.assetDetailsCard.title}
                                testID="DAPP_WITH_DETAILS_NAME">
                                {name}
                            </BaseText>
                            {showDetails ? (
                                <BaseText
                                    bg={theme.colors.label.backgroundLighter}
                                    px={8}
                                    py={4}
                                    borderRadius={4}
                                    typographyFont="captionMedium"
                                    color={theme.colors.label.text}
                                    testID="DAPP_WITH_DETAILS_URL">
                                    {category}
                                </BaseText>
                            ) : (
                                <BaseText
                                    typographyFont="captionRegular"
                                    numberOfLines={2}
                                    ellipsizeMode="tail"
                                    pr={24}
                                    color={theme.colors.assetDetailsCard.text}
                                    testID="DAPP_WITH_DETAILS_URL">
                                    {desc}
                                </BaseText>
                            )}
                        </BaseView>
                    </BaseView>
                </AnimatedBaseView>
            </TouchableOpacity>
            <X2EAppDetails show={showDetails}>{children}</X2EAppDetails>
        </AnimatedBaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        mainContainer: {
            backgroundColor: theme.colors.editSpeedBs.result.background,
            transformOrigin: "center",
            overflow: "hidden",
        },
        icon: {
            borderRadius: 8,
            overflow: "hidden",
        },
        chevron: {
            position: "absolute",
            right: 14,
            top: 14,
            borderRadius: 99,
            padding: 8,
            backgroundColor: theme.colors.label.background,
        },
    })
