import React from 'react'
import {Translation, BaseStatusBar} from '~Components'
import {SwitchStack} from '~Navigation'
import {useFonts} from 'expo-font'
import {
    Inter_Bold,
    Inter_Light,
    Inter_Medium,
    Inter_Regular,
    Mono_Extra_Bold,
    Mono_Bold,
    Mono_Regular,
    Mono_Light,
} from '~Assets'

const App = () => {
    const [fontsLoaded] = useFonts({
        'Inter-Bold': Inter_Bold,
        'Inter-Regular': Inter_Regular,
        'Inter-Light': Inter_Light,
        'Inter-Medium': Inter_Medium,
        'Mono-Extra-Bold': Mono_Extra_Bold,
        'Mono-Bold': Mono_Bold,
        'Mono-Regular': Mono_Regular,
        'Mono-Light': Mono_Light,
    })

    if (fontsLoaded) {
        return (
            <Translation>
                <BaseStatusBar />
                <SwitchStack />
            </Translation>
        )
    }

    return <></>
}

export default App
