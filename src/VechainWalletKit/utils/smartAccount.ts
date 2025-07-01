import { ThorClient } from "@vechain/sdk-network"
import { Address } from "@vechain/sdk-core"
import { SimpleAccountFactoryABI } from "./abi"
import { WalletError, WalletErrorType } from "./errors"
import { SmartAccountTransactionConfig } from "../types/smartAccountTransaction"

export async function getSmartAccount(
    thor: ThorClient,
    networkName: string,
    ownerAddress: string,
): Promise<SmartAccountTransactionConfig> {
    if (!ownerAddress) {
        throw new WalletError(WalletErrorType.WALLET_NOT_FOUND, "No owner address provided")
    }

    const config = getSmartAccountConfig(networkName)
    const accountFactory = thor.contracts.load(config.accountFactoryAddress, SimpleAccountFactoryABI)

    try {
        const account = await accountFactory.read.getAccountAddress(ownerAddress)
        const smartAccountAddress = String(account[0])

        // Check if the smart account is deployed by checking if it has code
        const isDeployed = (await thor.accounts.getAccount(Address.of(smartAccountAddress))).hasCode

        const hasV1Account = await accountFactory.read.hasLegacyAccount(ownerAddress)
        const version = await accountFactory.read.version()
        return {
            address: smartAccountAddress,
            hasV1Account: hasV1Account[0] as boolean,
            isDeployed,
            version: parseInt(version[0] as string) as number,
            factoryAddress: config.accountFactoryAddress,
        }
    } catch (error) {
        throw new WalletError(WalletErrorType.NETWORK_ERROR, "Network error whilst reading smart account info", error)
    }
}

export interface SmartAccountConfig {
    accountFactoryAddress: string
}

export function getFactoryAddress(networkName: string): string {
    const config = getSmartAccountConfig(networkName)
    return config.accountFactoryAddress
}

const SMART_ACCOUNT_CONFIG = {
    testnet: {
        accountFactoryAddress: "0x713b908Bcf77f3E00EFEf328E50b657a1A23AeaF",
    },
    mainnet: {
        accountFactoryAddress: "0xC06Ad8573022e2BE416CA89DA47E8c592971679A",
    },
} as const

export const getSmartAccountConfig = (networkName: string): SmartAccountConfig => {
    if (networkName === "testnet" || networkName === "mainnet") {
        return SMART_ACCOUNT_CONFIG[networkName]
    }

    throw new Error(`Unsupported network: ${networkName}`)
}

export const getSmartAccountFactoryAddress = (networkName: string): SmartAccountConfig => {
    return getSmartAccountConfig(networkName)
}
