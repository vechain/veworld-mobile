import React, { useCallback, useEffect } from "react"
import { Text, View, Button, StyleSheet } from "react-native"
import { useCreateWallet } from "../../../../Hooks/useCreateWallet"
import { useNavigation } from "@react-navigation/native"
import { useSmartWallet } from "../../../../VechainWalletKit"

export const SmartAccountScreen = () => {
    const { createSmartWallet } = useCreateWallet()
    const { login, logout, isAuthenticated, smartAccountAddress, ownerAddress, initialiseWallet } = useSmartWallet()
    // const [user, setUser] = useState<any>(null)
    // const { accountAddress } = useSocialLogin()
    const nav = useNavigation<any>()

    // const { createSmartWallet } = useCreateWallet()
    const navigateToTabStack = useCallback(() => {
        // Navigate directly to TabStack instead of a specific tab
        nav.reset({
            index: 0,
            routes: [{ name: "TabStack" }],
        })
    }, [nav])

    useEffect(() => {
        console.log("initialiseWallet changed")
    }, [initialiseWallet])

    useEffect(() => {
        console.log("createSmartWallet changed")
    }, [createSmartWallet])

    useEffect(() => {
        console.log("isAuthenticated changed")
    }, [isAuthenticated])

    useEffect(() => {
        console.log("smartAccountAddress changed")
    }, [smartAccountAddress])

    useEffect(() => {
        const init = async () => {
            console.log("init isAuthenticated", isAuthenticated, smartAccountAddress)
            if (isAuthenticated && smartAccountAddress) {
                console.log("initialising wallet!")
                await initialiseWallet()
                console.log("createSmartWallet", smartAccountAddress)
                await createSmartWallet({ address: smartAccountAddress })
            }
        }
        init()
    }, [isAuthenticated, initialiseWallet, createSmartWallet, smartAccountAddress])

    const handleLogin = useCallback(async () => {
        console.log("logging in!")
        await login({ provider: "google", oauthRedirectUri: "veworld://" })
    }, [login])

    const handleLogout = useCallback(async () => {
        console.log("logging out!")
        await logout()
    }, [logout])

    return (
        <View style={{ gap: 10, marginTop: 100 }}>
            <View
                style={{
                    padding: 40,
                    // flexDirection: "column",
                    gap: 10,
                }}>
                <View>
                    <Text style={{ fontWeight: "bold" }}>Is Authenticated</Text>
                    <Text>{isAuthenticated ? "Yes" : "No"}</Text>
                </View>
                <View>
                    <Text style={{ fontWeight: "bold" }}>Smart account address</Text>
                    <Text>{smartAccountAddress}</Text>
                </View>

                <View>
                    <Text style={{ fontWeight: "bold" }}>Owner address</Text>
                    <Text>{ownerAddress}</Text>
                </View>

                <View style={styles.oauthButtonContainer}>
                    {["google"].map(provider => (
                        <View key={provider}>
                            <Button
                                title={`Login with ${provider}`}
                                // disabled={oauth.state.status === "loading"}
                                onPress={handleLogin}></Button>
                        </View>
                    ))}
                </View>

                <View>
                    <Button
                        title={`Logout`}
                        // disabled={oauth.state.status === "loading"}
                        onPress={handleLogout}></Button>
                </View>
                {/* <Button title="Initialise Wallet" onPress={createAndInitWallet} /> */}
                <Button title="Go to Main App" onPress={navigateToTabStack} />

                {/* <Button title="Logout" onPress={logout} /> */}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        // flex: 1,
        // justifyContent: "center",
        // alignItems: "center",
        gap: 10,
        marginHorizontal: 10,
    },
    smallText: {
        fontSize: 10,
    },
    linkText: {
        color: "blue",
        textDecorationLine: "underline",
    },
    oauthButtonContainer: {
        // display: "flex",
        // flexDirection: "column",
        gap: 5,
        margin: 10,
    },
    errorText: {
        color: "red",
    },
})
