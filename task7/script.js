class PostModel {
    constructor() {
        this.apiUrl = 'https://jsonplaceholder.typicode.com/posts';
        this.limit = 10;
        this.totalLimit = 100;
        this.allPosts = [];
        this.displayedCount = 0;
        this.isLoading = false;
        this.searchQuery = '';
    }

    async fetchNextPage() {
        if (this.isLoading || this.displayedCount >= this.totalLimit) {
            return { success: true, hasMore: false };
        }

        this.isLoading = true;
        try {
            const url = this.apiUrl + '?_start=' + this.displayedCount + '&_limit=' + this.limit;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Ошибка сети: статус ' + response.status);
            }

            const newPosts = await response.json();

            if (newPosts.length > 0) {
                this.allPosts.push(...newPosts);
                this.displayedCount += newPosts.length;
            }

            const hasMore = this.displayedCount < this.totalLimit && newPosts.length === this.limit;
            return { success: true, hasMore: hasMore };
        } catch (error) {
            console.error('Ошибка загрузки:', error);
            return { success: false, error: error.message };
        } finally {
            this.isLoading = false;
        }
    }

    setSearchQuery(query) {
        this.searchQuery = query.trim().toLowerCase();
    }

    getFilteredPosts() {
        if (!this.searchQuery) return this.allPosts;
        const q = this.searchQuery;
        return this.allPosts.filter(post => post.title.toLowerCase().includes(q));
    }

    hasReachedEnd() {
        return this.displayedCount >= this.totalLimit;
    }
}

class PostView {
    constructor() {
        this.postsContainer = document.getElementById('postsContainer');
        this.searchInput = document.getElementById('searchInput');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.errorIndicator = document.getElementById('errorIndicator');
        this.endMessage = document.getElementById('endMessage');
    }

    renderPosts(posts, searchQuery) {
        if (posts.length === 0 && searchQuery) {
            this.postsContainer.innerHTML = '<div class="end-message">Ничего не найдено по вашему запросу</div>';
            return;
        }

        let html = '';
        const escape = this.escapeHTML;

        for (let i = 0; i < posts.length; i++) {
            const post = posts[i];
            html += '<div class="post-card">' +
                        '<div class="post-header">' +
                            '<span class="post-title">' + escape(post.title) + '</span>' +
                            '<span class="post-author">Автор: #' + post.userId + '</span>' +
                        '</div>' +
                        '<div class="post-body">' + escape(post.body) + '</div>' +
                    '</div>';
        }

        this.postsContainer.innerHTML = html;
    }

    showLoading(show) {
        if (show) {
            this.loadingIndicator.classList.remove('hidden');
        } else {
            this.loadingIndicator.classList.add('hidden');
        }
    }

    showError(message) {
        this.errorIndicator.textContent = message;
        this.errorIndicator.classList.remove('hidden');
    }

    hideError() {
        this.errorIndicator.classList.add('hidden');
    }

    showEndMessage(show) {
        if (show) {
            this.endMessage.classList.remove('hidden');
        } else {
            this.endMessage.classList.add('hidden');
        }
    }

    escapeHTML(str) {
        return str
            .replace(/&/g, '&')
            .replace(/</g, '<')
            .replace(/>/g, '>')
            .replace(/"/g, '"')
            .replace(/'/g, '');
    }
}

class PostController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.debounceTimer = null;

        this.initListeners();
        this.loadInitialPosts();
    }

    initListeners() {
        const self = this;

        // Отслеживание прокрутки для бесконечного скролла
        window.addEventListener('scroll', function() {
            const scrollTop = document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = document.documentElement.clientHeight;

            if (scrollTop + clientHeight >= scrollHeight - 200) {
                self.loadMorePosts();
            }
        });

        // Поиск с дебаунсом (~300мс)
        this.view.searchInput.addEventListener('input', function(e) {
            clearTimeout(self.debounceTimer);
            const value = e.target.value;

            self.debounceTimer = setTimeout(function() {
                self.model.setSearchQuery(value);
                self.updateView();
            }, 300);
        });
    }

    async loadInitialPosts() {
        await this.loadMorePosts();
    }

    async loadMorePosts() {
        if (this.model.isLoading || this.model.hasReachedEnd()) return;

        this.view.hideError();
        this.view.showLoading(true);

        const result = await this.model.fetchNextPage();

        this.view.showLoading(false);

        if (!result.success) {
            this.view.showError('Не удалось загрузить посты. Проверьте соединение с интернетом.');
            return;
        }

        this.updateView();

        if (this.model.hasReachedEnd() || !result.hasMore) {
            this.view.showEndMessage(true);
        }
    }

    updateView() {
        const filteredPosts = this.model.getFilteredPosts();
        this.view.renderPosts(filteredPosts, this.model.searchQuery);
    }
}

// Инициализация MVC приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    const model = new PostModel();
    const view = new PostView();
    const controller = new PostController(model, view);
});