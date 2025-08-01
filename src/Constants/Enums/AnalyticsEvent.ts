/**
 * Try to keep these names consistent. Trying to stick to the rough convention of: <DOMAIN>_<ACTION>_<RESULT>
 */
export enum AnalyticsEvent {
    /**
     * Security
     */
    APP_PIN_UNLOCKED = "APP_PIN_UNLOCKED",
    APP_WRONG_PIN = "APP_WRONG_PIN",
    APP_BIOMETRICS_UNLOCKED = "APP_BIOMETRICS_UNLOCKED",

    /**
     * DApps
     */
    DAPP_TX_REQUESTED = "DAPP_TX_REQUESTED",
    DAPP_REQUEST_CERTIFICATE = "DAPP_REQUEST_CERTIFICATE",
    DAPP_CERTIFICATE_SUCCESS = "DAPP_CERTIFICATE_SUCCESS",
    DAPP_CERTIFICATE_FAILED = "DAPP_CERTIFICATE_FAILED",
    DAPP_CERTIFICATE_REJECTED = "DAPP_CERTIFICATE_REJECTED",
    DAPP_REQUEST_TYPED_DATA = "DAPP_REQUEST_TYPED_DATA",
    DAPP_TYPED_DATA_SUCCESS = "DAPP_TYPED_DATA_SUCCESS",
    DAPP_TYPED_DATA_FAILED = "DAPP_TYPED_DATA_FAILED",
    DAPP_TYPED_DATA_REJECTED = "DAPP_TYPED_DATA_REJECTED",
    DAPP_UNIVERSAL_LINK_INITIATED = "DAPP_UNIVERSAL_LINK_INITIATED",
    DAPP_UNIVERSAL_LINK_OPENED = "DAPP_UNIVERSAL_LINK_OPENED",
    DAPP_DISCOVERY_TRANSACTION_SENT_SUCCESS = "DAPP_DISCOVERY_TRANSACTION_SENT_SUCCESS",
    DAPP_DISCOVERY_TRANSACTION_SENT_FAILURE = "DAPP_DISCOVERY_TRANSACTION_SENT_FAILURE",
    DAPP_CERTIFICATE_CHANGE_ACCOUNT_CLICKED = "DAPP_CERTIFICATE_CHANGE_ACCOUNT_CLICKED",

    /**
     * Tokens
     */
    TOKENS_CUSTOM_TOKEN_ADDED = "TOKENS_CUSTOM_TOKEN_ADDED",

    /**
     * Add wallets/accounts Events
     */
    WALLET_ADD_LEDGER_SUCCESS = "WALLET_ADD_LEDGER_SUCCESS",
    WALLET_ADD_LEDGER_ERROR = "WALLET_ADD_LEDGER_ERROR",
    WALLET_ADD_LOCAL_SUCCESS = "WALLET_ADD_LOCAL_SUCCESS",
    WALLET_ADD_DERIVATION_PATH_TYPE = "WALLET_ADD_DERIVATION_PATH_TYPE",
    WALLET_ADD_LOCAL_ERROR = "WALLET_ADD_LOCAL_ERROR",
    PAGE_LOADED_IMPORT_OR_CREATE = "PAGE_LOADED_IMPORT_OR_CREATE",
    PAGE_LOADED_SETUP_PASSWORD = "PAGE_LOADED_SETUP_PASSWORD",
    PASSWORD_SETUP_SUBMITTED = "PASSWORD_SETUP_SUBMITTED",
    NEW_WALLET_VERIFICATION_ATTEMPTED = "NEW_WALLET_VERIFICATION_ATTEMPTED",
    NEW_WALLET_VERIFICATION_SUCCESS = "NEW_WALLET_VERIFICATION_SUCCESS",
    NEW_WALLET_VERIFICATION_FAILED = "NEW_WALLET_VERIFICATION_FAILED",
    NEW_WALLET_PROCEED_TO_VERIFY = "NEW_WALLET_PROCEED_TO_VERIFY",
    IMPORT_MNEMONIC_SUBMITTED = "IMPORT_MNEMONIC_SUBMITTED",
    IMPORT_PRIVATE_KEY_SUBMITTED = "IMPORT_PRIVATE_KEY_SUBMITTED",
    IMPORT_KEYSTORE_FILE_SUBMITTED = "IMPORT_KEYSTORE_FILE_SUBMITTED",
    IMPORT_MNEMONIC_FAILED = "IMPORT_MNEMONIC_FAILED",
    IMPORT_PRIVATE_KEY_FAILED = "IMPORT_PRIVATE_KEY_FAILED",
    IMPORT_KEYSTORE_FILE_FAILED = "IMPORT_KEYSTORE_FILE_FAILED",
    IMPORT_HW_PAGE_LOADED = "IMPORT_HW_PAGE_LOADED",
    IMPORT_HW_LEDGER_START = "IMPORT_HW_LEDGER_START",
    IMPORT_HW_FOUND_LEDGER_DETAILS = "IMPORT_HW_FOUND_LEDGER_DETAILS",
    IMPORT_HW_SELECTED_LEDGER = "IMPORT_HW_SELECTED_LEDGER",
    IMPORT_HW_FAILED_TO_IMPORT = "IMPORT_HW_FAILED_TO_IMPORT",
    IMPORT_HW_USER_SUBMITTED_ACCOUNTS = "IMPORT_HW_USER_SUBMITTED_ACCOUNTS",
    COMPLETED_WALLET_SCREEN = "COMPLETED_WALLET_SCREEN",
    SELECT_WALLET_CREATE_WALLET = "SELECT_WALLET_CREATE_WALLET",
    SELECT_WALLET_IMPORT_WALLET = "SELECT_WALLET_IMPORT_WALLET",
    SELECT_WALLET_IMPORT_MNEMONIC = "SELECT_WALLET_IMPORT_MNEMONIC",
    SELECT_WALLET_IMPORT_HARDWARE = "SELECT_WALLET_IMPORT_HARDWARE",
    SELECT_WALLET_OBSERVE_WALLET = "SELECT_WALLET_OBSERVE_WALLET",

    DISCOVERY_SECTION_OPENED = "DISCOVERY_SECTION_OPENED",
    DISCOVERY_USER_OPENED_DAPP = "DISCOVERY_USER_OPENED_DAPP",
    DISCOVERY_CERTIFICATE_REQUESTED = "DISCOVERY_CERTIFICATE_REQUESTED",
    DISCOVERY_CERTIFICATE_SUCCESS = "DISCOVERY_CERTIFICATE_SUCCESS",
    DISCOVERY_CERTIFICATE_ERROR = "DISCOVERY_CERTIFICATE_ERROR",
    DISCOVERY_TRANSACTION_REQUESTED = "DISCOVERY_TRANSACTION_REQUESTED",
    DISCOVERY_TRANSACTION_SUCCESS = "DISCOVERY_TRANSACTION_SUCCESS",
    DISCOVERY_TRANSACTION_ERROR = "DISCOVERY_TRANSACTION_ERROR",
    DISCOVERY_SIGNED_DATA_REQUESTED = "DISCOVERY_SIGNED_DATA_REQUESTED",
    DISCOVERY_SIGNED_DATA_SUCCESS = "DISCOVERY_SIGNED_DATA_SUCCESS",
    DISCOVERY_SIGNED_DATA_ERROR = "DISCOVERY_SIGNED_DATA_ERROR",

    DISCOVERY_BOOKMARK_ADDED = "DISCOVERY_LINK_BOOKMARKED",
    DISCOVERY_BOOKMARK_REMOVED = "DISCOVERY_LINK_BOOKMARK_REMOVED",

    DISCOVERY_VEBETTERDAO_BANNER_CLICKED = "DISCOVERY_VEBETTERDAO_BANNER_CLICKED",
    DISCOVERY_STELLAPAY_BANNER_CLICKED = "DISCOVERY_STELLAPAY_BANNER_CLICKED",
    DISCOVERY_STARGATE_BANNER_CLICKED = "DISCOVERY_STARGATE_BANNER_CLICKED",
    DISCOVERY_STARGATE_BANNER_CLOSED = "DISCOVERY_STARGATE_BANNER_CLOSED",

    NFT_COLLECTION_REPORTED = "NFT_COLLECTION_REPORTED",
    NFT_COLLECTION_REPORT_INITIATED = "NFT_COLLECTION_REPORT_INITIATED",
    NFT_COLLECTION_REPORT_CONFIRMED = "NFT_COLLECTION_REPORT_CONFIRMED",

    /**
     * BUY
     */
    BUY_CRYPTO_BUTTON_CLICKED = "BUY_CRYPTO_BUTTON_CLICKED",
    BUY_CRYPTO_PROVIDER_SELECTED = "BUY_CRYPTO_PROVIDER_SELECTED",
    BUY_CRYPTO_INITIALISED = "BUY_CRYPTO_INITIALISED",
    BUY_CRYPTO_CLOSED = "BUY_CRYPTO_CLOSED",
    BUY_CRYPTO_CREATED_ORDER = "BUY_CRYPTO_CREATED_ORDER",
    BUY_CRYPTO_SUCCESSFULLY_COMPLETED = "BUY_CRYPTO_SUCCESSFULLY_COMPLETED",
    BUY_CRYPTO_FAILED = "BUY_CRYPTO_FAILED",
    BUY_CRYPTO_CANCELLED = "BUY_CRYPTO_CANCELLED",

    SWAPP_USER_OPENED_DAPP = "SWAPP_USER_OPENED_DAPP",

    //*
    // * VERSION UPGRADE MODAL
    // */
    VERSION_UPGRADE_MODAL_OPENED = "VERSION_UPGRADE_MODAL_OPENED",
    VERSION_UPGRADE_MODAL_SUCCESS = "VERSION_UPGRADE_MODAL_SUCCESS",
    VERSION_UPGRADE_MODAL_DISMISSED = "VERSION_UPGRADE_MODAL_DISMISSED",

    /**
     * UNIFIED EVENTS
     */

    WALLET_OPERATION = "WALLET_OPERATION",
    WALLET_GENERATION = "WALLET_GENERATION",
    NATIVE_TOKEN = "NATIVE_TOKEN",
    TOKEN = "TOKEN",
    NFT = "NFT",
    LOCAL = "LOCAL",
    HARDWARE = "HARDWARE",
    IN_APP = "IN_APP",
    WALLET_CONNECT = "WALLET_CONNECT",
    DAPP = "DAPP",
    SEND = "SEND",

    /**
     * ONBOARDING EVENTS
     */
    ONBOARDING_START = "ONBOARDING_START",
    ONBOARDING_SUCCESS = "ONBOARDING_SUCCESS",
    ONBOARDING_FAILED = "ONBOARDING_FAILED",

    /**
     * SECURITY UPGRADE
     */
    SECURITY_UPGRADE = "SECURITY_UPGRADE",

    /**
     * CLOUD
     */
    IMPORT_FROM_CLOUD_START = "IMPORT_FROM_CLOUD_START",
    IMPORT_FROM_CLOUD_SUCCESS = "IMPORT_FROM_CLOUD_SUCCESS",
    DELETE_BACKUP = "DELETE_BACKUP_START",
    DELETE_BACKUP_SUCCESS = "DELETE_BACKUP_SUCCESS",
    SAVE_BACKUP_TO_CLOUD_START = "SAVE_BACKUP_TO_CLOUD_START",
    SAVE_BACKUP_TO_CLOUD_SUCCESS = "SAVE_BACKUP_TO_CLOUD_SUCCESS",
    IMPORT_ALL_BACKUPS_FROM_WALLET_START = "IMPORT_ALL_BACKUPS_FROM_WALLET_START",
    IMPORT_ALL_BACKUPS_FROM_WALLET_SUCCESS = "IMPORT_ALL_BACKUPS_FROM_WALLET_SUCCESS",

    /**
     * Claim username (vet domains - subdomain)
     */
    CLAIM_USERNAME_PAGE_LOADED = "CLAIM_USERNAME_PAGE_LOADED",
    CLAIM_USERNAME_CREATED = "CLAIM_USERNAME_CREATED",
    CLAIM_USERNAME_FAILED = "CLAIM_USERNAME_FAILED",

    /**
     * VeBetterDao Events
     */
    CONVERT_B3TR_VOT3 = "CONVERT_B3TR_VOT3",
    CONVERT_B3TR_VOT3_SUCCESS = "CONVERT_B3TR_VOT3_SUCCESS",
    CONVERT_B3TR_VOT3_FAILED = "CONVERT_B3TR_VOT3_FAILED",

    /**
     * BUY
     */
    SELL_CRYPTO_BUTTON_CLICKED = "SELL_CRYPTO_BUTTON_CLICKED",
    SELL_CRYPTO_PROVIDER_SELECTED = "SELL_CRYPTO_PROVIDER_SELECTED",
    SELL_CRYPTO_INITIALISED = "SELL_CRYPTO_INITIALISED",
    SELL_CRYPTO_CLOSED = "SELL_CRYPTO_CLOSED",
    SELL_CRYPTO_CREATED_ORDER = "SELL_CRYPTO_CREATED_ORDER",
    SELL_CRYPTO_SUCCESSFULLY_COMPLETED = "SELL_CRYPTO_SUCCESSFULLY_COMPLETED",
    SELL_CRYPTO_FAILED = "SELL_CRYPTO_FAILED",
    SELL_CRYPTO_CANCELLED = "SELL_CRYPTO_CANCELLED",

    /**
     * TRANSACTIONS
     */
    TRANSACTION_SEND_GAS = "TRANSACTION_SEND_GAS",
    TRANSACTION_SEND_DELEGATION = "TRANSACTION_SEND_DELEGATION",
    TRANSACTION_SEND_DELEGATION_TOKEN = "TRANSACTION_SEND_DELEGATION_TOKEN",

    /**
     * Transaction Settings
     */
    SETTINGS_DELEGATION_TOKEN = "SETTINGS_DELEGATION_TOKEN",

    /**
     * Browser
     */
    BROWSER_GO_BACK_CLICKED = "BROWSER_GO_BACK_CLICKED",
    BROWSER_GO_FORWARD_CLICKED = "BROWSER_GO_FORWARD_CLICKED",
}

/**
 * @description MixPanelEvent type
 */
type MixPanelEvent = {
    medium: AnalyticsEvent.SEND | AnalyticsEvent.DAPP
    signature: AnalyticsEvent.LOCAL | AnalyticsEvent.HARDWARE
    network: string
    subject?: AnalyticsEvent.NATIVE_TOKEN | AnalyticsEvent.TOKEN | AnalyticsEvent.NFT
    context?: AnalyticsEvent.IN_APP | AnalyticsEvent.WALLET_CONNECT | AnalyticsEvent.SEND

    failed?: boolean
    dappUrl?: string
}

/**
 * @param {AnalyticsEvent.SEND | AnalyticsEvent.DAPP} medium
 * @param {AnalyticsEvent.LOCAL | AnalyticsEvent.HARDWARE} signature
 * @param {string} network
 * @param {AnalyticsEvent.NATIVE_TOKEN | AnalyticsEvent.TOKEN | AnalyticsEvent.NFT} [subject]
 * @param {AnalyticsEvent.IN_APP | AnalyticsEvent.WALLET_CONNECT | AnalyticsEvent.SEND} [context]
 * @param {boolean} [failed]
 * @param {string} [dappUrl]
 *
 * @description Create a new event for mixpanel
 * @returns {MixPanelEvent} object
 */

export const creteAnalyticsEvent = ({
    medium,
    signature,
    network,
    subject,
    context,
    failed,
    dappUrl,
}: {
    medium: AnalyticsEvent.SEND | AnalyticsEvent.DAPP
    signature: AnalyticsEvent.LOCAL | AnalyticsEvent.HARDWARE
    network: string
    subject?: AnalyticsEvent.NATIVE_TOKEN | AnalyticsEvent.TOKEN | AnalyticsEvent.NFT
    context?: AnalyticsEvent.IN_APP | AnalyticsEvent.WALLET_CONNECT | AnalyticsEvent.SEND
    failed?: boolean
    dappUrl?: string
}): MixPanelEvent => {
    return {
        subject,
        medium,
        network,
        signature,
        context,
        failed,
        dappUrl,
    }
}
