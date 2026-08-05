terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket         = "bugforge-tf-state-prod"
    key            = "global/s3/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "bugforge-tf-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  default = "us-east-1"
}

variable "environment" {
  default = "production"
}

# AWS VPC Module
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  name   = "bugforge-vpc"
  cidr   = "10.0.0.0/16"

  azs             = ["us-east-1a", "us-east-1b", "us-east-1c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = false

  tags = {
    Environment = var.environment
    Project     = "BugForge"
  }
}

# AWS EKS Kubernetes Cluster Module
module "eks" {
  source          = "terraform-aws-modules/eks/aws"
  cluster_name    = "bugforge-eks-prod"
  cluster_version = "1.30"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  eks_managed_node_groups = {
    general = {
      min_size     = 2
      max_size     = 10
      desired_size = 3

      instance_types = ["t3.xlarge"]
      capacity_type  = "ON_DEMAND"
    }
  }
}

# AWS RDS PostgreSQL 16 Module
module "db" {
  source  = "terraform-aws-modules/rds/aws"
  identifier = "bugforge-postgres-db"

  engine               = "postgres"
  engine_version       = "16.3"
  family               = "postgres16"
  instance_class       = "db.r6g.large"
  allocated_storage    = 50
  max_allocated_storage = 500

  db_name  = "bugforge_db"
  username = "bugforge_admin"
  port     = "5432"

  multi_az               = true
  db_subnet_group_name   = module.vpc.database_subnet_group
  vpc_security_group_ids = [aws_security_group.rds_sg.id]

  deletion_protection = true
}

resource "aws_security_group" "rds_sg" {
  name   = "bugforge-rds-sg"
  vpc_id = module.vpc.vpc_id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = module.vpc.private_subnets_cidr_blocks
  }
}
