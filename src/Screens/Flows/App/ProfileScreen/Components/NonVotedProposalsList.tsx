import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useMemo } from "react"
import { FlatList, ListRenderItemInfo, StyleSheet } from "react-native"
import { BaseSpacer, BaseText, BaseView } from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
import { components } from "~Generated/indexer/schema"
import { useActiveProposalsWithoutVote, useThemedStyles } from "~Hooks"
import { useBrowserTab } from "~Hooks/useBrowserTab"
import { useOfflineCallback } from "~Hooks/useOfflineCallback"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { SeeAllButton } from "../../BalanceScreen/Components/SeeAllButton"
import { NonVotedProposalItem } from "./NonVotedProposalItem"

const VBD_PROPOSALS_URL = "https://governance.vebetterdao.org/proposals"
const MAX_PROPOSALS = 4

type ProposalResult = components["schemas"]["ProposalResult"]

export const NonVotedProposalsList = () => {
    const { theme } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const { navigateWithTab } = useBrowserTab()
    const { data, isLoading } = useActiveProposalsWithoutVote()

    const proposals = useMemo(() => data?.activeProposalsWithoutVote ?? [], [data?.activeProposalsWithoutVote])
    const visibleProposals = useMemo(() => proposals.slice(0, MAX_PROPOSALS), [proposals])
    const hasMoreProposals = proposals.length > MAX_PROPOSALS

    const openUrl = useCallback(
        (url: string) => {
            navigateWithTab({
                url,
                title: url,
                navigationFn(nextUrl) {
                    nav.navigate(Routes.BROWSER, { url: nextUrl, returnScreen: Routes.PROFILE })
                },
            })
        },
        [nav, navigateWithTab],
    )

    const onSeeMore = useOfflineCallback(() => openUrl(VBD_PROPOSALS_URL))
    const onOpenProposal = useOfflineCallback((proposalId: string) => openUrl(`${VBD_PROPOSALS_URL}/${proposalId}`))

    const itemSeparator = useCallback(() => <BaseSpacer height={8} />, [])
    const listFooter = useCallback(() => {
        if (!hasMoreProposals) return null
        return <SeeAllButton action={onSeeMore}>{LL.ACTIVITY_SEE_ALL()}</SeeAllButton>
    }, [LL, hasMoreProposals, onSeeMore])

    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<ProposalResult>) => {
            return <NonVotedProposalItem item={item} onPress={onOpenProposal} />
        },
        [onOpenProposal],
    )

    if (isLoading || visibleProposals.length === 0) return null

    return (
        <BaseView>
            <BaseSpacer height={24} />
            <BaseText typographyFont="subSubTitleSemiBold" color={theme.isDark ? COLORS.GREY_100 : COLORS.DARK_PURPLE}>
                {LL.VBD_PROPOSALS_SECTION_TITLE()}
            </BaseText>
            <BaseSpacer height={16} />
            <FlatList<ProposalResult>
                data={visibleProposals}
                renderItem={renderItem}
                keyExtractor={item => item.proposalId}
                ItemSeparatorComponent={itemSeparator}
                ListFooterComponent={listFooter}
                scrollEnabled={false}
            />
        </BaseView>
    )
}

const baseStyles = (_theme: ColorThemeType) =>
    StyleSheet.create({
        seeMoreButton: {
            height: 40,
            justifyContent: "center",
            alignItems: "center",
        },
    })
