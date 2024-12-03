import { DecodedMessage } from "@xmtp/react-native-sdk"

export type VeChatMessage = Omit<DecodedMessage, "client" | "content"> & { msgContent: any }
