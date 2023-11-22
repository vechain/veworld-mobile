import React, { useCallback } from "react"
import { StyleSheet } from "react-native"
import { useThemedStyles } from "~Hooks"
import { ColorThemeType } from "~Constants"
import { StringUtils } from "~Utils"
import { BaseCard, BaseIcon, BaseText, BaseTouchableBox, BaseView } from "~Components"
import { Network } from "~Model"
import { useI18nContext } from "~i18n"

type Props = {
    network: Network
    onPress?: (network: Network) => void
    rightIcon?: string
    isSelected?: boolean
    flex?: number
    activeOpacity?: number
}
export const NetworkBox: React.FC<Props> = ({ network, onPress, rightIcon, isSelected = false }) => {
    const { LL } = useI18nContext()
    const { theme, styles } = useThemedStyles(baseStyles)
    const style = isSelected ? styles.selected : styles.notSelected

    const handleOnPress = useCallback(() => !!onPress && onPress(network), [onPress, network])

    const networkBoxBody = useCallback(
        () => (
            <BaseView flexDirection="row" justifyContent="space-between" alignItems="center" flex={1}>
                <BaseView
                    flexDirection="column"
                    alignItems="flex-start"
                    style={rightIcon ? styles.NetworkInfoRightIcon : styles.NetworkInfoNoRightIcon}>
                    <BaseView flexDirection="row">
                        <BaseText typographyFont="button" ellipsizeMode="tail" numberOfLines={1}>
                            {StringUtils.capitalize(network.name)}
                        </BaseText>
                        {network.defaultNet && (
                            <BaseText pl={2} typographyFont="captionRegular">
                                ({LL.COMMON_LBL_DEFAULT()})
                            </BaseText>
                        )}
                    </BaseView>
                    <BaseText pt={2} typographyFont="captionMedium">
                        {network.currentUrl}
                    </BaseText>
                </BaseView>
                {rightIcon && <BaseIcon name={rightIcon} color={theme.colors.text} />}
            </BaseView>
        ),
        [
            LL,
            network.currentUrl,
            network.defaultNet,
            network.name,
            rightIcon,
            styles.NetworkInfoNoRightIcon,
            styles.NetworkInfoRightIcon,
            theme.colors.text,
        ],
    )

    return onPress ? (
        <BaseView style={styles.touchableContainer} flexDirection="row">
            <BaseTouchableBox haptics="Light" action={handleOnPress} innerContainerStyle={style}>
                {networkBoxBody()}
            </BaseTouchableBox>
        </BaseView>
    ) : (
        <BaseCard style={style}>{networkBoxBody()}</BaseCard>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        selected: {
            borderWidth: 1.5,
            borderColor: theme.colors.text,
        },
        notSelected: {
            borderWidth: 1.5,
            borderColor: theme.colors.card,
        },
        touchableContainer: {
            backgroundColor: theme.colors.card,
            borderRadius: 16,
        },
        NetworkInfoRightIcon: {
            width: "90%",
        },
        NetworkInfoNoRightIcon: {
            width: "100%",
        },
    })
