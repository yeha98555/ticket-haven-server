variable "region" {
  type = string
}

variable "domain_name" {
  type = string
}

variable "backend_domain" {
  type = string
}

variable "iam_user" {
  type = string
}

variable "iam_role" {
  type = string
}

variable "app_tags" {
  type = string
}

variable "application_name" {
  type = string
}

variable "solution_stack_name" {
  type    = string
  default = "64bit Amazon Linux 2 v5.8.1 running Node.js 18"
}

variable "tier" {
  type    = string
  default = "WebServer"
}

variable "instance_type" {
  type = string
}

variable "disk_size" {
  type = string
}

variable "keypair" {
  type = string
}

variable "certificate" {
  type = string
}

variable "sshrestrict" {
  type = string
}

variable "aws_route53_zone" {
  type = string
}
