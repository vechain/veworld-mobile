export type WalletEncryptionKey = {
    walletKey: string
}

export type StorageEncryptionKeys = {
    redux: string
    metadata: string
    images: string
}

export type EncryptionKeys = StorageEncryptionKeys & WalletEncryptionKey
