import React, { useMemo, useState } from "react"
import { LayoutChangeEvent, StyleSheet } from "react-native"
import { BaseSimpleTabs, BaseView } from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { BalanceActivity } from "./Activity/BalanceActivity"
import { Tokens } from "./Tokens"
import { BALANCE_TABS, BalanceTab } from "./types"

type Props = {
    onLayout: (e: LayoutChangeEvent) => void
}

export const TabRenderer = ({ onLayout }: Props) => {
    const { LL } = useI18nContext()
    const { styles } = useThemedStyles(baseStyles)
    const [selectedTab, setSelectedTab] = useState<BalanceTab>("TOKENS")

    const labels = useMemo(() => BALANCE_TABS.map(tab => LL[`BALANCE_TAB_${tab}`]()), [LL])
    return (
        <BaseView style={styles.root} gap={16} onLayout={onLayout}>
            <BaseSimpleTabs
                keys={BALANCE_TABS}
                labels={labels}
                selectedKey={selectedTab}
                setSelectedKey={setSelectedTab}
            />
            <BaseView>
                <>
                    {selectedTab === "TOKENS" ? <Tokens /> : null}
                    <BalanceActivity tab={selectedTab} />
                </>
            </BaseView>
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            marginTop: -24,
            paddingBottom: 24,
            backgroundColor: theme.isDark ? COLORS.PURPLE_DISABLED : COLORS.LIGHT_GRAY,
            padding: 16,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
        },
    })
