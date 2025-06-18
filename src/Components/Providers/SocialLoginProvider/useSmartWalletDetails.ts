import { useQuery } from "@tanstack/react-query"
import { Address } from "@vechain/sdk-core"
import { ThorClient } from "@vechain/sdk-network"
import { useAppSelector } from "~Storage/Redux"
import { selectSelectedNetwork } from "~Storage/Redux/Selectors"
import { SimpleAccountFactoryABI } from "./abi"

export interface SmartAccountReturnType {
    address: string | undefined
    isDeployed: boolean
}

const testnetConf = {
    accountFactoryAddress: "0x713b908Bcf77f3E00EFEf328E50b657a1A23AeaF",
}

const mainnetConf = {
    accountFactoryAddress: "0xC06Ad8573022e2BE416CA89DA47E8c592971679A",
}

const getConfig = (networkName: String) => {
    if (networkName === "testnet") return testnetConf
    return mainnetConf
}

export const getSmartAccountFactoryAddress = (networkName: string) => {
    if (networkName === "testnet") return testnetConf
    return mainnetConf
}

const useHasV1SmartAccount = (ownerAddress: string, thor: ThorClient, selectedNetworkName: string) => {
    return useQuery({
        queryKey: ["VECHAIN_KIT", "SMART_ACCOUNT", "HAS_V1_SMART_ACCOUNT", ownerAddress, selectedNetworkName],
        queryFn: async () => {
            console.log("useHasV1SmartAccount query start")
            if (!ownerAddress) throw new Error("Owner address is required")

            const accountFactory = thor.contracts.load(
                getConfig(selectedNetworkName).accountFactoryAddress,
                SimpleAccountFactoryABI,
            )

            const result = await accountFactory.read.hasLegacyAccount(ownerAddress)
            console.log("useHasV1SmartAccount result", result)
            return result[0] as boolean
        },
        enabled: !!thor && !!ownerAddress && !!selectedNetworkName,
    })
}

const useSmartAccountVersion = (smartAccountAddress: string, thor: ThorClient, selectedNetworkName: string) => {
    return useQuery({
        queryKey: ["VECHAIN_KIT", "SMART_ACCOUNT", "VERSION", smartAccountAddress],
        queryFn: async () => {
            console.log("useSmartAccountVersion query start")
            if (!smartAccountAddress) throw new Error("Smart account address is required")

            const accountFactory = thor.contracts.load(
                getConfig(selectedNetworkName).accountFactoryAddress,
                SimpleAccountFactoryABI,
            )
            console.log("useSmartAccountVersion accountFactory", accountFactory)
            const result = await accountFactory.read.version()
            console.log("useSmartAccountVersion result", result)
            return parseInt(result[0] as string) as number
        },
        enabled: !!thor && smartAccountAddress !== "" && !!selectedNetworkName,
    })
}

const useSmartAccount = (ownerAddress: string, thor: ThorClient, selectedNetworkName: string) => {
    return useQuery({
        queryKey: ["VECHAIN_KIT_SMART_ACCOUNT", ownerAddress],
        queryFn: async (): Promise<SmartAccountReturnType> => {
            console.log("useSmartAccount query start", ownerAddress)
            if (!ownerAddress) {
                return { address: undefined, isDeployed: false }
            }

            const accountFactory = thor.contracts.load(
                getConfig(selectedNetworkName).accountFactoryAddress,
                SimpleAccountFactoryABI,
            )

            const account = await accountFactory.read.getAccountAddress(ownerAddress)
            console.log("useSmartAccount result", account)

            const isDeployed = (await thor.accounts.getAccount(Address.of(String(account[0])))).hasCode
            console.log("useSmartAccount isDeployed", isDeployed)
            return {
                address: String(account[0]),
                isDeployed,
            }
        },
        enabled: !!ownerAddress && !!selectedNetworkName && !!thor,
    })
}

/**
 * Main hook that returns all smart wallet details functionality
 * @param ownerAddress - The address of the owner of the smart account
 * @returns Object containing all three query functions and their results
 */
export const useSmartWalletDetails = (ownerAddress: string) => {
    console.log("useSmartWalletDetails start", ownerAddress)
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const nodeUrl = selectedNetwork.currentUrl
    const thor = ThorClient.at(nodeUrl)

    const hasV1SmartAccountQuery = useHasV1SmartAccount(ownerAddress, thor, selectedNetwork.name)
    const smartAccountQuery = useSmartAccount(ownerAddress, thor, selectedNetwork.name)
    const smartAccountVersionQuery = useSmartAccountVersion(
        smartAccountQuery.data?.address ?? "",
        thor,
        selectedNetwork.name,
    )

    return {
        hasV1SmartAccountQuery,
        smartAccountVersionQuery,
        smartAccountQuery,
        getSmartAccountFactoryAddress,
        // Helper methods to refetch individual queries
        refetchHasV1SmartAccount: hasV1SmartAccountQuery.refetch,
        refetchSmartAccountVersion: smartAccountVersionQuery.refetch,
        refetchSmartAccount: smartAccountQuery.refetch,
        // Combined loading state
        isLoading:
            hasV1SmartAccountQuery.isLoading || smartAccountVersionQuery.isLoading || smartAccountQuery.isLoading,
        // Combined error state
        hasError: hasV1SmartAccountQuery.isError || smartAccountVersionQuery.isError || smartAccountQuery.isError,
    }
}
