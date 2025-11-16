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
            content: content
        };
    } catch (error) {
        console.error('Error loading post:', error);
        return {
            date: postInfo.date,
            title: postInfo.title,
            content: `Error loading post: ${error.message}`
        };
    }
}

async function loadAllPosts() {
    try {
        await loadPostsList();
        if (postsList.length === 0) {
            return;
        }
        const promises = postsList.map(post => fetchPost(post));
        loadedPosts = await Promise.all(promises);
        loadPosts();
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
    postDiv.className = 'blog-post';
    
    const contentHtml = processMarkdownWithMath(post.content);
    const readTime = calculateReadTime(post.content);
    
    postDiv.innerHTML = `
        <div class="post-header">
            <div class="post-info">
                <div class="post-date">${formatDate(post.date)} • ${readTime} min read</div>
                <div class="post-title">${post.title}</div>
            </div>
            <div class="expand-icon">▼</div>
        </div>
        <div class="post-content">
            <div class="post-content-inner">
                ${contentHtml}
            </div>
        </div>
    `;


    const header = postDiv.querySelector('.post-header');
    header.addEventListener('click', () => {
        postDiv.classList.toggle('expanded');
        if (postDiv.classList.contains('expanded')) {
            // Tell MathJax to process the math in this post
            MathJax.typesetPromise([postDiv]).catch((err) => console.log('MathJax error:', err));
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