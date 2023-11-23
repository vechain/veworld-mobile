import React, { useCallback, useRef } from "react"
import { BaseSafeArea, BaseSpacer, BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { FlatList } from "react-native-gesture-handler"
import { ColorThemeType, CompatibleDApp, CompatibleDApps, isSmallScreen } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { ScrollView, StyleSheet } from "react-native"
import { useNavigation, useScrollToTop } from "@react-navigation/native"
import { DAppCard } from "~Screens/Flows/App/DiscoverScreen/Components/DAppCard"
import { Routes } from "~Navigation"

export const DiscoverScreen: React.FC = () => {
    const { styles: themedStyles } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()
    const nav = useNavigation()

    const flatListRef = useRef(null)
    useScrollToTop(flatListRef)

    const onDAppPress = (dapp: CompatibleDApp) => {
        nav.navigate(Routes.BROWSER, { initialUrl: dapp.href })
    }

    const renderItem = ({ item }: { item: CompatibleDApp }) => {
        return <DAppCard dapp={item} onPress={onDAppPress} />
    }

    const renderSeparator = useCallback(() => <BaseSpacer height={16} />, [])

    return (
        <BaseSafeArea>
            <BaseText mx={24} typographyFont="largeTitle" testID="settings-screen" pb={16}>
                {LL.DISCOVER_TITLE()}
            </BaseText>

            <BaseView style={[themedStyles.list]}>
                <ScrollView>
                    <FlatList
                        ref={flatListRef}
                        data={CompatibleDApps}
                        contentContainerStyle={themedStyles.contentContainerStyle}
                        ItemSeparatorComponent={renderSeparator}
                        scrollEnabled={isSmallScreen}
                        keyExtractor={item => item.id}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        renderItem={renderItem}
                    />
                </ScrollView>
            </BaseView>
        </BaseSafeArea>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        contentContainerStyle: {
            paddingHorizontal: 24,
        },
        image: {
            width: 60,
            height: 60,
        },
        separator: {
            backgroundColor: theme.colors.text,
            height: 5,
        },
        list: { flex: 1 },
    })
