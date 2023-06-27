data "aws_route53_zone" "public" {
  name         = "${var.domain_name}."
  private_zone = false
}

resource "aws_acm_certificate" "acm_main" {
  domain_name               = var.domain_name
  subject_alternative_names = ["*.${var.domain_name}"]
  validation_method         = "DNS"
  lifecycle {
    create_before_destroy = true
  }
}

resource "null_resource" "wait_for_certificate_validation" {
  triggers = {
    certificate_arn = aws_acm_certificate.acm_main.arn
  }

  provisioner "local-exec" {
    command = "sleep 600" # 等待10分鐘
  }
}

resource "aws_route53_record" "cert_validation" {
  depends_on = [aws_acm_certificate.acm_main]

  allow_overwrite = true
  name            = tolist(aws_acm_certificate.acm_main.domain_validation_options)[0].resource_record_name
  records         = [tolist(aws_acm_certificate.acm_main.domain_validation_options)[0].resource_record_value]
  type            = tolist(aws_acm_certificate.acm_main.domain_validation_options)[0].resource_record_type
  zone_id         = data.aws_route53_zone.public.id
  ttl             = 60
}

resource "aws_acm_certificate_validation" "cert" {
  depends_on = [aws_route53_record.cert_validation]

  certificate_arn         = aws_acm_certificate.acm_main.arn
  validation_record_fqdns = [aws_route53_record.cert_validation.fqdn]
}
