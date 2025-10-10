import React, { useCallback, useEffect } from "react"
import { FlatList, ListRenderItemInfo } from "react-native"
import DeviceInfo from "react-native-device-info"
import { BaseBottomSheet, BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { useBottomSheetModal, useTheme, useCheckAppVersion } from "~Hooks"
import { useI18nContext } from "~i18n"
import { useAppDispatch, setInstalledVersion } from "~Storage/Redux"

const ItemSeparatorComponent = () => <BaseSpacer height={14} />

export const VersionChangelogBottomSheet = () => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    const { ref, onOpen, onClose } = useBottomSheetModal()
    const dispatch = useAppDispatch()
    const { shouldShowChangelog, changelog } = useCheckAppVersion()
    const deviceVersion = DeviceInfo.getVersion()

    useEffect(() => {
        if (shouldShowChangelog && changelog.length > 0) {
            onOpen()
        }
    }, [shouldShowChangelog, onOpen, changelog])

    const handleDismiss = useCallback(() => {
        dispatch(setInstalledVersion(deviceVersion))
        onClose()
    }, [deviceVersion, dispatch, onClose])

    const renderListItems = useCallback(
        ({ item }: ListRenderItemInfo<string>) => {
            return (
                <BaseView flexDirection="row" gap={8}>
                    <BaseIcon size={16} color={theme.colors.button} name="icon-check" />
                    <BaseText typographyFont="body" color={theme.colors.text}>
                        {item}
                    </BaseText>
                </BaseView>
            )
        },
        [theme.colors],
    )

    return (
        <BaseBottomSheet
            blurBackdrop
            dynamicHeight
            backgroundStyle={{ backgroundColor: theme.colors.actionBottomSheet.background }}
            onDismiss={handleDismiss}
            ref={ref}>
            <BaseView gap={24} testID="VersionChangelogBottomSheet">
                <BaseView gap={16} flexDirection="row" justifyContent="space-between" alignSelf="center">
                    <BaseIcon size={24} color={theme.colors.text} name="icon-party-popper" />
                    <BaseText flexGrow={1} typographyFont="subTitleSemiBold" color={theme.colors.text}>
                        {LL.APP_UPDATED()}
                    </BaseText>
                    <BaseView px={8} py={4} borderRadius={4} bg={theme.colors.label.background}>
                        <BaseText typographyFont="bodyMedium" color={theme.colors.label.text}>
                            {LL.APP_VERSION({ version: deviceVersion })}
                        </BaseText>
                    </BaseView>
                </BaseView>
                <BaseView gap={16}>
                    <BaseText typographyFont="subSubTitleLight" color={theme.colors.text}>
                        {LL.APP_UPDATED_WHATS_NEW()}
                    </BaseText>
                    <FlatList
                        scrollEnabled={false}
                        data={changelog}
                        keyExtractor={(item, index) => `${item}-${index}`}
                        ItemSeparatorComponent={ItemSeparatorComponent}
                        renderItem={renderListItems}
                    />
                </BaseView>
                <BaseButton
                    testID="Dismiss_Button"
                    my={16}
                    action={handleDismiss}
                    title={LL.BTN_DISMISS()}
                    variant="outline"
                />
            </BaseView>
        </BaseBottomSheet>
    )
}
