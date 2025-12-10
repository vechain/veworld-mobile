import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { ReactElement, useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import Animated, { LinearTransition } from "react-native-reanimated"

import { Layout } from "~Components"
import { CloseIconHeaderButton } from "~Components/Reusable/HeaderButtons"
import { ReceiverScreen, SendContextProvider, useNFTSendContext } from "~Components/Reusable/Send"
import { useThemedStyles } from "~Hooks"
import { RootStackParamListNFT, Routes } from "~Navigation"
import { HexUtils } from "~Utils"
import { useI18nContext } from "~i18n"
import { NFTSummaryScreen } from "~Screens"

type NavigationProps = NativeStackNavigationProp<RootStackParamListNFT, Routes.SEND_NFT>

type RouteProps = RouteProp<RootStackParamListNFT, Routes.SEND_NFT>

export const SendNFTScreenContent = (): ReactElement => {
    const { LL } = useI18nContext()
    const navigation = useNavigation<NavigationProps>()
    const { styles } = useThemedStyles(baseStyles)
    const { step } = useNFTSendContext()

    const handleClose = useCallback(() => {
        navigation.goBack()
    }, [navigation])

    const headerRightElement = useMemo(
        () => <CloseIconHeaderButton action={handleClose} testID="Send_NFT_Screen_Close" />,
        [handleClose],
    )

    return (
        <Layout
            title={LL.SEND_COLLECTIBLE()}
            noBackButton
            headerTitleAlignment="center"
            headerRightElement={headerRightElement}
            fixedBody={
                <Animated.View style={[styles.viewContainer, styles.flexElement]} layout={LinearTransition}>
                    {step === "insertAddress" && <ReceiverScreen />}
                    {step === "summary" && <NFTSummaryScreen />}
                </Animated.View>
            }
        />
    )
}

export const SendNFTScreen = () => {
    const route = useRoute<RouteProps>()

    return (
        <SendContextProvider
            initialFlowState={{
                type: "nft",
                contractAddress: HexUtils.normalize(route.params.contractAddress),
                tokenId: route.params.tokenId,
                address: "",
            }}>
            <SendNFTScreenContent />
        </SendContextProvider>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        flexElement: { flex: 1 },
        viewContainer: { paddingHorizontal: 16, flexDirection: "column" },
    })
