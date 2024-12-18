# LinkedIn Post Saver

## Description
**LinkedIn Post Saver** is a Chrome extension that allows users to save LinkedIn posts to a local MongoDB database for later reference. It provides an easy way to bookmark and organize LinkedIn content directly from your browser.

## Prerequisites
1. OpenAI API key for embeddings

**TODO**: Update Installation prerequisites

## Features
- Extracts post details such as author, content, timestamp, likes, and URL from LinkedIn.
- Saves posts to a local MongoDB database through a backend API.
- Allows users to view saved posts in a popup interface.
- Includes functionality to clear saved data from the database.

## Installation
1. Clone this repository:
    `git clone https://github.com/gauravjain14/learn-chrome-extensions.git`
2. Navigate to the `save-linkedin-posts` directory:
    `cd learn-chrome-extensions/save-linkedin-posts`
3. Open Chrome and go to chrome://extensions and enable **developer mode** (toggle in the top-right corner).
4. Click on the "Load Unpacked" button and select the `save-linkedin-posts` folder

## Usage

### Start the node server and python backend server (for access the embeddings database)
1. Open two terminals and cd to the directory
    `cd learn-chrome-extensions/save-linkedin-posts`
2. In the first terminal, start the node server by running - 
    `node server.js`
3. In the second terminal, start the python backend server by running - 
    `uvicorn backend:app --reload`

### In the Chrome browser
1. Open LinkedIn in your browser.
2. Click on the extension icon to open the popup window.
3. Use the "Save" button to save the current post to the database (and also the embeddings).
4. To view saved posts, click on the extension icon and all saved posts will show.
5. To clear all saved posts from the database, click on the extension icon and select "Clear Databases".

## License
This project is licensed under the Apache 2.0 License.
