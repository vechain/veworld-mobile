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
    hasV1Account: boolean
    factoryAddress: string
}

export type TransactionSigningFunction = (typedData: any) => Promise<string>
