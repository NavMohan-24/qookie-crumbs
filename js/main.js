// Configure marked
marked.setOptions({
    breaks: true,
    gfm: true
});

let postsList = [];
let loadedPosts = [];
let currentIndex = 0;
const postsPerLoad = 5;
let isLoading = false;

// Generate URL-friendly slug from title
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// Get post ID from URL hash
function getPostIdFromURL() {
    const hash = window.location.hash.substring(1); // Remove #
    return hash || null;
}

// Set post ID in URL
function setPostIdInURL(postId) {
    if (postId) {
        window.location.hash = postId;
    } else {
        history.pushState("", document.title, window.location.pathname);
    }
}

// Load posts list from JSON file
async function loadPostsList() {
    try {
        const response = await fetch('posts.json');
        if (!response.ok) {
            throw new Error('Failed to load posts.json');
        }
        postsList = await response.json();
        return postsList;
    } catch (error) {
        console.error('Error loading posts list:', error);
        document.getElementById('error').textContent = 'Error loading posts list: ' + error.message;
        document.getElementById('error').style.display = 'block';
        return [];
    }
}

async function fetchPost(postInfo) {
    try {
        const response = await fetch(postInfo.file);
        if (!response.ok) {
            throw new Error(`Failed to load ${postInfo.file}`);
        }
        const content = await response.text();
        return {
            date: postInfo.date,
            title: postInfo.title,
            content: content,
            series: postInfo.series  
        };
    } catch (error) {
        console.error('Error loading post:', error);
        return {
            date: postInfo.date,
            title: postInfo.title,
            content: `Error loading post: ${error.message}`,
            series: postInfo.series 
        };
    }
}
// Expand a specific post by ID
function expandPostById(postId) {
    const postElement = document.querySelector(`[data-post-id="${postId}"]`);
    if (postElement && !postElement.classList.contains('expanded')) {
        postElement.classList.add('expanded');
        MathJax.typesetPromise([postElement]).catch((err) => console.log('MathJax error:', err));
        postElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Handle browser back/forward buttons
window.addEventListener('hashchange', () => {
    const postId = getPostIdFromURL();
    if (postId) {
        expandPostById(postId);
    } else {
        // Close all posts if hash is removed
        document.querySelectorAll('.blog-post.expanded').forEach(post => {
            post.classList.remove('expanded');
        });
    }
});


async function loadAllPosts() {
    try {
        await loadPostsList();
        if (postsList.length === 0) {
            return;
        }
        // Sort posts by date in descending order (newest first)
        postsList.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA;  // Descending order (newest first)
        });
        const promises = postsList.map(post => fetchPost(post));
        loadedPosts = await Promise.all(promises);
        // Add unique IDs to posts
        loadedPosts.forEach((post, index) => {
            post.id = generateSlug(post.title);
        });

        // Check if URL has a post ID to open
        const postIdFromURL = getPostIdFromURL();
        if (postIdFromURL) {
            // Load all posts first, then expand the specific one
            currentIndex = loadedPosts.length; // Load all at once
            loadPosts();
            setTimeout(() => expandPostById(postIdFromURL), 100);
        } else {
            loadPosts();
        }
        
    } catch (error) {
        document.getElementById('error').textContent = 'Error loading posts: ' + error.message;
        document.getElementById('error').style.display = 'block';
    }
}

function processMarkdownWithMath(markdown) {
    // Simple approach: convert markdown, MathJax will handle the rest
    return marked.parse(markdown);
}

function calculateReadTime(content) {
    // Average reading speed: 200 words per minute
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return readTime;
}

function createPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.setAttribute('data-post-id', post.id);
    postDiv.className = 'blog-post';
    
    const contentHtml = processMarkdownWithMath(post.content);
    const readTime = calculateReadTime(post.content);
    // Changed from HTML element to inline text
    const seriesTag = post.series ? ` • ${post.series}` : '';;
    
    postDiv.innerHTML = `
        <div class="post-header">
            <div class="post-info">
                <div class="post-date">${formatDate(post.date)} • ${readTime} min read${seriesTag}</div>
                <div class="post-title">${post.title}</div>
            </div>
            <div class="post-header-right">
                <div class="expand-icon">▼</div>
            </div>
        </div>
        <div class="post-content">
            <div class="post-content-inner">
                ${contentHtml}
            </div>
        </div>
    `;

    const header = postDiv.querySelector('.post-header');
    header.addEventListener('click', () => {
    const wasExpanded = postDiv.classList.contains('expanded');  // ADDED
    postDiv.classList.toggle('expanded');
    
    if (postDiv.classList.contains('expanded')) {
        setPostIdInURL(post.id);  //  Update URL with post ID
        MathJax.typesetPromise([postDiv]).catch((err) => console.log('MathJax error:', err));
        postDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });  // Scroll to post
    } else {
        setPostIdInURL(null);  // Clear URL hash when closing
    }
    });

    return postDiv;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function loadPosts() {
    if (isLoading || currentIndex >= loadedPosts.length) return;
    
    isLoading = true;
    document.getElementById('loading').style.display = 'block';

    setTimeout(() => {
        const container = document.getElementById('blog-posts');
        const end = Math.min(currentIndex + postsPerLoad, loadedPosts.length);

        for (let i = currentIndex; i < end; i++) {
            container.appendChild(createPostElement(loadedPosts[i]));
        }

        currentIndex = end;
        isLoading = false;
        document.getElementById('loading').style.display = 'none';
    }, 300);
}

function handleScroll() {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
        loadPosts();
    }
}

// Initialize
loadAllPosts();
window.addEventListener('scroll', handleScroll);