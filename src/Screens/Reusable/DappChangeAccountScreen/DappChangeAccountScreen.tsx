import React, { FC, useCallback, useEffect, useMemo, useState } from "react"
import {
    AccountCard,
    BaseButton,
    BaseSpacer,
    BaseText,
    BaseView,
    Layout,
    showInfoToast,
    useInAppBrowser,
} from "~Components"
import { useI18nContext } from "~i18n"
import { RootStackParamListSwitch, Routes } from "~Navigation"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { useNavigation } from "@react-navigation/native"
import { selectAccounts, useAppSelector } from "~Storage/Redux"
import { AccountWithDevice } from "~Model"
import { AddressUtils } from "~Utils"

type Props = NativeStackScreenProps<RootStackParamListSwitch, Routes.DAPP_CHANGE_ACCOUNT_SCREEN>

export const DappChangeAccountScreen: FC<Props> = ({ route }: Props) => {
    const { request } = route.params
    const accounts = useAppSelector(selectAccounts)

    const { switchAccount, postMessage } = useInAppBrowser()
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const [hasPosted, setHasPosted] = useState(false)

    const requestedAccount: AccountWithDevice | undefined = useMemo(
        () =>
            accounts.find(acct => {
                return AddressUtils.compareAddresses(request.options.signer, acct.address)
            }),
        [accounts, request.options.signer],
    )

    useEffect(() => {
        return () => {
            if (!hasPosted) {
                postMessage({
                    id: request.id,
                    error: "Invalid account",
                    method: request.method,
                })
            }
        }
    }, [hasPosted, postMessage, request.id, request.method])

    const onPressBack = useCallback(() => {
        if (nav.canGoBack()) {
            postMessage({
                id: request.id,
                error: "Invalid account",
                method: request.method,
            })

            setHasPosted(true)

            showInfoToast({
                text1: LL.NOTIFICATION_DAPP_REQUESTED_ACCOUNT_NOT_FOUND(),
            })

            nav.goBack()
        }
    }, [LL, nav, postMessage, request.id, request.method])

    const onAccept = useCallback(async () => {
        switchAccount(request)
        nav.goBack()
    }, [nav, request, switchAccount])

    // @ts-expect-error - origin is not defined in WindowRequest
    const origin = request.origin.includes("https://") ? request.origin.split("https://")[1] : request.origin

    return (
        <Layout
            fixedBody={
                <>
                    <BaseView mx={24} my={28} flex={1} alignSelf="flex-start">
                        <BaseText typographyFont="title">{LL.CONNECTED_APP_REQUEST()}</BaseText>

                        <BaseSpacer height={32} />
                        <BaseText typographyFont="subTitle">{LL.CONNECTED_APP_CHANGE_ACCOUNT_REQUEST_TITLE()}</BaseText>
                        <BaseSpacer height={16} />
                        <BaseText>{LL.CONNECTED_APP_CHANGE_ACCOUNT_REQUEST_DESCRIPTION({ dapp: origin })}</BaseText>

                        <BaseSpacer height={32} />
                        <BaseText typographyFont="subTitleBold">{LL.CONNECTED_APP_SELECTED_ACCOUNT_LABEL()}</BaseText>

                        <BaseSpacer height={16} />
                        <AccountCard account={requestedAccount!} showOpacityWhenDisabled={false} />

                        <BaseSpacer height={32} />
                    </BaseView>
                </>
            }
            footer={
                <BaseView>
                    <BaseButton w={100} haptics="Light" title={LL.COMMON_BTN_SIGN()} action={onAccept} />

                    <BaseSpacer height={16} />

                    <BaseButton
                        w={100}
                        haptics="Light"
                        variant="outline"
                        title={LL.COMMON_BTN_REJECT()}
                        action={onPressBack}
                    />
                </BaseView>
            }
        />
    )
}
