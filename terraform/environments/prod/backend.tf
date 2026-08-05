terraform {
  backend "s3" {
    bucket         = "restauranthub-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "eu-west-3"
    encrypt        = true
    dynamodb_table = "restauranthub-terraform-locks"
  }
}
