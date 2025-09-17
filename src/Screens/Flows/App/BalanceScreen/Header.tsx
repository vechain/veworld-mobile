import { useNavigation } from "@react-navigation/native"
import { default as React, useCallback, useState } from "react"
import { StyleSheet, TouchableOpacity } from "react-native"
import LinearGradient from "react-native-linear-gradient"
import { Extrapolation, interpolate, runOnJS, SharedValue, useDerivedValue } from "react-native-reanimated"
import { AccountIcon, BaseIcon, BaseText, BaseView } from "~Components"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { Routes } from "~Navigation"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"

type Props = {
    scrollY: SharedValue<number>
    contentOffsetY: SharedValue<number>
}

export const Header = ({ scrollY, contentOffsetY }: Props) => {
    const { styles } = useThemedStyles(baseStyles)
    const account = useAppSelector(selectSelectedAccount)

    const nav = useNavigation()

    const [locations, setLocations] = useState([0, 0, 0])

    const onWalletManagementPress = useCallback(() => {
        nav.navigate(Routes.WALLET_MANAGEMENT)
    }, [nav])

    const secondStop = useDerivedValue(
        () => interpolate(scrollY.value, [0, contentOffsetY.value], [1, 0.6524], Extrapolation.CLAMP),
        [scrollY.value, contentOffsetY.value],
    )
    const thirdStop = useDerivedValue(
        () => interpolate(scrollY.value, [0, contentOffsetY.value], [1, 1], Extrapolation.CLAMP),
        [scrollY.value, contentOffsetY.value],
    )

    const stops = useDerivedValue(() => [0, secondStop.value, thirdStop.value], [secondStop.value, thirdStop.value])

    useDerivedValue(() => runOnJS(setLocations)(stops.value), [stops.value])

    return (
        <LinearGradient
            style={styles.root}
            colors={[COLORS.BALANCE_BACKGROUND, "rgba(29, 23, 58, 0.50)", COLORS.PURPLE]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            locations={locations}
            angle={0}>
            <TouchableOpacity>
                <BaseView flexDirection="row" gap={12} p={8} pr={16} bg="rgba(255, 255, 255, 0.05)" borderRadius={99}>
                    <AccountIcon address={account.address} size={24} borderRadius={100} />
                    <BaseText typographyFont="captionSemiBold" color={COLORS.PURPLE_LABEL}>
                        {account.alias}
                    </BaseText>
                </BaseView>
            </TouchableOpacity>

            <BaseView flexDirection="row" gap={12}>
                <TouchableOpacity onPress={onWalletManagementPress}>
                    <BaseView borderRadius={99} p={10} bg="rgba(255, 255, 255, 0.05)">
                        <BaseIcon name="icon-wallet" color={COLORS.PURPLE_LABEL} size={20} />
                    </BaseView>
                </TouchableOpacity>
                <TouchableOpacity>
                    <BaseView borderRadius={99} p={10} bg="rgba(255, 255, 255, 0.05)">
                        <BaseIcon name="icon-scanQR" color={COLORS.PURPLE_LABEL} size={20} />
                    </BaseView>
                </TouchableOpacity>
            </BaseView>
        </LinearGradient>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        root: {
            flexDirection: "row",
            paddingTop: 8,
            paddingHorizontal: 16,
            paddingBottom: 16,
            justifyContent: "space-between",
        },
    })
