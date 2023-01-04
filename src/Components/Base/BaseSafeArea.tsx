/* eslint-disable react-native/no-inline-styles */
import React from 'react'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useTheme} from '~Common'

type Props = {
    bg?: string
    transparent?: boolean
}

export const BaseSafeArea = ({bg, transparent}: Props) => {
    const theme = useTheme()
    return (
        <SafeAreaView
            style={{
                backgroundColor: transparent
                    ? 'transparent'
                    : bg
                    ? bg
                    : theme.colors.background,
            }}
        />
    )
}
