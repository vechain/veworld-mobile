import React, { useCallback, useState } from "react"
import {
    BaseButton,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseView,
    CheckBoxWithText,
    Layout,
    MnemonicCard,
} from "~Components"
import { StyleSheet } from "react-native"
import { useI18nContext } from "~i18n"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import { useGenerateMnemonic } from "./useGenerateMnemonic"
import { useCopyClipboard, useTheme } from "~Hooks"
import { useAppDispatch } from "~Storage/Redux"
import { setMnemonic } from "~Storage/Redux/Actions"

export const NewMnemonicScreen = () => {
    const nav = useNavigation()
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()

    const [isChecked, setIsChecked] = useState(false)
    const { mnemonic, mnemonicArray } = useGenerateMnemonic()

    const theme = useTheme()

    const { onCopyToClipboard } = useCopyClipboard()

    const onBackupPress = useCallback(() => {
        dispatch(setMnemonic(mnemonic))
        nav.navigate(Routes.CONFIRM_MNEMONIC)
    }, [dispatch, mnemonic, nav])

    return (
        <Layout
            body={
                <BaseView alignItems="flex-start">
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
                            action={() =>
                                onCopyToClipboard(
                                    mnemonicArray.join(" "),
                                    LL.TITLE_MNEMONIC(),
                                )
                            }
                            w={100}
                            title={LL.BTN_MNEMONIC_CLIPBOARD()}
                            disabled={!mnemonic}
                            rightIcon={
                                <BaseIcon
                                    name="content-copy"
                                    color={theme.colors.card}
                                    size={12}
                                    style={styles.icon}
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
                </BaseView>
            }
            footer={
                <BaseView alignItems="center" w={100}>
                    <BaseView mx={16}>
                        <CheckBoxWithText
                            isChecked={isChecked}
                            text={LL.BTN_MNEMONIC_CHECKBOX()}
                            checkAction={setIsChecked}
                            testID="mnemonic-checkbox"
                        />
                    </BaseView>

                    <BaseButton
                        action={onBackupPress}
                        w={100}
                        px={20}
                        haptics="Medium"
                        title={LL.BTN_MNEMONIC_BACKUP()}
                        disabled={!isChecked}
                    />
                </BaseView>
            }
        />
    )
}

const styles = StyleSheet.create({
    icon: { marginLeft: 6 },
})
