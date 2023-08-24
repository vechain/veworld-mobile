import React, { useState } from "react"
import { useAppReset, useTheme } from "~Hooks"
import {
    BaseButton,
    BaseText,
    BaseView,
    CheckBoxWithText,
    Layout,
} from "~Components"
import { useI18nContext } from "~i18n"

export const ResetAppScreen = () => {
    const appReset = useAppReset()
    const { LL } = useI18nContext()
    const theme = useTheme()

    const [isChecked, setIsChecked] = useState(false)

    return (
        <Layout
            body={
                <BaseView alignItems="center" justifyContent="space-between">
                    <BaseView alignSelf="flex-start">
                        <BaseText typographyFont="title">
                            {LL.TITLE_RESET_APP()}
                        </BaseText>

                        <BaseText typographyFont="bodyMedium" my={10}>
                            {LL.BD_CONFIRM_RESET()}
                        </BaseText>

                        <BaseText typographyFont="body" my={10}>
                            {LL.BD_RESET_APP_01()}
                        </BaseText>

                        <BaseText typographyFont="body" my={10}>
                            {LL.BD_RESET_APP_02()}
                        </BaseText>

                        <BaseText
                            typographyFont="body"
                            my={10}
                            color={theme.colors.danger}>
                            {LL.BD_RESET_APP_DISCLAIMER()}
                        </BaseText>
                    </BaseView>
                </BaseView>
            }
            footer={
                <BaseView alignItems="center" w={100}>
                    <CheckBoxWithText
                        isChecked={isChecked}
                        text={LL.BTN_RESET_APP_CHECKBOX()}
                        checkAction={setIsChecked}
                        testID="reset-app-checkbox"
                    />

                    <BaseButton
                        haptics="Warning"
                        action={appReset}
                        w={100}
                        px={20}
                        title={LL.BTN_RESET_APP().toUpperCase()}
                        disabled={!isChecked}
                        bgColor={theme.colors.primary}
                    />
                </BaseView>
            }
        />
    )
}
