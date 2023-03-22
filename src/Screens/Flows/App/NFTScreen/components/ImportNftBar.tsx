import React, { memo, useCallback } from "react"
import { BaseButton, BaseIcon, BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"

export const ImportNftBar = memo(() => {
    const { LL } = useI18nContext()
    const onImportPress = useCallback(() => {}, [])

    return (
        <BaseView
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            px={20}
            my={20}>
            <BaseText typographyFont="subTitle">{LL.SB_YOUR_NFTS()}</BaseText>

            <BaseButton
                size="md"
                action={onImportPress}
                title={LL.COMMON_LBL_IMPORT()}
                rightIcon={
                    <BaseIcon
                        name="tray-arrow-up"
                        style={{ marginLeft: 4 }}
                        size={20}
                    />
                }
            />
        </BaseView>
    )
})
