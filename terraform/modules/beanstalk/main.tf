# create vpc
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}

resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id
}

resource "aws_route_table" "main" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }
}

resource "aws_main_route_table_association" "a" {
  vpc_id         = aws_vpc.main.id
  route_table_id = aws_route_table.main.id
}

# create subnet
resource "aws_subnet" "subnet_a" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "${var.region}a"
}
resource "aws_subnet" "subnet_b" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "${var.region}b"
}

# create IAM
resource "aws_iam_instance_profile" "iamuser" {
  name = var.iam_user
  role = var.iam_role //aws_iam_role.role.name
}

data "aws_elastic_beanstalk_hosted_zone" "current" {}

resource "aws_elastic_beanstalk_application" "elasticapp" {
  name = var.application_name
}

data "aws_elastic_beanstalk_solution_stack" "node_latest" {
  most_recent = true

  name_regex = "^${var.solution_stack_name}$"
}

resource "aws_elastic_beanstalk_environment" "beanstalkappenv" {
  name                = "${var.app_tags}-Api"
  application         = var.application_name
  solution_stack_name = var.solution_stack_name
  tier                = var.tier
  tags = {
    APP_NAME = var.app_tags
  }

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = aws_iam_instance_profile.iamuser.name
  }
  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "ServiceRole"
    value     = aws_iam_instance_profile.iamuser.name
  }

  setting {
    namespace = "aws:ec2:vpc"
    name      = "VPCId"
    value     = aws_vpc.main.id
  }
  setting {
    namespace = "aws:ec2:vpc"
    name      = "AssociatePublicIpAddress"
    value     = "True"
  }

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "DisableIMDSv1"
    value     = "true"
  }

  setting {
    namespace = "aws:ec2:vpc"
    name      = "Subnets"
    value     = aws_subnet.subnet_a.id
  }
  setting {
    namespace = "aws:ec2:vpc"
    name      = "ELBSubnets"
    value     = join(",", [aws_subnet.subnet_a.id, aws_subnet.subnet_b.id])
  }

  setting {
    namespace = "aws:elasticbeanstalk:environment:process:default"
    name      = "MatcherHTTPCode"
    value     = "200"
  }
  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "LoadBalancerType"
    value     = "application"
  }
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "InstanceType"
    value     = var.instance_type
  }
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "RootVolumeType"
    value     = "gp3"
  }

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "RootVolumeSize"
    value     = var.disk_size
  }

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "RootVolumeIOPS"
    value     = 3000
  }

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "RootVolumeThroughput"
    value     = 125
  }

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "SSHSourceRestriction"
    value     = "tcp, 22, 22, ${var.sshrestrict}"
  }

  setting {
    namespace = "aws:ec2:vpc"
    name      = "ELBScheme"
    value     = "internet facing"
  }
  setting {
    namespace = "aws:autoscaling:asg"
    name      = "MinSize"
    value     = 1
  }
  setting {
    namespace = "aws:autoscaling:asg"
    name      = "MaxSize"
    value     = 4
  }
  setting {
    namespace = "aws:elasticbeanstalk:healthreporting:system"
    name      = "SystemType"
    value     = "enhanced"
  }

  setting {
    namespace = "aws:autoscaling:updatepolicy:rollingupdate"
    name      = "RollingUpdateEnabled"
    value     = true

  }

  setting {
    namespace = "aws:autoscaling:updatepolicy:rollingupdate"
    name      = "RollingUpdateType"
    value     = "Health"

  }

  setting {
    namespace = "aws:autoscaling:updatepolicy:rollingupdate"
    name      = "MinInstancesInService"
    value     = 1

  }

  setting {
    namespace = "aws:elasticbeanstalk:command"
    name      = "DeploymentPolicy"
    value     = "RollingWithAdditionalBatch"

  }

  setting {
    namespace = "aws:autoscaling:updatepolicy:rollingupdate"
    name      = "MaxBatchSize"
    value     = 1

  }

  setting {
    namespace = "aws:elasticbeanstalk:command"
    name      = "BatchSizeType"
    value     = "Percentage"

  }

  setting {
    namespace = "aws:elasticbeanstalk:command"
    name      = "BatchSize"
    value     = 30

  }

  ###=========================== Logging ========================== ###

  setting {
    namespace = "aws:elasticbeanstalk:hostmanager"
    name      = "LogPublicationControl"
    value     = false

  }

  setting {
    namespace = "aws:elasticbeanstalk:cloudwatch:logs"
    name      = "StreamLogs"
    value     = true

  }

  setting {
    namespace = "aws:elasticbeanstalk:cloudwatch:logs"
    name      = "DeleteOnTerminate"
    value     = true

  }

  setting {
    namespace = "aws:elasticbeanstalk:cloudwatch:logs"
    name      = "RetentionInDays"
    value     = 7
  }

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "EC2KeyName"
    value     = var.keypair
  }

  ###=========================== Load Balancer ========================== ###
  setting {
    namespace = "aws:elbv2:listener:default"
    name      = "ListenerEnabled"
    value     = false
  }

  setting {
    namespace = "aws:elbv2:listener:443"
    name      = "ListenerEnabled"
    value     = true
  }
  setting {
    namespace = "aws:elbv2:listener:443"
    name      = "Protocol"
    value     = "HTTPS"
  }
  setting {
    namespace = "aws:elbv2:listener:443"
    name      = "SSLCertificateArns"
    value     = var.certificate
  }
  setting {
    namespace = "aws:elbv2:listener:443"
    name      = "SSLPolicy"
    value     = "ELBSecurityPolicy-2016-08"

  }
  setting {
    namespace = "aws:elasticbeanstalk:environment:process:default"
    name      = "HealthCheckPath"
    value     = "/"
  }
  setting {
    namespace = "aws:elasticbeanstalk:environment:process:default"
    name      = "Port"
    value     = 80
  }
  setting {
    namespace = "aws:elasticbeanstalk:environment:process:default"
    name      = "Protocol"
    value     = "HTTP"
  }

  ###=========================== Autoscale trigger ========================== ###

  setting {
    namespace = "aws:autoscaling:trigger"
    name      = "MeasureName"
    value     = "CPUUtilization"

  }

  setting {
    namespace = "aws:autoscaling:trigger"
    name      = "Statistic"
    value     = "Average"

  }

  setting {
    namespace = "aws:autoscaling:trigger"
    name      = "Unit"
    value     = "Percent"

  }

  setting {
    namespace = "aws:autoscaling:trigger"
    name      = "LowerThreshold"
    value     = 20

  }

  setting {
    namespace = "aws:autoscaling:trigger"
    name      = "LowerBreachScaleIncrement"
    value     = -1

  }

  setting {
    namespace = "aws:autoscaling:trigger"
    name      = "UpperThreshold"
    value     = 60

  }

  setting {
    namespace = "aws:autoscaling:trigger"
    name      = "UpperBreachScaleIncrement"
    value     = 1

  }

  setting {
    namespace = "aws:elasticbeanstalk:managedactions"
    name      = "ManagedActionsEnabled"
    value     = "true"
  }

  setting {
    namespace = "aws:elasticbeanstalk:managedactions"
    name      = "PreferredStartTime"
    value     = "Tue:10:00"
  }

  setting {
    namespace = "aws:elasticbeanstalk:managedactions:platformupdate"
    name      = "UpdateLevel"
    value     = "minor"
  }

  setting {
    namespace = "aws:elasticbeanstalk:managedactions:platformupdate"
    name      = "InstanceRefreshEnabled"
    value     = "true"
  }

  ###=========================== Env variables ========================== ###
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "NODE_ENV"
    value     = var.NODE_ENV
  }
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "PORT"
    value     = var.PORT
  }
  setting { // TODO: use var.docdbcluster_username
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "MONGODB_USER"
    value     = var.MONGODB_USER
  }
  setting { // TODO: use var.docdbcluster_password
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "MONGODB_PASSWORD"
    value     = var.MONGODB_PASSWORD
  }
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "MONGODB_DATABASE"
    value     = var.MONGODB_DATABASE
  }
  setting { // TODO: replace render mongodb with aws docdb
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "MONGODB_CONNECT_STRING"
    value     = var.MONGODB_CONNECT_STRING
  }
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "JWT_SECRET"
    value     = var.JWT_SECRET
  }
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "LOG_FILE_DIR"
    value     = var.LOG_FILE_DIR
  }
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "NEWEBPAY_VERSION"
    value     = var.NEWEBPAY_VERSION
  }
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "NEWEBPAY_MERCHANT_ID"
    value     = var.NEWEBPAY_MERCHANT_ID
  }
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "NEWEBPAY_HASH_KEY"
    value     = var.NEWEBPAY_HASH_KEY
  }
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "NEWEBPAY_HASH_IV"
    value     = var.NEWEBPAY_HASH_IV
  }
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "NEWEBPAY_NOTIFY_URL"
    value     = var.NEWEBPAY_NOTIFY_URL
  }
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "NEWEBPAY_RETURN_URL"
    value     = var.NEWEBPAY_RETURN_URL
  }
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "PAYMENT_RETURN_URL"
    value     = var.PAYMENT_RETURN_URL
  }
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "TICKET_CHECKIN_KEY"
    value     = var.TICKET_CHECKIN_KEY
  }
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "TICKET_CHECKIN_IV"
    value     = var.TICKET_CHECKIN_IV
  }
  setting { // TODO: replace render redis with aws elasticache
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "REDIS_CONNECT_STRING"
    value     = var.REDIS_CONNECT_STRING
  }
}


resource "aws_lb_listener" "https_redirect" {
  load_balancer_arn = aws_elastic_beanstalk_environment.beanstalkappenv.load_balancers[0]
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

data "aws_lb" "eb_lb" {
  arn = aws_elastic_beanstalk_environment.beanstalkappenv.load_balancers[0]
}

resource "aws_security_group_rule" "allow_80" {
  type              = "ingress"
  from_port         = 80
  to_port           = 80
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = tolist(data.aws_lb.eb_lb.security_groups)[0]
}

resource "aws_route53_record" "myapp" {
  zone_id = var.aws_route53_zone
  name    = var.backend_domain
  type    = "A"
  alias {
    name                   = aws_elastic_beanstalk_environment.beanstalkappenv.cname
    zone_id                = data.aws_elastic_beanstalk_hosted_zone.current.id
    evaluate_target_health = false
  }
}

