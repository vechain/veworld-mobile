import { useCallback, useMemo } from "react"
import { useResetStacks } from "~Hooks/useSetSelectedAccount/useResetStacks"
import { useI18nContext } from "~i18n"
import { Network, NETWORK_TYPE } from "~Model"
import { useAppDispatch, useAppSelector } from "~Storage/Redux"
import { switchActiveNetwork } from "~Storage/Redux/Actions"
import { selectNetworksByType } from "~Storage/Redux/Selectors"

type Args = {
    onNetworkSelected?: (network: Network) => void
}

type NetworkListSection = {
    title: string
    data: Network[]
}

export const useNetworkList = ({ onNetworkSelected }: Args = {}) => {
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()
    const { resetStacks } = useResetStacks()

    const mainNetworks = useAppSelector(selectNetworksByType(NETWORK_TYPE.MAIN))
    const testNetworks = useAppSelector(selectNetworksByType(NETWORK_TYPE.TEST))
    const otherNetworks = useAppSelector(selectNetworksByType(NETWORK_TYPE.OTHER))

    // variables
    const sections: NetworkListSection[] = useMemo(() => {
        const data: NetworkListSection[] = []
        if (mainNetworks.length > 0) {
            data.push({
                title: LL.NETWORK_LABEL_MAIN_NETWORKS(),
                data: mainNetworks,
            })
        }
        if (testNetworks.length > 0) {
            data.push({
                title: LL.NETWORK_LABEL_TEST_NETWORKS(),
                data: testNetworks,
            })
        }
        if (otherNetworks.length > 0) {
            data.push({
                title: LL.NETWORK_LABEL_OTHER_NETWORKS(),
                data: otherNetworks,
            })
        }
        return data
    }, [mainNetworks, testNetworks, otherNetworks, LL])

    const onPress = useCallback(
        (network: Network) => {
            resetStacks()
            dispatch(switchActiveNetwork(network))
            onNetworkSelected?.(network)
        },
        [dispatch, onNetworkSelected, resetStacks],
    )

    return useMemo(() => ({ sections, onPress }), [onPress, sections])
}
