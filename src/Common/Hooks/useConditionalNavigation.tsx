import { useNavigation } from "@react-navigation/native"

export const useConditionalNavigation = () => {
    const nav = useNavigation()

    //TODO: find correct type anotation
    function navigate<T extends any>(condition: boolean, route1: T, route2: T) {
        if (condition) {
            //@ts-ignore
            nav.navigate(route1)
        } else {
            //@ts-ignore
            nav.navigate(route2)
        }
    }

    return navigate
}
