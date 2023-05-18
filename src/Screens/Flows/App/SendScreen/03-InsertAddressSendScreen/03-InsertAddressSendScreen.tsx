import { useNavigation } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useState } from "react"
import { StyleSheet } from "react-native"
import { AddressUtils, debug, useTheme } from "~Common"
import {
    BackButtonHeader,
    BaseButton,
    BaseIcon,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseTextInput,
    BaseView,
} from "~Components"
import {
    RootStackParamListDiscover,
    RootStackParamListHome,
    Routes,
} from "~Navigation"
import { useI18nContext } from "~i18n"

type Props = NativeStackScreenProps<
    RootStackParamListHome & RootStackParamListDiscover,
    Routes.INSERT_ADDRESS_SEND
>

export const InsertAddressSendScreen = ({ route }: Props) => {
    const { token, amount, initialRoute } = route.params
    const { LL } = useI18nContext()
    const [address, setAddress] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [isValid, setIsValid] = useState(false)
    const theme = useTheme()
    const nav = useNavigation()

    const handleAddressChange = (addressRaw: string) => {
        const newAddress = addressRaw.toLowerCase()
        setErrorMessage("")
        setIsValid(false)
        setAddress(newAddress)
        if (AddressUtils.isValid(newAddress)) {
            debug("Valid address")
            setIsValid(true)
        }
    }
    const onOpenCamera = () => {
        nav.navigate(Routes.CAMERA, { onScan: handleAddressChange })
    }
    const goToResumeTransaction = () => {
        nav.navigate(Routes.TRANSACTION_SUMMARY_SEND, {
            token,
            amount,
            address,
            initialRoute: initialRoute ?? "",
        })
    }

    return (
        <BaseSafeArea grow={1}>
            <BackButtonHeader />
            <BaseView mx={24}>
                <BaseText typographyFont="title">
                    {LL.SEND_TOKEN_TITLE()}
                </BaseText>
                <BaseSpacer height={24} />
                <BaseText typographyFont="button">
                    {LL.SEND_INSERT_ADDRESS()}
                </BaseText>
                <BaseSpacer height={8} />
                <BaseText typographyFont="body">
                    {LL.SEND_INSERT_ADDRESS_DESCRIPTION()}
                </BaseText>
                <BaseSpacer height={24} />
                {/** TODO: understand how to add contacts here */}
                <BaseView flexDirection="row" w={100}>
                    <BaseTextInput
                        containerStyle={styles.inputContainer}
                        value={address}
                        setValue={handleAddressChange}
                        placeholder={LL.MANAGE_CUSTOM_TOKENS_ENTER_AN_ADDRESS()}
                        errorMessage={errorMessage}
                    />
                    {!address && (
                        <BaseIcon
                            name={"flip-horizontal"}
                            size={24}
                            color={theme.colors.primary}
                            action={onOpenCamera}
                            style={styles.icon}
                        />
                    )}
                </BaseView>
            </BaseView>
            <BaseButton
                style={styles.nextButton}
                mx={24}
                title={LL.COMMON_BTN_NEXT()}
                disabled={!isValid}
                action={goToResumeTransaction}
            />
        </BaseSafeArea>
    )
}

const styles = StyleSheet.create({
    icon: {
        position: "absolute",
        top: 10,
        right: 10,
    },
    inputContainer: {
        width: "100%",
    },
    nextButton: {
        marginBottom: 70,
    },
})
