module "versioninfo" {
  source                = "git::git@github.com:/vechain/terraform_infrastructure_modules.git//s3-static-cloudfront-hosting?ref=v.3.1.4"
  env                   = local.env.environment
  project               = local.env.project
  domain_name           = local.env.domain_name
  origin_id             = local.env.domain_name
  bucket_prefix         = local.env.bucket_prefix
  domain_zone           = local.env.zone_id
  block_public          = false
  create_logging_bucket = false
  referer               = "random"
  default_root_object   = "index.html"
  cors_rules = [{
    allowed_headers = ["*"]
    allowed_methods = ["GET"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }] 
}

