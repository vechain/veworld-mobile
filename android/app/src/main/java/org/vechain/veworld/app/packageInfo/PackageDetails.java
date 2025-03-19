package org.vechain.veworld.app.packageInfo;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.SigningInfo;
import android.content.pm.Signature;
import android.util.Log;
import android.content.Context;
import android.content.pm.PackageManager.NameNotFoundException;

import java.io.ByteArrayInputStream;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.security.spec.X509EncodedKeySpec;

import android.os.Build;
import android.util.Base64;

import org.vechain.veworld.app.BuildConfig;

public class PackageDetails extends ReactContextBaseJavaModule {
    private static final String TAG = "PackageDetails";

    // This is the base64 *body* of your PEM-encoded public key, e.g. everything
    // between the "-----BEGIN PUBLIC KEY-----" and "-----END PUBLIC KEY-----" lines
    // with no extra whitespace or line breaks.
    private static final String PUBLIC_KEY_PEM_BODY = BuildConfig.PUBLIC_KEY;

    private final Context context;
    
    // State variables to store verification results
    private String packageName;
    private String versionName;
    private int versionCode;
    private boolean isOfficial = false;

    public PackageDetails(ReactApplicationContext reactContext) {
        super(reactContext);
        this.context = reactContext;
        Log.i(TAG, "PackageDetails constructor called");
        
        // Perform verification during construction so its only done once per app launch
        initializePackageInfo();
    }

    private void initializePackageInfo() {
        try {
            // Choose the appropriate flag based on Android version
            int signatureFlag;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                signatureFlag = PackageManager.GET_SIGNING_CERTIFICATES;
            } else {
                signatureFlag = PackageManager.GET_SIGNATURES;
            }
            
            PackageInfo pInfo = context.getPackageManager().getPackageInfo(
                    context.getPackageName(),
                    signatureFlag
            );

            // Store basic package info in state variables
            this.packageName = pInfo.packageName;
            this.versionName = pInfo.versionName;
            this.versionCode = pInfo.versionCode;

            // Verify signature
            this.isOfficial = false; // Default to failed

            Signature[] sigs;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                // For newer devices
                SigningInfo signingInfo = pInfo.signingInfo;
                sigs = signingInfo.getApkContentsSigners();
            } else {
                // Legacy approach
                sigs = pInfo.signatures;
            }

            if (sigs != null && sigs.length > 0) {
                // If any cert passes verification, we'll consider it verified
                for (Signature sig : sigs) {
                    if (verifySignatureAgainstPublicKey(sig)) {
                        this.isOfficial = true;
                        break;
                    }
                }
            }
            
            Log.i(TAG, "Package verification completed during initialization. isOfficial: " + this.isOfficial + ", packageName: " + this.packageName);

        } catch (NameNotFoundException e) {
            Log.e(TAG, "Package name not found during initialization", e);
            this.isOfficial = false;
        } catch (Exception e) {
            Log.e(TAG, "Error verifying package during initialization", e);
            this.isOfficial = false;
        }
    }

    @Override
    public String getName() {
        return "PackageDetails";
    }

    @ReactMethod
    public void getPackageInfo(Promise promise) {
        try {
            // Use the cached values instead of performing verification again
            WritableMap info = Arguments.createMap();
            info.putString("packageName", this.packageName);
            info.putString("versionName", this.versionName);
            info.putInt("versionCode", this.versionCode);
            info.putBoolean("isOfficial", this.isOfficial);
            
            promise.resolve(info);
        } catch (Exception e) {
            Log.e(TAG, "Error retrieving package info", e);
            promise.reject("ERR_PACKAGE_INFO", "Error retrieving package info", e);
        }
    }

    /**
     * Converts the raw Signature bytes to an X.509 certificate and verifies it
     * against the known release public key. Returns true if valid, false otherwise.
     */
    private boolean verifySignatureAgainstPublicKey(Signature signature) {
        try {
            // Parse the app's signing cert from the raw bytes
            CertificateFactory certFactory = CertificateFactory.getInstance("X.509");
            X509Certificate x509Cert = (X509Certificate) certFactory.generateCertificate(
                new ByteArrayInputStream(signature.toByteArray())
            );
            
            // Parse PUBLIC_KEY_PEM_BODY as a certificate first, then get the public key
            X509Certificate trustedCert = (X509Certificate) certFactory.generateCertificate(
                new ByteArrayInputStream(Base64.decode(PUBLIC_KEY_PEM_BODY, Base64.DEFAULT))
            );
            PublicKey knownPublicKey = trustedCert.getPublicKey();
    
            // Verify the certificate using the known public key
            x509Cert.verify(knownPublicKey);
    
            Log.i(TAG, "Certificate verification succeeded.");
            return true;
        } catch (Exception e) {
            // Any exception means verification failed
            Log.e(TAG, "Certificate verification failed: ", e);
            return false;
        }
    }
}