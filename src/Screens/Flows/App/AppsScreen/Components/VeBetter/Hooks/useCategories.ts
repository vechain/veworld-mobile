import { useMemo } from "react"
import { useI18nContext } from "~i18n"
import { X2ECategoryType } from "~Model/DApp"
import { IconKey } from "~Model/Icon"

export const useCategories: () => {
    id: X2ECategoryType
    displayName: string
    icon: IconKey
}[] = () => {
    const { LL } = useI18nContext()

    return useMemo(
        () => [
            {
                id: X2ECategoryType.NUTRITION,
                displayName: LL.APP_CATEGORY_FOOD_AND_DRINK(),
                icon: "icon-salad",
            },
            {
                id: X2ECategoryType.PLASTIC_WASTE_RECYCLING,
                displayName: LL.APP_CATEGORY_RECYCLING(),
                icon: "icon-recycle",
            },
            { id: X2ECategoryType.FITNESS_WELLNESS, displayName: LL.APP_CATEGORY_LIFESTYLE(), icon: "icon-dumbbell" },
            {
                id: X2ECategoryType.RENEWABLE_ENERGY_EFFICIENCY,
                displayName: LL.APP_CATEGORY_ENERGY(),
                icon: "icon-plug",
            },
            {
                id: X2ECategoryType.SUSTAINABLE_SHOPPING,
                displayName: LL.APP_CATEGORY_SHOPPING(),
                icon: "icon-shopping-bag",
            },
            {
                id: X2ECategoryType.GREEN_MOBILITY_TRAVEL,
                displayName: LL.APP_CATEGORY_TRANSPORTATION(),
                icon: "icon-car",
            },
            { id: X2ECategoryType.PETS, displayName: LL.APP_CATEGORY_PETS(), icon: "icon-cat" },
            {
                id: X2ECategoryType.EDUCATION_LEARNING,
                displayName: LL.APP_CATEGORY_LEARNING(),
                icon: "icon-graduation-cap",
            },
            { id: X2ECategoryType.GREEN_FINANCE_DEFI, displayName: LL.APP_CATEGORY_WEB3(), icon: "icon-codesandbox" },
            { id: X2ECategoryType.OTHERS, displayName: LL.APP_CATEGORY_OTHERS(), icon: "icon-more-horizontal" },
        ],
        [LL],
    )
}
