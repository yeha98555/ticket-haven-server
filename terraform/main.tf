provider "aws" {
  region = var.region
}

module "dns_and_ssl" {
  source = "./modules/dns_and_ssl/"

  domain_name = var.domain_name
  # cname       = module.eb.cname
  # zone        = module.eb.zone
}

module "eb" {
  source = "./modules/beanstalk/"

  depends_on = [module.dns_and_ssl]

  region           = var.region
  domain_name      = var.domain_name
  backend_domain   = var.backend_domain
  iam_user         = var.iam_user
  iam_role         = var.iam_role
  app_tags         = var.app_tags
  application_name = var.application_name
  instance_type    = var.instance_type
  disk_size        = var.disk_size
  keypair          = var.keypair
  sshrestrict      = var.sshrestrict
  certificate      = module.dns_and_ssl.certificate
  aws_route53_zone = module.dns_and_ssl.aws_route53_zone
}

module "cloudwatch" {
  source = "./modules/cloudwatch/"

  app_tags        = var.app_tags
  alarm_sns_topic = var.alarm_sns_topic
  asgName         = module.eb.asgName
  envName         = module.eb.envName
  lbarn           = module.eb.lbarn
}
