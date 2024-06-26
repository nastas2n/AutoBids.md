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
            displayRandomArticle();
        })
        .catch(error => console.error('Error fetching blog data:', error));
}

function displayRandomArticle() {
    if (articlesData.length === 0) return;

    const randomIndex = Math.floor(Math.random() * articlesData.length);
    const post = articlesData[randomIndex];

    const blogCards = document.getElementById('blog-cards');
    blogCards.innerHTML = ''; // Clear previous article

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

    const randomButton = document.getElementById('random-article-button');

    randomButton.addEventListener('click', () => {
        displayRandomArticle();
    });
});