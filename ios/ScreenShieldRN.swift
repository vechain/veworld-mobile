//
//  ScreenShieldRN.swift
//  VeWorld
//
//  Created by Vasileios  Gkreen on 09/05/24.
//

import Foundation
import UIKit

@objc(ScreenShieldRN)
class ScreenShieldRN: UIViewController {
  
  
    @objc func protectScreenRecording() {
        ScreenShield.shared.protectFromScreenRecording()
    }
  

    @objc static func requiresMainQueueSetup() -> Bool {
        return true
    }
}
