import React, { memo } from "react"
import { BaseIcon, BaseSpacer, BaseView, HeaderStyle, HeaderTitle, PlusIconHeaderButton } from "~Components"
import { useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"

export const Header = memo(() => {
    const { LL } = useI18nContext()
    const theme = useTheme()

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
                    action={() => {}}
                    haptics="Light"
                />
                <BaseSpacer width={8} />
                <PlusIconHeaderButton action={() => {}} />
            </BaseView>
        </BaseView>
    )
})
