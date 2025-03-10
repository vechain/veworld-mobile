import { Image, StyleSheet } from "react-native"
import React from "react"
import { BaseText, BaseView, BaseSpacer, BaseSkeleton } from "~Components"
import Animated from "react-native-reanimated"
import { useTheme } from "~Hooks"
import { COLORS } from "~Constants"

type BaseTokenCardProps = {
    icon: string
    symbol: string
    isLoading: boolean
    isBalanceVisible: boolean
    tokenBalance: string
    rightContent: React.ReactNode
}

export const BaseTokenCard = ({
    icon,
    symbol,
    isLoading,
    isBalanceVisible,
    tokenBalance,
    rightContent,
}: BaseTokenCardProps) => {
    const theme = useTheme()
    const tokenValueLabelColor = theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500

    return (
        <Animated.View style={[styles.innerRow]}>
            <BaseView flexDirection="row">
                <BaseView style={[styles.imageContainer]}>
                    <Image source={{ uri: icon }} style={styles.image} />
                </BaseView>
                <BaseSpacer width={16} />
                <BaseView alignItems="flex-start" justifyContent="center">
                    <BaseText typographyFont="bodyBold">{symbol}</BaseText>
                    <BaseSpacer height={2} />

                    <BaseView flexDirection="row">
                        {isLoading ? (
                            <BaseView flexDirection="row">
                                <BaseSkeleton
                                    containerStyle={styles.skeletonBalance}
                                    animationDirection="horizontalLeft"
                                    boneColor={theme.colors.skeletonBoneColor}
                                    highlightColor={theme.colors.skeletonHighlightColor}
                                    height={14}
                                />
                            </BaseView>
                        ) : (
                            <BaseView flexDirection="row">
                                <BaseText typographyFont="bodyMedium" color={tokenValueLabelColor}>
                                    {isBalanceVisible ? tokenBalance : "•••••"}{" "}
                                </BaseText>
                            </BaseView>
                        )}
                    </BaseView>
                </BaseView>
            </BaseView>
            {rightContent}
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    imageContainer: {
        borderRadius: 30,
        padding: 10,
        backgroundColor: COLORS.GREY_50,
    },
    imageShadow: {
        width: "auto",
    },
    image: { width: 20, height: 20 },
    innerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        paddingHorizontal: 16,
    },
    skeletonBalance: { width: 50, paddingVertical: 2 },
})
