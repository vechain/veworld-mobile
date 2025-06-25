/**
 * Data that the user must sign in order to execute a transaction
 * by authorizing the Smart Account contract
 */
export interface ExecuteWithAuthorizationSignData {
    domain: {
        name: string
        version: string
        chainId: number
        verifyingContract: string
    }
    types: {
        ExecuteWithAuthorization: {
            name: string
            type: string
        }[]
        EIP712Domain: {
            name: string
            type: string
        }[]
    }
    primaryType: string
    message: {
        validAfter: number
        validBefore: number
        to: string | null | undefined
        value: string
        data: string
    }
}

export interface ExecuteBatchWithAuthorizationSignData {
    domain: {
        name: string
        version: string
        chainId: number
        verifyingContract: string
    }
    types: {
        ExecuteBatchWithAuthorization: {
            name: string
            type: string
        }[]
        EIP712Domain: {
            name: string
            type: string
        }[]
    }
    primaryType: string
    message: {
        to: string[] | null | undefined
        value: string[] | null | undefined
        data: string[] | null | undefined
        validAfter: number
        validBefore: number
        nonce: string
    }
}

export interface SmartAccountTransactionConfig {
    address: string
    version?: number
    isDeployed: boolean
    hasV1SmartAccount: boolean
    factoryAddress: string
}

export interface TransactionNetworkConfig {
    chainId: number
    chainTag: number
}

export type TransactionSigningFunction = (typedData: any) => Promise<string>
