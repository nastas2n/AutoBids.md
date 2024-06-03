// Include Firebase initialization if not already included
// <script src="path/to/your/firebase-init.js"></script>

let currentArticleIndex = 0;
let articlesData = [];

function fetchBlogPosts() {
    // Initialize Firestore
    var db = firebase.firestore();

    db.collection('articles').get()
        .then(querySnapshot => {
            querySnapshot.forEach(doc => {
                articlesData.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            displayCurrentArticle();
        })
        .catch(error => console.error('Error fetching blog data:', error));
}

function displayCurrentArticle() {
    if (articlesData.length === 0) return;

    const blogCards = document.getElementById('blog-cards');
    blogCards.innerHTML = ''; // Clear previous article

    const post = articlesData[currentArticleIndex];
    const postDiv = document.createElement('div');
    postDiv.classList.add('blog-card');

    const imageSource = post.content2 ? post.content2 : ''; // Assuming content2 is the image URL field

    postDiv.innerHTML = `
        <a href="article-page-name.html?id=${post.id}" class="post-link">
            <div class="post">
                <div class="post__content">
                    <div class="post__image-container">
                        ${imageSource ? `<img src="${imageSource}" alt="Post Image" class="post__image">` : ''}
                    </div>
                    <div class="post__details">
                        <h3 class="post__title">${post.title}</h3>
                        <div class="post__meta">
                            <span class="post__date">${post.date}</span>
                        </div>
                    </div>
                </div>
            </div>
        </a>
    `;

    blogCards.appendChild(postDiv);
}

document.addEventListener('DOMContentLoaded', () => {
    fetchBlogPosts();

    const nextButton = document.getElementById('next-article-button');
    const prevButton = document.getElementById('prev-article-button');

    nextButton.addEventListener('click', () => {
        currentArticleIndex = (currentArticleIndex + 1) % articlesData.length;
        displayCurrentArticle();
    });

    prevButton.addEventListener('click', () => {
        currentArticleIndex = (currentArticleIndex - 1 + articlesData.length) % articlesData.length;
        displayCurrentArticle();
    });
});
