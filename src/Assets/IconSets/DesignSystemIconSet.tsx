import { createIconSet } from "@expo/vector-icons"

import designSystemIconMap from "~Assets/IconSets/DesignSystemIconMap.json"

export const DesignSystemIcon = createIconSet(
    designSystemIconMap,
    "DesignSystemIcons",
    require("~Assets/IconSets/DesignSystemIcons.ttf"),
)
