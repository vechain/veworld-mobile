import { createIconSet } from "@expo/vector-icons"
import designSystemIconMap from "~Assets/Fonts/DesignSystemIcons/DesignSystemIconMap.json"

export const DesignSystemIcon = createIconSet(
    designSystemIconMap,
    "DesignSystemIcons",
    require("~Assets/Fonts/DesignSystemIcons/DesignSystemIcons.ttf"),
)
