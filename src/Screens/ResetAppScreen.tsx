import React, { useCallback, useState } from "react"
import { useAppReset, useTheme } from "~Common"
import {
    BaseButton,
    BaseIcon,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    CheckBoxWithText,
} from "~Components"
import { getConfig, useRealm } from "~Storage"
import { useI18nContext } from "~i18n"

export const ResetAppScreen = () => {
    const appReset = useAppReset()
    const { LL } = useI18nContext()
    const { store } = useRealm()
    const theme = useTheme()

    const [IsChecked, setIsChecked] = useState(false)

    const onBackPress = useCallback(() => {
        store.write(() => {
            const config = getConfig(store)
            if (config) config.isResettingApp = false
        })
    }, [store])

    return (
        <BaseSafeArea grow={1}>
            <BaseIcon
                name="chevron-left"
                style={{ alignSelf: "flex-start" }}
                size={24}
                color={theme.colors.text}
                action={onBackPress}
            />

            <BaseSpacer height={20} />
            <BaseView align="center" justify="space-between" grow={1} mx={20}>
                <BaseView selfAlign="flex-start">
                    <BaseText typographyFont="largeTitle">
                        {LL.TITLE_RESET_APP()}
                    </BaseText>

                    <BaseText typographyFont="body" my={10}>
                        {LL.BD_RESET_APP_01()}
                    </BaseText>

                    <BaseSpacer height={20} />

                    <BaseText typographyFont="body" my={10}>
                        {LL.BD_RESET_APP_02()}
                    </BaseText>
                </BaseView>

                <BaseView align="center" w={100}>
                    <BaseText
                        typographyFont="footNoteAccent"
                        color="red"
                        my={10}>
                        {LL.BD_RESET_APP_DISCLAIMER()}
                    </BaseText>
                    <CheckBoxWithText
                        text={LL.BTN_RESET_APP_CHECKBOX()}
                        checkAction={setIsChecked}
                    />

                    <BaseButton
                        action={appReset}
                        w={100}
                        px={20}
                        title={LL.TITLE_RESET_APP()}
                        disabled={!IsChecked}
                        bgColor={theme.colors.danger}
                    />
                </BaseView>
            </BaseView>

            <BaseSpacer height={40} />
        </BaseSafeArea>
    )
}
