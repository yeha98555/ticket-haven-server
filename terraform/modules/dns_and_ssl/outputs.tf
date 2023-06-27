output "certificate" {
  value = aws_acm_certificate.acm_main.arn
}

output "aws_route53_zone" {
  value = data.aws_route53_zone.public.id
}
