import React, {useState} from 'react'
import {NativeModules, TouchableOpacity} from 'react-native'
import {
    Translation,
    VWSafeArea,
    VWScrollView,
    VWSpacer,
    VWStatusBar,
    VWText,
    VWView,
} from '~Components'
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
            <VWSafeArea />
            <VWStatusBar />

            <VWScrollView>
                <TouchableOpacity testID="Button" onPress={onPressNativeModule}>
                    <VWText>Press me to call a native function</VWText>
                </TouchableOpacity>

                <VWSpacer height={20} />

                <TestScreen />

                <VWSpacer height={20} />

                {nativeText && <VWText>{nativeText}</VWText>}

                <VWSpacer height={20} />

                <VWView>
                    <VWText>TEST TEXT</VWText>
                </VWView>
            </VWScrollView>
        </Translation>
    )
}

export default App
