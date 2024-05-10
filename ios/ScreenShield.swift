//
//  ScreenShield.swift
//  VeWorld
//
//  Created by Vasileios  Gkreen on 09/05/24.
//



import UIKit
import SwiftUI


// MARK: UIKit
public class ScreenShield {
    
    public static let shared = ScreenShield()
    private var blurView: UIVisualEffectView?
    private var recordingObservation: NSKeyValueObservation?
        
    public func protectFromScreenRecording() {
        recordingObservation =  UIScreen.main.observe(\UIScreen.isCaptured, options: [.new]) { [weak self] screen, change in
            let isRecording = change.newValue ?? false
            
            if isRecording {
                self?.addBlurView()
            } else {
                self?.removeBlurView()
            }
        }
    }
    
    private func addBlurView() {
        let blurEffect = UIBlurEffect(style: .regular)
        let blurView = UIVisualEffectView(effect: blurEffect)
        blurView.frame = UIScreen.main.bounds
        
        // Add a label to the blur view
        let label = UILabel()
        label.text = "Screen recording not allowed"
        label.font = UIFont.boldSystemFont(ofSize: 20)
        label.textColor = .black
        label.translatesAutoresizingMaskIntoConstraints = false
        blurView.contentView.addSubview(label)
        NSLayoutConstraint.activate([
            label.centerXAnchor.constraint(equalTo: blurView.contentView.centerXAnchor),
            label.centerYAnchor.constraint(equalTo: blurView.contentView.centerYAnchor)
        ])
        
        self.blurView = blurView
        UIApplication.shared.windows.first { $0.isKeyWindow }?.addSubview(blurView)
    }
    
    private func removeBlurView() {
        blurView?.removeFromSuperview()
        blurView = nil
    }
}
