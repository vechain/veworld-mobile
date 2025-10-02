import React, { PropsWithChildren, useMemo } from "react"
import { StyleSheet, TouchableOpacity } from "react-native"
import Animated, { LinearTransition } from "react-native-reanimated"
import { BaseIcon, BaseSpacer, BaseText, DAppIcon } from "~Components"
import { BaseView } from "~Components/Base/BaseView"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { wrapFunctionComponent } from "~Utils/ReanimatedUtils/Reanimated"
import { LAYOUT_TRANSITION } from "./constants"
import { useX2EAppAnimation } from "./Hooks/useX2EAppAnimation"
import { RowExpandableDetails } from "./RowExpandableDetails"

const AnimatedBaseView = Animated.createAnimatedComponent(wrapFunctionComponent(BaseView))

type AppRowDetailsProps = PropsWithChildren<{
    name: string
    icon: string
    desc?: string
    categories?: string[]
    isDefaultVisible?: boolean
    isFavorite?: boolean
    onToggleFavorite?: () => void
    itemId?: string
    isOpen?: boolean
    onToggleOpen?: (itemId: string) => void
}>

export const RowDetails = React.memo(
    ({
        name,
        icon,
        desc,
        categories = [],
        children,
        isDefaultVisible = false,
        isFavorite = false,
        onToggleFavorite,
        itemId,
        isOpen,
        onToggleOpen,
    }: AppRowDetailsProps) => {
        const { styles, theme } = useThemedStyles(baseStyles)

        const {
            state,
            handlers,
            styles: animatedStyles,
        } = useX2EAppAnimation({
            isDefaultVisible,
            itemId,
            isOpen,
            onToggleOpen,
        })

        const { showDetails, isAnimating, contentVisible } = state
        const { toggleDetails, onPressIn, onPressOut } = handlers

        const categoryElements = useMemo(() => {
            return categories.map((category, index) => (
                <BaseText
                    key={category}
                    bg={theme.colors.x2eAppOpenDetails.label.background}
                    px={8}
                    py={4}
                    borderRadius={4}
                    typographyFont="captionMedium"
                    color={theme.colors.x2eAppOpenDetails.label.text}
                    testID={`DAPP_WITH_DETAILS_CATEGORY_${index}`}>
                    {category}
                </BaseText>
            ))
        }, [categories, theme.colors.x2eAppOpenDetails.label])

        const favoriteButton = useMemo(() => {
            if (showDetails) return null

            return (
                <TouchableOpacity
                    onPress={e => {
                        e.stopPropagation()
                        onToggleFavorite?.()
                    }}
                    style={styles.iconWrapper}>
                    <BaseIcon
                        name={isFavorite ? "icon-star-on" : "icon-star"}
                        haptics="Light"
                        size={20}
                        color={theme.colors.x2eAppOpenDetails.description}
                    />
                </TouchableOpacity>
            )
        }, [showDetails, isFavorite, onToggleFavorite, styles.iconWrapper, theme.colors.x2eAppOpenDetails.description])

        return (
            <AnimatedBaseView
                flexDirection="column"
                layout={LAYOUT_TRANSITION}
                style={[styles.mainContainer, animatedStyles.containerStyle]}>
                <Animated.View style={animatedStyles.pressAnimationStyle}>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={toggleDetails}
                        onPressIn={onPressIn}
                        onPressOut={onPressOut}
                        disabled={isAnimating}
                        testID="X2E_APP_WITH_DETAILS_ROW">
                        <BaseView justifyContent="center">
                            <Animated.View style={[styles.chevron, animatedStyles.chevronStyle]}>
                                <BaseIcon
                                    name="icon-chevron-up"
                                    size={16}
                                    color={theme.colors.x2eAppOpenDetails.chevron.icon}
                                />
                            </Animated.View>
                        </BaseView>
                        <AnimatedBaseView
                            flexDirection="row"
                            mb={4}
                            style={[animatedStyles.padding]}
                            layout={LinearTransition.springify().damping(20).stiffness(100).mass(0.6)}>
                            <BaseView flexDirection="row" flex={1} alignItems="flex-start">
                                <DAppIcon uri={icon} size={64} />
                                <Animated.View style={animatedStyles.spacerStyle} />
                                <BaseView flexDirection="column" gap={10} overflow="hidden" pr={16} flex={1}>
                                    <BaseText
                                        style={styles.appNameText}
                                        typographyFont="bodySemiBold"
                                        numberOfLines={1}
                                        testID="X2E_APP_WITH_DETAILS_NAME">
                                        {name}
                                    </BaseText>

                                    {showDetails ? (
                                        <Animated.View
                                            style={[animatedStyles.contentStyle, animatedStyles.categoryLabelStyle]}>
                                            <BaseView flexDirection="row" flexWrap="wrap" gap={8}>
                                                {categoryElements}
                                            </BaseView>
                                        </Animated.View>
                                    ) : (
                                        <Animated.View style={animatedStyles.descriptionStyle}>
                                            <BaseText
                                                typographyFont="captionRegular"
                                                numberOfLines={2}
                                                ellipsizeMode="tail"
                                                color={theme.colors.x2eAppOpenDetails.description}
                                                w={100}
                                                testID="DAPP_WITH_DETAILS_DESC">
                                                {desc}
                                            </BaseText>
                                        </Animated.View>
                                    )}
                                </BaseView>
                                <BaseSpacer width={12} />
                            </BaseView>
                            {favoriteButton}
                        </AnimatedBaseView>
                    </TouchableOpacity>
                </Animated.View>

                {showDetails && (
                    <Animated.View>
                        <RowExpandableDetails show={showDetails} visible={contentVisible}>
                            {children}
                        </RowExpandableDetails>
                    </Animated.View>
                )}
            </AnimatedBaseView>
        )
    },
)

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        mainContainer: {
            backgroundColor: theme.colors.x2eAppOpenDetails.background,
            transformOrigin: "center",
            overflow: "hidden",
        },
        iconWrapper: {
            padding: 10,
        },
        chevron: {
            position: "absolute",
            right: 14,
            top: 14,
            borderRadius: 99,
            padding: 8,
            backgroundColor: theme.colors.x2eAppOpenDetails.chevron.background,
        },
        appNameText: {
            color: theme.colors.x2eAppOpenDetails.title,
            fontFamily: "Inter-SemiBold",
        },
    })
