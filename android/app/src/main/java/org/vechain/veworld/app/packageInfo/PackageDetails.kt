package org.vechain.veworld.app.packageInfo

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments

import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.content.pm.SigningInfo
import android.content.pm.Signature
import android.util.Log
import android.content.Context
import android.content.pm.PackageManager.NameNotFoundException

import java.io.ByteArrayInputStream
import java.security.PublicKey
import java.security.cert.CertificateFactory
import java.security.cert.X509Certificate

import android.os.Build
import android.util.Base64

import org.vechain.veworld.app.BuildConfig

class PackageDetails(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    companion object {
        private const val TAG = "PackageDetails"
        
        // This is the base64 *body* of your PEM-encoded public key, e.g. everything
        // between the "-----BEGIN PUBLIC KEY-----" and "-----END PUBLIC KEY-----" lines
        // with no extra whitespace or line breaks.
        private val PUBLIC_KEY_PEM_BODY = BuildConfig.PUBLIC_KEY
    }

    private val context: Context = reactContext
    
    // State variables to store verification results
    private var packageName: String? = null
    private var versionName: String? = null
    private var versionCode: Int = 0
    private var isOfficial: Boolean = false

    init {
        Log.i(TAG, "PackageDetails constructor called")
        
        // Perform verification during construction so its only done once per app launch
        initializePackageInfo()
    }

    private fun initializePackageInfo() {
        try {
            // Choose the appropriate flag based on Android version
            val signatureFlag = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                PackageManager.GET_SIGNING_CERTIFICATES
            } else {
                PackageManager.GET_SIGNATURES
            }
            
            val pInfo = context.packageManager.getPackageInfo(
                context.packageName,
                signatureFlag
            )

            // Store basic package info in state variables
            this.packageName = pInfo.packageName
            this.versionName = pInfo.versionName
            this.versionCode = pInfo.versionCode

            // Verify signature
            this.isOfficial = false // Default to failed

            val sigs = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                // For newer devices
                val signingInfo = pInfo.signingInfo
                signingInfo.apkContentsSigners
            } else {
                // Legacy approach
                pInfo.signatures
            }

            if (sigs != null && sigs.isNotEmpty()) {
                // If any cert passes verification, we'll consider it verified
                for (sig in sigs) {
                    if (verifySignatureAgainstPublicKey(sig)) {
                        this.isOfficial = true
                        break
                    }
                }
            }
            
            Log.i(TAG, "Package verification completed during initialization. isOfficial: $isOfficial, packageName: $packageName")

        } catch (e: NameNotFoundException) {
            Log.e(TAG, "Package name not found during initialization", e)
            this.isOfficial = false
        } catch (e: Exception) {
            Log.e(TAG, "Error verifying package during initialization", e)
            this.isOfficial = false
        }
    }

    override fun getName(): String {
        return "PackageDetails"
    }

    @ReactMethod
    fun getPackageInfo(promise: Promise) {
        try {
            // Use the cached values instead of performing verification again
            val info = Arguments.createMap()
            info.putString("packageName", this.packageName)
            info.putString("versionName", this.versionName)
            info.putInt("versionCode", this.versionCode)
            info.putBoolean("isOfficial", this.isOfficial)
            
            promise.resolve(info)
        } catch (e: Exception) {
            Log.e(TAG, "Error retrieving package info", e)
            promise.reject("ERR_PACKAGE_INFO", "Error retrieving package info", e)
        }
    }

    /**
     * Converts the raw Signature bytes to an X.509 certificate and verifies it
     * against the known release public key. Returns true if valid, false otherwise.
     */
    private fun verifySignatureAgainstPublicKey(signature: Signature): Boolean {
        try {
            // Parse the app's signing cert from the raw bytes
            val certFactory = CertificateFactory.getInstance("X.509")
            val x509Cert = certFactory.generateCertificate(
                ByteArrayInputStream(signature.toByteArray())
            ) as X509Certificate
            
            // Parse PUBLIC_KEY_PEM_BODY as a certificate first, then get the public key
            val trustedCert = certFactory.generateCertificate(
                ByteArrayInputStream(Base64.decode(PUBLIC_KEY_PEM_BODY, Base64.DEFAULT))
            ) as X509Certificate
            val knownPublicKey = trustedCert.publicKey
    
            // Verify the certificate using the known public key
            x509Cert.verify(knownPublicKey)
    
            Log.i(TAG, "Certificate verification succeeded.")
            return true
        } catch (e: Exception) {
            // Any exception means verification failed
            Log.e(TAG, "Certificate verification failed: ", e)
            return false
        }
    }
} 