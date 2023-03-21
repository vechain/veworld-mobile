import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { CameraScreen } from "~Screens"
import { Routes } from "~Navigation/Enums"

export type RootStackParamListCamera = {
    [Routes.CAMERA]: undefined
}

const Camera = createNativeStackNavigator<RootStackParamListCamera>()

export const CameraStack = () => {
    return (
        <Camera.Navigator screenOptions={{ headerShown: false }}>
            <Camera.Group>
                <Camera.Screen
                    name={Routes.CAMERA}
                    component={CameraScreen}
                    options={{ headerShown: false }}
                />
            </Camera.Group>
        </Camera.Navigator>
    )
}
