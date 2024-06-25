import React, { forwardRef, useState } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import {
    BaseButton,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseView,
    MnemonicCard,
    BaseBottomSheet,
    BaseTextInput,
    Layout,
} from "~Components"
import { useI18nContext } from "~i18n"
import { useBottomSheetModal, useCloudKit, useCopyClipboard, useThemedStyles } from "~Hooks"
import { StyleSheet } from "react-native"
import { LocalDevice } from "~Model"
import { COLORS } from "~Constants"

type Props = {
    mnemonicArray: string[]
    deviceToBackup?: LocalDevice
    onClose: () => void
}

export const BackupMnemonicBottomSheet = forwardRef<BottomSheetModalMethods, Props>(
    ({ mnemonicArray, deviceToBackup }, ref) => {
        const { LL } = useI18nContext()

        const { styles, theme } = useThemedStyles(baseStyles)

        const { isCloudKitAvailable, isWalletBackedUp } = useCloudKit(deviceToBackup)

        const { onCopyToClipboard } = useCopyClipboard()

        const { ref: warningRef, onOpen, onClose: onCloseWarning } = useBottomSheetModal()

        return (
            <BaseBottomSheet snapPoints={["78%"]} ref={ref}>
                <Layout
                    noBackButton
                    noMargin
                    noStaticBottomPadding
                    hasSafeArea={false}
                    fixedBody={
                        <BaseView flex={1}>
                            <BaseView flexDirection="row" w={100}>
                                <BaseText typographyFont="subTitleBold">{LL.BTN_BACKUP_MENMONIC()}</BaseText>
                            </BaseView>

                            <BaseSpacer height={24} />

                            <BaseView justifyContent="center">
                                <BaseView flexDirection="row">
                                    <BaseIcon
                                        name="apple-icloud"
                                        size={24}
                                        color={isWalletBackedUp ? theme.colors.success : theme.colors.danger}
                                    />
                                    <BaseSpacer width={8} />
                                    <BaseText color={isWalletBackedUp ? theme.colors.success : theme.colors.danger}>
                                        {isWalletBackedUp ? "Backed up to iCloud" : "Not backed up to iCloud"}
                                    </BaseText>
                                </BaseView>

                                <BaseSpacer height={24} />

                                <BaseText>
                                    {
                                        // eslint-disable-next-line max-len
                                        "Never share these words. Anyone who learns them can steal all of your crypto. VeWorld will never ask you for them."
                                    }
                                </BaseText>

                                <BaseSpacer height={16} />

                                <BaseText>
                                    {
                                        // eslint-disable-next-line max-len
                                        "The 12 words below are your wallet's recovery phrase. This phrase lets you recover your wallet if you lose your device. Back up it up on iCloud (recommended) or write it down. Or both."
                                    }
                                </BaseText>

                                <BaseSpacer height={36} />
                            </BaseView>

                            <BaseView alignItems="flex-start" mb={16}>
                                <MnemonicCard mnemonicArray={mnemonicArray} souceScreen="BackupMnemonicBottomSheet" />

                                <BaseSpacer height={16} />

                                <BaseButton
                                    size="sm"
                                    variant="ghost"
                                    selfAlign="flex-start"
                                    action={() => onCopyToClipboard(mnemonicArray.join(" "), LL.TITLE_MNEMONIC())}
                                    title={LL.BTN_MNEMONIC_CLIPBOARD()}
                                    disabled={!mnemonicArray.length}
                                    rightIcon={
                                        <BaseIcon
                                            name="content-copy"
                                            color={theme.colors.text}
                                            size={12}
                                            style={styles.icon}
                                        />
                                    }
                                />

                                {!isCloudKitAvailable && <BaseSpacer height={12} />}
                            </BaseView>
                        </BaseView>
                    }
                    footer={
                        <>
                            {isCloudKitAvailable && (
                                <>
                                    <BaseSpacer height={56} />
                                    <BaseButton w={100} action={onOpen} title={"Back up on iCloud"} />
                                    <BaseSpacer height={24} />
                                </>
                            )}
                        </>
                    }
                />

                <CloudKitWarningBottomSheet ref={warningRef} onCloseWarning={onCloseWarning} />
            </BaseBottomSheet>
        )
    },
)

const baseStyles = () =>
    StyleSheet.create({
        icon: {
            marginLeft: 6,
        },
        warningIcon: {
            width: 44,
            height: 44,
            borderRadius: 12,
        },
    })

type WarningProps = {
    onCloseWarning: () => void
}

const CloudKitWarningBottomSheet = forwardRef<BottomSheetModalMethods, WarningProps>(({ onCloseWarning }, ref) => {
    const [secureText1, setsecureText1] = useState(true)
    const [secureText2, setsecureText2] = useState(true)

    const [password1, setPassword1] = useState("")
    const [password2, setPassword2] = useState("")

    const { styles } = useThemedStyles(baseStyles)

    return (
        <BaseBottomSheet snapPoints={["78%"]} ref={ref}>
            <Layout
                noBackButton
                noMargin
                noStaticBottomPadding
                hasSafeArea={false}
                fixedBody={
                    <BaseView flex={1}>
                        <BaseText typographyFont="subTitleBold">{"Cloud Backup Password"}</BaseText>
                        <BaseSpacer height={48} />
                        {/* Warning ICON */}
                        <BaseView justifyContent="center" alignItems="center">
                            <BaseView justifyContent="center" bg={COLORS.PASTEL_ORANGE} style={styles.warningIcon}>
                                <BaseIcon my={8} size={22} name="alert-outline" color={COLORS.MEDIUM_ORANGE} />
                            </BaseView>
                        </BaseView>
                        <BaseSpacer height={48} />
                        <BaseText>
                            {
                                // eslint-disable-next-line max-len
                                "This password will secure your secret recovery phrase in the cloud. VeWorld does NOT have access to your password. We can NOT reset it if you lose it, so keep it safe."
                            }
                        </BaseText>
                        <BaseSpacer height={24} />
                        <BaseTextInput
                            placeholder="Chooe password"
                            secureTextEntry={secureText1}
                            rightIcon={secureText1 ? "eye-off" : "eye"}
                            onIconPress={() => setsecureText1(prev => !prev)}
                            value={password1}
                            setValue={setPassword1}
                        />
                        <BaseSpacer height={24} />
                        <BaseTextInput
                            placeholder="Confirm password"
                            secureTextEntry={secureText2}
                            rightIcon={secureText2 ? "eye-off" : "eye"}
                            onIconPress={() => setsecureText2(prev => !prev)}
                            value={password2}
                            setValue={setPassword2}
                        />
                    </BaseView>
                }
                footer={
                    <>
                        <BaseSpacer height={48} />
                        <BaseButton title="Proceed" action={onCloseWarning} />
                        <BaseSpacer height={24} />
                    </>
                }
            />
        </BaseBottomSheet>
    )
})
