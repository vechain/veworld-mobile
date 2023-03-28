import { useNavigation } from "@react-navigation/native"
import { useEffect, useMemo } from "react"
import { IdConstants } from "~Common/Constant"
import { PlatformUtils } from "~Common/Utils"
import { tabStackbaseStyles } from "~Navigation"
import { useTheme } from "./useTheme"

/**
 * A custom hook that handles hiding the tab bar and header on Android devices.
 * This hook has no effect on iOS devices.
 */
export const useAndroidModalHandler = () => {
    const navigation = useNavigation()

    const theme = useTheme()

    /**
     * A memoized function that recursively searches for the tab navigator
     * in the navigation hierarchy.
     *
     * @param {any} route - The current route in the navigation hierarchy.
     * @returns {any|null} The tab navigator route if found, or null otherwise.
     */
    const getTabNavigatorProp = useMemo(
        () =>
            (route: any): any => {
                if (!route) {
                    return null
                }

                if (route.getId() === IdConstants.TABBAR_NAVIGATOR_ID) {
                    return route
                }

                return getTabNavigatorProp(route.getParent())
            },
        [],
    )

    // Effect to handle hiding the tab bar and header on Android devices
    useEffect(() => {
        //Don't want to do anything on iOS
        if (PlatformUtils.isIOS()) {
            return
        }

        const tabNavigator = getTabNavigatorProp(navigation.getParent())

        if (!tabNavigator) {
            return
        }

        // Hide the header and the tab bar
        tabNavigator.setOptions({ headerShown: false })
        tabNavigator.setOptions({ tabBarStyle: { display: "none" } })

        // When the component is unmounted, restore the header and tab bar styles
        return () => {
            tabNavigator.setOptions({
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: {
                    backgroundColor: theme.colors.card,
                    ...tabStackbaseStyles.tabbar,
                    ...tabStackbaseStyles.shadow,
                },
            })
        }
    }, [getTabNavigatorProp, navigation, theme.colors.card])
}
