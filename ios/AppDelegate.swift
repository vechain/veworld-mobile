import UIKit
import React
import RNBootSplash
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
class AppDelegate: RCTAppDelegate {
  
  override func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
        self.moduleName = "VeWorld"
        self.dependencyProvider = RCTAppDependencyProvider()
    
        // You can add your custom initial props in the dictionary below.
        // They will be passed down to the ViewController used by React Native.
        self.initialProps = [:]

        let didFinish = super.application(application, didFinishLaunchingWithOptions: launchOptions)

        
        return didFinish
      }

      override func customize(_ rootView:RCTRootView!) {
        super.customize(rootView)
        // Initialize the splash screen
        RNBootSplash.initWithStoryboard("BootSplash", rootView: rootView)

      }
  
      override func sourceURL(for bridge: RCTBridge?) -> URL {
  #if DEBUG
          return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry")!
  #else
          return Bundle.main.url(forResource: "main", withExtension: "jsbundle")!
  #endif
      }
    
    override func applicationDidEnterBackground(_ application: UIApplication) {
        let secureView = UIView(frame: self.window.bounds ?? .zero)
        secureView.tag = 9824684
        secureView.backgroundColor = UIColor(red: 0.035, green: 0.0078, blue: 0.184, alpha: 1)
        
        let imageViewWidth: CGFloat = 100
        let imageViewHeight: CGFloat = 91
        let xPosition = (secureView.frame.width - imageViewWidth) / 2
        let yPosition = (secureView.frame.height - imageViewHeight) / 2
        
        let imageView = UIImageView(frame: CGRect(x: xPosition, y: yPosition, width: imageViewWidth, height: imageViewHeight))
        imageView.contentMode = .scaleAspectFit
        imageView.image = UIImage(named: "BootSplashLogo")
        
        secureView.addSubview(imageView)
        self.window.addSubview(secureView)
    }
    
    override func applicationWillEnterForeground(_ application: UIApplication) {
        self.window.viewWithTag(9824684)?.removeFromSuperview()
    }
    
    // func application(
    //     _ application: UIApplication,
    //     continue userActivity: NSUserActivity,
    //     restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
    // ) -> Bool {
    //     return RCTLinkingManager.application(application, continue: userActivity, restorationHandler: restorationHandler)
    // }
    
    // func application(
    //     _ application: UIApplication,
    //     open url: URL,
    //     options: [UIApplication.OpenURLOptionsKey: Any] = [:]
    // ) -> Bool {
    //     return RCTLinkingManager.application(application, open: url, options: options)
    // }
    
    private func clearKeychainIfNecessary() {
        let hasRunBefore = UserDefaults.standard.bool(forKey: "HAS_RUN_BEFORE")
        if !hasRunBefore {
            UserDefaults.standard.set(true, forKey: "HAS_RUN_BEFORE")
            let secItemClasses: [CFString] = [
                kSecClassGenericPassword,
                kSecClassInternetPassword,
                kSecClassCertificate,
                kSecClassKey,
                kSecClassIdentity
            ]
            
            for secItemClass in secItemClasses {
                let spec: [String: Any] = [kSecClass as String: secItemClass]
                SecItemDelete(spec as CFDictionary)
            }
        }
    }
}
