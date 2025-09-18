import { default as React } from "react"
import { StyleSheet, TouchableOpacity } from "react-native"
import LinearGradient from "react-native-linear-gradient"
import { BaseIcon, BaseText, BaseView } from "~Components"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { IconKey } from "~Model"

type GlassButtonProps = {
    icon: IconKey
    onPress: () => void
    disabled?: boolean
}

const GlassButton = ({ icon, onPress, disabled }: GlassButtonProps) => {
    const { styles } = useThemedStyles(baseStyles)
    return (
        <TouchableOpacity onPress={onPress} disabled={disabled}>
            {disabled ? (
                <BaseView p={16} borderRadius={99} bg={COLORS.PURPLE_LABEL_5}>
                    <BaseIcon name={icon} size={24} color={COLORS.DARK_PURPLE_DISABLED} />
                </BaseView>
            ) : (
                <LinearGradient
                    colors={["rgba(29, 23, 58, 0.20)", "rgba(177, 168, 220, 0.20)"]}
                    angle={0}
                    useAngle
                    style={styles.innerShadow}>
                    <BaseIcon name={icon} size={24} color={COLORS.PURPLE_LABEL} />
                </LinearGradient>
            )}
        </TouchableOpacity>
    )
}

type Props = { label: string; icon: IconKey; onPress: () => void; disabled?: boolean }

export const GlassButtonWithLabel = ({ label, icon, onPress, disabled }: Props) => {
    return (
        <BaseView flexDirection="column" gap={8} alignItems="center">
            <GlassButton icon={icon} onPress={onPress} disabled={disabled} />
            <BaseText
                typographyFont="captionSemiBold"
                color={disabled ? COLORS.DARK_PURPLE_DISABLED : COLORS.PURPLE_LABEL}>
                {label}
            </BaseText>
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        innerShadow: { padding: 16, borderRadius: 99, borderWidth: 1, borderColor: COLORS.PURPLE_LABEL_5 },
    })
