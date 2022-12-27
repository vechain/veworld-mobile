//
//  SampleNativeModule.swift
//  veWorldMobile
//
//  Created by Vasileios  Gkreen on 23/12/22.
//

import Foundation



@objc(SampleNativeModule)
class SampleNativeModule: NSObject {
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
  
  @objc
  func getText(_ text: String,
               resolve: @escaping(RCTPromiseResolveBlock),
               rejecter reject: @escaping(RCTPromiseRejectBlock)) -> Void
  {
    if text.isEmpty {
      let error = NSError(domain: "", code: 404, userInfo: nil)
      reject("NativeScrypt", error.localizedDescription, error)
    }
    
    resolve("Hello \(text)")
  }
}
