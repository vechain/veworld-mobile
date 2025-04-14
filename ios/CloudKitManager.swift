//
//  CloudKitManager.swift
//  VeWorld
//
//  Created by Vasileios  Gkreen on 20/06/24.
//

import React
import Foundation

#if !targetEnvironment(macCatalyst)
import CloudKit
#endif


@objc(CloudKitManager)
class CloudKitManager: NSObject {
    
  private enum Constants {
    static let fileNameWallet = "VEWORLD_WALLET"
    static let fileNameSalt = "SALT"
    static let fileNameIV = "IV"
    static let salt = "salt"
    static let iv = "iv"
    static let rootAddress = "rootAddress"
    static let walletType = "walletType"
    static let data = "data"
    static let derivationPath = "derivationPath"
    static let firstAccountAddress = "firstAccountAddress"
    static let creationDate = "creationDate"
    static let walletZone = "WALLET_ZONE"
    static let saltZone = "SALT_ZONE"
    static let ivZone = "IV_ZONE"
  }
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
  
  @objc
  func checkCloudKitAvailability(_ resolve: @escaping(RCTPromiseResolveBlock), rejecter reject: @escaping(RCTPromiseRejectBlock)) -> Void {
    CKContainer.default().accountStatus { (accountStatus, error) in
      if let error = error {
        self.handleError(error, reject: reject)
      } else {
        if accountStatus == .available {
          resolve(true)
        }
      }
    }
  }
  
  
  private func handleError(_ error: Error?, reject: RCTPromiseRejectBlock, domain: String = "ICLOUD", code: Int = 420, defaultMessage: String = "iCloud operation failed") {
    if let error = error {

      if let ckError = error as? CKError {
        switch ckError.code {
          
        // Service related stuff code - 411
        case .networkUnavailable:
          print("Network is unavailable")
          let nsError = NSError(domain: String(411), code: 411, userInfo: [NSLocalizedDescriptionKey: error.localizedDescription])
          reject(domain, "Network is unavailable", nsError)
        case .networkFailure:
          print("Network failure occurred")
          let nsError = NSError(domain: String(411), code: 411, userInfo: [NSLocalizedDescriptionKey: error.localizedDescription])
          reject(domain, "Network failure occurred", nsError)
        case .serviceUnavailable:
          print("Service is unavailable")
          let nsError = NSError(domain: String(411), code: 411, userInfo: [NSLocalizedDescriptionKey: error.localizedDescription])
          reject(domain, "Service is unavailable", nsError)
        case .requestRateLimited:
          print("Request rate is limited")
          let nsError = NSError(domain: String(411), code: 411, userInfo: [NSLocalizedDescriptionKey: error.localizedDescription])
          reject(domain, "Request rate is limited", nsError)
          
        // Wallet/User related stuff code - 122
        case .unknownItem:
          print("Unknown item")
          let nsError = NSError(domain: String(122), code: 122, userInfo: [NSLocalizedDescriptionKey: error.localizedDescription])
          reject(domain, "Unknown item", nsError)
        case .invalidArguments:
          print("Invalid arguments")
          let nsError = NSError(domain: String(122), code: 122, userInfo: [NSLocalizedDescriptionKey: error.localizedDescription])
          reject(String(122), "Invalid arguments", nsError)
        case .serverRejectedRequest:
          print("iCloud server rejected the request")
          let nsError = NSError(domain: String(122), code: 122, userInfo: [NSLocalizedDescriptionKey: error.localizedDescription])
          reject(domain, "iCloud server rejected the request", nsError)
        case .assetFileNotFound:
          print("Wallet not found on iCloud")
          let nsError = NSError(domain: String(122), code: 122, userInfo: [NSLocalizedDescriptionKey: error.localizedDescription])
          reject(domain, "Wallet not found on iCloud", nsError)
        case .assetNotAvailable:
          print("Wallet not found on iCloud")
          let nsError = NSError(domain: String(122), code: 122, userInfo: [NSLocalizedDescriptionKey: error.localizedDescription])
          reject(domain, "Wallet not found on iCloud", nsError)

        // User relate stuff code - 233
        case .quotaExceeded:
          print("iCloud quota exceeded")
          let nsError = NSError(domain: String(233), code: 233, userInfo: [NSLocalizedDescriptionKey: error.localizedDescription])
          reject(domain, "iCloud quota exceeded", nsError)
        case .managedAccountRestricted:
          print("Account restricted")
          let nsError = NSError(domain: String(233), code: 233, userInfo: [NSLocalizedDescriptionKey: error.localizedDescription])
          reject(domain, "Account restricted", nsError)
        case .participantMayNeedVerification:
          print("User may need verification on iCloud")
          let nsError = NSError(domain: String(233), code: 233, userInfo: [NSLocalizedDescriptionKey: error.localizedDescription])
          reject(domain, "User may need verification on iCloud", nsError)
        case .accountTemporarilyUnavailable:
          print("iCloud temporarily unavailable")
          let nsError = NSError(domain: String(233), code: 233, userInfo: [NSLocalizedDescriptionKey: error.localizedDescription])
          reject(domain, "iCloud temporarily unavailable", nsError)

          // code 001
        default:
          let nsError = NSError(domain: String(001), code: 001, userInfo: [NSLocalizedDescriptionKey: error.localizedDescription])
          reject(domain, error.localizedDescription, nsError)
        }
      } else {
        print("Internal iCloud error log: \(String(describing: error))")
        let nsError = NSError(domain: String(000), code: 000, userInfo: [NSLocalizedDescriptionKey: error.localizedDescription])
        reject(domain, error.localizedDescription, nsError)
      }
    } else {
      let nsError = NSError(domain: String(000), code: 000, userInfo: [NSLocalizedDescriptionKey: defaultMessage])
      reject(domain, defaultMessage, nsError)
    }
  }
  
  
  @available(iOS 15.0, *)
  @objc
  func saveToCloudKit(_ rootAddress: String, data: String, walletType: String, firstAccountAddress: String, derivationPath: String, resolver: @escaping(RCTPromiseResolveBlock), rejecter reject: @escaping(RCTPromiseRejectBlock)) -> Void {
    
    let recordID = CKRecord.ID(recordName: "\(Constants.walletZone)_\(rootAddress)")
    let wallet = CKRecord(recordType: Constants.fileNameWallet, recordID: recordID)
    wallet[Constants.rootAddress] = rootAddress as CKRecordValue
    wallet[Constants.walletType] = walletType  as CKRecordValue
    wallet[Constants.firstAccountAddress] = firstAccountAddress as CKRecordValue
    wallet[Constants.derivationPath] = derivationPath as CKRecordValue
    wallet.encryptedValues[Constants.data] = data
    
    CKContainer.default().privateCloudDatabase.save(wallet) { [weak self] record, error in
      guard let self = self else { return }
      
      if let error = error {
        self.handleError(error, reject: reject)
      } else {
        print("Wallet saved successfullt on iCloud")
        resolver(true)
      }
    }
  }
  
  
  @available(iOS 15.0, *)
  @objc
  func getAllFromCloudKit(_ resolve: @escaping(RCTPromiseResolveBlock), rejecter reject: @escaping(RCTPromiseRejectBlock)) -> Void {
    
    let pred = NSPredicate(value: true)
    let sort = NSSortDescriptor(key: "creationDate", ascending: false)
    let query = CKQuery(recordType: Constants.fileNameWallet, predicate: pred)
    query.sortDescriptors = [sort]
    
    let operation = CKQueryOperation(query: query)
    operation.desiredKeys = [Constants.rootAddress, Constants.walletType, Constants.data, Constants.firstAccountAddress, Constants.creationDate, Constants.derivationPath]
    
    var wallets = [[AnyHashable : Any]]()
    
    operation.recordFetchedBlock = { [weak self] record in
      guard let self = self else { return }
      
      do {
        if let rootAddress = record[Constants.rootAddress] as? String,
           let walletType = record[Constants.walletType] as? String,
           let firstAccountAddress = record[Constants.firstAccountAddress] as? String,
           let derivationPath = record[Constants.derivationPath] as? String,
           let data = record.encryptedValues[Constants.data] as? String {
          
          let wallet = [
            Constants.rootAddress : rootAddress,
            Constants.walletType : walletType,
            Constants.firstAccountAddress : firstAccountAddress,
            Constants.derivationPath : derivationPath,
            Constants.creationDate : (record.creationDate?.timeIntervalSince1970 ?? Date().timeIntervalSince1970) as TimeInterval,
            Constants.data : data,
          ] as [AnyHashable : Any]
          
          wallets.append(wallet)
          
        } else {
          print("Record data is missing or invalid")
        }
      }
    }
    
    operation.queryCompletionBlock = {  [weak self] cursor, error in
      guard let self = self else { return }
      
      if error != nil {
        self.handleError(error, reject: reject)
      } else {
        resolve(wallets)
      }
    }
    
    CKContainer.default().privateCloudDatabase.add(operation)
  }
  
  
  
  @available(iOS 15.0, *)
  @objc
  func getWallet(_ rootAddress: String, resolver: @escaping(RCTPromiseResolveBlock), rejecter reject: @escaping(RCTPromiseRejectBlock)) -> Void {
    
    let pred = NSPredicate(format: "\(Constants.rootAddress)=%@", rootAddress)
    let query = CKQuery(recordType: Constants.fileNameWallet, predicate: pred)
    let operation = CKQueryOperation(query: query)
    operation.desiredKeys = [Constants.rootAddress, Constants.walletType, Constants.data, Constants.firstAccountAddress, Constants.creationDate, Constants.derivationPath]
    
    var wallet: [AnyHashable : Any] = [:]
    
    operation.recordFetchedBlock = { record in
      
      wallet = [
        Constants.rootAddress : record[Constants.rootAddress] as! String,
        Constants.walletType : record[Constants.walletType] as! String,
        Constants.firstAccountAddress : record[Constants.firstAccountAddress] as! String,
        Constants.derivationPath : record[Constants.derivationPath] as! String,
        Constants.creationDate : (record.creationDate?.timeIntervalSince1970 ?? Date().timeIntervalSince1970) as TimeInterval,
        Constants.data : record.encryptedValues[Constants.data] as! String,
      ] as [AnyHashable : Any]
    }
    
    operation.queryCompletionBlock = { [weak self] cursor, error in
      guard let self = self else { return }
      
      if error != nil {
        self.handleError(error, reject: reject)
      } else {
        resolver(wallet.isEmpty ? nil : wallet)
      }
    }
    
    CKContainer.default().privateCloudDatabase.add(operation)
  }
  
  
  @available(iOS 15.0, *)
  @objc
  func saveSalt(_ rootAddress: String, salt: String, resolver: @escaping(RCTPromiseResolveBlock), rejecter reject: @escaping(RCTPromiseRejectBlock)) -> Void {
    
    let recordID = CKRecord.ID(recordName: "\(Constants.saltZone)_\(rootAddress)")
    let _salt = CKRecord(recordType: Constants.fileNameSalt, recordID: recordID)
    _salt.encryptedValues[Constants.salt] = salt
    
    CKContainer.default().privateCloudDatabase.save(_salt) { [weak self] record, error in
      guard let self = self else { return }
      
      if (error != nil) {
        self.handleError(error, reject: reject)
      } else {
        print("Salt saved successfullt on iCloud")
        resolver(true)
      }
    }
  }
  
  
  @available(iOS 15.0, *)
  @objc
  func saveIV(_ rootAddress: String, iv: String, resolver: @escaping(RCTPromiseResolveBlock), rejecter reject: @escaping(RCTPromiseRejectBlock)) -> Void {
    
    let recordID = CKRecord.ID(recordName: "\(Constants.ivZone)_\(rootAddress)")
    let _iv = CKRecord(recordType: Constants.fileNameIV, recordID: recordID)
    _iv.encryptedValues[Constants.iv] = iv
    
    CKContainer.default().privateCloudDatabase.save(_iv) {  [weak self] record, error in
      guard let self = self else { return }
      
      if (error != nil) {
        self.handleError(error, reject: reject)
      } else {
        print("IV saved successfullt on iCloud")
        resolver(true)
      }
    }
  }
  
  
  @available(iOS 15.0, *)
  @objc
  func getSalt(_ rootAddress: String, resolver: @escaping(RCTPromiseResolveBlock), rejecter reject: @escaping(RCTPromiseRejectBlock)) -> Void {
    
    let recordID: CKRecord.ID = CKRecord.ID(recordName: "\(Constants.saltZone)_\(rootAddress)")
    let pred = NSPredicate(format: "recordID=%@", recordID)
    let query = CKQuery(recordType: Constants.fileNameSalt, predicate: pred)
    let operation = CKQueryOperation(query: query)
    operation.desiredKeys =  [Constants.salt]
    
    var salt: [AnyHashable : Any] = ["" : ""]
    
    operation.recordFetchedBlock = { record in
      salt = [
        Constants.salt : record.encryptedValues[Constants.salt] as! String,
      ] as [AnyHashable : Any]
    }
    
    operation.queryCompletionBlock = { [weak self] cursor, error in
      guard let self = self else { return }
      
      if error != nil {
        self.handleError(error, reject: reject)
      } else {
        resolver(salt)
      }
    }
    
    CKContainer.default().privateCloudDatabase.add(operation)
  }
  
  
  @available(iOS 15.0, *)
  @objc
  func getIV(_ rootAddress: String, resolver: @escaping(RCTPromiseResolveBlock), rejecter reject: @escaping(RCTPromiseRejectBlock)) -> Void {
    
    let recordID: CKRecord.ID = CKRecord.ID(recordName: "\(Constants.ivZone)_\(rootAddress)")
    let pred = NSPredicate(format: "recordID=%@", recordID)
    let query = CKQuery(recordType: Constants.fileNameIV, predicate: pred)
    let operation = CKQueryOperation(query: query)
    operation.desiredKeys =  [Constants.iv]
    
    var iv: [AnyHashable : Any] = ["" : ""]
    
    operation.recordFetchedBlock = { record in
      iv = [
        Constants.iv : record.encryptedValues[Constants.iv] as! String,
      ] as [AnyHashable : Any]
    }
    
    operation.queryCompletionBlock = { [weak self] cursor, error in
      guard let self = self else { return }
      
      if error != nil {
        self.handleError(error, reject: reject)
      } else {
        resolver(iv)
      }
    }
    
    CKContainer.default().privateCloudDatabase.add(operation)
  }
  
  
  @available(iOS 15.0, *)
  @objc
  func deleteWallet(_ rootAddress: String, resolver: @escaping(RCTPromiseResolveBlock), rejecter reject: @escaping(RCTPromiseRejectBlock)) -> Void {
    
    let pred = NSPredicate(format: "\(Constants.rootAddress) == %@", rootAddress)
    let query = CKQuery(recordType: Constants.fileNameWallet, predicate: pred)
    let operation = CKQueryOperation(query: query)
    
    operation.recordFetchedBlock = { record in
      let id = record.recordID
      
      CKContainer.default().privateCloudDatabase.delete(withRecordID: id) { [weak self] record, error in
        guard let self = self else { return }
        
        if error != nil {
          self.handleError(error, reject: reject)
        }
      }
    }
    
    operation.queryCompletionBlock = { [weak self] cursor, error in
      guard let self = self else { return }
      
      if error != nil {
        self.handleError(error, reject: reject)
      } else {
        resolver(true)
      }
    }
    
    CKContainer.default().privateCloudDatabase.add(operation)
  }
  
  
  @available(iOS 15.0, *)
  @objc
  func deleteSalt(_ rootAddress: String, resolver: @escaping(RCTPromiseResolveBlock), rejecter reject: @escaping(RCTPromiseRejectBlock)) -> Void {
    
    let recordID: CKRecord.ID = CKRecord.ID(recordName: "\(Constants.saltZone)_\(rootAddress)")
    let pred = NSPredicate(format: "recordID=%@", recordID)
    let query = CKQuery(recordType: Constants.fileNameSalt, predicate: pred)
    let operation = CKQueryOperation(query: query)
    
    operation.recordFetchedBlock = { record in
      let id = record.recordID
      
      CKContainer.default().privateCloudDatabase.delete(withRecordID: id) { [weak self] record, error in
        guard let self = self else { return }
        
        if error != nil {
          self.handleError(error, reject: reject)
        }
      }
    }
    
    operation.queryCompletionBlock = { [weak self] cursor, error in
      guard let self = self else { return }
      
      if error != nil {
        self.handleError(error, reject: reject)
      } else {
        resolver(true)
      }
    }
    
    CKContainer.default().privateCloudDatabase.add(operation)
  }
  
  
  @available(iOS 15.0, *)
  @objc
  func deleteIV(_ rootAddress: String, resolver: @escaping(RCTPromiseResolveBlock), rejecter reject: @escaping(RCTPromiseRejectBlock)) -> Void {
    
    let recordID: CKRecord.ID = CKRecord.ID(recordName: "\(Constants.ivZone)_\(rootAddress)")
    let pred = NSPredicate(format: "recordID=%@", recordID)
    let query = CKQuery(recordType: Constants.fileNameIV, predicate: pred)
    let operation = CKQueryOperation(query: query)
    
    operation.recordFetchedBlock = { record in
      let id = record.recordID
      
      CKContainer.default().privateCloudDatabase.delete(withRecordID: id) {  [weak self] record, error in
        guard let self = self else { return }
        
        if error != nil {
          self.handleError(error, reject: reject)
        }
      }
    }
    
    operation.queryCompletionBlock = { [weak self] cursor, error in
      guard let self = self else { return }
      
      if error != nil {
        self.handleError(error, reject: reject)
      } else {
        resolver(true)
      }
    }
    
    CKContainer.default().privateCloudDatabase.add(operation)
  }
}
