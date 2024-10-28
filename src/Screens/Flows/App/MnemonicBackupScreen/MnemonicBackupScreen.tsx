import React, { useCallback } from "react"
import { BaseIcon, BaseSpacer, BaseText, BaseView, Layout } from "~Components"
import { useI18nContext } from "~i18n"
import { useCloudKit, useTheme } from "~Hooks"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamListSettings, Routes } from "~Navigation"
import { useNavigation } from "@react-navigation/native"
import { CloudAndManualBackup, ManualOnlyBackup } from "./Components"

type Props = NativeStackScreenProps<RootStackParamListSettings, Routes.ICLOUD_MNEMONIC_BACKUP>

export const MnemonicBackupScreen = ({ route }: Props) => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    const { isCloudKitAvailable } = useCloudKit()

    const nav = useNavigation()

    const { mnemonicArray, deviceToBackup } = route.params

    const onActionPress = useCallback(async () => {
        nav.goBack()
    }, [nav])

    return (
        <Layout
            noStaticBottomPadding
            noBackButton
            pageHeader={
                <BaseView>
                    <BaseSpacer height={24} />
                    <BaseView flexDirection="row" w={100} px={8} justifyContent="space-between">
                        <BaseIcon
                            haptics="Light"
                            action={onActionPress}
                            name="arrow-left"
                            size={24}
                            color={theme.colors.text}
                        />
                        <BaseText typographyFont="subTitleBold">{LL.SB_RECOVERY_PHRASE()}</BaseText>
                        <BaseSpacer width={24} />
                    </BaseView>
                </BaseView>
            }
            body={
                <BaseView>
                    {isCloudKitAvailable ? (
                        <CloudAndManualBackup mnemonicArray={mnemonicArray} deviceToBackup={deviceToBackup} />
                    ) : (
                        <ManualOnlyBackup mnemonicArray={mnemonicArray} deviceToBackup={deviceToBackup} />
                    )}
                </BaseView>
            }
        />
    )
}
