import React from 'react'
import {SafeAreaView} from 'react-native'
import {useTheme} from '~Common'

export const VWSafeArea = () => {
    const theme = useTheme()
    return <SafeAreaView style={{backgroundColor: theme.colors.background}} />
}
