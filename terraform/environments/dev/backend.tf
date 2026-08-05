terraform {
  backend "s3" {
    bucket         = "restauranthub-terraform-state"
    key            = "dev/terraform.tfstate"
    region         = "eu-west-3"
    encrypt        = true
    dynamodb_table = "restauranthub-terraform-locks"
  }
}
