import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { ReactElement, useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import Animated, {
    EntryAnimationsValues,
    ExitAnimationsValues,
    FadeInLeft,
    FadeOutLeft,
    LinearTransition,
} from "react-native-reanimated"
import { BaseButton, BaseView, Layout } from "~Components"
import { CloseIconHeaderButton } from "~Components/Reusable/HeaderButtons"
import { ReceiverScreen, SendNFTContextProvider, useSendContext } from "~Components/Reusable/Send/Provider"
import { useThemedStyles } from "~Hooks"
import { RootStackParamListNFT, Routes } from "~Navigation"
import { selectNFTWithAddressAndTokenId, useAppSelector } from "~Storage/Redux"
import { wrapFunctionComponent } from "~Utils/ReanimatedUtils/Reanimated"
import { useI18nContext } from "~i18n"
import { EnteringFromLeftAnimation, EnteringFromRightAnimation } from "../../SendScreen/Animations/Entering"
import { ExitingToLeftAnimation, ExitingToRightAnimation } from "../../SendScreen/Animations/Exiting"

type SendNFTFlowStep = "insertAddress" | "summary"

const ORDER: SendNFTFlowStep[] = ["insertAddress", "summary"]

type NavigationProps = NativeStackNavigationProp<RootStackParamListNFT, Routes.SEND_NFT>

const AnimatedBaseButton = Animated.createAnimatedComponent(wrapFunctionComponent(BaseButton))
const AnimatedBaseView = Animated.createAnimatedComponent(wrapFunctionComponent(BaseView))

type RouteProps = RouteProp<RootStackParamListNFT, Routes.SEND_NFT>

export const SendNFTScreenContent = (): ReactElement => {
    const { LL } = useI18nContext()

    const navigation = useNavigation<NavigationProps>()
    const { styles } = useThemedStyles(baseStyles)
    const { step, previousStep, nextStep, goToNext, goToPrevious, isPreviousButtonEnabled, isNextButtonEnabled } =
        useSendContext()

    const handleClose = useCallback(() => {
        navigation.goBack()
    }, [navigation])

    const headerRightElement = useMemo(
        () => <CloseIconHeaderButton action={handleClose} testID="Send_NFT_Screen_Close" />,
        [handleClose],
    )

    const Entering = useCallback(
        (values: EntryAnimationsValues) => {
            "worklet"
            if (!previousStep.value || !nextStep.value)
                return {
                    initialValues: values,
                    animations: {},
                }
            if (ORDER.indexOf(nextStep.value as SendNFTFlowStep) > ORDER.indexOf(previousStep.value as SendNFTFlowStep))
                return EnteringFromRightAnimation(values)
            return EnteringFromLeftAnimation(values)
        },
        [nextStep.value, previousStep.value],
    )

    const Exiting = useCallback(
        (values: ExitAnimationsValues) => {
            "worklet"
            if (!previousStep.value || !nextStep.value)
                return {
                    initialValues: values,
                    animations: {},
                }
            if (ORDER.indexOf(nextStep.value as SendNFTFlowStep) > ORDER.indexOf(previousStep.value as SendNFTFlowStep))
                return ExitingToLeftAnimation(values)
            return ExitingToRightAnimation(values)
        },
        [nextStep.value, previousStep.value],
    )

    return (
        <Layout
            title={LL.SEND_COLLECTIBLE()}
            noBackButton
            headerTitleAlignment="center"
            headerRightElement={headerRightElement}
            fixedBody={
                <Animated.View style={styles.flexElement}>
                    <Animated.View
                        style={[styles.flexElement, styles.viewContainer]}
                        entering={Entering}
                        exiting={Exiting}
                        key={step}>
                        {step === "insertAddress" && <ReceiverScreen />}
                        {step === "summary" && <></>}
                    </Animated.View>
                </Animated.View>
            }
            footer={
                <AnimatedBaseView flexDirection="row" gap={16} layout={LinearTransition}>
                    {step !== "insertAddress" && (
                        <AnimatedBaseButton
                            variant="outline"
                            flex={1}
                            action={goToPrevious}
                            layout={LinearTransition}
                            disabled={!isPreviousButtonEnabled}
                            entering={FadeInLeft.delay(50)}
                            exiting={FadeOutLeft}>
                            {LL.COMMON_LBL_BACK()}
                        </AnimatedBaseButton>
                    )}
                    <AnimatedBaseButton
                        flex={1}
                        action={goToNext}
                        disabled={!isNextButtonEnabled}
                        layout={LinearTransition}>
                        {LL.COMMON_LBL_NEXT()}
                    </AnimatedBaseButton>
                </AnimatedBaseView>
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
        viewContainer: { paddingHorizontal: 16 },
    })
