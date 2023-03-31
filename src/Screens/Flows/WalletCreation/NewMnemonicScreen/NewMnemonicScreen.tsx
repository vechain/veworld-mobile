import React, { useCallback, useState } from "react"
import {
    BaseButton,
    BaseIcon,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    CheckBoxWithText,
    MnemonicCard,
} from "~Components"
import { Alert } from "react-native"
import * as Clipboard from "expo-clipboard"
import { useI18nContext } from "~i18n"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import { useGenerateMnemonic } from "./useGenerateMnemonic"
import { useTheme } from "~Common"
import { useAppDispatch } from "~Storage/Redux"
import { setMnemonic } from "~Storage/Redux/Actions"

export const NewMnemonicScreen = () => {
    const nav = useNavigation()
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()

    const [isChecked, setIsChecked] = useState(false)
    const { mnemonic, mnemonicArray } = useGenerateMnemonic()

    const theme = useTheme()

    const onCopyToClipboard = useCallback(async () => {
        await Clipboard.setStringAsync(mnemonic)
        Alert.alert("Success!", "Mnemonic copied to clipboard")
    }, [mnemonic])

    const onBackupPress = useCallback(() => {
        dispatch(setMnemonic(mnemonic))
        nav.navigate(Routes.CONFIRM_MNEMONIC)
    }, [dispatch, mnemonic, nav])

    return (
        <BaseSafeArea grow={1}>
            <BaseSpacer height={20} />
            <BaseView
                alignItems="flex-start"
                justifyContent="space-between"
                flexGrow={1}
                mx={20}>
                <BaseView alignItems="flex-start">
                    <BaseText typographyFont="title" align="left">
                        {LL.TITLE_MNEMONIC()}
                    </BaseText>

                    <BaseText typographyFont="body" my={10}>
                        {LL.BD_MNEMONIC_SUBTITLE()}
                    </BaseText>

                    <BaseSpacer height={24} />

                    <MnemonicCard mnemonicArray={mnemonicArray} />
                    <BaseSpacer height={20} />
                    <BaseButton
                        size="sm"
                        selfAlign="flex-end"
                        action={onCopyToClipboard}
                        w={100}
                        title={LL.BTN_MNEMONIC_CLIPBOARD()}
                        disabled={!mnemonic}
                        rightIcon={
                            <BaseIcon
                                name="content-copy"
                                color={theme.colors.card}
                                size={12}
                                style={{ marginLeft: 6 }}
                            />
                        }
                    />
                    <BaseSpacer height={28} />

                    <BaseText
                        typographyFont="footNoteAccent"
                        color={theme.colors.danger}
                        my={10}>
                        {LL.BD_MNEMONIC_DISCLAIMER()}
                    </BaseText>

                    <BaseText typographyFont="footNote">
                        {LL.BD_MNEMONIC_BACKUP()}
                    </BaseText>
                </BaseView>

                <BaseView alignItems="center" w={100}>
                    <CheckBoxWithText
                        text={LL.BTN_MNEMONIC_CHECKBOX()}
                        checkAction={setIsChecked}
                    />

                    <BaseButton
                        action={onBackupPress}
                        w={100}
                        px={20}
                        title={LL.BTN_MNEMONIC_BACKUP()}
                        disabled={!isChecked}
                    />
                </BaseView>
            </BaseView>

            <BaseSpacer height={40} />
        </BaseSafeArea>
    )
}
