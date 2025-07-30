import { queryOptions } from "@tanstack/react-query"
import axios, { AxiosRequestConfig } from "axios"
import URIUtils from "~Utils/URIUtils"

/**
 * Validate IPFS URI strings. An example of a valid IPFS URI is:
 * - ipfs://QmfSTia1TJUiKQ2fyW9NTPzEKNdjMGzbUgrC3QPSTpkum6/406.json
 * - ipfs://QmVPqKfwRXjg5Fqwy6RNRbKR2ZP4pKKVLvmfjmhQfdM3MH/4
 * - ipfs://QmVPqKfwRXjg5Fqwy6RNRbKR2ZP4pKKVLvmfjmhQfdM3MH
 * - ipfs://bafybeiccwhv6x57oxedqos6xruudgbgtkszzquyxjv73ux7zs2w7w3d42q
 * - ipfs://bafybeiccwhv6x57oxedqos6xruudgbgtkszzquyxjv73ux7zs2w7w3d42q/
 * - ipfs://bafybeiccwhv6x57oxedqos6xruudgbgtkszzquyxjv73ux7zs2w7w3d42q/any-file.json
 * @param uri
 * @returns
 */
export const validateIpfsUri = (uri: string): boolean => {
    const trimmedUri = uri.trim()
    return (
        /^ipfs:\/\/Qm[a-zA-Z0-9]+(\/[^/]+)*\/?$/.test(trimmedUri) ||
        /^ipfs:\/\/baf[a-z0-9]+(\/[^/]+)*\/?$/.test(trimmedUri)
    )
}

export const getIpfsValue = async <TData>(uri: string, config?: NoInfer<AxiosRequestConfig<TData>>): Promise<TData> => {
    const metadata = await axios.get<TData>(URIUtils.convertUriToUrl(uri), {
        ...config,
        headers: {
            "x-project-id": "veworld-mobile",
        },
    })

    return metadata.data
}

export const getIpfsQueryKeyOptions = <TData>(uri: string, config?: NoInfer<AxiosRequestConfig<TData>>) =>
    queryOptions({
        queryKey: ["IPFS_URI", uri],
        staleTime: Infinity,
        gcTime: Infinity,
        queryFn: () => getIpfsValue<TData>(uri, config),
    })
