import React from 'react'
import {SafeAreaView} from 'react-native'
import {useTheme} from '~Common'

export const BaseSafeArea = () => {
    const theme = useTheme()
    return <SafeAreaView style={{backgroundColor: theme.colors.background}} />
}
