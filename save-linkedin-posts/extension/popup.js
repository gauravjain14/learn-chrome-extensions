function sendToBackend(postData) {
  // Replace with your MongoDB API endpoint
  fetch('http://localhost:3000/api/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData)
  })
  .then(response => response.json())
  .then(data => {
    document.getElementById('status').textContent = 'Post saved successfully!';
  })
  .catch(error => {
    document.getElementById('status').textContent = 'Error saving post ' + error.message;
  });
}

  // Add this to your existing popup.js
async function loadPosts() {
  const statusDiv = document.getElementById('status');
  const postsContainer = document.getElementById('postsContainer');

  try {
      const response = await fetch('http://localhost:3000/api/posts');
      if (!response.ok) {
          throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const posts = await response.json();
      if (posts.length === 0) {
          postsContainer.innerHTML = '<p>No saved posts found in the vault.</p>';
          return;
      }

      // Sort posts by savedAt date (newest first)
      posts.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));

      posts.forEach(post => {
          const postElement = document.createElement('div');
          postElement.className = 'post';
          postElement.innerHTML = `
          <div class="author">${post.author || 'Unknown Author'}</div>
          <div class="content">${post.content || 'No content'}</div>
          <div class="meta">
              ${post.timestamp ? `Posted: ${post.timestamp}<br>` : ''}
              ${post.likes ? `Likes: ${post.likes}<br>` : ''}
              Saved: ${new Date(post.savedAt).toLocaleString()}
          </div>
          `;
          postsContainer.appendChild(postElement);
      });
  } catch (error) {
      console.error('Error details:', error);
      statusDiv.textContent = 'Error loading posts: ' + error.message;
  }
};

document.addEventListener('DOMContentLoaded', loadPosts);

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('searchButton').addEventListener('click', async () => {
      const query = document.getElementById('searchInput').value;
      const postsContainer = document.getElementById('postsContainer');
      
      // Replace with your MongoDB API endpoint (see above)
      
      try {
          const response = await fetch('http://localhost:3000/api/search', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ query })
          });
          
          const results = await response.json();
          console.log('Search results:', results); // Debug log
          displaySearchResults(results);
      } catch (error) {
          console.error('Search error:', error);
      }
  });
});

function displaySearchResults(results) {
    // Create a new page
    const newPage = window.open('', '_blank');
    if (!newPage) {
        alert('Pop-ups are blocked. Please allow pop-ups for this feature to work.');
        return;
    }

    newPage.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Search Results</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 20px;
                    background: #f9f9f9;
                }
                h1 {
                    color: #333;
                }
                .post {
                    background: #fff;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    padding: 15px;
                    margin-bottom: 10px;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                }
                .author {
                    font-weight: bold;
                    font-size: 16px;
                    margin-bottom: 5px;
                }
                .content {
                    margin-bottom: 10px;
                }
                .meta {
                    font-size: 12px;
                    color: #666;
                }
                .post a {
                    color: #0073b1;
                    text-decoration: none;
                }
                .post a:hover {
                    text-decoration: underline;
                }
            </style>
        </head>
        <body>
            <h1>Search Results</h1>
            <div id="results-container">
                ${results.length ? results.map(post => `
                    <div class="post">
                        <div class="author">
                            ${post.author || 'Unknown Author'}
                        </div>
                        <div class="content">
                            ${post.document || 'No content'}
                        </div>
                        <div class="meta">
                            ${post.url ? `<a href="${post.url}" target="_blank">View Post</a><br>` : ''}
                            ${post.likes ? `Likes: ${post.likes}<br>` : ''}
                        </div>
                    </div>
                `).join('') : '<p>No results found</p>'}
            </div>
        </body>
        </html>
    `);

    // Close the document to trigger rendering
    newPage.document.close();
}


function createSearchDialog(results) {
    console.log('results results ', results);
    // Create dialog element
    const dialog = document.createElement('dialog');
    dialog.className = 'search-results-dialog';
    
    // Add content to dialog
    dialog.innerHTML = `
        <div class="dialog-header">
            <h2>Search Results</h2>
            <button class="close-button">&times;</button>
        </div>
        <div class="dialog-content">
            ${results.length ? results.map(post => `
                <div class="post">
                    <div class="author">${post.author || 'Unknown Author'}</div>
                    <div class="content">${post.content || 'No content'}</div>
                    <div class="meta">
                        ${post.timestamp ? `Posted: ${post.timestamp}<br>` : ''}
                        ${post.likes ? `Likes: ${post.likes}<br>` : ''}
                        Saved: ${new Date(post.savedAt).toLocaleString()}
                    </div>
                </div>
            `).join('') : '<p>No results found</p>'}
        </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .search-results-dialog {
            width: 80%;
            max-width: 600px;
            padding: 20px;
            border: none;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .dialog-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        .close-button {
            border: none;
            background: none;
            font-size: 24px;
            cursor: pointer;
            padding: 5px;
        }
        .dialog-content {
            max-height: 400px;
            overflow-y: auto;
        }
        .post {
            border-bottom: 1px solid #eee;
            padding: 10px 0;
        }
        .author {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .meta {
            font-size: 12px;
            color: #666;
        }
    `;

    document.head.appendChild(style);
    document.body.appendChild(dialog);

    // Add event listeners
    dialog.querySelector('.close-button').addEventListener('click', () => {
        dialog.close();
        dialog.remove();
    });

    // Show dialog
    dialog.showModal();
}

document.addEventListener('DOMContentLoaded', () => {
    const clearButton = document.getElementById('clearDatabasesButton');
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            if (confirm("Are you sure you want to clear the database? This action cannot be undone.")) {
                // Send a message to the background script
                chrome.runtime.sendMessage({ action: 'clearDatabases' }, (response) => {
                    if (response?.success) {
                        alert("Database cleared successfully!");
                    } else {
                        alert("Failed to clear the database.");
                    }
                });

                // clear chromaDB embeddings
                chrome.runtime.sendMessage({ action: 'clearChromaDB' }, (chromaResponse) => {
                    console.log("Chroma Response ", chromaResponse);
                    if (chromaResponse?.success) {
                        console.log("ChromaDB cleared successfully.");
                    } else {
                        console.error("Failed to clear ChromaDB.");
                    }
                });
            }
        });
    } else {
        console.error("Clear Database button not found!");
    }
});