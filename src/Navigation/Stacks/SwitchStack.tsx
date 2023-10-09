import React, { useMemo } from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { TabStack } from "~Navigation/Tabs"
import { OnboardingStack } from "./OnboardingStack"
import { CreateWalletAppStack, Routes } from "~Navigation"
import {
    BlackListedCollectionsScreen,
    ConnectAppScreen,
    SendTransactionScreen,
    SignCertificateScreen,
} from "~Screens"
import { AppBlockedScreen } from "~Screens/Flows/App/AppBlockedScreen"
import { TransferEventListener } from "../../TransferEventListener"
import { Certificate, Transaction } from "thor-devkit"
import { LedgerAccountWithDevice, WALLET_STATUS } from "~Model"
import {
    LedgerSignCertificate,
    LedgerSignTransaction,
} from "~Screens/Flows/App/LedgerScreen"
import { useWalletStatus } from "~Components"
import {
    CertificateRequest,
    TransactionRequest,
    WalletConnectPendingSession,
} from "~Storage/Redux/Slices/WalletConnect"

export type RootStackParamListSwitch = {
    OnboardingStack: undefined
    TabStack: undefined
    ResetAppScreen: undefined
    [Routes.CREATE_WALLET_FLOW]: undefined
    [Routes.BLACKLISTED_COLLECTIONS]: undefined
    [Routes.CONNECT_APP_SCREEN]: {
        sessionProposal: WalletConnectPendingSession
    }
    [Routes.CONNECTED_APP_SEND_TRANSACTION_SCREEN]: {
        request: TransactionRequest
    }
    [Routes.CONNECTED_APP_SIGN_CERTIFICATE_SCREEN]: {
        request: CertificateRequest
    }
    [Routes.LEDGER_SIGN_CERTIFICATE]: {
        request: CertificateRequest
        certificate: Certificate
        accountWithDevice: LedgerAccountWithDevice
        initialRoute: Routes
    }
    [Routes.LEDGER_SIGN_TRANSACTION]: {
        accountWithDevice: LedgerAccountWithDevice
        delegationSignature?: string
        transaction: Transaction
        initialRoute: Routes
        request?: TransactionRequest
    }
    [Routes.BLOCKED_APP_SCREEN]: undefined
}
const Switch = createNativeStackNavigator<RootStackParamListSwitch>()

export const SwitchStack = () => {
    const walletStatus = useWalletStatus()

    const RenderStacks = useMemo(() => {
        if (walletStatus === WALLET_STATUS.FIRST_TIME_ACCESS) {
            return (
                <Switch.Screen
                    name="OnboardingStack"
                    component={OnboardingStack}
                    options={{ headerShown: false }}
                />
            )
        } else {
            return (
                <>
                    <Switch.Screen
                        name="TabStack"
                        component={AppContainer}
                        options={{ headerShown: false }}
                    />

                    {/* Full screen modals */}
                    <Switch.Group
                        screenOptions={{
                            headerShown: false,
                        }}>
                        <Switch.Screen
                            name={Routes.CREATE_WALLET_FLOW}
                            component={CreateWalletAppStack}
                        />

                        <Switch.Screen
                            name={Routes.BLACKLISTED_COLLECTIONS}
                            component={BlackListedCollectionsScreen}
                            options={{
                                presentation: "modal",
                            }}
                        />

                        <Switch.Screen
                            name={Routes.CONNECT_APP_SCREEN}
                            component={ConnectAppScreen}
                        />

                        <Switch.Screen
                            name={Routes.CONNECTED_APP_SEND_TRANSACTION_SCREEN}
                            component={SendTransactionScreen}
                        />

                        <Switch.Screen
                            name={Routes.CONNECTED_APP_SIGN_CERTIFICATE_SCREEN}
                            component={SignCertificateScreen}
                        />

                        <Switch.Screen
                            name={Routes.BLOCKED_APP_SCREEN}
                            component={AppBlockedScreen}
                        />

                        <Switch.Screen
                            name={Routes.LEDGER_SIGN_CERTIFICATE}
                            component={LedgerSignCertificate}
                        />

                        <Switch.Screen
                            name={Routes.LEDGER_SIGN_TRANSACTION}
                            component={LedgerSignTransaction}
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
