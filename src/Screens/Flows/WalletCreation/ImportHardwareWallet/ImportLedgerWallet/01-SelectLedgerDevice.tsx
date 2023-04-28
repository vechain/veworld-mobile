import React, { useState } from "react"
import {
    BaseButton,
    BaseIcon,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    DismissKeyboardView,
} from "~Components"
import { useI18nContext } from "~i18n"
import { debug, useTheme } from "~Common"
import { StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"

import BleTransport from "@ledgerhq/react-native-hw-transport-ble"

export const SelectLedgerDevice = () => {
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const theme = useTheme()

    const [isDisabled] = useState(true)

    const goBack = () => nav.goBack()

    BleTransport.listen({
        complete: () => {
            debug("complete")
        },
        next: e => {
            debug({ e })
            // if (e.type === "add") {
            //     const device = e.descriptor
            //     addDeviceToTheUI(device)
            // }
        },
        error: error => {
            debug({ error })
        },
    })

    return (
        <DismissKeyboardView>
            <BaseSafeArea grow={1}>
                <BaseIcon
                    style={styles.backIcon}
                    mx={8}
                    size={36}
                    name="chevron-left"
                    color={theme.colors.text}
                    action={goBack}
                />
                <BaseSpacer height={22} />
                <BaseView
                    alignItems="center"
                    justifyContent="space-between"
                    flexGrow={1}
                    mx={20}>
                    <BaseView alignSelf="flex-start" w={100}>
                        <BaseView flexDirection="row" w={100}>
                            <BaseText typographyFont="title">
                                {LL.WALLET_LEDGER_SELECT_DEVICE_TITLE()}
                            </BaseText>
                        </BaseView>
                        <BaseText typographyFont="body" my={10}>
                            {LL.WALLET_LEDGER_SELECT_DEVICE_SB()}
                        </BaseText>

                        <BaseSpacer height={20} />
                    </BaseView>

                    <BaseView w={100}>
                        <BaseButton
                            action={() => null}
                            w={100}
                            title={LL.COMMON_LBL_IMPORT()}
                            disabled={isDisabled}
                        />
                    </BaseView>
                </BaseView>

                <BaseSpacer height={40} />
            </BaseSafeArea>
        </DismissKeyboardView>
    )
}

const styles = StyleSheet.create({
    backIcon: { marginHorizontal: 20, alignSelf: "flex-start" },
})
