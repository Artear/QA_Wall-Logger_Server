#!/bin/sh

echo " ************************"
echo "*QA_Wall Server Isntaller*"
echo " ************************"
echo ""
echo "Disclaimer: this is a VERY simple install script, no robust checks are in place. If this script fails, you can mannualy install all components."
echo ""
echo "** You need to have Xcode insalled for this to work!"
echo ""
echo ""
echo ""

echo "Installing Homebrew (if needed)..."
ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

echo ""
echo "Installing Node..."
brew install node

echo ""
echo "Installing Xcode command line tools..."
xcode-select --install

echo ""
echo "Installing Project dependencies..."
npm install