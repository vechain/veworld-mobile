import { useNavigation } from "@react-navigation/native"
import React, { memo } from "react"
import { BaseIcon, BaseView, HeaderStyle, HeaderTitle } from "~Components"
import { useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"

export const Header = memo(() => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    const nav = useNavigation()

    return (
        <BaseView w={100} style={HeaderStyle}>
            <BaseView flexDirection="row" alignItems="center" alignSelf="center">
                <HeaderTitle testID="nfts_title" title={LL.DISCOVER_TITLE()} />
            </BaseView>

            <BaseView flexDirection="row">
                <BaseIcon
                    p={4}
                    name={"icon-search"}
                    size={22}
                    color={theme.colors.text}
                    action={() => nav.navigate(Routes.DISCOVER_SEARCH)}
                    haptics="Light"
                />
            </BaseView>
        </BaseView>
    )
})
