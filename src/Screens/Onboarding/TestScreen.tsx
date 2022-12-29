import {Text, View} from 'react-native'
import React from 'react'
import {useI18nContext} from '~i18n'

export const TestScreen = () => {
    const {LL} = useI18nContext()

    return (
        <View>
            <Text>{LL.HI({name: 'VeChain'})}</Text>
        </View>
    )
}
