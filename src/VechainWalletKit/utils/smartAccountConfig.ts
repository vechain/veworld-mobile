export interface SmartAccountConfig {
    accountFactoryAddress: string
}

export interface SmartAccountReturnType {
    address: string | undefined
    isDeployed: boolean
}

const SMART_ACCOUNT_CONFIGS = {
    testnet: {
        accountFactoryAddress: "0x713b908Bcf77f3E00EFEf328E50b657a1A23AeaF",
    },
    mainnet: {
        accountFactoryAddress: "0xC06Ad8573022e2BE416CA89DA47E8c592971679A",
    },
} as const

export const getSmartAccountConfig = (networkName: string): SmartAccountConfig => {
    if (networkName === "testnet") return SMART_ACCOUNT_CONFIGS.testnet
    return SMART_ACCOUNT_CONFIGS.mainnet
}

export const getSmartAccountFactoryAddress = (networkName: string): SmartAccountConfig => {
    return getSmartAccountConfig(networkName)
} 