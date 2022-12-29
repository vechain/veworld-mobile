import React, {useState} from 'react'
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    NativeModules,
    TouchableOpacity,
} from 'react-native'
import {Translation} from '~Components'
import {TestScreen} from '~Screens/Onboarding/TestScreen'

const {SampleNativeModule} = NativeModules

const App = () => {
    const [nativeText, setNativeText] = useState('')

    const onPressNativeModule = async () => {
        const res = await SampleNativeModule.getText('Vechain')
        setNativeText(res)
    }

    return (
        <Translation>
            <SafeAreaView>
                <StatusBar />
                <ScrollView contentInsetAdjustmentBehavior="automatic">
                    <TouchableOpacity
                        testID="Button"
                        onPress={onPressNativeModule}>
                        <Text>Press me to call a native function</Text>
                    </TouchableOpacity>

                    <TestScreen />

                    {nativeText && <Text>{nativeText}</Text>}
                </ScrollView>
            </SafeAreaView>
        </Translation>
    )
}

export default App
