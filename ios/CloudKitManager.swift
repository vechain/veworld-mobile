//
//  CloudKitManager.swift
//  VeWorld
//
//  Created by Vasileios  Gkreen on 20/06/24.
//

import Foundation
import CloudKit


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
      if accountStatus == .available {
        print("iCloud app container and private database is available")
        resolve(true)
      } else {
        let error = NSError(domain: "", code: 200, userInfo: nil)
        reject("ICLOUD", "iCloud is not available on the device", error)
      }
    }
  }
  
  
  private func handleError(_ error: Error?, reject: RCTPromiseRejectBlock, domain: String = "ICLOUD", code: Int = 420, defaultMessage: String = "iCloud operation failed") {
    if let error = error {
      print("Internal iCloud error log: \(String(describing: error))")
      let nsError = NSError(domain: domain, code: code, userInfo: [NSLocalizedDescriptionKey: error.localizedDescription])
      reject(domain, error.localizedDescription, nsError)
    } else {
      let nsError = NSError(domain: domain, code: code, userInfo: [NSLocalizedDescriptionKey: defaultMessage])
      reject(domain, defaultMessage, nsError)
    }
  }
  
  
  @available(iOS 15.0, *)
  @objc
  func saveToCloudKit(_ rootAddress: String, data: String, walletType: String, firstAccountAddress: String, resolver: @escaping(RCTPromiseResolveBlock), rejecter reject: @escaping(RCTPromiseRejectBlock)) -> Void {
    
    let recordID = CKRecord.ID(recordName: "\(Constants.walletZone )_\(rootAddress)")
    let wallet = CKRecord(recordType: Constants.fileNameWallet, recordID: recordID)
    wallet[Constants.rootAddress] = rootAddress as CKRecordValue
    wallet[Constants.walletType] = walletType  as CKRecordValue
    wallet[Constants.firstAccountAddress] = firstAccountAddress as CKRecordValue
    wallet.encryptedValues[Constants.data] = data
    
    CKContainer.default().privateCloudDatabase.save(wallet) { [weak self] record, error in
      guard let self = self else { return }
      
      if (error != nil) {
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
    operation.desiredKeys = [Constants.rootAddress, Constants.walletType, Constants.data, Constants.firstAccountAddress, Constants.creationDate]
    
    var wallets = [[AnyHashable : Any]]()
    
    operation.recordFetchedBlock = { [weak self] record in
      
      guard let self = self else { return }
      
      let wallet = [
        Constants.rootAddress : record[Constants.rootAddress] as! String,
        Constants.walletType : record[Constants.walletType] as! String,
        Constants.firstAccountAddress : record[Constants.firstAccountAddress] as! String,
        Constants.creationDate : (record.creationDate?.timeIntervalSince1970 ?? Date().timeIntervalSince1970) as TimeInterval,
        Constants.data : record.encryptedValues[Constants.data] as! String,
      ] as [AnyHashable : Any]
      
      wallets.append(wallet)
    }
    
    operation.queryCompletionBlock = { cursor, error in
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
    
    let pred = NSPredicate(format: "\(Constants.rootAddress) == %@", rootAddress)
    let query = CKQuery(recordType: Constants.fileNameWallet, predicate: pred)
    let operation = CKQueryOperation(query: query)
    operation.desiredKeys = [Constants.rootAddress, Constants.walletType, Constants.data, Constants.firstAccountAddress, Constants.creationDate]
    
    var wallet: [AnyHashable : Any] = ["" : ""]
    
    operation.recordFetchedBlock = { [weak self] record in
      
      guard let self = self else { return }
      
      let wallet = [
        Constants.rootAddress : record[Constants.rootAddress] as! String,
        Constants.walletType : record[Constants.walletType] as! String,
        Constants.firstAccountAddress : record[Constants.firstAccountAddress] as! String,
        Constants.creationDate : (record.creationDate?.timeIntervalSince1970 ?? Date().timeIntervalSince1970) as TimeInterval,
        Constants.data : record.encryptedValues[Constants.data] as! String,
      ] as [AnyHashable : Any]
    }
    
    operation.queryCompletionBlock = { cursor, error in
      if error != nil {
        self.handleError(error, reject: reject)
      } else {
        resolver(wallet)
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
    
    operation.recordFetchedBlock = { [weak self] record in
      guard let self = self else { return }
      
      salt = [
        Constants.salt : record.encryptedValues[Constants.salt] as! String,
      ] as [AnyHashable : Any]
    }
    
    operation.queryCompletionBlock = { cursor, error in
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
    
    operation.recordFetchedBlock = { [weak self] record in
      guard let self = self else { return }
      
      iv = [
        Constants.iv : record.encryptedValues[Constants.iv] as! String,
      ] as [AnyHashable : Any]
    }
    
    operation.queryCompletionBlock = { cursor, error in
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
    
    operation.recordFetchedBlock = { [weak self] record in
      guard let self = self else { return }
      
      let id = record.recordID
      
      CKContainer.default().privateCloudDatabase.delete(withRecordID: id) { record, error in
        
        
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
    
    operation.recordFetchedBlock = { [weak self] record in
      guard let self = self else { return }
      
      let id = record.recordID
      
      CKContainer.default().privateCloudDatabase.delete(withRecordID: id) { record, error in
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
    
    operation.recordFetchedBlock = { [weak self] record in
      guard let self = self else { return }
      
      let id = record.recordID
      
      CKContainer.default().privateCloudDatabase.delete(withRecordID: id) { record, error in
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
