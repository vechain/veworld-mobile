import { ThorClient } from "@vechain/sdk-network"
import { Address } from "@vechain/sdk-core"
import { SimpleAccountFactoryABI } from "./abi"
import { WalletError, WalletErrorType } from "./errors"
import { SmartAccountTransactionConfig } from "../types/smartAccountTransaction"

export async function getSmartAccount(
    thor: ThorClient,
    ownerAddress: string,
    accountFactoryAddress: string,
): Promise<SmartAccountTransactionConfig> {
    if (!ownerAddress || !accountFactoryAddress) {
        throw new WalletError(
            WalletErrorType.WALLET_NOT_FOUND,
            `Owner address: ${ownerAddress} or account factory address: ${accountFactoryAddress} not found`,
        )
    }
    const accountFactory = thor.contracts.load(accountFactoryAddress, SimpleAccountFactoryABI)

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
            factoryAddress: accountFactoryAddress,
        }
    } catch (error) {
        throw new WalletError(WalletErrorType.NETWORK_ERROR, "Network error whilst reading smart account info", error)
    }
}
