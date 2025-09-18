import { default as React } from "react"
import { StyleSheet, TouchableOpacity } from "react-native"
import LinearGradient from "react-native-linear-gradient"
import { BaseIcon, BaseText, BaseView } from "~Components"
import { ShadowView } from "~Components/Reusable/ShadowView"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { IconKey } from "~Model"

type GlassButtonProps = {
    icon: IconKey
    onPress: () => void
}

const GlassButton = ({ icon, onPress }: GlassButtonProps) => {
    const { styles } = useThemedStyles(baseStyles)
    return (
        <TouchableOpacity onPress={onPress}>
            <LinearGradient
                colors={["rgba(29, 23, 58, 0.20)", "rgba(177, 168, 220, 0.20)"]}
                angle={0}
                style={styles.gradient}>
                <ShadowView
                    inset
                    backgroundColor="transparent"
                    shadowColor="rgba(214, 212, 227, 0.10)"
                    shadowOffset={{ height: 4, width: 0 }}
                    shadowBlur={4}
                    style={styles.innerShadow}>
                    <BaseIcon name={icon} size={24} color={COLORS.PURPLE_LABEL} />
                </ShadowView>
            </LinearGradient>
        </TouchableOpacity>
    )
}

type Props = { label: string; icon: IconKey; onPress: () => void }

export const GlassButtonWithLabel = ({ label, icon, onPress }: Props) => {
    return (
        <BaseView flexDirection="column" gap={8} alignItems="center">
            <GlassButton icon={icon} onPress={onPress} />
            <BaseText typographyFont="captionSemiBold" color={COLORS.PURPLE_LABEL}>
                {label}
            </BaseText>
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        innerShadow: { padding: 16, borderRadius: 99 },
        gradient: { borderRadius: 99 },
    })
