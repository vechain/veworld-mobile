import React from "react"
import {
    BaseButton,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
} from "~Components"
import { SecurityDowngradeSVG } from "~Assets"
import { useI18nContext } from "~i18n"
import { useAppReset } from "~Hooks"

export const AppBlockedScreen = () => {
    const { LL } = useI18nContext()
    const appReset = useAppReset()

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
                        {LL.TITLE_SECURITY_DOWNGRADE()}
                    </BaseText>
                </BaseView>

                <BaseSpacer height={48} />

                <BaseView alignItems="center" w={100} flexGrow={1}>
                    <SecurityDowngradeSVG />
                    <BaseSpacer height={40} />
                    <BaseText align="left" py={20}>
                        {LL.BD_APP_BLOCKED()}
                        {/* TODO Change translation. Currently dummy text */}
                    </BaseText>
                </BaseView>

                <BaseView alignItems="center" w={100}>
                    <BaseButton
                        action={appReset}
                        w={100}
                        title={LL.BTN_RESET_APP().toUpperCase()}
                        haptics="medium"
                    />
                </BaseView>

                <BaseSpacer height={40} />
            </BaseView>
        </BaseSafeArea>
    )
}
