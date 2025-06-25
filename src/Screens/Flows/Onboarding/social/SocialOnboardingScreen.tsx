import { Button, Linking, Text, View, StyleSheet } from "react-native"
import { LoginWithOAuthInput, useLoginWithOAuth, usePrivy } from "@privy-io/expo"
import Constants from "expo-constants"
import * as Application from "expo-application"
import React, { useState } from "react"
import { Routes } from "../../../../Navigation/Enums"
import { useNavigation } from "@react-navigation/native"

export default function SocialOnboardingScreen() {
    const [error, setError] = useState("")
    const { user } = usePrivy()
    const nav = useNavigation<any>()
    if (user) {
        nav.navigate(Routes.SOCIAL_USER)
    }
    const oauth = useLoginWithOAuth({
        onError: (err: any) => {
            setError(JSON.stringify(err.message))
        },
    })
    const privyAppId = "cmal5kjzv0001jp0mshok7f37"
    const privyClientId = "client-WY6LHx69tXsKYk5SLbF5dtUekKfmuTquV4BybTVK4UCP9"
    const dashboardUrl = `https://dashboard.privy.io/apps/${privyAppId}/settings?setting=clients`
    return (
        <View style={styles.container}>
            <Text>Privy App ID:</Text>
            <Text style={styles.smallText}>{privyAppId}</Text>
            <Text>Privy Client ID:</Text>
            <Text style={styles.smallText}>{privyClientId}</Text>
            <Text>
                Navigate to your{" "}
                <Text style={styles.linkText} onPress={() => Linking.openURL(dashboardUrl)}>
                    dashboard
                </Text>{" "}
                and ensure the following Expo Application ID is listed as an \`Allowed app identifier\`:
            </Text>
            <Text style={styles.smallText}>{Application.applicationId}</Text>
            <Text>
                Navigate to your{" "}
                <Text style={styles.linkText} onPress={() => Linking.openURL(dashboardUrl)}>
                    dashboard
                </Text>{" "}
                and ensure the following value is listed as an \`Allowed app URL scheme\`:
            </Text>
            <Text style={styles.smallText}>{Constants.expoConfig?.scheme}</Text>

            {/* <Button
                title="Login using Passkey"
                onPress={() =>
                    loginWithPasskey({
                        relyingParty: Constants.expoConfig?.extra?.passkeyAssociatedDomain,
                    })
                }
            /> */}

            <View style={styles.oauthButtonContainer}>
                {["github", "google", "discord", "apple"].map(provider => (
                    <View key={provider}>
                        <Button
                            title={`Login with ${provider}`}
                            disabled={oauth.state.status === "loading"}
                            onPress={() =>
                                oauth.login({ provider, redirectUrl: "hugh://" } as LoginWithOAuthInput)
                            }></Button>
                    </View>
                ))}
            </View>
            <Text>Hello {JSON.stringify(oauth)}</Text>
            {error && <Text style={styles.errorText}>Error: {error}</Text>}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
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
        display: "flex",
        flexDirection: "column",
        gap: 5,
        margin: 10,
    },
    errorText: {
        color: "red",
    },
})
