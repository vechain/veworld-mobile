/**
 * An enum to define all possible statuses a wallet can be in
 * @value `FIRST_TIME_ACCESS` - This is the first time the user has entered the wallet app
 * @value `LOCKED` - The wallet is locked. The user must provide a passphrase to unlock it
 * @value `UNLOCKED` - The wallet is unlocked and the user can interact with it
 * @value `NOT_INITIALISED` - The wallet has not been setup yet
 */
export enum WALLET_STATUS {
    FIRST_TIME_ACCESS = "FIRST_TIME_ACCESS",
    LOCKED = "LOCKED",
    UNLOCKED = "UNLOCKED",
    NOT_INITIALISED = "NOT_INITIALISED",
    MIGRATING = "MIGRATING",
}

/**
 * An enum to define all possible modes a wallet can be in
 * @value `NOT_SET` - The wallet mode has not been defined
 * @value `UNLOCKED` - When accessing the mnemonic phrase for a `local` wallet -> do **NOT** ask the user to enter their passphrase
 * @value `ASK_TO_SIGN` - `(default)` When accessing the mnemonic phrase for a `local` wallet -> ask the user the enter their passphrase
 */
export enum WALLET_MODE {
    UNLOCKED = "unlocked",
    ASK_TO_SIGN = "ask-to-sign",
}

/**
 * An enum to define all wallet types
 * @value `LOCAL_MNEMONIC` - wallet is stored locally and backed up by a mnemonic
 * @value `LOCAL_PRIVATE_KEY` = A single private key stored locally. Can't derive child private keys
 * @value `LEDGER` - imported from a `ledger` hardware wallet
 */
export enum DEVICE_TYPE {
    LOCAL_MNEMONIC = "local-mnemonic",
    LOCAL_WATCHED = "local-watched",
    LOCAL_PRIVATE_KEY = "local-pk",
    LEDGER = "ledger",
}

/**
 * The wallet import method
 */
export enum IMPORT_TYPE {
    UNKNOWN = "unknown",
    MNEMONIC = "mnemonic",
    PRIVATE_KEY = "private-key",
    KEYSTORE_FILE = "keystore-file",
    ICLOUD = "icloud",
}
