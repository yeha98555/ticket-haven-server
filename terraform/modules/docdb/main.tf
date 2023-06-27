resource "aws_security_group" "main" {
  name        = "${var.application_name}-docdb-sg"
  description = "Security Group for ${var.application_name}"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = var.docdb_port
    to_port     = var.docdb_port
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_docdb_subnet_group" "docdb_subnet" {
  name       = "${var.application_name}-docdb-subnet"
  subnet_ids = var.subnet_ids
}

resource "aws_docdb_cluster" "docdb_cluster" {
  cluster_identifier     = "${var.application_name}-docdb-cluster"
  engine                 = "docdb"
  master_username        = var.docdb_username
  master_password        = var.docdb_password
  port                   = var.docdb_port
  db_subnet_group_name   = aws_docdb_subnet_group.docdb_subnet.name
  vpc_security_group_ids = [aws_security_group.main.id]
  skip_final_snapshot    = true

  # backup
  backup_retention_period = var.backup_retention_period
  preferred_backup_window = var.preferred_backup_window
}

resource "aws_docdb_cluster_instance" "docdb_instance" {
  count              = 2
  identifier         = "${var.application_name}-docdb-instance-${count.index}"
  cluster_identifier = aws_docdb_cluster.docdb_cluster.id
  instance_class     = var.instance_class
  availability_zone  = var.availability_zone
}
