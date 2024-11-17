document.getElementById('savePost').addEventListener('click', async () => {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = 'Extracting post data...';
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: extractLinkedInData
    }, (results) => {
      if (results && results[0]) {
        console.log('Sending to backend: ', results[0].result);
        sendToBackend(results[0].result);
      }
    });
  });
  
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
document.getElementById('viewPosts').addEventListener('click', async () => {
  const statusDiv = document.getElementById('status');
  const postsContainer = document.getElementById('postsContainer');
  statusDiv.textContent = 'Loading posts...';

  try {
      const response = await fetch('http://localhost:3000/api/posts');
      if (!response.ok) {
          throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const posts = await response.json();
      if (posts.length === 0) {
          postsContainer.innerHTML = '<p>No saved posts found.</p>';
          return;
      }

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
      
      statusDiv.textContent = `Loaded ${posts.length} posts`;
  } catch (error) {
      console.error('Error details:', error);
      statusDiv.textContent = 'Error loading posts: ' + error.message;
  }
});

// Optional: Load posts automatically when popup opens
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('viewPosts').click();
});