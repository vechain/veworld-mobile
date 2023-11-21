import { Layout } from "~Components"
import { Header } from "~Screens"
import { StyleSheet, View } from "react-native"
import React, { useRef } from "react"
import WebView from "react-native-webview"
import { blake2b256, Certificate, HDNode, secp256k1 } from "thor-devkit"
import { WebViewMessageEvent } from "react-native-webview/src/WebViewTypes"

const mnemonic =
    "denial kitchen pet squirrel other broom bar gas better priority spoil cross"

type WindowRequest = {
    id: number
    method: "thor_signCertificate"
    origin: string
    msg: Connex.Vendor.CertMessage
    options: Connex.Signer.CertOptions
    genesisId: string
}

type WindowResponse = {
    id: number
    response: Connex.Vendor.CertResponse
    error?: any
}

export const InAppBrowser = () => {
    const webviewRef = useRef<WebView>()

    const onRequest = (event: WindowRequest) => {
        const hdNode = HDNode.fromMnemonic(mnemonic.split(" "))

        const cert: Certificate = {
            purpose: event.msg.purpose,
            payload: event.msg.payload,
            timestamp: Math.round(Date.now() / 1000),
            domain: new URL(event.origin).hostname,
            signer: hdNode.address,
        }

        const payload = blake2b256(Certificate.encode(cert))

        const res: Connex.Vendor.CertResponse = {
            annex: {
                signer: hdNode.address,
                domain: new URL(event.origin).hostname,
                timestamp: cert.timestamp,
            },
            signature: `0x${secp256k1
                .sign(payload, hdNode.privateKey!)
                .toString("hex")}`,
        }

        const windowResponse: WindowResponse = {
            id: event.id,
            response: res,
        }

        webviewRef.current?.injectJavaScript(
            `
setTimeout(function() { 
   postMessage(${JSON.stringify(windowResponse)}, "*")
}, 1);
            `,
        )
    }

    const onMessage = (event: WebViewMessageEvent) => {
        const data = JSON.parse(event.nativeEvent.data) as WindowRequest

        if (data.method === "thor_signCertificate") {
            return onRequest(data)
        }
    }

    return (
        <Layout
            fixedHeader={<Header />}
            noBackButton
            noMargin
            fixedBody={
                <>
                    <View style={styles.container}>
                        <WebView
                            ref={webviewRef}
                            source={{
                                uri: "https://veworld-dapp-vecha.in",
                            }}
                            javaScriptEnabled={true}
                            onMessage={onMessage}
                            style={styles.loginWebView}
                            scalesPageToFit={true}
                            injectedJavaScriptBeforeContentLoaded={injectedJs}
                        />
                    </View>
                </>
            }
        />
    )
}

const injectedJs = `
function newResponseHandler(id) {
    return new Promise((resolve, reject) => {
        addEventListener("message", event => {
            try {
                const data = event.data

                if (data.error) {
                    reject(data.error)
                } else {
                    console.log("resolve", data.response)
                    resolve(data.response)
                }
            } catch (e) {
                console.error(e.message)
            }
        })
    })
}

window.vechain = {
    isVeWorld: true,
    newConnexSigner: function (genesisId) {
        return {
            signTx(msg, options) {
                const request = {
                    id:
                        Math.floor(Math.random() * (10000000 - 1000000 + 1)) +
                        1000000,
                    method: "thor_sendTransaction",
                    origin: window.origin,
                    msg,
                    options,
                    genesisId,
                }

                window.ReactNativeWebView.postMessage(JSON.stringify(request))

                return newResponseHandler(request.id)
            },

            signCert(msg, options) {
                const request = {
                    id:
                        Math.floor(Math.random() * (10000000 - 1000000 + 1)) +
                        1000000,
                    method: "thor_signCertificate",
                    origin: window.origin,
                    msg,
                    options,
                    genesisId,
                }

                window.ReactNativeWebView.postMessage(JSON.stringify(request))

                return newResponseHandler(request.id)
            },
        }
    },
}
`

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "stretch",
    },
    loginWebView: {
        flex: 1,
        marginTop: 30,
        marginBottom: 20,
    },
})
