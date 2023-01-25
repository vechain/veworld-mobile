import React from "react"
import {
    AppState,
    BaseStatusBar,
    BaseText,
    BaseView,
    Security,
    Translation,
} from "~Components"
import { SwitchStack } from "~Navigation"
import { useFonts } from "expo-font"
import {
    Inter_Bold,
    Inter_Light,
    Inter_Medium,
    Inter_Regular,
    Mono_Bold,
    Mono_Extra_Bold,
    Mono_Light,
    Mono_Regular,
} from "~Assets"
import { selectSecurityDowngrade, useAppSelector } from "~Storage/Caches"

const WALLET_EXIST_PLACEHOLDER = true

const App = () => {
    const isSecurityDowngrade = useAppSelector(selectSecurityDowngrade)

    const [fontsLoaded] = useFonts({
        "Inter-Bold": Inter_Bold,
        "Inter-Regular": Inter_Regular,
        "Inter-Light": Inter_Light,
        "Inter-Medium": Inter_Medium,
        "Mono-Extra-Bold": Mono_Extra_Bold,
        "Mono-Bold": Mono_Bold,
        "Mono-Regular": Mono_Regular,
        "Mono-Light": Mono_Light,
    })

    if (fontsLoaded) {
        return (
            <>
                <Translation>
                    <AppState />
                    <Security />

                    <BaseStatusBar />

                    {isSecurityDowngrade && WALLET_EXIST_PLACEHOLDER && (
                        <BaseView
                            style={{
                                flex: 1,
                                backgroundColor: "red",
                                // position: "absolute",
                            }}>
                            <BaseText>DOWNGRADE DETECTED!!!!</BaseText>
                        </BaseView>
                    )}

                    <SwitchStack />
                </Translation>
            </>
        )
    }

    return <></>
}

export default App
