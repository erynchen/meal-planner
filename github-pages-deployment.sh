#!/bin/bash
# This script helps deploy the meal planner app to GitHub Pages

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting GitHub Pages deployment process...${NC}"

# Step 1: Install gh-pages package
echo -e "\n${YELLOW}Installing gh-pages package...${NC}"
npm install --save-dev gh-pages

# Step 2: Add homepage, predeploy and deploy scripts to package.json
echo -e "\n${YELLOW}Updating package.json for GitHub Pages...${NC}"

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${RED}Error: jq is required but not installed.${NC}"
    echo "Please install jq first:"
    echo "  - On macOS: brew install jq"
    echo "  - On Ubuntu/Debian: sudo apt-get install jq"
    echo "  - On Windows with chocolatey: choco install jq"
    exit 1
fi

# Prompt for GitHub username
read -p "Enter your GitHub username: " github_username

# Prompt for repository name
read -p "Enter your repository name: " repo_name

# Update package.json
jq --arg homepage "https://$github_username.github.io/$repo_name/" \
   '.homepage = $homepage | .scripts.predeploy = "npm run build" | .scripts.deploy = "gh-pages -d build"' \
   package.json > package.json.tmp && mv package.json.tmp package.json

echo -e "${GREEN}Successfully updated package.json${NC}"

# Step 3: Create a temporary .env file to store public URL
echo -e "\n${YELLOW}Creating .env file for build configuration...${NC}"
echo "PUBLIC_URL=https://$github_username.github.io/$repo_name" > .env

# Step 4: Build the app
echo -e "\n${YELLOW}Building the app...${NC}"
npm run build

# Step 5: Deploy to GitHub Pages
echo -e "\n${YELLOW}Deploying to GitHub Pages...${NC}"
npm run deploy

echo -e "\n${GREEN}Deployment completed!${NC}"
echo -e "Your app should be available at: ${YELLOW}https://$github_username.github.io/$repo_name/${NC}"
echo -e "Note: It might take a few minutes for GitHub Pages to update."
echo -e "\n${YELLOW}Additional steps:${NC}"
echo "1. Make sure your repository is public"
echo "2. In your GitHub repository settings, ensure GitHub Pages source is set to the gh-pages branch"

# Cleanup
rm .env
