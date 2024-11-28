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

// contentScript.js
function createSaveButton() {
    // Create the outer container div
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'feed-shared-social-action-bar__action-button';

    // Create the button with LinkedIn's classes
    const button = document.createElement('button');
    button.className = 'artdeco-button artdeco-button--muted artdeco-button--4 artdeco-button--tertiary ember-view social-actions-button';
    button.setAttribute('aria-label', 'Save post');
    
    // Create the button content
    button.innerHTML = `
        <svg role="none" aria-hidden="true" class="artdeco-button__icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M20 4v16H4V4h16m2-2H2v20h20V2zM12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="currentColor"/>
        </svg>
        <span class="artdeco-button__text">
            <span class="artdeco-button__text social-action-button__text">Vault</span>
        </span>
    `;

    buttonContainer.appendChild(button);
    return buttonContainer;
}

const addSuggestionButton = (commentBox) => {
    const button = document.createElement("button");
    button.classList.add(
      "artdeco-button",
      "artdeco-button--muted",
      "artdeco-button--tertiary",
      "artdeco-button--circle"
    );
    button.type = "button";
    button.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-lightbulb-fill" viewBox="0 0 16 16"><path d="M2 6a6 6 0 1 1 10.174 4.31c-.203.196-.359.4-.453.619l-.762 1.769A.5.5 0 0 1 10.5 13h-5a.5.5 0 0 1-.46-.302l-.761-1.77a2 2 0 0 0-.453-.618A5.98 5.98 0 0 1 2 6m3 8.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1l-.224.447a1 1 0 0 1-.894.553H6.618a1 1 0 0 1-.894-.553L5.5 15a.5.5 0 0 1-.5-.5"/></svg>';
  };

  function addSaveButtonToPost() {
    // Find all action bars
    const actionBars = document.querySelectorAll('.feed-shared-social-action-bar--full-width');
    
    actionBars.forEach(actionBar => {
        // Don't add if button already exists
        if (actionBar.querySelector('.save-post-button')) return;

        const saveButton = createSaveButton();
        saveButton.classList.add('save-post-button');

        // Add click handler
        saveButton.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Find the post container by traversing up from the button
            const postContainer = actionBar.closest(
                '.feed-shared-update-v2 .feed-shared-update-v2__control-menu-container');

            if (!postContainer) {
                console.error('Could not find post container');
                return;
            }

            try {
                // Get the post data
                // These fields are captured by inspecting the HTML. Need to find a better way to capture
                // this information.
                function extractPostInfo(postElement) {
                    const userName = postElement.querySelector(".update-components-actor__name")?.querySelector('span[aria-hidden="true"]')?.textContent.trim() || "";
                    const userImageUrl = postElement.querySelector(".update-components-actor__avatar-image")?.src || "";
                    const userDescription = postElement.querySelector(".update-components-actor__description")?.textContent.trim() || "";
                    const postText = postElement.querySelector(".update-components-text")?.textContent.trim() || "";
                    const postImageUrl = postElement.querySelector(".update-components-image__image-link img")?.src || null;
                    const postContainer = postElement.closest(".feed-shared-update-v2");
                    let activityId = "";
                    if (postContainer) {
                        const dataUrn = postContainer.getAttribute("data-urn");
                        if (dataUrn) {
                            const match = dataUrn.match(/activity:(\d+)/);
                            if (match && match[1]) {
                                activityId = match[1];
                            }
                        }
                    }
                    // Construct post URL using activity ID
                    const postUrl = activityId ? `https://www.linkedin.com/feed/update/urn:li:activity:${activityId}/` : "";
                    return {
                        id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                        userName,
                        userImageUrl,
                        userDescription,
                        postText,
                        postImageUrl,
                        postUrl
                    };
                };
                extractedData = extractPostInfo(postContainer);

                // This is old code but sticking with using it for now. But can switch to using
                // the extractedData
                const data = {
                    author: postContainer.querySelector(
                        '.update-components-actor__title [aria-hidden="true"]')?.innerText?.trim(), // Adjust selector
                    content: postContainer.querySelector(
                        '.update-components-text')?.textContent?.trim(),
                    timestamp: postContainer.querySelector(
                        '.update-components-actor__sub-description')?.textContent?.trim(),
                    likes: postContainer.querySelector(
                        '.social-details-social-counts__reactions-count')?.textContent?.trim(),
                    url: extractedData.postUrl,
                    savedAt: new Date().toISOString()
                };

                // Check if author in data is null. If yes, raise an Exception
                 if (!data?.author) {
                     throw new Error('No author found');
                 }

                const response = await fetch('http://localhost:3000/api/posts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    const buttonText = saveButton.querySelector('.social-action-button__text');
                    /* Don't change the state */
                    /* buttonText.textContent = 'Saved';
                    setTimeout(() => {
                        buttonText.textContent = 'Save';
                    }, 2000); */
                }
            } catch (error) {
                console.error('Error saving post:', error);
                const buttonText = saveButton.querySelector('.social-action-button__text');
                buttonText.textContent = 'Error';
                // setTimeout(() => {
                //     buttonText.textContent = 'Save';
                // }, 2000);
            }
        });

        // Add button after the Send button
        actionBar.appendChild(saveButton);
    });
}

// Initial run
addSaveButtonToPost();

// Watch for new posts
const observer = new MutationObserver(() => {
    addSaveButtonToPost();
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Log for debugging
console.log('LinkedIn Save Button Extension loaded');