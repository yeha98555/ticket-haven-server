output "envName" {
  value = aws_elastic_beanstalk_environment.beanstalkappenv.name
}

output "asgName" {
  value = aws_elastic_beanstalk_environment.beanstalkappenv.autoscaling_groups[0]
}

output "lbarn" {
  value = aws_elastic_beanstalk_environment.beanstalkappenv.load_balancers[0]
}
