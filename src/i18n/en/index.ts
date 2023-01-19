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
    TITLE_MNEMONIC: "Your Mnemonic",
    TITLE_USER_PASSWORD: "Choose your 6-digit PIN",

    // ELEMENTS
    FACE_ID: "Face ID",
    FINGERPRINT: "Fingerprint",
    IRIS: "Iris",
    DEVICE_PIN: "Device Pin",
    TAP_TO_VIEW: "Tap to view",


    // Common Buttons
    COMMON_BTN_back: "Back",
    COMMON_BTN_next: "Next",
    COMMON_BTN_cancel: "Cancel",
    COMMON_BTN_connect: "Connect",
    COMMON_BTN_save_changes: "Save changes",
    COMMON_BTN_revoke: "Revoke",
    COMMON_BTN_add: "Add",
    COMMON_BTN_approve: "Approve",
    COMMON_BTN_reject: "Reject",
    COMMON_BTN_proceed: "Proceed",
    COMMON_BTN_update: "Update",
    COMMON_BTN_verify: "Verify",
    COMMON_BTN_continue: "Continue",
    COMMON_BTN_show_qr: "Show QR code",
    COMMON_BTN_unlock: "Unlock",
    COMMON_BTN_delete: "Delete",
    COMMON_BTN_reset: "Reset",
    COMMON_BTN_confirm: "Confirm",
    COMMON_BTN_go_home: "Go to Homepage",
    COMMON_BTN_send: "Send",
    COMMON_BTN_sign: "Sign",
    COMMON_BTN_you_can_change_your_account_here:
        "You can change the selected account here",
    COMMON_BTN_go_to_dashboard: "Go To Dashboard",

    // Common Labels
    COMMON_LABEL_warning: "Warning",
    COMMON_LABEL_identification: "Identification",
    COMMON_LABEL_maximum: "Maximum",
    COMMON_LABEL_delegated: "Delegated",
    COMMON_LABEL_not_occurring: "Not occurring",
    COMMON_LABEL_agreement: "Agreement",
    COMMON_LABEL_wallet: "Wallet",
    COMMON_LABEL_min_1: "1 min",
    COMMON_LABEL_amount: "Amount",
    COMMON_LABEL_disabled: "Disabled",
    COMMON_LABEL_custom: "Custom",
    COMMON_LABEL_default: "Default",
    COMMON_LABEL_enter_password: "Please enter your password",
    COMMON_LABEL_from: "From",
    COMMON_LABEL_left_parenthesis: "(",
    COMMON_LABEL_loading: "Loading...",
    COMMON_LABEL_date: "Date",
    COMMON_LABEL_network: "Network",
    COMMON_LABEL_no_more_data: "No more data...",
    COMMON_LABEL_not_available: "Not available",
    COMMON_LABEL_password: "Password",
    COMMON_LABEL_password_description:
        "Enter the password used to unlock VeWorld",
    COMMON_LABEL_reset: "Reset",
    COMMON_LABEL_right_parenthesis: ")",
    COMMON_LABEL_status: "Status",
    COMMON_LABEL_to: "To",
    COMMON_LABEL_sent: "Sent",
    COMMON_LABEL_received: "Received",
    COMMON_LABEL_url: "URL",
    COMMON_LABEL_callback_url: "Callback URL",
    COMMON_LABEL_paste_clipboard: "Paste from clipboard",
    COMMON_LABEL_clear_phrase: "Empty phrase",
    COMMON_LABEL_testnet_message: "You are currently on network: {network}",
    COMMON_LABEL_symbol: "Token Symbol",
    COMMON_LABEL_account_name: "Account name",
    COMMON_LABEL_wallet_name: "Wallet name",
    COMMON_LABEL_yes: "Yes",
    COMMON_LABEL_no: "No",
    COMMON_LABEL_transaction_id: "Transaction ID",
    COMMON_LABEL_show: "show",
    COMMON_LABEL_hide: "hide",
    COMMON_LABEL_add_a: "add a new",
    COMMON_LABEL_confirm_transaction: "Confirm transaction",
    COMMON_LABEL_sign_certificate: "Sign Certificate",
    COMMON_LABEL_transaction_will_be_sent:
        "The transaction will be sent without password authorisation",
    COMMON_LABEL_cert_will_be_returned:
        "The certificate will be sent to the requester",
    COMMON_LABEL_cannot_remove_wallet_description:
        "You're not allowed to remove this wallet as it's the only one you own",
    COMMON_LABEL_known_accounts: "Known accounts",
    COMMON_LABEL_official_vechain_token: "VeChain official tokens",
    COMMON_LABEL_of: "of",
    COMMON_LABEL_copy_to_clipboard: "Copy {name} to clipboard",
    COMMON_LABEL_light: "Light",
    COMMON_LABEL_dark: "Dark",
    COMMON_LABEL_auto_system: "Auto (System)",
    COMMON_LABEL_type: "Type",
    COMMON_LABEL_contract_address: "Contract address",
    COMMON_LABEL_purpose_not_listed: "Purpose not listed",
    COMMON_LABEL_content_not_found: "No content found",
    COMMON_LABEL_abi: "Transaction ABI",
    COMMON_LABEL_comment: "Comment",

    // Common Titles
    COMMON_TITLES_veworld: "VeWorld",
    COMMON_TITLES_enter_password: "Enter your VeWorld password",

    // Errors
    ERRORS_invalid_context_title: "Invalid context detected",
    ERRORS_invalid_context_text:
        "The current context has been invalidated. This usually happens when the extension is updated without refreshing the page. You may need to reload the parent window to continue.",
    ERRORS_data_not_available: "Data not available",
    ERRORS_for_this_token: "for this token",
    ERRORS_not_in_contacts: "Not in contacts",
    ERRORS_send_same_address: "Sender and recipient are the same",
    ERRORS_price_feed_not_available: "Price feed not available",
    ERRORS_balance_not_available: "Balance not available",
    ERRORS_app_not_recognized: "Application not recognised by VeChain",
    ERROR_RPC_INVALID_wrong_mnemonic_length:
        "The mnemonic should be exactly 12 words",
    ERROR_RPC_INVALID_wallet_already_exists:
        "Can't add this wallet as it already exists",
    ERROR_RPC_INVALID_network_already_exists: "This network already exists",
    ERROR_RPC_INVALID_device_already_exists: "This device already exists",
    ERROR_RPC_INVALID_contact_already_exists: "This contact already exists",
    ERROR_RPC_INVALID_cant_add_account_for_non_hd:
        "Can't add accounts for non-HD wallets",
    ERROR_RPC_INVALID_ledger_does_not_match_account:
        "The connected ledger device does not match the selected account",
    ERROR_RPC_INVALID_currency_not_supported:
        "The selected currency is not supported",
    ERROR_RPC_INTERNAL_failed_to_import_mnemonic:
        "Failed to import the mnemonic",
    ERROR_RPC_INTERNAL_failed_to_add_wallet: "Failed to add the wallet",
    ERROR_RPC_INTERNAL_failed_to_get_mnemonic: "Failed to backup mnemonic",
    ERROR_RPC_INTERNAL_failed_to_change_sign_mode: "Failed to change sign mode",
    ERROR_RPC_INTERNAL_failed_to_update_settings: "Failed to update settings",
    ERROR_RPC_NOT_FOUND_contact_not_found: "The contact was not found",
    ERROR_RPC_REJECTED_transaction_delegation_failed:
        "Failed to construct the transaction. The delegation failed",
    ERROR_PROVIDER_UNAUTHORIZED_failed_to_get_password:
        "Failed to get password",

    // Network
    NETWORK_mainnet: "Main",
    NETWORK_testnet: "Test",
    NETWORK_solo: "Solo",

    // Network Labels
    NETWORK_LABEL_select: "Select a network",
    NETWORK_LABEL_current: "Current Network",
    NETWORK_LABEL_custom: "Configure a custom network",

    // Notifications
    NOTIFICATION_signing_error:
        "There as an unexpected error signing the payload",
    NOTIFICATION_wallet_create_error: "Failed to create new wallet: ",
    NOTIFICATION_no_account_selected: "No account selected",
    NOTIFICATION_selected_account: "accounts selected",
    NOTIFICATION_wallet_create_passord_required: "Please provide a password",
    NOTIFICATION_connected_app_approval_failed: "Failed to approve app",
    NOTIFICATION_account_change_failed: "Failed to switch account",
    NOTIFICATION_account_changed: "You've switched to {alias}",
    NOTIFICATION_network_changed: "You have switched to {networkName} network",
    NOTIFICATION_token_confirm_delete_title:
        "Do you want to remove this token from your token list?",
    NOTIFICATION_token_confirm_delete_text:
        "You are about to remove {name} token from your token list",
    NOTIFICATION_empty_official_token:
        "You don’t have any official VeChain tokens added yet",
    NOTIFICATION_empty_custom_token:
        "You don’t have any custom tokens added yet",
    NOTIFICATION_token_toggle_error: "Failed to toggle token",
    NOTIFICATION_connected_app_removal_failure:
        "Failed to remove the application",
    NOTIFICATION_contact_add_failed: "Failed to add new contact",
    NOTIFICATION_contact_update_failed: "Failed to update the contact",
    NOTIFICATION_network_change_error: "Failed to change network",
    NOTIFICATION_mode_change_error: "Failed to change mode",
    NOTIFICATION_custom_network_failed: "Failed to add custom network",
    NOTIFICATION_failed_to_send_transaction: "Failed to send the transaction",
    NOTIFICATION_failed_to_sign_certificate: "Failed to sign the certificate",
    NOTIFICATION_invalid_password: "Invalid password",
    NOTIFICATION_failed_to_remove_wallet: "Failed to remove wallet",
    NOTIFICATION_failed_to_verify_mnemonic: "Failed to verify mnemonic",
    NOTIFICATION_failed_empty_words: "Failed empty words",
    NOTIFICATION_failed_paste_from_clipboard: "Failed paste from clipboard",
    NOTIFICATION_network_updated: "Network updated!",
    NOTIFICATION_network_update_failed: "Failed to update custom network",
    NOTIFICATION_network_delete_failed: "Failed to delete custom network",
    NOTIFICATION_password_reset_failed: "Failed to reset password",
    NOTIFICATION_failed_to_reset_app: "Failed to reset the app",
    NOTIFICATION_failed_to_lock: "Failed to lock the app",
    NOTIFICATION_ledger_details_not_found: "Ledger details not found",
    NOTIFICATION_contact_not_found: "Contact not found!",
    NOTIFICATION_failed_to_find_network: "Network not found!",
    NOTIFICATION_custom_token_failed: "Failed to add custom token",
    NOTIFICATION_transaction_reverted: "Transaction {txId} was reverted.",
    NOTIFICATION_view_on_explorer: "View on VeChain explorer",
    NOTIFICATION_found_token_transfer: "Found {token} transfer: {amount}",
    NOTIFICATION_unable_to_account: "Unable to {action} account",
    NOTIFICATION_unable_to_accounts: "Unable to {action} accounts",
    NOTIFICATION_could_not_update_network: "Could not update the network",
    NOTIFICATION_no_wallet_found:
        "No wallet found for the connected app request",
    NOTIFICATION_failed_to_build_transaction:
        "Failed to build the connected app transaction",
    NOTIFICATION_transaction_may_be_reverted:
        "Transaction may fail or be reverted",
    NOTIFICATION_failed_to_import_wallet: "Failed to import the wallet",
    NOTIFICATION_password_is_required: "Password is required",
    NOTIFICATION_failed_to_switch_account: "Failed to switch account",
    NOTIFICATION_failed_to_switch_to_requested_account:
        "Failed to switch to the requested account",
    NOTIFICATION_failed_to_process_the_transaction:
        "Failed to process the transaction",
    NOTIFICATION_failed_to_sign: "Failed to sign with Ledger",
    NOTIFICATION_address_not_valid: "Address not valid",

    // Accounts
    ACCOUNT_pick_account: "Pick the account you want to use",
    ACCOUNT_advanced_options: "Wallet Management",
    ACCOUNT_edit_account: "Edit Account",
    ACCOUNT_edit_account_description:
        "Your account name is used locally to identify each account, change it so you can easily recognise it",
    ACCOUNT_edit_wallet: "Edit Wallet",
    ACCOUNT_edit_wallet_description:
        "Your wallet name is used locally to identify each account, change it so you can easily recognise it",
    ACCOUNT_advanced_options_description:
        "Click the visibility icon of the accounts that you wish to be visible in account management",
    ACCOUNT_remove_wallet: "Remove Wallet",
    ACCOUNT_account_update_fail: "Account update fail",

    // Onboarding
    ONBOARDING_welcome_header: "Welcome to",
    ONBOARDING_welcome_intro_1: "The ",
    ONBOARDING_welcome_intro_2: "Future of Sustainable",
    ONBOARDING_welcome_intro_3: " Self-Custody Web",
    ONBOARDING_welcome_intro_4: "extension Wallet, ",
    ONBOARDING_welcome_intro_5: "Enabled By VeChain’s",
    ONBOARDING_welcome_intro_6: "Advanced Blockchain",
    ONBOARDING_welcome_intro_7: "Technology",
    ONBOARDING_welcome_accept_terms_1:
        "By pressing ‘get started’ you are agreeing to VeWorld’s ",
    ONBOARDING_welcome_accept_terms_2: " and ",
    ONBOARDING_welcome_accept_terms_3:
        ", compliant with Art. 5 GDPR (Required)",
    ONBOARDING_terms_and_conditions: "Terms and conditions",
    ONBOARDING_privacy_policy: "Privacy policy",
    ONBOARDING_welcome_button: "Get Started",
    ONBOARDING_welcome_button_dev: "Dev Mode Signup",
    ONBOARDING_first_access_slide_1_title: "Seamlessly manage your crypto",
    ONBOARDING_first_access_slide_1_text:
        "Viewing and managing your crypto assets has never been easier.",
    ONBOARDING_first_access_slide_1_button: "Sustainable",
    ONBOARDING_first_access_slide_2_title: "Sustainable",
    ONBOARDING_first_access_slide_2_text:
        "Using Innovative Green Technology, Continues Building The Future of Safe.",
    ONBOARDING_first_access_slide_2_button: "Safe and fast",
    ONBOARDING_first_access_slide_3_title: "Customizable, safe and fast",
    ONBOARDING_first_access_slide_3_text:
        "Wallet Extension provides a simpler and secured way to manage your coins.",
    ONBOARDING_first_access_slide_3_button: "Create password",
    ONBOARDING_first_access_skip: "Skip ahead to create password",
    ONBOARDING_password_header: "Create Password",
    ONBOARDING_password_intro:
        "This password will allow you to access your account after it was locked and to authorize password protected actions.",
    ONBOARDING_password_insert: "Insert password",
    ONBOARDING_password_confirm: "Confirm password",
    ONBOARDING_password_required: "Password required",
    ONBOARDING_wallet_header: "Let's Start",
    ONBOARDING_wallet_intro:
        "You can import your existing wallet, and retain all of your accounts and related transaction keys.",
    ONBOARDING_wallet_create_header: "Create Wallet",
    ONBOARDING_wallet_create_title: "Are you new to crypto?",
    ONBOARDING_wallet_create_text:
        "Create a new local wallet and immediately start enjoying the VeChain eco-system.",
    ONBOARDING_wallet_create_link: "About crypto wallets",
    ONBOARDING_wallet_create_button: "Create Wallet",
    ONBOARDING_wallet_import_title: "Do you already have an existing wallet?",
    ONBOARDING_wallet_import_text:
        "You can import your existing wallet, and retain all of your accounts and related transaction keys.",
    ONBOARDING_wallet_import_button: "Import Wallet",
    ONBOARDING_wallet_import_header: "Import Wallet",
    ONBOARDING_wallet_import_intro:
        "Select what type of wallet you want to import",
    ONBOARDING_wallet_import_local_title: "Local wallet",
    ONBOARDING_wallet_import_local_tooltip:
        "A local wallet stores public and private keys while providing an easy-to-use interface to manage crypto balances and perform transfers through the blockchain.",
    ONBOARDING_wallet_import_local_text:
        "You can import your existing wallet, use your 12 word recovery phrase to securely access your wallet.",
    ONBOARDING_wallet_import_hardware_title: "Hardware Wallet",
    ONBOARDING_wallet_import_hardware_tooltip:
        "A hardware wallet is a physical device used to store the private keys and keep them offline.",
    ONBOARDING_wallet_import_hardware_text:
        "You can import your existing wallet, and retain all of your accounts and related transaction keys.",
    ONBOARDING_wallet_featured_slide_1_title: "Secret recovery phrase",
    ONBOARDING_wallet_featured_slide_1_text:
        "The secret phrase is your only way to access your funds. This will be needed when importing your crypto wallet from or to VeWorld.",
    ONBOARDING_wallet_featured_slide_1_button: "Custody",
    ONBOARDING_wallet_featured_slide_2_title: "The key to your crypto",
    ONBOARDING_wallet_featured_slide_2_text:
        "If you lose this phrase you will lose access to all the funds available on your wallet. You should never share your secret phrase.",
    ONBOARDING_wallet_featured_slide_2_button: "Safety",
    ONBOARDING_wallet_featured_slide_3_title: "Keep your phrase safe",
    ONBOARDING_wallet_featured_slide_3_text:
        "You can write it down and store it somewhere safe, save it in an encrypted password manager or best of all memorize and never write it down.",
    ONBOARDING_wallet_featured_slide_3_button: "Secret Phrase",
    ONBOARDING_wallet_featured_skip: "Skip ahead to recovery phrase",
    ONBOARDING_verification_mnemonic_modal_copy: "Are you sure to proceed?",
    ONBOARDING_verification_mnemonic_modal_security:
        "Copying your mnemonic phrase is not recommended, the best way is to store it offline",
    ONBOARDING_mnemonic_copy_success:
        "Mnemonic copied to your clipboard successfully",

    // Page Titles
    PAGE_TITLE_account_management: "Account Management",
    PAGE_TITLE_manage_tokens: "Manage Tokens",
    PAGE_TITLE_add_token: "Add Token",
    PAGE_TITLE_connected_app_request_accounts: "External app connection",
    PAGE_TITLE_send_transaction: "Send a transaction",
    PAGE_TITLE_sign_certificate: "Sign Certificate",
    PAGE_TITLE_connected_app_success: "External App Connected",

    // Settings Connected Apps
    SETTINGS_CONN_APP_description:
        "You can find below all the connected applications. Use the button at right to revoke the connection to an app",
    SETTINGS_CONN_APP_revoke_connection: "Revoke connection",
    SETTINGS_CONN_APP_revoke_connection_description:
        "Are you sure you want to revoke the connection to {app_name}? The app would need to require access to the wallet again.",
    SETTINGS_CONN_APP_empty_connections:
        "You have no connected apps. Once you have any they would be displayed here",
    SETTINGS_CONN_APP_no_connections_found: "No apps found",
    SETTINGS_CONN_APP_search_connected_apps: "Search connected apps",

    // Settings Labels
    SETTINGS_LABEL_network_name: "Node Name",
    SETTINGS_LABEL_settings: "Settings",
    SETTINGS_LABEL_theme: "Theme",
    SETTINGS_LABEL_theme_description: "Select the general app theme",
    SETTINGS_LABEL_general: "General",
    SETTINGS_LABEL_advanced: "Advanced",
    SETTINGS_LABEL_networks: "Networks",
    SETTINGS_LABEL_contacts: "Contacts",
    SETTINGS_LABEL_security_privacy: "Security & Privacy",
    SETTINGS_LABEL_alerts: "Alerts",
    SETTINGS_LABEL_support: "Support",
    SETTINGS_LABEL_bug_report: "Bug Report",
    SETTINGS_LABEL_connected_apps: "Connected Applications",
    SETTINGS_LABEL_about: "About VeWorld",
    SETTINGS_LABEL_version: "Version",
    SETTINGS_LABEL_language: "Language",
    SETTINGS_LABEL_select_language: "Select your language",
    SETTINGS_LABEL_conversion_currency: "Conversion Currency",
    SETTINGS_LABEL_pick_the_currency:
        "Pick the currency that you prefer to be shown for conversions",
    SETTINGS_LABEL_hide_without_balance: "Hide tokens without a balance",
    SETTINGS_LABEL_hide_without_balance_description:
        "Tokens without a balance won't be shown in the assets list",
    SETTINGS_LABEL_unlock_15: '15"',
    SETTINGS_LABEL_unlock_30: '30"',
    SETTINGS_LABEL_unlock_60: '60"',
    SETTINGS_LABEL_auto_lock_time: "Auto Lock Timer",
    SETTINGS_LABEL_auto_lock_time_description:
        "How long should we wait to lock your wallet after it has been idle?",
    SETTINGS_LABEL_password_auth: "Password authorisation for transactions",
    SETTINGS_LABEL_password_auth_description:
        "Require the extension password when performing transactions with local wallets",
    SETTINGS_LABEL_state_logs: "State Logs",
    SETTINGS_LABEL_state_logs_description:
        "State logs contain your public account addresses and sent transactions",
    SETTINGS_LABEL_state_logs_download: "Download State Logs",
    SETTINGS_LABEL_veworld_reset: "VeWorld Reset",
    SETTINGS_LABEL_veworld_reset_description:
        "Click to reset VeWorld and erase all your data stored on it",
    SETTINGS_LABEL_confirm_reset: "Confirm Reset",
    SETTINGS_LABEL_confirm_reset_p1:
        "Resetting your account will log you out and erase all of your data stored locally (accounts, wallets, transaction history etc)",
    SETTINGS_LABEL_confirm_reset_p2:
        "This will not change the balances in your accounts but it will require you to re-enter your Secret Recovery Phrase.",
    SETTINGS_LABEL_make_sure_recovered:
        "Make sure you have backed up the recovery phrase of all of your wallets as this action is irreversible",
    SETTINGS_LABEL_understand_irreversible:
        "I am aware that this action is irreversible (required)",
    SETTINGS_LABEL_select_network: "Select a Network",
    SETTINGS_LABEL_select_network_description:
        "Select the network you wish to transact on",
    SETTINGS_LABEL_add_network: "Add Custom Network",
    SETTINGS_LABEL_add_network_details: "Add network details",
    SETTINGS_LABEL_edit_network: "Edit Custom Network",
    SETTINGS_LABEL_edit_network_details: "Modify network details",
    SETTINGS_LABEL_name_already_used: "Name already in use",
    SETTINGS_LABEL_address_already_used: "Address already in use",
    SETTINGS_LABEL_network_already_used: "Network already in use",
    SETTINGS_LABEL_custom_networks: "Custom networks",
    SETTINGS_LABEL_enter_valid_url: "Enter a valid URL",
    SETTINGS_LABEL_enter_valid_name: "Enter a valid name",
    SETTINGS_LABEL_show_test_conversion: "Other networks - show conversion",
    SETTINGS_LABEL_show_test_conversion_description:
        "Show fiat exchange rates when on other networks",
    SETTINGS_LABEL_show_test_net_flag: "Other networks - show indicator",
    SETTINGS_LABEL_show_test_net_flag_description:
        "Display an indicator when transacting on another network",
    SETTINGS_LABEL_add_contact: "Add Contact",
    SETTINGS_LABEL_contact_name: "Contact name",
    SETTINGS_LABEL_contact_list: "Your Contact List",
    SETTINGS_LABEL_contact_list_description:
        "Add friends and addresses you trust",
    SETTINGS_LABEL_add_edit_contact_description:
        "Add friends and addresses you trust, inserting the data required",
    SETTINGS_LABEL_edit_contact: "Edit Contact",
    SETTINGS_LABEL_enter_valid_address: "Please enter a valid VeChain address",
    SETTINGS_LABEL_reset_password: "Reset Password",
    SETTINGS_LABEL_backup_mnemonic: "Backup Mnemonic",
    SETTINGS_LABEL_backup_mnemonic_text: "Want to backup your mnemonic phrase?",
    SETTINGS_LABEL_analytics_tracking: "Analytics tracking",
    SETTINGS_LABEL_analytics_tracking_description:
        "I accept to be tracked by Analytics and for research and service quality purposes",
    SETTINGS_LABEL_reset_password_description: "Want to change your password?",
    SETTINGS_LABEL_enter_new_password: "Enter your new password",
    SETTINGS_LABEL_add_custom_token: "Add custom token",
    SETTINGS_LABEL_add_tokens_description:
        "You can add a token from the official VeChain token list or add a custom token",
    SETTINGS_LABEL_manage_tokens_official_text:
        "These are the tokens that you added from the official VeChain token list, they will appear in your dashboard",
    SETTINGS_LABEL_token_autocomplete_label: "Pick official VeChain token",
    SETTINGS_LABEL_your_tokens: "Your tokens",
    SETTINGS_LABEL_add_token: "Add token details",
    SETTINGS_LABEL_token_address: "Token address",
    SETTINGS_LABEL_show_completed_transactions: "Show completed transactions",
    SETTINGS_LABEL_show_completed_transactions_description:
        "Get warned when new transactions are authenticated on the blockchain",
    SETTINGS_LABEL_show_new_tokens: "New tokens",
    SETTINGS_LABEL_show_new_tokens_description:
        "Get warned when new tokens are added to your wallet",
    SETTINGS_LABEL_notification_type: "Notification type",
    SETTINGS_LABEL_notification_type_description:
        "Decide what type of notification you want to receive",
    SETTINGS_LABEL_notification_type_all: "Internal and system",
    SETTINGS_LABEL_notification_type_system: "System only",
    SETTINGS_LABEL_notification_type_internal: "Internal only",
    SETTINGS_LABEL_custom_tokens: "Custom tokens",
    SETTINGS_LABEL_custom_tokens_text:
        "These are the custom tokens that you added",
    SETTINGS_LABEL_connection_request: "Connection request",
    SETTINGS_LABEL_app_access: "is asking for access to:",
    SETTINGS_LABEL_token_name: "Token name",
    SETTINGS_LABEL_select_wallet_mnemonic:
        "Select the wallet you want to backup the mnemonic",
    SETTINGS_LABEL_download_logs_success: "State logs download successful",
    SETTINGS_LABEL_download_logs_error: "State logs download error",

    // Settings Currencies
    SETTINGS_CURRENCIES_eur: "Euro",
    SETTINGS_CURRENCIES_usd: "Dollar (US)",

    // Settings Languages
    SETTINGS_LANG_en_US: "English (United States)",
    SETTINGS_LANG_en_GB: "English (Great Britain)",
    SETTINGS_LANG_fr_FR: "French (France)",

    // Wallets New Local
    WALLET_NEW_LOCAL_recovery_info:
        "Your Secret Recovery Phrase makes it easy to back up and restore your account.",
    WALLET_NEW_LOCAL_recovery_protect:
        "This is your secret phrase that you should use to protect your VeChain wallet",
    WALLET_NEW_LOCAL_recovery_disclose:
        "Never disclose your Secret Recovery Phrase. Anyone with this phrase can take your VeChain cryptos forever.",
    WALLET_NEW_LOCAL_recovery_action:
        "Store this phrase in a password manager, write it down or memorize it.",
    WALLET_NEW_LOCAL_recovery_checkbox_1: "I state that ",
    WALLET_NEW_LOCAL_recovery_checkbox_2: "I have saved the secret phrase",
    WALLET_NEW_LOCAL_recovery_checkbox_3:
        " and I am aware that I am responsible if I lose it.",
    WALLET_NEW_LOCAL_mnemonic_info: "Enter the word indicated in the label",
    WALLET_NEW_LOCAL_mnemonic_password_label:
        "Insert {number}{suffix} word of your recovery phrase",
    WALLET_NEW_LOCAL_completed_header: "Congratulations",
    WALLET_NEW_LOCAL_completed_title: "You’re finally one of us!",
    WALLET_NEW_LOCAL_completed_text:
        "If you have any doubts about how the app works, please follow our documentation on ",
    WALLET_NEW_LOCAL_completed_link: "Vechain.org",

    // Wallets Import
    WALLET_IMPORT_local_header: "Import Local Wallet",
    WALLET_IMPORT_local_intro:
        "Import your wallet with your secret recovery phrase. Enter your wallet’s 12-words recovery phrase",
    WALLET_IMPORT_local_help: "Where can I find it?",
    WALLET_IMPORT_local_loader: "Verifying your secret phrase...",
    WALLET_IMPORT_hardware_header: "Import Hardware Wallet",
    WALLET_IMPORT_hardware_intro:
        "Select the hardware wallet from the overlay that will open. If you have problems loading, try it later.",
    WALLET_IMPORT_hardware_loader: "Loading your Ledger accounts...",
    WALLET_IMPORT_hardware_type: "What hardware wallet do you have?",
    WALLET_IMPORT_hardware_guide_title: "Plug in Ledger wallet",
    WALLET_IMPORT_hardware_guide_text:
        "Connect your wallet directly to your computer. Unlock your Ledger and open the browser extension. For more on using hardware wallet device, ",
    WALLET_IMPORT_hardware_guide_link: "click here",
    WALLET_IMPORT_hardware_help: "Contact support",
    WALLET_IMPORT_hardware_forget: "Forget this device",

    // Wallet Labels
    WALLET_LABEL_local: "Local",
    WALLET_LABEL_address: "Address",
    WALLET_LABEL_account_name: "Account {accountId}",
    WALLET_LABEL_account: "Account",
    WALLET_LABEL_mnemonic: "Mnemonic: ",
    WALLET_LABEL_type: "Type",
    WALLET_LABEL_your_accounts: "Your accounts",
    WALLET_LABEL_cached_addresses: "Previous addresses",
    WALLET_LABEL_your_contacts: "Your contacts",

    // Wallet Buttons
    WALLET_BTN_import_wallet: "Import Your Wallet",
    WALLET_BTN_add_account: "Add Account",
    WALLET_BTN_add_wallet: "Add wallet",
    WALLET_BTN_add_ledger_device: "Add Ledger Device",
    WALLET_BTN_generate_new_wallet: "Generate New Wallet",
    WALLET_BTN_sign_and_send_transaction: "Sign & Send",
    WALLET_BTN_sign: "Sign",
    WALLET_BTN_lock_wallet: "Lock wallet",

    // Wallet Validation
    WALLET_VALIDATION_message_address_required:
        "Please provide a valid address",
    WALLET_VALIDATION_transfer_message_amount_required_generic:
        "Please provide a valid amount",
    WALLET_VALIDATION_transfer_message_amount_greater_than_zero:
        "Please provide a valid amount",
    WALLET_VALIDATION_transfer_message_amount_less_than_balance:
        "Insufficient balance",
    WALLET_VALIDATION_transfer_message_insufficient_vtho: "Insufficient VTHO",
    WALLET_VALIDATION_invalid_password: "Invalid password",
    WALLET_VALIDATION_password_required: "Password required",
    WALLET_VALIDATION_validate_min_length: "Minimum length of {num} characters",
    WALLET_VALIDATION_password_mismatch: "Passwords do not match",
    WALLET_VALIDATION_word_required: "Word required",
    WALLET_VALIDATION_word_wrong: "Word is wrong",
    WALLET_VALIDATION_accept_terms: "Please accept the terms and conditions",

    // Wallet Titles
    WALLET_TITLE_send_transaction: "Send Transaction",
    WALLET_TITLE_sign_with_ledger: "Ledger Verification",
    WALLET_TITLE_add_ledger: "Add a new ledger",
    WALLET_TITLE_select_account: "Select an account",

    // Wallet Ledger
    WALLET_LEDGER_awaiting_connection:
        "Please confirm when you have connected and unlocked your Ledger",
    WALLET_LEDGER_connected: "Ledger Connected!",
    WALLET_LEDGER_please_open_app:
        "Please open the VET app in order to proceed",
    WALLET_LEDGER_app_not_opened: "VET app not open",
    WALLET_LEDGER_not_connected: "Not connected",
    WALLET_LEDGER_please_confirm_transaction:
        "Please, confirm the transaction on your device",
    WALLET_LEDGER_app_open: "VET App is open",
    WALLET_LEDGER_processing_transaction_data: "Processing transaction data...",
    WALLET_LEDGER_introductory_text:
        "Make sure your Ledger is unlocked and the VET app is open. If you're encountering any issues, please try to reopen the app or this dialog.",
    WALLET_LEDGER_already_connected: "Already connected",
    WALLET_LEDGER_already_connected_description:
        "This Ledger has already been added. You can add more accounts in account management",
    WALLET_LEDGER_not_recognised_description:
        "The account on this Ledger does not match the expected account. Please use the correct Ledger device",
    WALLET_LEDGER_not_recognised: "Ledger not recognised",

    // Transaction Labels
    TXN_LABEL_dapp_transaction: "DApp transaction",
    TXN_LABEL_signed_certificate: "Signed certificate",
    TXN_LABEL_clauses: "Clauses",
    TXN_LABEL_clause: "Clause",
    TXN_LABEL_outcome: "Outcome",
    TXN_LABEL_purpose: "Purpose",
    TXN_LABEL_content: "Content",

    // Unlock
    UNLOCK_welcome_back_to: "Welcome back to",
    UNLOCK_enter_password: "Enter your password to unlock your wallet",

    // Dashboard
    DASHBOARD_send: "Send",
    DASHBOARD_your_balance_title: "Your balance",
    DASHBOARD_your_tokens_title: "Your tokens",
    DASHBOARD_manage_tokens: "Manage Tokens",
    DASHBOARD_view_qr_code_title: "View QR Code",
    DASHBOARD_view_qr_code_text:
        "QR code. Scan this to copy this account address.",

    // Send
    SEND_send_title: "Send",
    SEND_no_tokens_found: "No tokens found",
    SEND_send_asset_text: "Select the asset that you want to transfer",
    SEND_send_input_search_placeholder: "Search your token",
    SEND_insert_amount: "Insert Amount",
    SEND_transaction_completed: "Transaction completed",
    SEND_transaction_authenticated_soon:
        "The transaction will be authenticated soon",
    SEND_use_address: "Use Address",

    // Send Confirm
    SEND_CONFIRM_user_sending_text: "You are sending",
    SEND_CONFIRM_user_sending_successfully_text: "You just sent",
    SEND_CONFIRM_estimated_fee: "Estimated fee",
    SEND_CONFIRM_estimated_time: "Estimated time",
    SEND_CONFIRM_less_than: "Less than",
    SEND_CONFIRM_token_cost: "Token value",
    SEND_CONFIRM_transaction_cost: "Transaction cost",

    // Activities
    ACTIVITIES_title_detail: "Activity Details",
    ACTIVITIES_about_transactions: "About shown transactions",
    ACTIVITIES_your_activities: "Your Activities",
    ACTIVITIES_your_transactions_desc:
        "Please notice that the transactions you see here are only the outgoing ones of the selected account performed via the current instance of VeWorld.",
    ACTIVITIES_empty_transactions:
        "Your transactions will be displayed here once you have any",
    ACTIVITIES_view_vechain_explorer: "View on Vechain explorer",
    ACTIVITIES_tx_id: "Transaction ID",
    ACTIVITIES_nonce: "Nonce",
    ACTIVITIES_gas_used: "Gas Used (Units)",
    ACTIVITIES_number_of_clauses: "Number of Clauses",
    ACTIVITIES_STATUS_pending: "Pending",
    ACTIVITIES_STATUS_success: "Success",
    ACTIVITIES_STATUS_reverted: "Reverted",
    ACTIVITIES_gas_payer: "Gas Payer",
    ACTIVITIES_block_number: "Block Number",
    ACTIVITIES_transaction_final: "Transaction Finality",
    ACTIVITIES_sent_fungible: "Sent fungible token",
    ACTIVITIES_received_fungible: "Received fungible token",

    // Transfers
    TRANSFER_your_transfers: "Your Token Transfers",
    TRANSFER_empty_transfers: "Empty Transfer",

    // Connected App
    CONNECTED_APP_signature_request: "Your Signature is being requested for:",
    CONNECTED_APP_origin: "Origin",
    CONNECTED_APP_contract_data: "Contract data",
    CONNECTED_APP_contract_call_data: "Contract call data",
    CONNECTED_APP_clause: "Clause",
    CONNECTED_APP_token_transfer: "Token Transfer",
    CONNECTED_APP_contract_deployment: "Contract Deployment",
    CONNECTED_APP_contract_call: "Contract Call",
    CONNECTED_APP_requested_account: "Request account: ",
    CONNECTED_APP_transaction_delegated: "Your transaction will be delegated",
    CONNECTED_APP_transaction_comment: "DApp transaction comment",

    // Connected App Labels
    CONNECTED_APP_LABEL_see_address: "See address",
    CONNECTED_APP_LABEL_account_balance: "Account balance",
    CONNECTED_APP_LABEL_suggest_approve: "Suggest Transactions to approve",
    CONNECTED_APP_LABEL_following_accounts: "The following accounts: ",
    CONNECTED_APP_LABEL_now_connected_with: "Are now connected with: ",
    CONNECTED_APP_LABEL_following_rights: "And have the following rights: ",

    // Tokens
    TOKEN_token_receive: "Receive",

    // NFTs
    NFT_title: "VeWorld NFT",
    NFT_subtitle: "Coming soon",
    NFT_box_1_title: "Artwork",
    NFT_box_1_text: "You can buy and manage your NFT artworks in our portal",
    NFT_box_2_title: "Smart Contract",
    NFT_box_2_text: "You can easily sign smart contracts with VeChain NFT",
    NFT_box_3_title: "Multi Task transaction",
    NFT_box_3_text:
        "Multi-function atomic transactions allow developers to batch payments",

    // Ledger Config
    LEDGER_CONFIG_01010007:
        "Multi-clause transactions are not enabled on your Ledger settings.",
    LEDGER_CONFIG_02010007:
        "Contract call transactions are not enabled on your Ledger settings.",
    LEDGER_CONFIG_00010007:
        "Multi-clause and contract call transactions are not enabled on your Ledger settings.",
}

export default en
