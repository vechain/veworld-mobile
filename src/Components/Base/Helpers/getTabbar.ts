import {
    NavigationProp,
    NavigationState,
    ParamListBase,
} from "@react-navigation/native"

type NavigationRoute = NavigationState["routes"][number]

type NavProps = NavigationProp<
    ParamListBase,
    string,
    undefined,
    Readonly<{
        key: string
        index: number
        routeNames: string[]
        history?: unknown[] | undefined
        routes: NavigationRoute[]
        type: string
        stale: false
    }>,
    {},
    {}
>

// recursive function that gets the parent of the current navigation stack and stops when it finds that the parent is null or tht the parent is the tab
export const getTabbar = (nav: NavProps): NavProps | null => {
    const parent = nav.getParent()

    if (!parent) {
        return null
    }

    if (parent.getState().type === "tab") {
        return parent
    } else {
        return getTabbar(parent)
    }
}
