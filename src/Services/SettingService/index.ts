import AdvancedSettingsService from "./Advanced"
import ContactSettings from "./Contacts"
import GeneralSettingsService from "./General"
import NetworkService from "./Network"
import SecurityAndPrivacy from "./SecurityAndPrivacy"
import SettingService from "./SettingService"

const Settings = {
    ...SettingService,
    Advanced: AdvancedSettingsService,
    Contacts: ContactSettings,
    General: GeneralSettingsService,
    Network: NetworkService,
    SecurityAndPrivacy: SecurityAndPrivacy,
}

export default Settings
