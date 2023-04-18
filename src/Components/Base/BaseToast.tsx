import React from "react"
import { StyleSheet } from "react-native"
import Toast, {
    BaseToast as BaseRNToastMessage,
    ErrorToast as BaseRNErrorToastMessage,
    BaseToastProps,
} from "react-native-toast-message"

const styles = StyleSheet.create({
    successStyle: { borderLeftColor: "pink" },
    successContainerStyle: { paddingHorizontal: 15 },
    successText1Style: {
        fontSize: 15,
        fontWeight: "400",
    },
    errorText1Style: {
        fontSize: 17,
    },
    errorText2Style: {
        fontSize: 15,
    },
})

/*
  1. Create the config
*/
const toastConfig = {
    /*
    Overwrite 'success' type,
    by modifying the existing `BaseToast` component
  */
    success: (props: BaseToastProps) => (
        <BaseRNToastMessage
            {...props}
            style={styles.successStyle}
            contentContainerStyle={styles.successContainerStyle}
            text1Style={styles.successText1Style}
        />
    ),
    /*
    Overwrite 'error' type,
    by modifying the existing `ErrorToast` component
  */
    error: (props: BaseToastProps) => (
        <BaseRNErrorToastMessage
            {...props}
            text1Style={styles.errorText1Style}
            text2Style={styles.errorText2Style}
        />
    ),
    /*
    Or create a completely new type - `tomatoToast`,
    building the layout from scratch.

    I can consume any custom `props` I want.
    They will be passed when calling the `show` method (see below)
  */
    //   tomatoToast: ({ text1, props }) => (
    //     <View style={{ height: 60, width: '100%', backgroundColor: 'tomato' }}>
    //       <Text>{text1}</Text>
    //       <Text>{props.uuid}</Text>
    //     </View>
    //   )
}

export const commonToastParams: {
    position: "top" | "bottom"
    visibilityTime: number
    autoHide: boolean
    topOffset: number
    bottomOffset: number
} = {
    position: "top",
    visibilityTime: 4000,
    autoHide: true,
    topOffset: 30,
    bottomOffset: 40,
}

export const BaseToast: React.FC = () => {
    return <Toast config={toastConfig} {...commonToastParams} />
}

export const hideToast = () => {
    Toast.hide()
}

export const showSuccessToast = (text1: string, text2?: string) => {
    Toast.show({
        type: "success",
        text1,
        text2,
    })
}

export const showErrorToast = (text1: string, text2?: string) => {
    Toast.show({
        type: "error",
        text1,
        text2,
    })
}

export const showInfoToast = (text1: string, text2?: string) => {
    Toast.show({
        type: "info",
        text1,
        text2,
    })
}

export const showWarningToast = (text1: string, text2?: string) => {
    Toast.show({
        type: "warning",
        text1,
        text2,
    })
}
