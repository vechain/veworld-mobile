import React, {useState} from 'react'
import {NativeModules, TouchableOpacity} from 'react-native'
import {
    Translation,
    BaseSafeArea,
    BaseScrollView,
    BaseSpacer,
    BaseStatusBar,
    BaseText,
    BaseView,
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
            <BaseSafeArea />
            <BaseStatusBar />

            <BaseScrollView>
                <TouchableOpacity testID="Button" onPress={onPressNativeModule}>
                    <BaseText>Press me to call a native function</BaseText>
                </TouchableOpacity>

                <BaseSpacer height={20} />

                <TestScreen />

                <BaseSpacer height={20} />

                {nativeText && <BaseText>{nativeText}</BaseText>}

                <BaseSpacer height={20} />

                <BaseView>
                    <BaseText font="largeTitle">TEST TEXT</BaseText>
                </BaseView>
            </BaseScrollView>
        </Translation>
    )
}

export default App
