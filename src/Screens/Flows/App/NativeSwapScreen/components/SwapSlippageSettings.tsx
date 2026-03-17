import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { useCallback, useState } from "react"
import { StyleSheet, TextInput } from "react-native"
import { BaseBottomSheet, BaseIcon, BaseSpacer, BaseText, BaseTouchableBox, BaseView } from "~Components"
import { AnalyticsEvent, COLORS } from "~Constants"
import { ColorThemeType } from "~Constants/Theme"
import { useAnalyticTracking, useTheme, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"

type SwapSlippageSettingsProps = {
    slippageBasisPoints: number
    onSlippageChange: (value: number) => void
}

const PRESETS = [
    { label: "0.5%", value: 50 },
    { label: "1%", value: 100 },
    { label: "2%", value: 200 },
]

export const SwapSlippageSettings = React.forwardRef<BottomSheetModalMethods, SwapSlippageSettingsProps>(
    function SwapSlippageSettings({ slippageBasisPoints, onSlippageChange }, ref) {
        const { LL } = useI18nContext()
        const theme = useTheme()
        const { styles } = useThemedStyles(baseStyles)
        const track = useAnalyticTracking()

        const [customValue, setCustomValue] = useState("")
        const isCustom = !PRESETS.some(p => p.value === slippageBasisPoints)

        const handlePresetPress = useCallback(
            (value: number) => {
                onSlippageChange(value)
                setCustomValue("")
                track(AnalyticsEvent.SWAP_SLIPPAGE_CHANGED, { slippageBasisPoints: value })
            },
            [onSlippageChange, track],
        )

        const handleCustomChange = useCallback(
            (text: string) => {
                const cleaned = text.replace(/[^0-9.]/g, "")
                setCustomValue(cleaned)
                const parsed = parseFloat(cleaned)
                if (!isNaN(parsed) && parsed > 0 && parsed <= 50) {
                    const bps = Math.round(parsed * 100)
                    onSlippageChange(bps)
                    track(AnalyticsEvent.SWAP_SLIPPAGE_CHANGED, { slippageBasisPoints: bps })
                }
            },
            [onSlippageChange, track],
        )

        return (
            <BaseBottomSheet ref={ref} dynamicHeight contentStyle={styles.content} backgroundStyle={styles.background}>
                <BaseView flexDirection="row" gap={12}>
                    <BaseIcon name="icon-settings" size={20} color={theme.colors.text} />
                    <BaseText typographyFont="subTitleSemiBold">{LL.SWAP_NATIVE_SLIPPAGE()}</BaseText>
                </BaseView>

                <BaseSpacer height={20} />

                <BaseView flexDirection="row" gap={8}>
                    {PRESETS.map(preset => (
                        <BaseTouchableBox
                            key={preset.value}
                            action={() => handlePresetPress(preset.value)}
                            containerStyle={[
                                styles.presetButton,
                                slippageBasisPoints === preset.value && styles.presetButtonActive,
                            ]}>
                            <BaseText
                                typographyFont="bodySemiBold"
                                color={
                                    slippageBasisPoints === preset.value ? theme.colors.primary : theme.colors.text
                                }>
                                {preset.label}
                            </BaseText>
                        </BaseTouchableBox>
                    ))}

                    <BaseView style={[styles.customInput, isCustom && styles.presetButtonActive]}>
                        <TextInput
                            style={[styles.customTextInput, { color: theme.colors.text }]}
                            value={isCustom ? customValue || `${(slippageBasisPoints / 100).toFixed(1)}` : customValue}
                            onChangeText={handleCustomChange}
                            placeholder={LL.SWAP_NATIVE_SLIPPAGE_CUSTOM()}
                            placeholderTextColor={theme.colors.subtitle}
                            keyboardType="decimal-pad"
                            textAlign="center"
                        />
                        <BaseText typographyFont="bodySemiBold" color={theme.colors.subtitle}>
                            %
                        </BaseText>
                    </BaseView>
                </BaseView>

                <BaseSpacer height={24} />
            </BaseBottomSheet>
        )
    },
)

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        content: {
            paddingBottom: 40,
        },
        background: {
            backgroundColor: theme.isDark ? COLORS.DARK_PURPLE : theme.colors.card,
        },
        presetButton: {
            flex: 1,
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: "center",
            backgroundColor: theme.isDark ? COLORS.DARK_PURPLE : COLORS.LIGHT_GRAY,
            borderWidth: 1,
            borderColor: "transparent",
        },
        presetButtonActive: {
            borderColor: theme.colors.primary,
        },
        customInput: {
            flex: 1,
            borderRadius: 12,
            paddingVertical: 4,
            paddingHorizontal: 8,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: theme.isDark ? COLORS.DARK_PURPLE : COLORS.LIGHT_GRAY,
            borderWidth: 1,
            borderColor: "transparent",
        },
        customTextInput: {
            flex: 1,
            fontSize: 16,
            fontWeight: "600",
            textAlign: "center",
            padding: 0,
        },
    })
