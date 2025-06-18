import React, { useCallback } from "react"
import { Text, View, Button, ScrollView } from "react-native"

import { usePrivy, getUserEmbeddedEthereumWallet, useLinkWithOAuth } from "@privy-io/expo"

import { useNavigation } from "@react-navigation/native"
import { useCreateWallet } from "../../../../Hooks/useCreateWallet/useCreateWallet"
import { useSocialLogin } from "../../../../Components/Providers/SocialLoginProvider/SocialLoginProvider"
import { useSmartWalletDetails } from "../../../../Components/Providers/SocialLoginProvider/useSmartWalletDetails"

export const SocialUserScreen = () => {
    const { createSocialWallet } = useCreateWallet()
    // const { accountAddress } = useSocialLogin()
    const nav = useNavigation<any>()

    const navigateToTabStack = useCallback(() => {
        // Navigate directly to TabStack instead of a specific tab
        nav.reset({
            index: 0,
            routes: [{ name: "TabStack" }],
        })
    }, [nav])

    const { logout, user } = usePrivy()

    const account = getUserEmbeddedEthereumWallet(user)
    console.log("SocialUserScreen account", account?.address)
    const { smartAccountQuery } = useSmartWalletDetails(account?.address ?? "")
    const createWalletAndNavigate = useCallback(() => {
        const address = smartAccountQuery.data?.address
        console.log("createWalletAndNavigate", address)
        if (address) {
            createSocialWallet({ address })
            navigateToTabStack()
        }
    }, [createSocialWallet, smartAccountQuery.data?.address, navigateToTabStack])

    // const { linkWithPasskey } = useLinkWithPasskey()
    const oauth = useLinkWithOAuth()

    if (!user) {
        return null
    }

    return (
        <View>
            <View style={{ display: "flex", flexDirection: "column", margin: 10 }}>
                {(["github", "google", "discord", "apple"] as const).map(provider => (
                    <View key={provider}>
                        <Button
                            title={`Link ${provider}`}
                            disabled={oauth.state.status === "loading"}
                            onPress={() => oauth.link({ provider })}></Button>
                    </View>
                ))}
            </View>

            <ScrollView style={{ borderColor: "rgba(0,0,0,0.1)", borderWidth: 1 }}>
                <View
                    style={{
                        padding: 20,
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                    }}>
                    <View>
                        <Text style={{ fontWeight: "bold" }}>User ID</Text>
                        <Text>{user.id}</Text>
                    </View>

                    <View>
                        <Text style={{ fontWeight: "bold" }}>Address</Text>
                        <Text>{account?.address}</Text>
                    </View>

                    <Button title="Create Wallet" onPress={createWalletAndNavigate} />
                    <Button title="Go to Main App" onPress={navigateToTabStack} />
                    <Button title="Logout" onPress={logout} />
                </View>
            </ScrollView>
        </View>
    )
}
