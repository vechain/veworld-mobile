import React from "react"
import { BaseView, BaseText } from "~Components"
import { useI18nContext } from "~i18n"

export const NewDapps = () => {
    const { LL } = useI18nContext()

    return (
        <BaseView py={24}>
            <BaseView flexDirection="row" justifyContent="space-between" px={24}>
                <BaseText typographyFont="bodySemiBold">{LL.DISCOVER_TAB_NEW_DAPPS()}</BaseText>
            </BaseView>

            {/* {showBookmarkedDAppsList && (
                <BookmarkedDAppsList bookmarkedDApps={bookmarkedDApps.slice(0, 5)} onDAppPress={onDAppPress} />
            )} */}
        </BaseView>
    )
}
