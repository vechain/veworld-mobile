import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { ReactElement, useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import Animated, { LinearTransition } from "react-native-reanimated"

import { Layout } from "~Components"
import { CloseIconHeaderButton } from "~Components/Reusable/HeaderButtons"
import {
    ReceiverScreen,
    SelectAmountSendComponent,
    SendContextProvider,
    SummaryScreen,
    useTokenSendContext,
} from "~Components/Reusable/Send"
import { useThemedStyles } from "~Hooks"
import { RootStackParamListHome, Routes } from "~Navigation"
import { useI18nContext } from "~i18n"

type NavigationProps = NativeStackNavigationProp<RootStackParamListHome, Routes.SEND_TOKEN>

type RouteProps = RouteProp<RootStackParamListHome, Routes.SEND_TOKEN>

export const SendScreenContent = (): ReactElement => {
    const { LL } = useI18nContext()
    const navigation = useNavigation<NavigationProps>()
    const { styles } = useThemedStyles(baseStyles)
    const { step } = useTokenSendContext()

    const handleClose = useCallback(() => {
        navigation.goBack()
    }, [navigation])

    const headerRightElement = useMemo(
        () => <CloseIconHeaderButton action={handleClose} testID="Send_Screen_Close" />,
        [handleClose],
    )

    return (
        <Layout
            title={LL.SEND_TOKEN_TITLE()}
            noBackButton
            headerTitleAlignment="center"
            headerRightElement={headerRightElement}
            fixedBody={
                <Animated.View style={[styles.viewContainer, styles.flexElement]} layout={LinearTransition}>
                    {step === "selectAmount" && <SelectAmountSendComponent />}
                    {step === "insertAddress" && <ReceiverScreen />}
                    {step === "summary" && <SummaryScreen />}
                </Animated.View>
            }
        />
    )
}

export const SendScreen = () => {
    const route = useRoute<RouteProps>()

    return (
        <SendContextProvider
            initialFlowState={{
                type: "token",
                token: route.params?.token,
                amount: "0",
                fiatAmount: "",
                address: "",
                amountInFiat: false,
            }}>
            <SendScreenContent />
        </SendContextProvider>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        flexElement: { flex: 1 },
        viewContainer: { paddingHorizontal: 16, flexDirection: "column" },
    })
