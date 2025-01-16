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
    const tokenValueLabelColor = theme.isDark ? COLORS.PRIMARY_200 : COLORS.GREY_500

    return (
        <Animated.View style={[styles.innerRow]}>
            <BaseView flexDirection="row">
                <BaseView style={[styles.imageContainer]}>
                    <Image source={{ uri: icon }} style={styles.image} />
                </BaseView>
                <BaseSpacer width={12} />
                <BaseView alignItems="flex-start" justifyContent="center">
                    <BaseText typographyFont="captionSemiBold">{symbol}</BaseText>
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
                                <BaseText typographyFont="captionRegular" color={tokenValueLabelColor}>
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
        padding: 9,
        backgroundColor: COLORS.GREY_50,
    },
    image: { width: 14, height: 14 },
    innerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        flexGrow: 1,
    },
    skeletonBalance: { width: 50, paddingVertical: 2 },
})
