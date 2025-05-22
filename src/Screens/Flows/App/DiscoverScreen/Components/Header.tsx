import { useNavigation } from "@react-navigation/native"
import React, { memo, useCallback } from "react"
import { TabsIconSVG } from "~Assets"
import { BaseIcon, BaseTouchable, BaseView, HeaderStyle, HeaderTitle, PlusIconHeaderButton } from "~Components"
import { useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { selectTabs, useAppSelector } from "~Storage/Redux"

export const Header = memo(() => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    const nav = useNavigation()

    const tabs = useAppSelector(selectTabs)

    const onTabsPress = useCallback(() => {
        nav.navigate(Routes.DISCOVER_TABS_MANAGER)
    }, [nav])

    return (
        <BaseView w={100} style={HeaderStyle}>
            <BaseView flexDirection="row" alignItems="center" alignSelf="center">
                <HeaderTitle testID="nfts_title" title={LL.DISCOVER_TITLE()} />
            </BaseView>

            <BaseView flexDirection="row" gap={12}>
                <BaseIcon
                    p={4}
                    name={"icon-search"}
                    size={22}
                    color={theme.colors.text}
                    action={() => nav.navigate(Routes.DISCOVER_SEARCH)}
                    haptics="Light"
                />
                {tabs.length > 0 ? (
                    <BaseTouchable onPress={onTabsPress}>
                        <TabsIconSVG count={tabs.length} textColor={theme.colors.text} />
                    </BaseTouchable>
                ) : (
                    <PlusIconHeaderButton action={onTabsPress} />
                )}
            </BaseView>
        </BaseView>
    )
})
