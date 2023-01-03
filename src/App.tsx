import React, {useState} from 'react'
import {NativeModules} from 'react-native'
import {
    Translation,
    BaseSafeArea,
    BaseScrollView,
    BaseSpacer,
    BaseStatusBar,
    BaseText,
    BaseView,
    BaseButton,
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
                <BaseButton
                    testID="Button"
                    action={onPressNativeModule}
                    mx={20}>
                    <BaseText isButton>
                        Press me to call a native function
                    </BaseText>
                </BaseButton>

                <BaseSpacer height={20} />

                <TestScreen />

                <BaseSpacer height={20} />

                {nativeText && <BaseText>{nativeText}</BaseText>}

                <BaseSpacer height={20} />

                <BaseView background="pink" mx={20}>
                    <BaseText font="largeTitle" px={20}>
                        TEST TEXT
                    </BaseText>
                </BaseView>
            </BaseScrollView>
        </Translation>
    )
}

export default App
