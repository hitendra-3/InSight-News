import { supabase } from './supabase';

export const bookmarkService = {
    async addBookmark(userId, article) {
        const { data, error } = await supabase
            .from('bookmarks')
            .insert({
                user_id: userId,
                title: article.title,
                summary: article.summary,
                image_url: article.urlToImage,
                article_url: article.url,
                source_name: article.source?.name,
                published_at: article.publishedAt
            })
            .select()
            .single();
        return { data, error };
    },

    async removeBookmark(bookmarkId) {
        const { error } = await supabase
            .from('bookmarks')
            .delete()
            .eq('id', bookmarkId);
        return { error };
    },

    async getBookmarks(userId) {
        const { data, error } = await supabase
            .from('bookmarks')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        return { data, error };
    },

    async isBookmarked(userId, articleUrl) {
        const { data, error } = await supabase
            .from('bookmarks')
            .select('id')
            .eq('user_id', userId)
            .eq('article_url', articleUrl)
            .single();

        return !!data;
    }
};
