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
    BTN_RESET_APP_RESET: "RESET",

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
    BD_IMPORT_WALLET_TYPE: "Select the type of wallet you want to import",
    BD_IMPORT_WALLET_TYPE_SEED: "To access your previous wallet, you can enter your 12-word recovery phrase.",
    BD_IMPORT_WALLET_TYPE_HARDWARE: "You can connect a hardware wallet which will give you access to your new and existing accounts.",
    BD_WALLET_IMPORT_LOCAL:
    "Import your wallet with your secret recovery phrase. Enter your wallet’s 12-words recovery phrase",
    BD_ALERT_FACE_ID_CANCELLED: "You cancelled using Face ID to authenticate. You must be authenticated to use VeWallet. Do you want to log out, or retry authenticating?",
    BD_WALLET_SUCCESS: "If you have any doubts about how the app works, please follow our documentation on Vechain.org",
    BD_RESET_APP_01: "Resetting your account will log you out and erase all your data stored locally (accounts, wallets, transaction history etc.)",
    BD_RESET_APP_02: "Resetting VeWorld will not change your accounts' balances but will require you to re-enter your secret recovery phrase to access them.",
    BD_RESET_APP_DISCLAIMER: "Ensure you have backed up the recovery phrase of all your wallets, as this action is irreversible.",
    BD_YOUR_BALANCE: "Your balance",

    // TITLES
    TITLE_WELCOME_TO: "Welcome to ",
    TITLE_ONBARDING_SLIDE_01: "Seamlessly manage your crypto",
    TITLE_ONBARDING_SLIDE_02: "Sustainable",
    TITLE_ONBARDING_SLIDE_03: "Customizable, safe and fast",
    TITLE_SECURITY: "Protect your wallet",
    TITLE_WALLET_TUTORIAL_SLIDE_01: "Secret recovery phrase",
    TITLE_WALLET_TUTORIAL_SLIDE_02: "The key to your crypto",
    TITLE_WALLET_TUTORIAL_SLIDE_03: "Keep your phrase safe",
    TITLE_CREATE_WALLET_TYPE: "Create Wallet",
    TITLE_IMPORT_WALLET_TYPE: "Import Wallet",
    TITLE_MNEMONIC: "Your Mnemonic",
    TITLE_USER_PASSWORD: "Choose your 6-digit PIN",
    TITLE_USER_PIN: "Insert your 6-digit PIN",
    TITLE_WALLET_IMPORT_LOCAL: "Import Local Wallet",
    TITLE_ALERT_FACE_ID_CANCELLED: "Face ID Cancelled",
    TITLE_WALLET_SUCCESS: "You're finally one of us!",
    TITLE_RESET_APP: "Confirm Reset",

    // SUBTITLES
    SB_IMPORT_WALLET_TYPE_SEED: "Local wallet",
    SB_IMPORT_WALLET_TYPE_HARDWARE: "Hardware Wallet",
    SB_SECOND_ACCESS_PIN: "Lorem Ipsum is simply dummy text of the printing and typesetting industry",

    // ELEMENTS
    FACE_ID: "Face ID",
    TOUCH_ID: "Touch ID",
    FINGERPRINT: "Fingerprint",
    IRIS: "Iris",
    DEVICE_PIN: "Device Pin",
    TAP_TO_VIEW: "Tap to view",
    BIOMETRICS_PROMPT: "Please use Biometrics to secure your wallet.",


    // Common Buttons
    COMMON_BTN_cancel: "Cancel",

    // Common Labels
    COMMON_LBL_ADDRESS: "Address",
    COMMON_LBL_SUCCESS: "Success",
    COMMON_LBL_ERROR: "Error",

    // Common Titles

    // Errors
    ERROR_INCORRECT_MNEMONIC: "Incorrect mnemonic phrase",

    // Network

    // Network Labels

    // Notifications
    NOTIFICATION_COPIED_CLIPBOARD: "{name} copied to clipboard!",

    // Accounts

    // Onboarding

    // Page Titles

    // Settings Connected Apps

    // Settings Labels

    // Settings Currencies

    // Settings Languages

    // Wallets New Local

    // Wallets Import

    // Wallet Labels

    // Wallet Buttons

    // Wallet Validation

    // Wallet Titles

    // Wallet Ledger

    // Transaction Labels

    // Unlock

    // Dashboard

    // Send

    // Send Confirm

    // Activities

    // Transfers

    // Connected App

    // Connected App Labels

    // Tokens

    // NFTs

    // Ledger Config
}

export default en
