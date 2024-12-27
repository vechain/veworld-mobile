import React, { useMemo } from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { TabStack } from "~Navigation/Tabs"
import { OnboardingStack } from "./OnboardingStack"
import { CreateWalletAppStack, Routes } from "~Navigation"
import {
    AppApprovalScreen,
    BlackListedCollectionsScreen,
    ChooseMnemonicBackupPassword,
    ConnectAppScreen,
    DappChangeAccountScreen,
    MnemonicBackupScreen,
    SendTransactionScreen,
    SignCertificateScreen,
    SignDataMessageScreen,
} from "~Screens"
import { PendingRequestTypes } from "@walletconnect/types"
import { AppBlockedScreen } from "~Screens/Flows/App/AppBlockedScreen"
import { TransferEventListener } from "../../TransferEventListener"
import { Certificate, Transaction } from "thor-devkit"
import { CertificateRequest, ConnectAppRequest, LedgerAccountWithDevice, LocalDevice, WALLET_STATUS } from "~Model"
import { LedgerSignCertificate, LedgerSignTransaction } from "~Screens/Flows/App/LedgerScreen"
import { useWalletStatus } from "~Components"
import { BuyStack } from "./BuyStack"
import { SignMessageScreen } from "~Screens/Flows/App/WalletConnect/SignMessageScreen"
import { LedgerSignMessage } from "~Screens/Flows/App/LedgerScreen/LedgerSignMessage"
import { TypeDataRequest, TransactionRequest } from "~Model/DApp"
import { WindowRequest } from "~Components/Providers/InAppBrowserProvider/types"

export type RootStackParamListSwitch = {
    OnboardingStack: undefined
    TabStack: undefined
    ResetAppScreen: undefined
    [Routes.CREATE_WALLET_FLOW]: undefined
    [Routes.BLACKLISTED_COLLECTIONS]: undefined
    [Routes.BUY_FLOW]: undefined
    [Routes.CONNECT_APP_SCREEN]: {
        request: ConnectAppRequest
    }
    [Routes.CONNECTED_APP_SEND_TRANSACTION_SCREEN]: {
        request: TransactionRequest
        isInjectedWallet?: boolean
    }
    [Routes.CONNECTED_APP_SIGN_CERTIFICATE_SCREEN]: {
        request: CertificateRequest
    }
    [Routes.CONNECTED_APP_SIGN_TYPED_MESSAGE_SCREEN]: {
        request: TypeDataRequest
    }
    [Routes.CONNECTED_APP_SIGN_MESSAGE_SCREEN]: {
        requestEvent: PendingRequestTypes.Struct
        message: string
    }
    [Routes.LEDGER_SIGN_CERTIFICATE]: {
        request: CertificateRequest
        certificate: Certificate
        accountWithDevice: LedgerAccountWithDevice
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
    [Routes.DAPP_CHANGE_ACCOUNT_SCREEN]: {
        request: WindowRequest
    }

    [Routes.ICLOUD_MNEMONIC_BACKUP]: { deviceToBackup?: LocalDevice; mnemonicArray: string[] }
    [Routes.CHOOSE_MNEMONIC_BACKUP_PASSWORD]: { mnemonicArray: string[]; device: LocalDevice }

    [Routes.CONNECTED_V2_APP_APPROVAL]: {
        request: {
            id: string
            genesisId: string
            message: {
                payload: {
                    content: string
                    type: string
                }
                puerpose: string
            }
            method: string
            oprtions: {}
            origin: string
        }
    }
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

                        <Switch.Screen name={Routes.CONNECT_APP_SCREEN} component={ConnectAppScreen} />

                        <Switch.Screen
                            name={Routes.CONNECTED_APP_SEND_TRANSACTION_SCREEN}
                            component={SendTransactionScreen}
                        />

                        <Switch.Screen
                            name={Routes.CONNECTED_APP_SIGN_CERTIFICATE_SCREEN}
                            component={SignCertificateScreen}
                        />

                        <Switch.Screen
                            name={Routes.CONNECTED_APP_SIGN_TYPED_MESSAGE_SCREEN}
                            component={SignDataMessageScreen}
                        />

                        <Switch.Screen name={Routes.CONNECTED_APP_SIGN_MESSAGE_SCREEN} component={SignMessageScreen} />

                        <Switch.Screen name={Routes.BLOCKED_APP_SCREEN} component={AppBlockedScreen} />

                        <Switch.Screen name={Routes.LEDGER_SIGN_CERTIFICATE} component={LedgerSignCertificate} />

                        <Switch.Screen name={Routes.LEDGER_SIGN_TRANSACTION} component={LedgerSignTransaction} />

                        <Switch.Screen name={Routes.LEDGER_SIGN_MESSAGE} component={LedgerSignMessage} />

                        <Switch.Screen name={Routes.DAPP_CHANGE_ACCOUNT_SCREEN} component={DappChangeAccountScreen} />

                        <Switch.Screen
                            name={Routes.ICLOUD_MNEMONIC_BACKUP}
                            component={MnemonicBackupScreen}
                            options={{ headerShown: false }}
                        />

                        <Switch.Screen
                            name={Routes.CHOOSE_MNEMONIC_BACKUP_PASSWORD}
                            component={ChooseMnemonicBackupPassword}
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

                        <Switch.Screen name={Routes.CONNECTED_V2_APP_APPROVAL} component={AppApprovalScreen} />
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
