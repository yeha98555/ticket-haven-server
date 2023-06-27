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

variable "NODE_ENV" {
  type    = string
  default = "production"
}

variable "MONGODB_USER" {
  type = string
}

variable "MONGODB_PASSWORD" {
  type = string
}

variable "MONGODB_DATABASE" {
  type = string
}

variable "MONGODB_CONNECT_STRING" {
  type = string
}

variable "JWT_SECRET" {
  type = string
}

variable "LOG_FILE_DIR" {
  type    = string
  default = "logs"
}

variable "NEWEBPAY_VERSION" {
  type    = string
  default = "1.5"
}

variable "NEWEBPAY_MERCHANT_ID" {
  type = string
}

variable "NEWEBPAY_HASH_KEY" {
  type = string
}

variable "NEWEBPAY_HASH_IV" {
  type = string
}

variable "PORT" {
  type    = string
  default = "3000"
}

variable "NEWEBPAY_NOTIFY_URL" {
  type = string
}

variable "NEWEBPAY_RETURN_URL" {
  type = string
}

variable "PAYMENT_RETURN_URL" {
  type = string
}

variable "TICKET_CHECKIN_KEY" {
  type = string
}

variable "TICKET_CHECKIN_IV" {
  type = string
}

variable "REDIS_CONNECT_STRING" {
  type = string
}
