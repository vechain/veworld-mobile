import React, {useMemo} from 'react'
import {StatusBar, StatusBarProps} from 'react-native'
import {useTheme} from '~Common'

type Props = {
    hero?: boolean
    transparent?: boolean
} & StatusBarProps

export const BaseStatusBar = (props: Props) => {
    const theme = useTheme()
    const barStyle = useMemo(
        () =>
            props.hero
                ? 'light-content'
                : theme.isDark
                ? 'light-content'
                : 'dark-content',
        [props.hero, theme.isDark],
    )

    return (
        <StatusBar
            translucent={props.hero}
            barStyle={barStyle}
            backgroundColor={
                props.transparent
                    ? theme.constants.transparent
                    : theme.colors.background
            }
            {...props}
        />
    )
}
