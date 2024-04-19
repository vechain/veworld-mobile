import React from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useCopyClipboard, useTheme, useVns } from "~Hooks"
import { BaseIcon, BaseSpacer, BaseText, BaseView, BaseBottomSheet, BaseButton } from "~Components"

import { useI18nContext } from "~i18n"
import { useAppSelector } from "~Storage/Redux"
import { selectSelectedAccount } from "~Storage/Redux/Selectors"
import QRCode from "react-native-qrcode-svg"
import { COLORS } from "~Constants"
import { StyleSheet } from "react-native"
import { AddressUtils } from "~Utils"
import { veworldLogo } from "~Assets"

export const QRCodeBottomSheet = React.forwardRef<BottomSheetModalMethods>(({}, ref) => {
    const theme = useTheme()
    const { LL } = useI18nContext()

    const selectedAccount = useAppSelector(selectSelectedAccount)

    let snapPoints = ["55%"]

    const { onCopyToClipboard } = useCopyClipboard()

    const { name: vnsName } = useVns({ name: "", address: selectedAccount.address })

    return (
        <BaseBottomSheet snapPoints={snapPoints} ref={ref}>
            <BaseView flexDirection="row" w={100} justifyContent="space-between">
                <BaseText typographyFont="subTitleBold">
                    {LL.TITLE_QR_CODE_FOR_ACCOUNT({
                        accountAlias: selectedAccount.alias,
                    })}
                </BaseText>
            </BaseView>

            <BaseSpacer height={24} />

            <BaseView justifyContent="center" alignItems="center">
                <BaseView
                    bg={COLORS.WHITE}
                    style={baseStyles.qrCodeWrapper}
                    justifyContent="center"
                    alignItems="center">
                    <QRCode
                        ecl="H"
                        value={selectedAccount.address}
                        size={172}
                        quietZone={10}
                        logo={{ uri: veworldLogo }}
                        logoSize={52}
                        logoBackgroundColor="transparent"
                    />
                </BaseView>

                <BaseSpacer height={32} />

                <BaseButton
                    haptics="Light"
                    px={28}
                    size="md"
                    title={AddressUtils.humanAddress(selectedAccount.address, 8, 7)}
                    action={() => onCopyToClipboard(selectedAccount.address, LL.COMMON_LBL_ADDRESS())}
                    rightIcon={<BaseIcon name="content-copy" color={theme.colors.card} style={baseStyles.icon} />}
                    m={16}
                />

                {vnsName && (
                    <BaseButton
                        haptics="Light"
                        px={28}
                        size="md"
                        bgColor={theme.colors.secondary}
                        textColor={theme.colors.text}
                        title={vnsName}
                        action={() => onCopyToClipboard(vnsName, LL.COMMON_LBL_ADDRESS())}
                        rightIcon={<BaseIcon name="content-copy" color={theme.colors.text} style={baseStyles.icon} />}
                    />
                )}
            </BaseView>
        </BaseBottomSheet>
    )
})

const baseStyles = StyleSheet.create({
    qrCodeWrapper: {
        width: 182,
        height: 182,
        borderRadius: 12,
    },
    icon: {
        marginLeft: 16,
    },
})
