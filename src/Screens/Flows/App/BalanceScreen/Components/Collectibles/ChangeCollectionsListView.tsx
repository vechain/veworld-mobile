import React, { useCallback, useMemo } from "react"
import { BaseButtonGroupHorizontal } from "~Components"
import { useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { BaseButtonGroupHorizontalType } from "~Model"

export type CollectiblesViewMode = "GALLERY" | "DETAILS"

type Props = {
    selectedView: CollectiblesViewMode
    onViewChange: (view: CollectiblesViewMode) => void
}

export const ChangeCollectionsListView: React.FC<Props> = ({ selectedView, onViewChange }) => {
    const { LL } = useI18nContext()
    const theme = useTheme()

    const viewModes: Array<BaseButtonGroupHorizontalType> = useMemo(
        () => [
            {
                id: "GALLERY",
                label: LL.COLLECTIBLES_VIEW_GALLERY(),
            },
            {
                id: "DETAILS",
                label: LL.COLLECTIBLES_VIEW_DETAILS(),
            },
        ],
        [LL],
    )

    const customStyles = useMemo(
        () => ({
            backgroundColor: {
                selected: theme.colors.collectibleDetailedCard.buttonGroup.background,
                default: "transparent",
            },
            textColor: {
                selected: theme.colors.collectibleDetailedCard.buttonGroup.text,
                default: theme.colors.collectibleDetailedCard.buttonGroup.text,
            },
        }),
        [theme.colors.collectibleDetailedCard.buttonGroup],
    )

    const handleSelectView = useCallback(
        (button: BaseButtonGroupHorizontalType) => {
            onViewChange(button.id as CollectiblesViewMode)
        },
        [onViewChange],
    )

    return (
        <BaseButtonGroupHorizontal
            selectedButtonIds={[selectedView]}
            buttons={viewModes}
            action={handleSelectView}
            typographyFont="captionMedium"
            customStyles={customStyles}
        />
    )
}
