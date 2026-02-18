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
    SendFlowState,
    SummaryScreen,
    useTokenSendContext,
} from "~Components/Reusable/Send"
import { useThemedStyles } from "~Hooks"
import { AmountInputMode } from "~Model"
import { RootStackParamListHome, Routes } from "~Navigation"
import { useAppSelector } from "~Storage/Redux/Hooks"
import { selectDefaultAmountInputMode } from "~Storage/Redux/Selectors/UserPreferences"
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
            hasTopSafeAreaOnly
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
    const defaultAmountInputMode = useAppSelector(selectDefaultAmountInputMode)

    const isInputInFiat = useMemo(() => defaultAmountInputMode === AmountInputMode.FIAT, [defaultAmountInputMode])

    const initialFlowState: SendFlowState = useMemo(
        () => ({
            type: "token",
            token: route.params?.token,
            amount: "0",
            fiatAmount: isInputInFiat ? "0" : "",
            address: "",
            amountInFiat: isInputInFiat,
        }),
        [route.params?.token, isInputInFiat],
    )

    return (
        <SendContextProvider initialFlowState={initialFlowState}>
            <SendScreenContent />
        </SendContextProvider>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        flexElement: { flex: 1 },
        viewContainer: { paddingHorizontal: 16, flexDirection: "column" },
    })
