import React, {useState} from 'react'
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    NativeModules,
    TouchableOpacity,
} from 'react-native'

const {SampleNativeModule} = NativeModules

const App = () => {
    const [nativeText, setNativeText] = useState('')

    const onPressNativeModule = async () => {
        const res = await SampleNativeModule.getText('Vechain')
        setNativeText(res)
    }

    return (
        <SafeAreaView>
            <StatusBar />
            <ScrollView contentInsetAdjustmentBehavior="automatic">
                <TouchableOpacity testID="Button" onPress={onPressNativeModule}>
                    <Text>Press me to call a native function</Text>
                </TouchableOpacity>

                {nativeText && <Text>{nativeText}</Text>}
            </ScrollView>
        </SafeAreaView>
    )
}

export default App
