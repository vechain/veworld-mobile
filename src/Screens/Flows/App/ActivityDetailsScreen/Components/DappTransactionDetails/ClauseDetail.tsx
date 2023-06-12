import React, { memo } from "react"
import { StyleSheet } from "react-native"
import { useThemedStyles } from "~Hooks"
import { ColorThemeType, SCREEN_WIDTH } from "~Constants"
import { BaseIcon, BaseText, BaseTouchable, BaseView } from "~Components"

type Props = {
    title: string
    value: string
    border?: boolean
    valueIcon?: string
    onValuePress?: () => void
}

export const ClauseDetail: React.FC<Props> = memo(
    ({ title, value, border = true, valueIcon, onValuePress }) => {
        const { styles, theme } = useThemedStyles(baseStyles)

        return (
            <BaseView
                w={100}
                pt={8}
                style={[
                    border ? styles.border : {},
                    { width: SCREEN_WIDTH - 100 },
                ]}>
                <BaseText typographyFont="buttonSecondary" pb={6}>
                    {title}
                </BaseText>
                <BaseTouchable action={onValuePress} disabled={!onValuePress}>
                    <BaseView flexDirection="row" alignItems="center" pb={8}>
                        <BaseText typographyFont="subSubTitle">
                            {value}
                        </BaseText>
                        {valueIcon && (
                            <BaseView pl={3}>
                                <BaseIcon
                                    name={valueIcon}
                                    size={12}
                                    color={theme.colors.text}
                                />
                            </BaseView>
                        )}
                    </BaseView>
                </BaseTouchable>
            </BaseView>
        )
    },
)

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        border: {
            borderBottomColor: theme.colors.separator,
            borderBottomWidth: 0.5,
        },
    })
