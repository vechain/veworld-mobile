import type { BaseTranslation } from "../i18n-types"

const en: BaseTranslation = {
    // dynamic example
    // HI: 'Hi {name:string}! This is a test translation',

    // BUTTONS
    BTN_GET_STARTED: "GET STARTED",
    BTN_ONBOARDING_SLIDE_01: "NEXT: SUSTAINABLE",
    BTN_ONBOARDING_SLIDE_02: "NEXT: SAFE AND FAST",
    BTN_ONBOARDING_SLIDE_03: "NEXT: CREATE PASSWORD",
    BTN_ONBOARDING_SKIP: "Skip ahead to create password",
    BTN_WALLET_TUTORIAL_SLIDE_01: "NEXT: CUSTODY",
    BTN_WALLET_TUTORIAL_SLIDE_02: "NEXT: SAFETY",
    BTN_WALLET_TUTORIAL_SLIDE_03: "NEXT: SECRET PHRASE",
    BTN_WALLET_TUTORIAL_SKIP: "Skip ahead to recovery phrase",
    BTN_SECURTY_USE_TYPE: "Use {type:string}",
    BTN_SECURITY_CREATE_PASSWORD: "Create password",
    BTN_CREATE_WALLET_TYPE_CREATE_NEW: "Create new wallet",
    BTN_CREATE_WALLET_TYPE_IMPORT: "Import wallet",
    BTN_MNEMONIC_BACKUP: "Backup",
    BTN_MNEMONIC_CHECKBOX:
        "I state that I have saved the secret phrase and I am aware that I am responsible if I lose it.",
    BTN_MNEMONIC_CLIPBOARD: "Copy mnemonic to clipboard",
    BTN_IMPORT_WALLET_VERIFY: "Verify",
    BTN_WALLET_IMPORT_HELP: "Where can I find it?",
    BTN_WALLET_SUCCESS: "CREATE WALLET",
    BTN_RESET_APP_CHECKBOX: "I am aware that this action is irreversible (required)",
    BTN_COPY_PUBLIC_ADDRESS: "Copy public address",
    BTN_SHOW_QR_CODE: "Show QR code",
    BTN_RENAME_ACCOUNT: "Rename account",
    BTN_REMOVE_ACCOUNT: "Remove account",
    BTN_ADD_ACCOUNT: "Add account",
    BTN_ADD_CUSTOM_NODE: "Add a custom node",
    BTN_EDIT_CUSTOM_NODE: "Edit custom node",
    BTN_DOWNLOAD_LOGS: "Download logs",
    BTN_RESET_APP: "Reset App",
    BTN_BUY: "Buy",
    BTN_SEND: "Send",
    BTN_SWAP: "Swap",
    BTN_HISTORY: "History",
    BTN_GO_TO_SETTINGS: "Go to settings",
    BTN_PASTE_ADDRESS: "Paste Address",
    BTN_SCAN_QR_CODE: "Scan QR Code",
    BTN_ADD_CONTACT: "Add contact",
    BTN_CREATE_CONTACT: "Create contact",
    BTN_EDIT_PIN: "Edit Pin",
    BTN_BACKUP_MENMONIC: "Backup phrase",
    BTN_LETS_GET_SENDING: "Let's get sending!",
   

    // BODY
    BD_GDPR:
        "By pressing ‘get started’ you are agreeing to VeWorld’s Terms and conditions and Privacy policy, compliant with Art. 5 GDPR (Required)",
    BD_WELCOME_SCREEN:
        "The Future of Sustainable Self-Custody Web extension Wallet, Enabled By VeChain’s Advanced Blockchain Technology",
    BD_ONBOARDING_SLIDE_01:
        "Viewing and managing your crypto assets has never been easier.",
    BD_ONBOARDING_SLIDE_02:
        "Using Innovative Green Technology, Continues Building The Future of Safe.",
    BD_ONBOARDING_SLIDE_03:
        "Wallet Extension provides a simpler and secured way to manage your coins.",
    BD_WALLET_TUTORIAL_SLIDE_01:
        "The secret phrase is your only way to access your funds. This will be needed when importing your crypto wallet from or to VeWorld.",
    BD_WALLET_TUTORIAL_SLIDE_02:
        "If you lose this phrase you will lose access to all the funds available on your wallet. You should never share your secret phrase.",
    BD_WALLET_TUTORIAL_SLIDE_03:
        "You can write it down and store it somewhere safe, save it in an encrypted password manager or best of all memorize and never write it down.",
    BD_MNEMONIC_BACKUP:
        "Store this phrase in a password manager, write it down or memorize it.",
    BD_MNEMONIC_DISCLAIMER:
        "Never disclose your Secret Recovery Phrase. Anyone with this phrase can take your VeChain cryptos forever.",
    BD_MNEMONIC_SUBTITLE:
        "Your Secret Recovery Phrase makes it easy to back up and restore your account.",
    BD_USER_PASSWORD_CONFIRM: "Confirm your PIN",
    BD_USER_PASSWORD_ERROR: "  PIN doesn't match. Try again.",
    BD_USER_EDIT_PASSWORD_ERROR: "Old PIN can't be the same as new PIN",
    BD_IMPORT_WALLET_TYPE: "Select the type of wallet you want to import",
    BD_IMPORT_WALLET_TYPE_SEED: "To access your previous wallet, you can enter your 12-word recovery phrase.",
    BD_IMPORT_WALLET_TYPE_HARDWARE: "You can connect a hardware wallet which will give you access to your new and existing accounts.",
    BD_WALLET_IMPORT_LOCAL:
        "Import your wallet with your secret recovery phrase. Enter your wallet’s 12-words recovery phrase",
    BD_ALERT_FACE_ID_CANCELLED: "You cancelled using Face ID to authenticate. You must be authenticated to use VeWallet. Do you want to log out, or retry authenticating?",
    BD_WALLET_SUCCESS: "If you have any doubts about how the app works, please follow our documentation on Vechain.org",
    BD_CONFIRM_RESET: "Confirm reset",
    BD_RESET_APP_01: "Resetting your account will log you out and erase all your data stored locally (accounts, wallets, transaction history etc).",
    BD_RESET_APP_02: "Resetting VeWorld will not change your accounts' balances but will require you to re-enter your secret recovery phrase to access them.",
    BD_RESET_APP_DISCLAIMER: "Ensure you have backed up the recovery phrase of all your wallets, as this action is irreversible.",
    BD_YOUR_BALANCE: "Your balance",
    BD_SELECT_WORD: "Select word {number}",
    BD_SELECT_NETWORK: "Select a network",
    BD_SELECT_NETWORK_DESC: "Select the network you want to transact on",
    BD_CUSTOM_NODES: "Custom nodes",
    BD_CUSTOM_NODES_DESC: "Manage your custom nodes",
    BD_OTHER_NETWORKS_CONVERSION: "Other networks - show conversion",
    BD_OTHER_NETWORKS_CONVERSION_DESC: "Show fiat exchange rates when on other networks",
    BD_OTHER_NETWORKS_INDICATOR: "Other networks - show indicator",
    BD_OTHER_NETWORKS_INDICATOR_DESC: "Display an indicator when transacting on another network",
    BD_STATE_LOGS: "State Logs",
    BD_STATE_LOGS_DISCLAIMER: "State logs contain your public account addresses and sent transactions",
    BD_RESET: "VeWorld reset",
    BD_RESET_DISCLAIMER: "Click to reset VeVault and erase all your data stored on it",
    BD_HELP_IMPROVE: "Help us improve",
    BD_HELP_IMPROVE_DISCLAIMER: "Enable this setting to help us improve and always provide the best experience for you",
    BD_CONVERSION_CURRENCY: "Conversion currency",
    BD_APP_THEME: "App theme",
    BD_APP_LANGUAGE: "App language",
    BD_HIDE_TOKENS: "Hide tokens without balance",
    BD_CONVERSION_CURRENCY_DISCLAIMER: "Pick the currency that you prefer to be shown for conversions",
    BD_APP_THEME_DISCLAIMER: "Select the general app theme",
    BD_HIDE_TOKENS_DISCLAIMER: "Tokens without balance won't be shown in the assets list",
    BD_APP_LANGUAGE_DISCLAIMER: "Select the general app language",
    BD_USD: "USD",
    BD_EUR: "EUR",
    BD_SCANED_ADDRESS_COPPIED: "Address Copied to Clipboard",
    BD_CONTACTS_LIST: "Your contact list", 
    BD_CONTACTS_LIST_DISCLAIMER: "Add friends and addresses you trust", 
    BD_ADD_CONTACT: "Add contact details",
    BD_ADD_CONTACT_DISCLAIMER: "Insert the required data to add a new contact",
    BD_CONTACT_NAME: "Contact name",
    BD_CONTACT_ADDRESS: "Contact address",
    BD_CONFIRM_REMOVE_CONTACT: "Remove contact",
    BD_CONFIRM_REMOVE_CONTACT_DESC: "Are you sure you want to remove this contact?",
    BD_APP_LOCK: "Require the pin when performing transactions with local wallets",
    BD_SECURITY_METHOD: "Click to reset VeVault and erase all your data stored on it",
    BD_NO_TOKEN_FOUND: "No token found",
    BD_BACKUP_MNEMONIC: "Backup your mnemonic phrase",
    BD_ANALYTICS_TRACKING: "I accept to be tracked by Analytics and for research and service quality purposes",
    BD_MNEMONIC_COPIED_TO_CLIPBOARD: "Mnemonic copied to clipboard",
    BD_SECURITY_DOWNGRADE: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text",
    BD_CREATE_WALLET_TYPE: "You can import your existing wallet, and retain all of your accounts and related transaction keys.",
    BD_CREATE_WALLET_TYPE_USER_ACCEPTS: "Creating the wallet the user accepts",
    BD_NFT_DESC_PLACEHOLDER: "Random NFT collection description placeholder in case the NFT collection doesn't have one",
 
    // TITLES
    TITLE_WELCOME_TO: "Welcome to ",
    TITLE_ONBARDING_SLIDE_01: "Seamlessly manage your crypto",
    TITLE_ONBARDING_SLIDE_02: "Sustainable",
    TITLE_ONBARDING_SLIDE_03: "Customizable, safe and fast",
    TITLE_SECURITY: "Protect your wallet",
    TITLE_WALLET_TUTORIAL_SLIDE_01: "Secret recovery phrase",
    TITLE_WALLET_TUTORIAL_SLIDE_02: "The key to your crypto",
    TITLE_WALLET_TUTORIAL_SLIDE_03: "Keep your phrase safe",
    TITLE_CREATE_WALLET_TYPE: "Wallet Setup",
    TITLE_IMPORT_WALLET_TYPE: "Import Wallet",
    TITLE_MNEMONIC: "Your Mnemonic",
    TITLE_CONFIRM_MNEMONIC: "Confirm your mnemonic",
    TITLE_USER_PASSWORD: "Choose your 6-digit PIN",
    TITLE_USER_PIN: "Insert your 6-digit PIN",
    TITLE_WALLET_IMPORT_LOCAL: "Import Local Wallet",
    TITLE_ALERT_FACE_ID_CANCELLED: "Face ID Cancelled",
    TITLE_ALERT_CAMERA_PERMISSION: "Camera Permissions",
    TITLE_ALERT_CAMERA_UNAVAILABLE: "Camera Unavailable",
    TITLE_WALLET_SUCCESS: "You're finally one of us!",
    TITLE_RESET_APP: "VeWorld reset",
    TITLE_WALLET_MANAGEMENT: "Wallet management",
    TITLE_SETTINGS: "Settings",
    TITLE_GENERAL: "General",
    TITLE_ADVANCED: "Advanced",
    TITLE_CONTACTS: "Contacts",
    TITLE_ADD_CONTACT: "Add Contact",
    TITLE_MANAGE_WALLET: "Manage Wallet",
    TITLE_TRANSACTIONS: "Transactions",
    TITLE_NFT: "NFT",
    TITLE_NFTS: "NFTs",
    TITLE_NETWORK: "Network",
    TITLE_NETWORKS: "Networks",
    TITLE_PRIVACY: "Privacy and Security",
    TITLE_ALERTS: "Alerts",
    TITLE_CONNECTED_APPS: "Connected Apps",
    TITLE_ABOUT: "About",
    TITLE_SCAN_QRCODE: "Scan QR Code",
    TITLE_SCANED_ADDRESS_COPPIED: "Address Copied to Clipboard",
    TITLE_ADD_TOKEN: "Add Token",
    TITLE_EDIT_WALLET: "Edit wallet",
    TITLE_SECURITY_DOWNGRADE: "Your app is blocked",
    TITLE_DISCOVER: "Discover",

    // SUBTITLES
    SB_IMPORT_WALLET_TYPE: "Which kind of wallet do you want to import?",
    SB_IMPORT_WALLET_TYPE_SEED: "Local wallet",
    SB_IMPORT_WALLET_TYPE_HARDWARE: "Hardware Wallet",
    SB_UNLOCK_WALLET_PIN: "Insert the pin you created in order to unlock your wallet.",
    SB_CONFIRM_PIN: "Insert the pin you created in order to perform the requested operation.",
    SB_EDIT_OLD_PIN: "Insert your old pin",
    SB_EDIT_NEW_PIN: "Insert your new pin",
    SB_ACCOUNT_MANAGEMENT: "Account management",
    SB_CHOOSE_A_WALLET: "Choose a wallet",
    SB_EDIT_WALLET: "Edit wallet {name}",
    SB_RENAME_WALLET: "Rename wallet",
    SB_RENAME_REORDER_ACCOUNTS: "Rename or reorder accounts ",
    SB_DEVICE_CARD: "{alias} ({accounts} accounts)",
    SB_ENTER_LANGUAGE: "Enter your language",
    SB_SELECT_LANGUAGE: "Select your language",
    SB_ALERT_CAMERA_PERMISSION: "You have previously denied camera access to VeWorld. Please enable it in your device settings.",
    SB_CAMERA_ANAVAILABILITY: "Your device does not support this operation.",
    SB_YOUR_TOKENS : "Your tokens",
    SB_YOUR_NFTS : "Your collections",
    SB_CONFIRM_OPERATION: "Confirm the operation?",
    SB_CONTACT_LIST_EMPTY: "Your contact list is empty",
    SB_CREATE_ONE: "Create one",
    SB_EDIT_CONTACT: "Edit contact",
    SB_PASSWORD_AUTH: "Password authorization",
    SB_SECURITY_METHOD: "Security method",
    SB_BACKUP_MNEMONIC: "Backup your mnemonic",
    SB_ANALYTICS_TRACKING: "Analytics tracking",
    SB_NO_TRANSACTIONS: "Your activities will appear here",
    SB_DESCRIPTION: "Description",
    SB_COLLECTIBLES: "Collectibles",

    // ELEMENTS
    FACE_ID: "Face ID",
    TOUCH_ID: "Touch ID",
    FINGERPRINT: "Fingerprint",
    BIOMETRICS: "Biometrics",
    IRIS: "Iris",
    DEVICE_PIN: "Device Pin",
    TAP_TO_VIEW: "Tap to view",
    BIOMETRICS_PROMPT: "Please use Biometrics to secure your wallet.",
    VEWORLD: "VeWorld",


    // Common Buttons
    COMMON_BTN_CANCEL: "Cancel",
    COMMON_BTN_REMOVE: "Remove",
    COMMON_BTN_RETRY: "Retry",
    COMMON_BTN_SIGN_OUT: "Sign out",
    COMMON_BTN_OK: "OK",
    COMMON_BTN_LOADING: "Loading",
    COMMON_BTN_DONE: "Done",
    COMMON_BTN_CONFIRM: "Confirm",
    COMMON_BTN_ADD: "Add",
    COMMON_BTN_SAVE: "Save",
    COMMON_BTN_NEXT: "NEXT",

    // Common Labels
    COMMON_LBL_AND: "and",
    COMMON_LBL_NAME: "name",
    COMMON_LBL_URL: "URL",
    COMMON_LBL_ADDRESS: "Address",
    COMMON_LBL_SUCCESS: "Success",
    COMMON_LBL_ERROR: "Error",
    COMMON_LBL_IMPORT: "Import",
    COMMON_LBL_FAVOURITE: "Favourite",
    COMMON_LBL_FAVOURITES: "Favourites",
    COMMON_LBL_ENTER_THE: "Enter the {name}",
    COMMON_LBL_DEFAULT: "Default",
    COMMON_LBL_NO_TOKEN_DATA: "No available price history for {tokenName: string}",
    COMMON_LBL_DATA: "Data",
    COMMON_LBL_COMMENT: "Comment",
    COMMON_LBL_PRIVACY_POLICY: "Privacy Policy",
    COMMON_LBL_TERMS_AND_CONDITIONS: "Terms and Conditions",
    COMMON_ASSETS: "Assets",
    COMMON_DAPPS: "DApps",
    COMMON_PRICE: "Price",
    COMMON_TODAY: "Today",
    COMMON_SELECT_ACCOUNT: "Select account",
    COMMON_MARKET_CAP: "Market Cap",
    COMMON_TOTAL_SUPPLY: "Total Supply",
    COMMON_24H_VOLUME: "24h Volume",
    COMMON_CIRCULATING_SUPPLY: "Circulating Supply",


    // Common Titles
    ALERT_TITLE_NOT_ENROLLED: "Biometrics not available",
    ALERT_MSG_NOT_ENROLLED: "You have not enrolled any biometric authentication method.",
    ALERT_TITLE_BIO_PREVIOUSLY_DENIED: "Biometrics previously denied",
    ALERT_MSG_BIO_PREVIOUSLY_DENIED: "You have previously denied biometric authentication. Please enable it in your device settings.",


    // Errors
    ERROR_GENERIC_SUBTITLE: "Something went wrong!",
    ERROR_GENERIC_BODY: "We apologise for the inconvenience.\nPlease, try again later.",
    ERROR_INCORRECT_MNEMONIC: "Incorrect mnemonic phrase",
    ERROR_WRONG_WORDS_COMBINATION: "Wrong words combination",
    ERROR_WRONG_WORDS_COMBINATION_DESC: "The words combination is wrong, try again.",
    ERROR_WALLET_ALREADY_EXISTS: "Wallet already exists",
    ERROR_ENTER_VALID_URL: "Enter a valid URL",
    ERROR_URL_NOT_VALID: "URL must be https or localhost",
    ERROR_URL_ALREADY_USED: "Network already in use",
    ERROR_NO_ASSETS_FOUND: "No assets found",

    ERROR_REQUIRED_FIELD: "Required",
    ERROR_MAX_INPUT_LENGTH: "Contact name too long",
    ERROR_NAME_ALREADY_EXISTS: "Name already exists in contacts",
    ERROR_ADDRESS_EXISTS: "Address already exists in contacts",
    ERROR_ADDRESS_INVALID: "Please enter a valid Vechain address",
    ERROR: "Error!",
    ERROR_GENERIC_OPERATION: "The operation went wrong. Please, try again.",
    ERROR_NFT_FAILED_TO_GET_URI_FROM_THOR: "Failed to get token URI from Thor",
    ERROR_NFT_FAILED_TO_GET_DATA_FROM_IPFS: "Failed to get token data from IPFS",
    ERROR_NFT_FAILED_TO_GET_DATA_FROM_ARWEAVE: "Failed to get token data from Arweave",
    ERROR_NFT_TOKEN_URI_PROTOCOL_NOT_SUPPORTED: "The token URI protocol is not supported ({protocol})",
    ERROR_NFT_FAILED_TO_GET_METADATA: "Failed to get token metadata",

    // Success

    SUCCESS_GENERIC: "Success!",
    SUCCESS_GENERIC_OPERATION: "The operation went well!",
    SUCCESS_GENERIC_VIEW_DETAIL_LINK: "View operation detail.",

    // Warning
    HEADS_UP: "Heads up!",
    ACTIVITIES_NOT_UP_TO_DATE: "Activities might not be up-to-date. Check your internet connection or try later",


    // Placeholders
    PLACEHOLDER_SEARCH_TOKEN: "Search a token",
    PLACEHOLDER_ENTER_NAME: "Enter the name",
    PLACEHOLDER_ENTER_ADDRESS: "Enter the address",

    // Network
    NETWORK_MANAGE_NODES: "Manage nodes",
    NETWORK_ADD_CUSTOM_NODE: "Add custom node",
    NETWORK_ADD_CUSTOM_NODE_SB: "Add network details",
    NETWORK_ADD_CUSTOM_NODE_SB_DESC: "If you are having problems adding your custom node, it usually indicates a poorly formatted URL or a problem with the CORS configuration of the node.",
    NETWORK_ADD_CUSTOM_NODE_NAME: "Node name",
    NETWORK_ADD_CUSTOM_NODE_ADD_NETWORK: "Add network",
    NETWORK_ADD_CUSTOM_NODE_EDIT_NETWORK: "Edit network",
    NETWORK_CONFIRM_REMOVE_NODE: "Remove custom node",
    NETWORK_CONFIRM_REMOVE_NODE_DESC: "Are you sure you want to remove this custom node?",

    // Network Labels
    NETWORK_LABEL_MAIN_NETWORKS: "Main Networks",
    NETWORK_LABEL_TEST_NETWORKS: "Test Networks",
    NETWORK_LABEL_OTHER_NETWORKS: "Other Networks",

    // Notifications
    NOTIFICATION_COPIED_CLIPBOARD: "{name} has been copied to the clipboard!",
    NOTIFICATION_transaction_reverted: "Transaction {txId} was reverted.",
    NOTIFICATION_found_token_transfer: "Found {token} transfer: {amount}",

    // Accounts

    // Onboarding

    // Page Titles

    // Settings Connected Apps

    // Settings Labels
    LIGHT_THEME: "Light",
    DARK_THEME: "Dark",
    SYSTEM_THEME: "System",

    // Settings Currencies

    SETTINGS_CURRENCIES_CONVERT_TO_FIAT: "Convert balances to fiat",
    
    // Settings Languages

    // Settings Transactions

    SETTINGS_TRANSACTIONS_TITLE: "Transactions",
    SETTINGS_TRANSACTIONS_DEFAULT_DELEGATION: "Default delegation",
    SETTINGS_TRANSACTIONS_SELECT_DEFAULT_DELEGATION: "Select the default delegation for your transactions",
    SETTINGS_TRANSACTIONS_SELECT_DELEGATION_URLS: "Delegation URLs",
    SETTINGS_TRANSACTIONS_SELECT_DELEGATION_URLS_BODY: "Add or delete a delegation URL so you can select it when sending transactions",
    SETTINGS_TRANSACTIONS_MANAGE_URLS: "Manage URLs",


    // Manage Token
    MANAGE_TOKEN_TITLE: "Manage Tokens",
    MANAGE_TOKEN_SELECT_YOUR_TOKEN_SUBTITLE: "Select your token",
    MANAGE_TOKEN_SELECT_YOUR_TOKEN_BODY: "Select your official tokens or add a new custom one",
    MANAGE_TOKEN_MANAGE_CUSTOM: "Manage custom tokens",
    MANAGE_TOKEN_ADD_CUSTOM: "Add custom token",
    MANAGE_TOKEN_SELECTED: "Selected",
    MANAGE_TOKEN_UNSELECTED: "Unselected",
    MANAGE_TOKEN_SEARCH_TOKEN: "Search a token",
    MANAGE_TOKEN_SUGGESTED_TOKENS: "We have noticed that you have tokens with balance, add them directly from here",
    MANAGE_TOKEN_ADD_SUGGESTED_TOKENS: "Add tokens",
    MANAGE_TOKEN_TITLE_SUGGESTED_TOKENS: "Suggested token",

    // Manage Custom tokens
    MANAGE_CUSTOM_TOKENS_ADD_TOKEN_TITLE: "Add custom token",
    MANAGE_CUSTOM_TOKENS_ENTER_AN_ADDRESS: "Enter an address",
    MANAGE_CUSTOM_TOKENS_CONFIRM_TOKEN_TITLE: "Confirm custom token",
    MANAGE_CUSTOM_TOKENS_DELETE_TITLE: "Remove custom token",
    MANAGE_CUSTOM_TOKENS_DELETE_DESC: "Are you sure you want to remove this custom token?",

    MANAGE_CUSTOM_TOKENS_ERROR_WRONG_ADDRESS: "The address entered is incorrect or can't be added to this network",
    MANAGE_CUSTOM_TOKENS_ERROR_OFFICIAL_TOKEN: "This is an official token, please select it from the previous list",
    MANAGE_CUSTOM_TOKENS_ERROR_ALREADY_PRESENT: "This custom token is already present",

    // Send Token
    SEND_TOKEN_TITLE: "Send",
    SEND_TOKEN_SUBTITLE: "Send your token",
    SEND_TOKEN_SELECT_ASSET: "Select the asset that you want to transfer",
    SEND_CURRENT_BALANCE: "Currency balance",
    SEND_BALANCE_PERCENTAGE: "Balance percentage",
    SEND_RANGE_ZERO: "0%",
    SEND_RANGE_MAX: "MAX",
    SEND_INSUFFICIENT_BALANCE: "Insufficient balance",
    SEND_INSERT_ADDRESS: "Send your token",
    SEND_INSERT_ADDRESS_DESCRIPTION: "Select a contact below or paste/scan an address",
    SEND_ENTER_AN_ADDRESS: "Enter or scan an address",
    SEND_INSERT_CONTACTS: "Contacts",
    SEND_INSERT_ACCOUNTS: "Accounts",
    SEND_FROM: "From",
    SEND_TO: "To",
    SEND_DETAILS: "Details",
    SEND_AMOUNT: "Amount",
    SEND_GAS_FEE: "Gas fee",
    SEND_ESTIMATED_TIME: "Estimated time",
    SEND_LESS_THAN_1_MIN: "Less than 1 min",
    SEND_DELEGATION_TITLE: "Select delegation",
    SEND_DELEGATION_NONE: "None",
    SEND_DELEGATION_ACCOUNT: "Account",
    SEND_DELEGATION_URL: "URL",
    SEND_DELEGATION_SELECT_URL: "Select URL",
    SEND_DELEGATION_MANAGE_URL: "Manage URLs",
    SEND_DELEGATION_ADD_URL: "Add delegation URL",
    SEND_DELEGATION_ADD_URL_SUBTITLE: "Insert the URL you want to to use to delegate this transaction",
    SEND_DELEGATION_ADD_URL_PLACEHOLDER: "Enter URL",
    SEND_DELEGATION_ERROR_SIGNATURE: "Failed to reach this URL. Please try again.",
    SEND_CREATE_CONTACT_TITLE: "Create contact",
    SEND_CREATE_CONTACT_SUBTITLE: "We noticed that the address you entered is not associated with any saved contacts, would you like to create one?",
    SEND_CREATE_CONTACT_CREATE_BUTTON: "CREATE CONTACT",
    SEND_CREATE_CONTACT_PROCEED_ANYWAY_BUTTON: "PROCEED ANYWAY",
    SEND_CREATE_CONTACT_NAME: "Contact name",
    SEND_CREATE_CONTACT_ADDRESS: "Contact address",

    // Wallets New Local
    WALLET_LABEL_ACCOUNT: "Account",
    WALLET_LABEL_WALLET: "Wallet",

    // Wallets Import

    // Wallet Labels

    // Wallet Buttons

    // Wallet Validation

    // Wallet Titles

    // Wallet 
    WALLET_LEDGER_SELECT_DEVICE_TITLE: "Import ledger",
    WALLET_LEDGER_SELECT_DEVICE_SB: "Please make sure your Ledger is unlocked and the bluetooth enabled",
    WALLET_LEDGER_ENABLE_ADDITION_SETTINGS_TITLE: "Enable additional settings",
    WALLET_LEDGER_ENABLE_ADDITION_SETTINGS_SB: "in order to give you the best user experience, you need to enable some additional settings in your ledger (Contract data and Multi-clause). Please follow the instructions below to proceed",
    WALLET_LEDGER_ENABLE_ADDITION_SETTINGS_STEP_1: "Open the VET app on your Ledger",
    WALLET_LEDGER_ENABLE_ADDITION_SETTINGS_STEP_1_DESC: "Unlock your Ledger and open the VET app. If you don't have it installed, please install it from the Ledger Live app.",
    WALLET_LEDGER_ENABLE_ADDITION_SETTINGS_STEP_2: "Navigate to Settings",
    WALLET_LEDGER_ENABLE_ADDITION_SETTINGS_STEP_2_DESC: "Use the buttons on your Ledger to navigate to Settings and press both buttons to enter the menu.",
    WALLET_LEDGER_ENABLE_ADDITION_SETTINGS_STEP_3: "Enable Contract data",
    WALLET_LEDGER_ENABLE_ADDITION_SETTINGS_STEP_3_DESC: "Navigate to Contract data and press both buttons to enable it.",
    WALLET_LEDGER_ENABLE_ADDITION_SETTINGS_STEP_4: "Enable Multi-clause",
    WALLET_LEDGER_ENABLE_ADDITION_SETTINGS_STEP_4_DESC: "Navigate to Multi-clause and press both buttons to enable it.",

    WALLET_LEDGER_ERROR_UNLOCK_LEDGER: "Unlock ledger",
    WALLET_LEDGER_ERROR_UNLOCK_LEDGER_DESC: "Please, turn on and unlock your ledger device to continue",
    WALLET_LEDGER_ERROR_OPEN_APP: "Open VET app",
    WALLET_LEDGER_ERROR_OPEN_APP_DESC: "Please, open the VET app to continue",
    WALLET_LEDGER_ERROR_UNKNOWN: "Unknown error",
    WALLET_LEDGER_ERROR_UNKNOWN_DESC: "An unknown error occurred. Please try again",


    // Transaction Labels

    // Unlock

    // Dashboard

    // Send

    // Send Confirm

    // Activities
    DATE_NOT_AVAILABLE: "Date not available",
    RECEIVE_ACTIVITY: "Receive",
    FROM: "From",
    TO: "To",
    UNKNOWN_ACCOUNT: "Unknown Account",
    VALUE_TITLE: "Value",
    GAS_FEE: "Gas fee",
    DETAILS: "Details",
    TRANSACTION_ID: "Transaction ID",
    VIEW_ON_EXPLORER: "View on explorer",
    BLOCK_NUMBER: "Block number",
    DAPP_TRANSACTION: "DApp Transaction",
    SIGN_CERTIFICATE: "Sign certificate",
    SIGNED_CERTIFICATE: "Signed certificate",
    ORIGIN: "Origin",
    CONTENT: "Content",
    STATUS: "Status",
    ACTIVITIES_STATUS_pending: "Pending",
    ACTIVITIES_STATUS_success: "Success",
    ACTIVITIES_STATUS_reverted: "Reverted",
    ACTIVITIES_STATUS_failed: "Failed",
    ACTIVITIES_PENDING_DESCRIPTION: "This transaction is pending, details might not be fully accurate",
    ACTIVITIES_FAILED_DESCRIPTION: "There was an error in executing the transaction",
    CONNECTED_APP_token_transfer: "Token transfer",
    CONNECTED_APP_contract_call: "Contract call",
    CONNECTED_APP_deploy_contract: "Contract deployment",
    CONNECTED_APP_approve_nft: "Approve NFT",
    CONNECTED_APP_swap_vet_for_tokens: "Swap VET for tokens",
    CONNECTED_APP_swap_tokens_for_vet: "Swap tokens for VET",
    CONNECTED_APP_swap_tokens_for_tokens: "Swap tokens for tokens",
    OUTCOMES: "Outcomes",
    TYPE: "Type",
    TOKEN_SYMBOL: "Token symbol",
    CONTRACT_DATA: "Contract data",
    CONTRACT_ABI: "Contract ABI",
    COPY_ABI: "Click to copy ABI",
    TOKEN_ID: "Token ID",


    // Transfers

    // Connected App

    // Connected App Labels

    // Tokens

    // NFTs

    // Ledger Config
}

export default en
