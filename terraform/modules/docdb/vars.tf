variable "application_name" {
  type = string
}
variable "vpc_id" {
  type = string
}
variable "subnet_ids" {
  type = list(string)
}
variable "availability_zone" {
  type = string
}

variable "docdb_username" {
  type = string
}
variable "docdb_password" {
  type = string
}
variable "docdb_port" {
  type = number
}
variable "backup_retention_period" {
  type = number
}
variable "preferred_backup_window" {
  type = string
}
variable "instance_class" {
  type = string
}
