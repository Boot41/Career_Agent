# Google Cloud Project Configuration
project_id = "boot41"
region     = "asia-south1"

# Container Deployment Configuration
service_name    = "career-agent"
container_image = "asia-south1-docker.pkg.dev/boot41/a3/career_agent2"
container_tag   = "v1"

# Environment Variables (Optional)
environment_variables = {
  "DEBUG"        = "false"
  "LOG_LEVEL"    = "info"
  "DB_NAME" = "sample.sqlite3"
}