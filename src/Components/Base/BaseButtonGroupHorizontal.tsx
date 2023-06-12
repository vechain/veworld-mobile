/* eslint-disable react-native/no-inline-styles */
import React, { useCallback, useMemo } from "react"
import { useTheme, useThemedStyles } from "~Hooks"
import { ColorThemeType } from "~Constants"
import { BaseButton } from "./BaseButton"
import { BaseView } from "./BaseView"
import { BaseIcon, BaseText } from "~Components"
import { StyleSheet } from "react-native"
import { BaseButtonGroupHorizontalType } from "~Model"

type Props = {
    action: (button: BaseButtonGroupHorizontalType) => void
    buttons: BaseButtonGroupHorizontalType[]
    /**
     * array of selected button ids
     */
    selectedButtonIds: string[]
    disabled?: boolean
}

export const BaseButtonGroupHorizontal = ({
    action,
    selectedButtonIds,
    buttons,
}: Props) => {
    const theme = useTheme()

    const onPress = useCallback(
        (button: BaseButtonGroupHorizontalType) => () => action(button),
        [action],
    )

    const buttonWidth = useMemo(() => 100 / buttons.length, [buttons.length])

    const { styles } = useThemedStyles(baseStyles)

    return (
        <BaseView
            justifyContent="center"
            alignItems="center"
            flexDirection="row"
            style={styles.backgroundStyle}>
            {buttons.map((button, _) => {
                const { id, label, disabled, icon } = button
                const selected = selectedButtonIds.includes(id)
                const bgColor = selected
                    ? theme.colors.primary
                    : theme.colors.card
                const textIconColor = selected
                    ? theme.colors.card
                    : theme.colors.text

                return (
                    <BaseButton
                        key={id}
                        action={onPress(button)}
                        disabled={disabled}
                        bgColor={bgColor}
                        typographyFont="bodyMedium"
                        w={buttonWidth}
                        style={styles.buttonStyle}
                        testID={`button-${id}`}>
                        <BaseView
                            justifyContent="center"
                            alignItems="center"
                            flexDirection="row"
                            style={{
                                marginBottom: -5,
                            }}>
                            {icon && (
                                <BaseIcon
                                    size={18}
                                    name={icon}
                                    color={textIconColor}
                                />
                            )}
                            <BaseText
                                color={textIconColor}
                                typographyFont="buttonPrimary"
                                px={5}>
                                {label}
                            </BaseText>
                        </BaseView>
                    </BaseButton>
                )
            })}
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        backgroundStyle: {
            backgroundColor: theme.colors.card,
            borderRadius: 16,
        },
        buttonStyle: {
            borderRadius: 16,
            borderBottomColor: theme.colors.background,
        },
    })
