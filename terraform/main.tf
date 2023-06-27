provider "aws" {
  region = var.region
}

module "dns_and_ssl" {
  source = "./modules/dns_and_ssl/"

  domain_name = var.domain_name
}

module "vpc" {
  source = "./modules/vpc/"

  region = var.region
}

module "docdb" {
  source = "./modules/docdb/"

  depends_on = [module.vpc]

  application_name        = lower(var.application_name)
  vpc_id                  = module.vpc.vpc_id
  subnet_ids              = [module.vpc.subnet_a_id, module.vpc.subnet_b_id]
  availability_zone       = module.vpc.availability_zone
  docdb_username          = var.docdb_username
  docdb_password          = var.docdb_password
  docdb_port              = var.docdb_port
  backup_retention_period = var.backup_retention_period
  preferred_backup_window = var.preferred_backup_window
  instance_class          = var.instance_class
}

module "eb" {
  source = "./modules/beanstalk/"

  depends_on = [module.dns_and_ssl, module.vpc, module.docdb]

  domain_name      = var.domain_name
  backend_domain   = var.backend_domain
  vpc_id           = module.vpc.vpc_id
  subnet_a_id      = module.vpc.subnet_a_id
  subnet_b_id      = module.vpc.subnet_b_id
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
  db_endpoint      = module.docdb.docdb_endpoint
  db_username      = var.docdb_username
  db_password      = var.docdb_password
}

module "cloudwatch" {
  source = "./modules/cloudwatch/"

  app_tags        = var.app_tags
  alarm_sns_topic = var.alarm_sns_topic
  asgName         = module.eb.asgName
  envName         = module.eb.envName
  lbarn           = module.eb.lbarn
}
