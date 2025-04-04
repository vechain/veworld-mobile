import React from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { BackupWallet, SecurityLevelType } from "~Model"
import { SecurityUpgrade_V2 } from "../../SecurityUpgrade_V2"
import { MnemonicBackup } from "../../Standalone.components"
import { Routes } from "~Navigation"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { GestureHandlerRootView } from "react-native-gesture-handler"

export type RootStackParamListBackupWallet = {
    [Routes.SECURITY_UPGRADE_V2_HOME]: undefined
    [Routes.SECURITY_UPGRADE_V2_MNEMONIC_BACKUP]: {
        wallets: BackupWallet[]
        securityType: SecurityLevelType
        oldPersistedState?: string
        pin?: string
    }
}

const Stack = createNativeStackNavigator<RootStackParamListBackupWallet>()

export const BackupWalletStack = ({
    oldPersistedState,
    securityType,
    upgradeSecurityToV2,
}: {
    oldPersistedState?: string
    securityType: SecurityLevelType
    upgradeSecurityToV2: (password?: string) => Promise<void>
}) => {
    return (
        <NavigationContainer>
            <Stack.Navigator id="BackupWalletStack" initialRouteName={Routes.SECURITY_UPGRADE_V2_HOME}>
                <Stack.Screen name={Routes.SECURITY_UPGRADE_V2_HOME} options={{ headerShown: false }}>
                    {props => (
                        <SecurityUpgrade_V2
                            {...props}
                            oldPersistedState={oldPersistedState}
                            securityType={securityType}
                            upgradeSecurityToV2={upgradeSecurityToV2}
                        />
                    )}
                </Stack.Screen>
                <Stack.Screen name={Routes.SECURITY_UPGRADE_V2_MNEMONIC_BACKUP} options={{ headerShown: false }}>
                    {props => (
                        <GestureHandlerRootView>
                            <BottomSheetModalProvider>
                                <MnemonicBackup {...props} upgradeSecurityToV2={upgradeSecurityToV2} />
                            </BottomSheetModalProvider>
                        </GestureHandlerRootView>
                    )}
                </Stack.Screen>
            </Stack.Navigator>
        </NavigationContainer>
    )
}
