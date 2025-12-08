import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { ReactElement, useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import Animated, { LinearTransition } from "react-native-reanimated"

import { Layout } from "~Components"
import { CloseIconHeaderButton } from "~Components/Reusable/HeaderButtons"
import { ReceiverScreen, SendNFTContextProvider, useSendContext } from "~Components/Reusable/Send"
import { useThemedStyles } from "~Hooks"
import { RootStackParamListNFT, Routes } from "~Navigation"
import { selectNFTWithAddressAndTokenId, useAppSelector } from "~Storage/Redux"
import { useI18nContext } from "~i18n"

type NavigationProps = NativeStackNavigationProp<RootStackParamListNFT, Routes.SEND_NFT>

type RouteProps = RouteProp<RootStackParamListNFT, Routes.SEND_NFT>

export const SendNFTScreenContent = (): ReactElement => {
    const { LL } = useI18nContext()
    const navigation = useNavigation<NavigationProps>()
    const { styles } = useThemedStyles(baseStyles)
    const { step } = useSendContext()

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
                    {step === "summary" && <></>}
                </Animated.View>
            }
        />
    )
}

export const SendNFTScreen = () => {
    const route = useRoute<RouteProps>()

    const nft = useAppSelector(state =>
        selectNFTWithAddressAndTokenId(state, route.params.contractAddress, route.params.tokenId),
    )

    return (
        <SendNFTContextProvider initialNft={nft ?? undefined}>
            <SendNFTScreenContent />
        </SendNFTContextProvider>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        flexElement: { flex: 1 },
        viewContainer: { paddingHorizontal: 16, flexDirection: "column" },
    })
