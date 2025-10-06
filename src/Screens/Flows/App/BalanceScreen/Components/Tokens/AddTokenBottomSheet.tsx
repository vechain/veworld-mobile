import React, { RefObject } from "react"
import { BaseBottomSheet, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { BottomSheetModal } from "@gorhom/bottom-sheet"
import { COLORS, ColorThemeType } from "~Constants"
import { StyleSheet, FlatList, TouchableOpacity } from "react-native"
import { useThemedStyles, useBottomSheetModal } from "~Hooks"
import { IconKey } from "~Model"
import { Routes } from "~Navigation"
import { useNavigation } from "@react-navigation/native"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"

type AddTokenBottomSheetProps = {
    onClose: () => void
    bottomSheetRef?: React.RefObject<BottomSheetModal>
    qrCodeBottomSheetRef?: RefObject<BottomSheetModalMethods>
}

type TokenListItemData = {
    id: string
    iconName: IconKey
    title: string
    subtitle: string
    onPress?: () => void
}

type TokenListItemProps = {
    item: TokenListItemData
}

const TokenListItem = ({ item }: TokenListItemProps) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    return (
        <TouchableOpacity style={styles.listItem} onPress={item.onPress}>
            <BaseView style={styles.innerListItem}>
                <BaseIcon
                    name={item.iconName}
                    size={18}
                    iconPadding={4}
                    bg={theme.isDark ? COLORS.PURPLE_DISABLED : COLORS.LIGHT_GRAY}
                    color={theme.isDark ? COLORS.PURPLE_LABEL : COLORS.GREY_500}
                />
                <BaseView flexDirection="column" gap={4}>
                    <BaseText typographyFont="bodySemiBold">{item.title}</BaseText>
                    <BaseText typographyFont="captionMedium" color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500}>
                        {item.subtitle}
                    </BaseText>
                </BaseView>
            </BaseView>
            <BaseIcon
                name="icon-chevron-right"
                size={16}
                color={theme.isDark ? COLORS.PURPLE_LABEL : COLORS.GREY_500}
            />
        </TouchableOpacity>
    )
}

const ItemSeparator = () => <BaseSpacer height={8} />

export const AddTokenBottomSheet = ({ onClose, bottomSheetRef, qrCodeBottomSheetRef }: AddTokenBottomSheetProps) => {
    const { LL } = useI18nContext()
    const { styles } = useThemedStyles(baseStyles)
    const nav = useNavigation()

    const { onOpen: openQRCodeSheet } = useBottomSheetModal({ externalRef: qrCodeBottomSheetRef })

    const tokenListData: TokenListItemData[] = [
        {
            id: "buy",
            iconName: "icon-plus",
            title: LL.TOKEN_BUY(),
            subtitle: LL.TOKEN_BUY_SUBTITLE(),
            onPress: () => {
                onClose()
                nav.navigate(Routes.BUY_FLOW)
            },
        },
        {
            id: "receive",
            iconName: "icon-arrow-down",
            title: LL.TOKEN_RECEIVE(),
            subtitle: LL.TOKEN_RECEIVE_SUBTITLE(),
            onPress: () => {
                onClose()
                openQRCodeSheet()
            },
        },
        {
            id: "custom",
            iconName: "icon-settings-2",
            title: LL.TOKEN_CUSTOM(),
            subtitle: LL.TOKEN_CUSTOM_SUBTITLE(),
            onPress: () => {
                onClose()
                nav.navigate(Routes.MANAGE_TOKEN)
            },
        },
    ]

    const renderItem = ({ item }: { item: TokenListItemData }) => <TokenListItem item={item} />

    return (
        <BaseBottomSheet dynamicHeight backgroundStyle={styles.bg} ref={bottomSheetRef} onDismiss={onClose} floating>
            <BaseText typographyFont="subSubTitleSemiBold">{LL.MANAGE_TOKEN_ADD_SUGGESTED_TOKENS()}</BaseText>
            <BaseSpacer height={12} />
            <FlatList
                data={tokenListData}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                ItemSeparatorComponent={ItemSeparator}
                showsVerticalScrollIndicator={false}
                testID="add-token-options-list"
            />
        </BaseBottomSheet>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            flex: 1,
        },
        bg: {
            backgroundColor: theme.isDark ? COLORS.PURPLE : COLORS.LIGHT_GRAY,
        },
        listItem: {
            backgroundColor: theme.isDark ? COLORS.PURPLE : COLORS.LIGHT_GRAY,
            flexDirection: "row",
            justifyContent: "space-between",
            paddingVertical: 24,
            paddingLeft: 24,
            paddingRight: 16,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.GREY_100,
        },
        innerListItem: {
            gap: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
        },
    })
