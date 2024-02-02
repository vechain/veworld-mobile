import React, { FC, useCallback } from "react"
import { BaseButton, BaseSafeArea, BaseSpacer, BaseText, BaseView } from "~Components"
import { useNavigation } from "@react-navigation/native"
import { VeWorldLogoSVG } from "~Assets"
import { useI18nContext } from "~i18n"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamListCreateWalletApp, Routes } from "~Navigation"
import { addAccount, useAppDispatch } from "~Storage/Redux"

type Props = {} & NativeStackScreenProps<RootStackParamListCreateWalletApp, Routes.OBSERVE_WALLET_CONFIRMATION>

export const ObserveWalletSuccesScreen: FC<Props> = ({ route }) => {
    const nav = useNavigation()
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()

    const navigateNext = useCallback(() => {
        const parent = nav.getParent()
        if (parent) {
            if (parent.canGoBack()) {
                parent.goBack()
            }
        }
    }, [nav])

    const onButtonPress = useCallback(async () => {
        let { account } = route.params
        dispatch(addAccount(account))
        navigateNext()
    }, [dispatch, navigateNext, route.params])

    return (
        <>
            <BaseSafeArea grow={1}>
                <BaseSpacer height={20} />

                <BaseView alignItems="center" mx={20} flexGrow={1}>
                    <BaseView flexDirection="row" flexWrap="wrap">
                        <BaseText typographyFont="title">{LL.TITLE_CREATE_WALLET_SUCCESS()}</BaseText>
                    </BaseView>

                    <BaseSpacer height={120} />

                    <BaseView alignItems="center" justifyContent="space-between" w={100} flexGrow={1}>
                        <BaseView alignItems="center">
                            <VeWorldLogoSVG height={200} width={200} />
                            <BaseText align="center" py={20}>
                                {LL.BD_CREATE_WALLET_SUCCESS()}
                            </BaseText>
                        </BaseView>

                        <BaseView alignItems="center" w={100}>
                            <BaseButton
                                action={onButtonPress}
                                w={100}
                                title={LL.BTN_CREATE_WALLET_SUCCESS()}
                                testID="GET_STARTED_BTN"
                                haptics="Success"
                            />
                        </BaseView>
                    </BaseView>
                    <BaseSpacer height={40} />
                </BaseView>
            </BaseSafeArea>
        </>
    )
}
