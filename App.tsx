/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from "react"
import { ScrollView, StatusBar, useColorScheme, View } from "react-native"
import BootSplash from "react-native-bootsplash"

import { Colors, Header, LearnMoreLinks } from "react-native/Libraries/NewAppScreen"

function App(): React.JSX.Element {
    const isDarkMode = useColorScheme() === "dark"

    const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    }

    const safePadding = "5%"

    useEffect(() => {
        BootSplash.hide({ fade: true }).then(() => {})
    }, [])

    return (
        <View style={backgroundStyle}>
            <StatusBar
                barStyle={isDarkMode ? "light-content" : "dark-content"}
                backgroundColor={backgroundStyle.backgroundColor}
            />
            <ScrollView contentInsetAdjustmentBehavior="automatic" style={backgroundStyle}>
                <View style={{ paddingRight: safePadding }}>
                    <Header />
                </View>
                <View
                    style={{
                        backgroundColor: isDarkMode ? Colors.black : Colors.white,
                        paddingHorizontal: safePadding,
                        paddingBottom: safePadding,
                    }}>
                    <LearnMoreLinks />
                </View>
            </ScrollView>
        </View>
    )
}

export default App
