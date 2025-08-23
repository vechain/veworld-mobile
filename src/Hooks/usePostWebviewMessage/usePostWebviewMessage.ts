import { MutableRefObject, useCallback } from "react"
import WebView from "react-native-webview"

export const usePostWebviewMessage = (ref: MutableRefObject<WebView<{}> | undefined>) => {
    const postWebviewMessage = useCallback(
        (msg: unknown) => {
            ref.current?.injectJavaScript(
                `
                    setTimeout(function() { 
                    postMessage(${JSON.stringify(msg)}, "*")
                    }, 1);
                    `,
            )
        },
        [ref],
    )

    return postWebviewMessage
}
