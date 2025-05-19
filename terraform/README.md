# Introduction

This repository contains configurations for back-end cloudfront and s3 web for bottomsheet version info

In order to configure following AWS profiles are used:

- veWorld
- veWorld-prod

Profile `veWorld` contains credentials for the dev account. It is in account `937628727224`.
Profile `veWorld-prod` contains credentials for the production account. It is in account `905964754131`
These piggyback on top of veworld-indexer terraform s3 backing buckets

To authenticate with terraform please follow the below document:
`https://vechain.atlassian.net/wiki/spaces/Devops/pages/183435265/Playing+nice+with+Okta+AWS+SSO+and+Terraform`

# Usage

In order to plan; at the minimum the following commands needs to be run
```bash
terraform init
terraform workspace select dev|prod
terraform plan
```

To then apply; build out the cloudfront distribution with
```bash
terraform apply
```
