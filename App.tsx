/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from "react"
import { SafeAreaView, ScrollView, StatusBar, useColorScheme, View } from "react-native"
import BootSplash from "react-native-bootsplash"

import { Colors, Header, LearnMoreLinks } from "react-native/Libraries/NewAppScreen"

function App(): React.JSX.Element {
    const isDarkMode = useColorScheme() === "dark"

    const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    }

    useEffect(() => {
        BootSplash.hide({ fade: true }).then(() => {})
    }, [])

    return (
        <SafeAreaView style={backgroundStyle}>
            <StatusBar
                barStyle={isDarkMode ? "light-content" : "dark-content"}
                backgroundColor={backgroundStyle.backgroundColor}
            />
            <ScrollView contentInsetAdjustmentBehavior="automatic" style={backgroundStyle}>
                <Header />
                <View
                    style={{
                        backgroundColor: isDarkMode ? Colors.black : Colors.white,
                    }}>
                    <LearnMoreLinks />
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default App
