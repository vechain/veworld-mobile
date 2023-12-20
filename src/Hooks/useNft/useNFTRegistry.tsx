import { useEffect } from "react"
import { ERROR_EVENTS } from "~Constants"
import { getCollectionInfo } from "~Networking"
import { selectSelectedNetwork, setCollectionRegistryInfo, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { warn } from "~Utils"

export const useNFTRegistry = () => {
    const dispatch = useAppDispatch()
    const network = useAppSelector(selectSelectedNetwork)

    useEffect(() => {
        getCollectionInfo(network.type)
            .then(data => {
                dispatch(
                    setCollectionRegistryInfo({
                        network: network.type,
                        registryInfo: data,
                    }),
                )
            })
            .catch(e => {
                warn(ERROR_EVENTS.NFT, e)
            })
    }, [dispatch, network])
}
