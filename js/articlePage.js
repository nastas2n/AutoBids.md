document.addEventListener('DOMContentLoaded', function() {
    // Assuming Firebase has already been initialized elsewhere
    const db = firebase.firestore();

    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    async function fetchArticle() {
        const articleId = getQueryParam('id');
        if (!articleId) {
            console.error('No article ID found in URL');
            return;
        }

        try {
            console.log(`Fetching article with ID: ${articleId}`);
            const doc = await db.collection('articles').doc(articleId).get();
            if (!doc.exists) {
                console.error('No such article!');
                handlePostNotFound();
                return;
            }
            const article = doc.data();
            displayPostContent(article);
            updateBreadcrumb(article.title);
        } catch (error) {
            console.error('Error fetching article:', error);
            handlePostNotFound();
        }
    }

    function displayPostContent(post) {
        const articleContent = document.getElementById('article__content');
        articleContent.innerHTML = '';

        const titleElement = document.createElement('h1');
        titleElement.textContent = post.title;
        articleContent.appendChild(titleElement);

        const dateElement = document.createElement('p');
        dateElement.textContent = post.date;
        dateElement.className = 'article__date';
        articleContent.appendChild(dateElement);

        for (let i = 1; post[`content${i}`]; i++) {
            const block = post[`content${i}`];
            if (block.startsWith('http')) {
                const imgContainer = document.createElement('div');
                imgContainer.className = 'article__image-container';
                const imgElement = document.createElement('img');
                imgElement.src = block;
                imgElement.alt = 'Article Image';
                imgElement.className = 'article__image';
                imgContainer.appendChild(imgElement);
                articleContent.appendChild(imgContainer);
            } else {
                const paragraph = document.createElement('p');
                paragraph.textContent = block;
                paragraph.className = 'article__text';
                articleContent.appendChild(paragraph);
            }
        }

        setupShareButtons();
    }

    function updateBreadcrumb(articleTitle) {
        const breadcrumbActiveItem = document.querySelector('.breadcrumbs__item--active');
        if (breadcrumbActiveItem) {
            breadcrumbActiveItem.textContent = articleTitle;
        }
    }

    function handlePostNotFound() {
        const articleContent = document.getElementById('article__content');
        articleContent.innerHTML = '<p>Blog post not found.</p>';
        updateBreadcrumb('Article not found');
    }

    function setupShareButtons() {
        const fbButton = document.getElementById('share-fb');
        const twButton = document.getElementById('share-tw');
        const linkButton = document.getElementById('share-link');

        fbButton.addEventListener('click', function(event) {
            event.preventDefault();
            const url = window.location.href;
            const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
            window.open(fbShareUrl, 'facebook-share-dialog', 'width=800,height=600');
        });

        twButton.addEventListener('click', function(event) {
            event.preventDefault();
            const url = window.location.href;
            const text = document.title;
            const twShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
            window.open(twShareUrl, 'twitter-share-dialog', 'width=800,height=600');
        });

        linkButton.addEventListener('click', function(event) {
            event.preventDefault();
            const url = window.location.href;
            navigator.clipboard.writeText(url).then(() => {
                alert('Link copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy link: ', err);
            });
        });
    }

    fetchArticle();
});
