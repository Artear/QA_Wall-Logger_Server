#!/bin/sh

TMP_DIR="./tmp_install"
ANDROID_SDK_NAME="android-sdk_r24.4.1-macosx"
ANDROID_SDK_ZIP_NAME="$ANDROID_SDK_NAME.zip"
ANDROID_SDK_DOWNLOAD_SOURCE="http://dl.google.com/android/$ANDROID_SDK_ZIP_NAME"
ANDROID_SDK_DOWNLOAD_DESTINATION="$TMP_DIR/$ANDROID_SDK_ZIP_NAME"
ANDROID_SDK_FOLDER="$HOME/Library/"
ANDROID_TOOLS_PATH="$ANDROID_SDK_FOLDER/android-sdk-macosx/tools/android"
ANDROID_PLATFORM_TOOLS_PATH="$ANDROID_SDK_FOLDER/android-sdk-macosx/platform-tools"


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

echo ""
echo "Creating temp dir $TMP_DIR..."
mkdir "$TMP_DIR"

echo ""
echo "Installing Android SDK $ANDROID_SDK_NAME into $ANDROID_SDK_FOLDER..."
echo ""
echo "Downloading $ANDROID_SDK_DOWNLOAD_SOURCE..."
curl "$ANDROID_SDK_DOWNLOAD_SOURCE" -o "$ANDROID_SDK_DOWNLOAD_DESTINATION"
echo ""
echo "Unziping into $ANDROID_SDK_FOLDER..."
mkdir "$ANDROID_SDK_FOLDER"
unzip "$ANDROID_SDK_DOWNLOAD_DESTINATION" -d "$ANDROID_SDK_FOLDER"

export PATH=$PATH:$ANDROID_TOOLS_PATH

android update sdk --filter platform-tools

export PATH=$PATH:$ANDROID_PLATFORM_TOOLS_PATH

echo ""
echo ""
echo "Cleaning temp dir..."
rm -R "$TMP_DIR"

