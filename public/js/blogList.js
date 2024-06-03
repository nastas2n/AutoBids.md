document.addEventListener('DOMContentLoaded', function() {
    const db = firebase.firestore();

    async function fetchBlogPosts() {
        try {
            console.log("Fetching articles...");
            const querySnapshot = await db.collection('articles').get();
            const data = [];
            querySnapshot.forEach(doc => {
                console.log("Document data:", doc.data());
                const article = doc.data();
                article.id = doc.id;
                data.push(article);
            });
            console.log('Fetched data from Firestore:', data);
            displayBlogPosts(data);
        } catch (error) {
            console.error('Error fetching blog data:', error);
            alert('Error fetching blog data: ' + error.message);
        }
    }

    function displayBlogPosts(data) {
        const container = document.getElementById('blog-posts-container');
        console.log('Displaying data:', data);

        data.forEach(post => {
            const postDiv = document.createElement('div');
            postDiv.classList.add('col-12', 'col-md-6', 'col-xl-4');
            postDiv.setAttribute('data-id', post.id);

            const contentKeys = Object.keys(post).filter(key => key.startsWith('content') && post[key].startsWith('http'));
            const firstImage = contentKeys.length > 0 ? post[contentKeys[0]] : '';

            postDiv.innerHTML = `
                <a href="article-page-name.html?id=${post.id}" class="post-link">
                    <div class="post">
                        <div class="post__content">
                            <div class="post__image-container">
                                ${firstImage ? `<img src="${firstImage}" alt="Post Image" class="post__image">` : ''}
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

            container.appendChild(postDiv);
        });
    }

    fetchBlogPosts();
});
