import React, { memo, useCallback, useState } from "react"
import { FlatList, StyleSheet, ViewToken } from "react-native"
import DropShadow from "react-native-drop-shadow"
import {
    ColorThemeType,
    FormattingUtils,
    SCREEN_WIDTH,
    useCopyClipboard,
    useTheme,
    useThemedStyles,
} from "~Common"
import { BaseText, BaseView, PaginatedDot } from "~Components"
import { ClauseType, ClauseWithMetadata } from "~Model"
import { useI18nContext } from "~i18n"
import { ClauseDetail } from "./ClauseDetail"

type Props = {
    clausesMetadata: ClauseWithMetadata[]
}

export const ClausesCarousel: React.FC<Props> = memo(({ clausesMetadata }) => {
    const theme = useTheme()

    const { LL } = useI18nContext()

    const { styles } = useThemedStyles(baseStyles)

    const [activeIndex, setActiveIndex] = useState(0)

    const { onCopyToClipboard } = useCopyClipboard()

    const getTransferClause = useCallback(
        (clause: ClauseWithMetadata) => {
            return (
                <BaseView style={{ width: SCREEN_WIDTH - 80 }}>
                    <ClauseDetail
                        title={LL.TYPE()}
                        value={LL.CONNECTED_APP_token_transfer()}
                    />
                    {clause.to !== null && (
                        <ClauseDetail
                            title={LL.TO()}
                            value={FormattingUtils.humanAddress(
                                clause.to,
                                7,
                                9,
                            )}
                            onValuePress={() =>
                                onCopyToClipboard(
                                    clause.to ?? "",
                                    LL.COMMON_LBL_ADDRESS(),
                                )
                            }
                            valueIcon="content-copy"
                        />
                    )}
                    {clause.tokenSymbol && (
                        <ClauseDetail
                            title={LL.TOKEN_SYMBOL()}
                            value={clause.tokenSymbol}
                            border={false}
                        />
                    )}
                </BaseView>
            )
        },
        [LL, onCopyToClipboard],
    )

    const getContractCallClause = useCallback(
        (clause: ClauseWithMetadata) => {
            return (
                <BaseView style={{ width: SCREEN_WIDTH - 80 }}>
                    <ClauseDetail
                        title={LL.TYPE()}
                        value={LL.CONNECTED_APP_contract_call()}
                    />
                    {clause.to && (
                        <ClauseDetail
                            title={LL.TO()}
                            value={FormattingUtils.humanAddress(
                                clause.to,
                                7,
                                9,
                            )}
                            onValuePress={() =>
                                onCopyToClipboard(
                                    clause.to ?? "",
                                    LL.COMMON_LBL_ADDRESS(),
                                )
                            }
                            valueIcon="content-copy"
                        />
                    )}

                    <ClauseDetail
                        title={LL.CONTRACT_DATA()}
                        value={FormattingUtils.humanAddress(clause.data, 7, 9)}
                        border={false}
                        onValuePress={() =>
                            onCopyToClipboard(
                                clause.to ?? "",
                                LL.COMMON_LBL_DATA(),
                            )
                        }
                        valueIcon="content-copy"
                    />
                </BaseView>
            )
        },
        [LL, onCopyToClipboard],
    )

    const getDeployContractClause = useCallback(
        (clause: ClauseWithMetadata) => {
            return (
                <BaseView style={{ width: SCREEN_WIDTH - 80 }}>
                    <ClauseDetail
                        title={LL.TYPE()}
                        value={LL.CONNECTED_APP_deploy_contract()}
                    />
                    {clause.to && (
                        <ClauseDetail
                            title={LL.TO()}
                            value={FormattingUtils.humanAddress(
                                clause.to,
                                7,
                                9,
                            )}
                            onValuePress={() =>
                                onCopyToClipboard(
                                    clause.to ?? "",
                                    LL.COMMON_LBL_ADDRESS(),
                                )
                            }
                            valueIcon="content-copy"
                        />
                    )}

                    {clause.abi && (
                        <ClauseDetail
                            title={LL.CONTRACT_ABI()}
                            value={LL.COPY_ABI()}
                            onValuePress={() =>
                                onCopyToClipboard(
                                    JSON.stringify(clause.abi),
                                    LL.COMMON_LBL_ADDRESS(),
                                )
                            }
                            valueIcon="content-copy"
                            border={false}
                        />
                    )}
                </BaseView>
            )
        },
        [LL, onCopyToClipboard],
    )

    const renderClause = useCallback(
        ({ item }: { item: ClauseWithMetadata }) => {
            switch (item.type) {
                case ClauseType.TRANSFER:
                    return getTransferClause(item)
                case ClauseType.CONTRACT_CALL:
                    return getContractCallClause(item)
                case ClauseType.DEPLOY_CONTRACT:
                    return getDeployContractClause(item)
                default:
                    return <></>
            }
        },
        [getContractCallClause, getDeployContractClause, getTransferClause],
    )

    const onViewableItemsChanged = useCallback(
        ({ viewableItems }: { viewableItems: ViewToken[] }) => {
            const activeIdx = viewableItems[0].index

            setActiveIndex(activeIdx ?? 0)
        },
        [],
    )

    return (
        <DropShadow style={[theme.shadows.card, styles.container]}>
            <BaseView bg={theme.colors.card} style={styles.view}>
                <BaseView w={100} pt={16} pb={8} alignItems="center">
                    <BaseText typographyFont="subSubTitle">
                        {LL.OUTCOMES()}
                    </BaseText>
                </BaseView>
                <BaseView mx={20}>
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
                            pagingEnabled={true}
                            snapToAlignment="start"
                            keyExtractor={item => item.data}
                            onViewableItemsChanged={onViewableItemsChanged}
                            scrollEnabled={clausesMetadata.length > 1}
                        />
                    </BaseView>
                </BaseView>
                {clausesMetadata.length > 1 && (
                    <BaseView alignItems="center" w={100} pt={6} pb={16}>
                        <PaginatedDot
                            activeDotColor={theme.colors.primary}
                            inactiveDotColor={theme.colors.primary}
                            pageIdx={activeIndex}
                            maxPage={clausesMetadata.length}
                        />
                    </BaseView>
                )}
            </BaseView>
        </DropShadow>
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
