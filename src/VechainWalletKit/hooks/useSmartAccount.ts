import { useCallback, useMemo } from "react"
import { ThorClient } from "@vechain/sdk-network"
import { Address } from "@vechain/sdk-core"
import { SimpleAccountFactoryABI } from "../utils/abi"
import { getSmartAccountConfig } from "../utils/smartAccountConfig"

export interface UseSmartAccountProps {
    thor: ThorClient
    networkName: string
}

export function useSmartAccount({ thor, networkName }: UseSmartAccountProps) {
    const config = useMemo(() => getSmartAccountConfig(networkName), [networkName])

    const getSmartAccount = useCallback(
        async (ownerAddress: string) => {
            try {
                if (!ownerAddress) {
                    return { address: undefined, isDeployed: false }
                }
                const accountFactory = thor.contracts.load(config.accountFactoryAddress, SimpleAccountFactoryABI)
                const account = await accountFactory.read.getAccountAddress(ownerAddress)
                const smartAccountAddress = String(account[0])

                if (!smartAccountAddress) {
                    return { address: undefined, isDeployed: false }
                }

                // Check if the smart account is deployed by checking if it has code
                const isDeployed = (await thor.accounts.getAccount(Address.of(smartAccountAddress))).hasCode

                return {
                    address: smartAccountAddress,
                    isDeployed,
                }
            } catch (error) {
                return { address: undefined, isDeployed: false }
            }
        },
        [thor, config.accountFactoryAddress],
    )

    const hasV1SmartAccount = useCallback(
        async (ownerAddress: string): Promise<boolean> => {
            try {
                if (!ownerAddress) return false

                const accountFactory = thor.contracts.load(config.accountFactoryAddress, SimpleAccountFactoryABI)
                const result = await accountFactory.read.hasLegacyAccount(ownerAddress)
                return result[0] as boolean
            } catch (error) {
                return false
            }
        },
        [thor, config.accountFactoryAddress],
    )

    const getSmartAccountVersion = useCallback(
        async (smartAccountAddress: string): Promise<number> => {
            try {
                if (!smartAccountAddress) throw new Error("Smart account address is required")

                const accountFactory = thor.contracts.load(config.accountFactoryAddress, SimpleAccountFactoryABI)
                const result = await accountFactory.read.version()
                return parseInt(result[0] as string) as number
            } catch (error) {
                // If we can't get the version, assume it's a V1 account
                return 1
            }
        },
        [thor, config.accountFactoryAddress],
    )

    const getFactoryAddress = useCallback(() => {
        return config.accountFactoryAddress
    }, [config.accountFactoryAddress])

    return useMemo(
        () => ({
            getSmartAccount,
            hasV1SmartAccount,
            getSmartAccountVersion,
            getFactoryAddress,
        }),
        [getSmartAccount, hasV1SmartAccount, getSmartAccountVersion, getFactoryAddress],
    )
}
