import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { Routes } from "~Navigation/Enums"
import { useNavAnimation } from "~Hooks"
import { ChatScreen } from "~Screens"

export type RootStackParamListBuy = {
    [Routes.CHAT_CONVERSATIONS]: undefined
    [Routes.CHAT_CONVERSATION]: {
        recipient: string
    }
    [Routes.CHAT_REQUESTS]: undefined
}

const { Navigator, Group, Screen } = createNativeStackNavigator<RootStackParamListBuy>()

const placeholder = () => {
    return <></>
}

export const ChatStack = () => {
    const { animation } = useNavAnimation()

    return (
        <Navigator id="ChatStack" screenOptions={{ headerShown: false, animation }}>
            <Group>
                <Screen name={Routes.CHAT_CONVERSATIONS} component={ChatScreen} options={{ headerShown: false }} />
                <Screen name={Routes.CHAT_CONVERSATION} component={placeholder} options={{ headerShown: false }} />
                <Screen name={Routes.CHAT_REQUESTS} component={placeholder} options={{ headerShown: false }} />
            </Group>
        </Navigator>
    )
}
