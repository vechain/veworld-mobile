import React, { memo, useCallback, useState } from "react"
import { FlatList, StyleSheet, ViewToken } from "react-native"
import { useThemedStyles } from "~Hooks"
import { ColorThemeType } from "~Constants"
import { BaseText, BaseView, PaginatedDot } from "~Components"
import { ClauseType, ClauseWithMetadata } from "~Model"
import { useI18nContext } from "~i18n"
import { TransferClause } from "./Clauses/TransferClause"
import { DeployContractClause } from "./Clauses/DeployContractClause"
import { ContractCallClause } from "./Clauses/ContractCallClause"
import {
    SwapTokensForTokensClause,
    SwapTokensForVetClause,
    SwapVetForTokensClause,
} from "./Clauses"

type Props = {
    clausesMetadata: ClauseWithMetadata[]
}

export const ClausesCarousel: React.FC<Props> = memo(({ clausesMetadata }) => {
    const { LL } = useI18nContext()

    const { styles, theme } = useThemedStyles(baseStyles)

    const [activeIndex, setActiveIndex] = useState(0)

    const renderClause = useCallback(
        ({ item }: { item: ClauseWithMetadata }) => {
            switch (item.type) {
                case ClauseType.TRANSFER:
                    return <TransferClause clause={item} />
                case ClauseType.CONTRACT_CALL:
                    return <ContractCallClause clause={item} />
                case ClauseType.DEPLOY_CONTRACT:
                    return <DeployContractClause clause={item} />
                case ClauseType.SWAP_VET_FOR_TOKENS:
                    return <SwapVetForTokensClause clause={item} />
                case ClauseType.SWAP_TOKENS_FOR_VET:
                    return <SwapTokensForVetClause clause={item} />
                case ClauseType.SWAP_TOKENS_FOR_TOKENS:
                    return <SwapTokensForTokensClause clause={item} />
                default:
                    return <></>
            }
        },
        [],
    )

    const onViewableItemsChanged = useCallback(
        ({ viewableItems }: { viewableItems: ViewToken[] }) => {
            const activeIdx = viewableItems[0].index

            setActiveIndex(activeIdx ?? 0)
        },
        [],
    )

    return (
        <BaseView style={[styles.container]}>
            <BaseView bg={theme.colors.card} style={styles.view}>
                <BaseView w={100} pt={16} pb={8} alignItems="center">
                    <BaseText typographyFont="subSubTitle">
                        {LL.OUTCOMES()}
                    </BaseText>
                </BaseView>
                <BaseView mx={20} pb={8}>
                    <BaseView
                        flexDirection="row"
                        style={styles.container}
                        justifyContent="flex-start">
                        <FlatList
                            data={clausesMetadata}
                            renderItem={renderClause}
                            showsHorizontalScrollIndicator={false}
                            showsVerticalScrollIndicator={false}
                            horizontal
                            pagingEnabled
                            snapToAlignment="start"
                            keyExtractor={(item, index) => `clause-${index}`}
                            onViewableItemsChanged={onViewableItemsChanged}
                            scrollEnabled={clausesMetadata.length > 1}
                        />
                    </BaseView>
                </BaseView>
                {clausesMetadata.length > 1 && (
                    <BaseView alignItems="center" w={100} pb={16}>
                        <PaginatedDot
                            activeDotColor={theme.colors.primary}
                            inactiveDotColor={theme.colors.primary}
                            pageIdx={activeIndex}
                            maxPage={clausesMetadata.length}
                        />
                    </BaseView>
                )}
            </BaseView>
        </BaseView>
    )
})

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            width: "100%",
        },
        bodyContainer: {
            borderBottomColor: theme.colors.separator,
            borderBottomWidth: 0.5,
        },
        view: {
            borderRadius: 16,
        },
        separator: {
            borderWidth: 1,
            borderColor: theme.colors.background,
            backgroundColor: theme.colors.background,
            width: "100%",
        },
    })
