import React from "react"
import { StyleSheet } from "react-native"
import { BaseSpacer, BaseText, BaseTouchable, BaseView } from "~Components/Base"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"

type Props = {
    name: string
    icon: React.ReactNode
    testID?: string
    disabled?: boolean
    iconOnly?: boolean
    action: () => void
}

export const BottomSheetAction = ({ icon, name, disabled, testID, iconOnly, action }: Props) => {
    const { styles, theme } = useThemedStyles(style => baseStyles(style, !!disabled))
    const iconColor = theme.colors.actionBottomSheet

    return (
        <BaseTouchable
            key={name}
            action={action}
            testID={testID}
            haptics={disabled ? "Error" : "Medium"}
            activeOpacity={disabled ? 0.9 : 0.2}
            disabled={disabled}
            style={[styles.action]}>
            <BaseView flexDirection="row" justifyContent={"center"} alignItems="center">
                <BaseView style={styles.actionIconBottomSheet}>{icon}</BaseView>
                {!iconOnly && (
                    <>
                        <BaseSpacer width={24} />
                        <BaseText
                            color={disabled ? iconColor.disabledText : iconColor.text}
                            typographyFont="subSubTitleSemiBold">
                            {name}
                        </BaseText>
                    </>
                )}
            </BaseView>
        </BaseTouchable>
    )
}

const baseStyles = (theme: ColorThemeType, disabled: boolean) =>
    StyleSheet.create({
        action: {
            flexDirection: "row",
            flexGrow: 1,
            paddingVertical: 8,
            borderRadius: 8,
        },
        actionIconBottomSheet: {
            width: 38,
            height: 38,
            padding: 12,
            borderRadius: 38,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: theme.colors.actionBottomSheet[disabled ? "disabledIconBackground" : "iconBackground"],
        },
    })
