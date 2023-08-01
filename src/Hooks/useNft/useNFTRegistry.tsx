import { useEffect } from "react"
import { getCollectionInfo } from "~Networking"
import {
    selectSelectedNetwork,
    setCollectionRegistryInfo,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { debug, error } from "~Utils"

export const useNFTRegistry = () => {
    const dispatch = useAppDispatch()
    const network = useAppSelector(selectSelectedNetwork)

    useEffect(() => {
        getCollectionInfo(network.type)
            .then(data => {
                debug("Got collection registry info from GitHub")
                dispatch(
                    setCollectionRegistryInfo({
                        network: network.type,
                        registryInfo: data,
                    }),
                )
            })
            .catch(e => {
                error("useNFTRegistry", e)
            })
    }, [dispatch, network])
}
