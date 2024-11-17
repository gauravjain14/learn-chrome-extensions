function extractPostContent() {
    console.log('Analyzing post structure...');
    analyzePostStructure();

    const post = document.querySelector('.feed-shared-update-v2');
    if (!post) return null;
  
    const data = {
      author: post.querySelector('.feed-shared-actor__name')?.textContent?.trim() || null,
      content: post.querySelector('.feed-shared-text')?.textContent?.trim() || null,
      timestamp: post.querySelector('.feed-shared-actor__sub-description')?.textContent?.trim() || null,
      likes: post.querySelector('.social-details-social-counts__reactions-count')?.textContent?.trim() || null,
      url: window.location.href,
      savedAt: new Date().toISOString()
    };

    return JSON.parse(JSON.stringify(data));
    /* return {
      author,
      timestamp,
      content,
      likes,
      url: window.location.href,
      savedAt: new Date().toISOString()
    }; */
  }

// content.js
function getPostContent() {
  // This selector might need adjustment based on LinkedIn's structure
  const postElement = document.querySelector('.feed-shared-update-v2');
  if (postElement) {
      return {
          content: postElement.textContent.trim(),
          url: window.location.href,
          timestamp: new Date().toISOString()
      };
  }
  return null;
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getPost") {
      sendResponse(getPostContent());
  }
});

// Add this function to your content.js
function analyzePostStructure() {
  // Find all potential post containers
  const postElements = document.querySelectorAll(
    'div[class*="post"], div[class*="update"], div[class*="feed"]');
  
  postElements.forEach((element, index) => {
      console.group(`Potential Post Element ${index + 1}`);
      console.log('Element:', element);
      
      // Log the element's class names
      console.log('Classes:', element.className);
      
      // Create a tree structure of child elements
      function logElementStructure(el, depth = 0) {
          const indent = '  '.repeat(depth);
          const classNames = el.className || '';
          const textContent = el.textContent?.trim().slice(0, 50) || '';
          
          console.log(`${indent}${el.tagName.toLowerCase()} - classes: ${classNames}`);
          if (textContent) {
              console.log(`${indent}Content preview: "${textContent}..."`);
          }
          
          Array.from(el.children).forEach(child => {
              logElementStructure(child, depth + 1);
          });
      }
      
      logElementStructure(element);
      console.groupEnd();
  });
}

async function extractLinkedInData() {
  // First log the entire page structure for debugging
  console.log('Page HTML:', document.body.innerHTML);

  // Try different post container selectors
  const postElement = document.querySelector([
      'div.feed-shared-update-v2',
      'div.feed-shared-post',
      'article.feed-shared-update',
      // Add more potential selectors
  ].join(', '));

  console.log('Found post element:', postElement); // Debug log

  if (!postElement) {
      console.log('No post element found');
      return null;
  }

  // Try multiple selectors for each piece of data
  const authorSelectors = [
      '.feed-shared-actor__name',
      '.update-components-actor__name',
      '.feed-shared-actor__title'
  ];

  const contentSelectors = [
      '.feed-shared-text',
      '.feed-shared-update-v2__description',
      '.feed-shared-inline-show-more-text'
  ];

  const timestampSelectors = [
      '.feed-shared-actor__sub-description',
      'time.feed-shared-actor__sub-description',
      '.feed-shared-time'
  ];

  const likesSelectors = [
      '.social-details-social-counts__reactions-count',
      '.social-details-social-counts__numbered-reactions-count',
      '.social-action-counts__count'
  ];

  // Helper function to try multiple selectors
  const findContent = (selectors) => {
      for (const selector of selectors) {
          const element = postElement.querySelector(selector);
          if (element) {
              console.log(`Found element with selector ${selector}:`, element);
              return element.textContent.trim();
          }
      }
      return null;
  };

  const data = {
      author: findContent(authorSelectors),
      content: findContent(contentSelectors),
      timestamp: findContent(timestampSelectors),
      likes: findContent(likesSelectors),
      url: window.location.href,
      savedAt: new Date().toISOString()
  };

  // Log the found data
  console.log('Extracted data:', {
      author: {
          value: data.author,
          foundWith: authorSelectors.find(s => postElement.querySelector(s))
      },
      content: {
          value: data.content,
          foundWith: contentSelectors.find(s => postElement.querySelector(s))
      },
      timestamp: {
          value: data.timestamp,
          foundWith: timestampSelectors.find(s => postElement.querySelector(s))
      },
      likes: {
          value: data.likes,
          foundWith: likesSelectors.find(s => postElement.querySelector(s))
      }
  });

  return data;
}