import React from 'react'
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    useColorScheme,
    NativeModules,
    TouchableOpacity,
} from 'react-native'

import {Colors} from 'react-native/Libraries/NewAppScreen'

const {SampleNativeModule} = NativeModules

const App = () => {
    const isDarkMode = useColorScheme() === 'dark'

    const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    }

    const onPressNativeModule = async () => {
        const res = await SampleNativeModule.getText('Vechain')
        console.log(res)
    }

    return (
        <SafeAreaView style={backgroundStyle}>
            <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={backgroundStyle.backgroundColor}
            />
            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                style={backgroundStyle}>
                <TouchableOpacity onPress={onPressNativeModule}>
                    <Text>Press me to call a native function</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    )
}

export default App
