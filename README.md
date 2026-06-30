# IG Relations - Follower Analyzer

A lightweight, local, and privacy-focused Chrome Extension to analyze your Instagram followers and following lists directly within your browser.

## Features

- **Sync Relations:** Fetches your followers and following data locally using your active session.
- **Mutual Check:** Filter users who don't follow you back.
- **Fans Check:** Filter users you don't follow back.
- **Direct Actions:** Open user profiles instantly or unfollow them directly from the dashboard.
- **No Third-Party Servers:** Your data never leaves your browser.

## Installation

1. Clone or download this repository to your local machine.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle switch in the top right corner.
4. Click the **Load unpacked** button in the top left corner.
5. Select the `ig-relations-extension` root folder.

## How to Use

1. Go to [Instagram](https://www.instagram.com).
2. Look for the **📊 IG Relations** button at the bottom right corner of your screen.
3. Click the button to open the dashboard.
4. Click **Sync Relations** to fetch and analyze your profile connections.

## Rate Limits & Safety Note

Instagram enforces strict rate limits on automated actions and pagination requests. To keep your account safe:
- **Built-in Delays:** The extension includes a mandatory 1.5-second delay between pagination loops to reduce the risk of rate-limiting or action blocks.
- **Action Control:** Avoid using the **Unfollow** or **Remove** buttons too rapidly in short successions. 
- **Target Analysis Limit:** Analyzing external public profiles too frequently might trigger temporary endpoint restrictions from Instagram. Use the sync feature responsibly.

## Disclaimer

**This tool is for educational and personal analytical purposes only.** It is not affiliated with, authorized, maintained, sponsored, or endorsed by Instagram, Meta Platforms, Inc., or any of its affiliates or subsidiaries. 

Automating interactions or scraping data from Instagram Web endpoints may violate Instagram's Terms of Service. By using this software, you acknowledge that you are doing so entirely **at your own risk**. The developer accepts no responsibility or liability for any account restrictions, temporary action blocks, suspensions, or data loss resulting from the use of this extension.

## License

This project is licensed under the MIT License - see the LICENSE file for details.