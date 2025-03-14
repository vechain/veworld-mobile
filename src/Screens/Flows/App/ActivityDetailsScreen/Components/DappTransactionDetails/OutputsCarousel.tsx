import React, { memo, useCallback, useState } from "react"
import { FlatList, StyleSheet, ViewToken } from "react-native"
import { BaseText, BaseView, PaginatedDot } from "~Components"
import { ColorThemeType } from "~Constants"
import { ActivityType, TransactionSimulationOutputType, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Swap, TokenAllowance, TokenTransfer, VetTransfer } from "./Outputs"

type Props = {
    outputs: ActivityType[]
}

export const OutputsCarousel: React.FC<Props> = memo(({ outputs }) => {
    const { LL } = useI18nContext()

    const { styles, theme } = useThemedStyles(baseStyles)

    const [activeIndex, setActiveIndex] = useState(0)

    const renderOutput = useCallback(({ item }: { item: ActivityType }) => {
        switch (item.kind) {
            case TransactionSimulationOutputType.VET_TRANSFER:
                return <VetTransfer output={item} />
            case TransactionSimulationOutputType.TOKEN_TRANSFER:
                return <TokenTransfer output={item} />
            case TransactionSimulationOutputType.TOKEN_ALLOWANCE:
                return <TokenAllowance output={item} />
            case TransactionSimulationOutputType.SWAP:
                return <Swap output={item} />
            default:
                return <></>
        }
    }, [])

    const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        const activeIdx = viewableItems[0].index

        setActiveIndex(activeIdx ?? 0)
    }, [])

    return (
        <BaseView style={[styles.container]}>
            <BaseView bg={theme.colors.card} style={styles.view}>
                <BaseView w={100} pt={16} pb={8} alignItems="center">
                    <BaseText typographyFont="subSubTitle">{LL.OUTCOMES()}</BaseText>
                </BaseView>
                <BaseView mx={20} pb={8}>
                    <BaseView flexDirection="row" style={styles.container} justifyContent="flex-start">
                        <FlatList
                            data={outputs}
                            renderItem={renderOutput}
                            showsHorizontalScrollIndicator={false}
                            showsVerticalScrollIndicator={false}
                            horizontal
                            pagingEnabled
                            snapToAlignment="start"
                            keyExtractor={(item, index) => `clause-${index}`}
                            onViewableItemsChanged={onViewableItemsChanged}
                            scrollEnabled={outputs.length > 1}
                        />
                    </BaseView>
                </BaseView>
                {outputs.length > 1 && (
                    <BaseView alignItems="center" w={100} pb={16}>
                        <PaginatedDot
                            activeDotColor={theme.colors.primary}
                            inactiveDotColor={theme.colors.primary}
                            pageIdx={activeIndex}
                            maxPage={outputs.length}
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
