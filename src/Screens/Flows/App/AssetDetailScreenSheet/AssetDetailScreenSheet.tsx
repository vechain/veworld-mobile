import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import Animated from "react-native-reanimated"
import { BaseSafeArea, BaseSpacer, BaseText, BaseView, TokenSymbol } from "~Components"
import { BaseBottomSheetHandle } from "~Components/Base/BaseBottomSheetHandle"
import { TokenImage } from "~Components/Reusable/TokenImage"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useTokenDisplayName } from "~Hooks/useTokenDisplayName"
import { RootStackParamListHome, Routes } from "~Navigation"
import { AddressUtils } from "~Utils"

type Props = NativeStackScreenProps<RootStackParamListHome, Routes.TOKEN_DETAILS>

export const AssetDetailScreenSheet = ({ route }: Props) => {
    const { token } = route.params
    const { styles, theme } = useThemedStyles(baseStyles)

    const isCrossChainToken = useMemo(() => !!token.crossChainProvider, [token.crossChainProvider])
    const name = useTokenDisplayName(token)

    return (
        <BaseSafeArea grow={1} style={styles.safeArea} bg="rgba(0,0,0,0.85)">
            <Animated.View style={styles.root}>
                <BaseBottomSheetHandle color={theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.GREY_300} />
                <BaseSpacer height={8} />
                <BaseView flexDirection="row" justifyContent="space-between">
                    <BaseView flexDirection="row" gap={16}>
                        <TokenImage
                            icon={token.icon}
                            isVechainToken={AddressUtils.isVechainToken(token.address)}
                            iconSize={32}
                            isCrossChainToken={isCrossChainToken}
                            rounded={!isCrossChainToken}
                        />
                        <BaseView flexDirection="column">
                            <BaseText
                                typographyFont="bodySemiBold"
                                color={theme.colors.activityCard.title}
                                flexDirection="row"
                                numberOfLines={1}
                                ellipsizeMode="tail"
                                testID="TOKEN_CARD_NAME">
                                {name}
                            </BaseText>
                            <TokenSymbol token={token} typographyFont="bodySemiBold" />
                        </BaseView>
                    </BaseView>
                </BaseView>
            </Animated.View>
        </BaseSafeArea>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            paddingHorizontal: 16,
            paddingBottom: 16,
            backgroundColor: theme.colors.card,
        },
        safeArea: {
            justifyContent: "flex-end",
        },
    })
