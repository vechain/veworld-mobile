import { useI18nContext } from "~i18n"

export const useMonthTranslation = () => {
    const { LL } = useI18nContext()

    const getMonthNamebyNumber = (month: number) => {
        switch (month) {
            case 0:
                return LL.JANUARY()
            case 1:
                return LL.FEBRUARY()
            case 2:
                return LL.MARCH()
            case 3:
                return LL.APRIL()
            case 4:
                return LL.MAY()
            case 5:
                return LL.JUNE()
            case 6:
                return LL.JULY()
            case 7:
                return LL.AUGUST()
            case 8:
                return LL.SEPTEMBER()
            case 9:
                return LL.OCTOBER()
            case 10:
                return LL.NOVEMBER()
            case 11:
                return LL.DECEMBER()
        }
    }

    return {
        getMonthNamebyNumber,
    }
}
