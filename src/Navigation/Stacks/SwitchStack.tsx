import { NavigatorScreenParams } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { Transaction } from "@vechain/sdk-core"
import { PendingRequestTypes } from "@walletconnect/types"
import React, { useMemo } from "react"
import { Certificate } from "thor-devkit"
import { useWalletStatus } from "~Components"
import { CertificateRequest, LedgerAccountWithDevice, LocalDevice, WALLET_STATUS } from "~Model"
import { LoginRequest, TransactionRequest } from "~Model/DApp"
import { CreateWalletAppStack, Routes } from "~Navigation"
import { TabStack, TabStackParamList } from "~Navigation/Tabs"
import { BlackListedCollectionsScreen, ChooseBackupDetailsPassword, DetailsBackupScreen } from "~Screens"
import { AppBlockedScreen } from "~Screens/Flows/App/AppBlockedScreen"
import { LedgerSignCertificate, LedgerSignTransaction } from "~Screens/Flows/App/LedgerScreen"
import { LedgerSignMessage } from "~Screens/Flows/App/LedgerScreen/LedgerSignMessage"
import { SignMessageScreen } from "~Screens/Flows/App/WalletConnect/SignMessageScreen"
import { TransferEventListener } from "../../TransferEventListener"
import { BuyStack } from "./BuyStack"
import { OnboardingStack } from "./OnboardingStack"
import { SellStack } from "./SellStack"

export type RootStackParamListSwitch = {
    OnboardingStack: undefined
    TabStack: NavigatorScreenParams<TabStackParamList>
    ResetAppScreen: undefined
    [Routes.CREATE_WALLET_FLOW]: undefined
    [Routes.BLACKLISTED_COLLECTIONS]: undefined
    [Routes.BUY_FLOW]: undefined
    [Routes.CONNECTED_APP_SIGN_MESSAGE_SCREEN]: {
        requestEvent: PendingRequestTypes.Struct
        message: string
    }
    [Routes.LEDGER_SIGN_CERTIFICATE]: {
        request: CertificateRequest | Extract<LoginRequest, { kind: "certificate" }>
        certificate: Certificate
        accountWithDevice: LedgerAccountWithDevice
        keepMeLoggedIn?: boolean
    }
    [Routes.LEDGER_SIGN_TRANSACTION]: {
        accountWithDevice: LedgerAccountWithDevice
        delegationSignature?: string
        transaction: Transaction
        dappRequest?: TransactionRequest
        initialRoute?: Routes.HOME | Routes.NFTS
    }
    [Routes.LEDGER_SIGN_MESSAGE]: {
        requestEvent: PendingRequestTypes.Struct
        message: string
        accountWithDevice: LedgerAccountWithDevice
    }
    [Routes.BLOCKED_APP_SCREEN]: undefined

    [Routes.ICLOUD_DETAILS_BACKUP]: { deviceToBackup?: LocalDevice; backupDetails: string[] | string }
    [Routes.CHOOSE_DETAILS_BACKUP_PASSWORD]: { backupDetails: string[] | string; device: LocalDevice }
    [Routes.SELL_FLOW]: undefined
}
const Switch = createNativeStackNavigator<RootStackParamListSwitch>()

export const SwitchStack = () => {
    const walletStatus = useWalletStatus()

    const RenderStacks = useMemo(() => {
        if (walletStatus === WALLET_STATUS.FIRST_TIME_ACCESS) {
            return <Switch.Screen name="OnboardingStack" component={OnboardingStack} options={{ headerShown: false }} />
        } else {
            return (
                <>
                    <Switch.Screen name="TabStack" component={AppContainer} options={{ headerShown: false }} />

                    {/* Full screen modals */}
                    <Switch.Group
                        screenOptions={{
                            headerShown: false,
                        }}>
                        <Switch.Screen name={Routes.CREATE_WALLET_FLOW} component={CreateWalletAppStack} />

                        <Switch.Screen
                            name={Routes.BLACKLISTED_COLLECTIONS}
                            component={BlackListedCollectionsScreen}
                            options={{
                                presentation: "modal",
                            }}
                        />

                        <Switch.Screen name={Routes.CONNECTED_APP_SIGN_MESSAGE_SCREEN} component={SignMessageScreen} />

                        <Switch.Screen name={Routes.BLOCKED_APP_SCREEN} component={AppBlockedScreen} />

                        <Switch.Screen name={Routes.LEDGER_SIGN_CERTIFICATE} component={LedgerSignCertificate} />

                        <Switch.Screen name={Routes.LEDGER_SIGN_TRANSACTION} component={LedgerSignTransaction} />

                        <Switch.Screen name={Routes.LEDGER_SIGN_MESSAGE} component={LedgerSignMessage} />

                        <Switch.Screen
                            name={Routes.ICLOUD_DETAILS_BACKUP}
                            component={DetailsBackupScreen}
                            options={{ headerShown: false }}
                        />

                        <Switch.Screen
                            name={Routes.CHOOSE_DETAILS_BACKUP_PASSWORD}
                            component={ChooseBackupDetailsPassword}
                            options={{
                                headerShown: false,
                            }}
                        />

                        <Switch.Screen
                            name={Routes.BUY_FLOW}
                            component={BuyStack}
                            options={{
                                presentation: "modal",
                            }}
                        />

                        <Switch.Screen
                            name={Routes.SELL_FLOW}
                            component={SellStack}
                            options={{
                                presentation: "modal",
                            }}
                        />
                    </Switch.Group>
                </>
            )
        }
    }, [walletStatus])

    return (
        <Switch.Navigator
            screenOptions={{
                headerShown: false,
            }}>
            {RenderStacks}
        </Switch.Navigator>
    )
}

const AppContainer = () => {
    const walletStatus = useWalletStatus()

    if (walletStatus === WALLET_STATUS.UNLOCKED) {
        return (
            <>
                <TransferEventListener />
                <TabStack />
            </>
        )
    }

    return <TabStack />
}
