import { Blog, IBlog } from './blog.model';
import { ApiError } from '@/modules/common/middleware/error.middleware';
import { HTTP_STATUS } from '@/constants';

export class BlogService {
  /**
   * Create a new blog
   */
  async createBlog(input: {
    title: string;
    excerpt: string;
    date: string;
    thumbnail: string;
    images: string[];
    fullContent: string;
  }): Promise<IBlog> {
    const blog = await Blog.create(input);
    return blog;
  }

  /**
   * Get all blogs
   */
  async getAllBlogs(): Promise<IBlog[]> {
    return Blog.find().sort({ createdAt: -1 });
  }

  /**
   * Get blog by ID
   */
  async getBlogById(id: string): Promise<IBlog> {
    const blog = await Blog.findById(id);
    if (!blog) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Blog not found');
    }
    return blog;
  }

  /**
   * Update blog
   */
  async updateBlog(
    id: string,
    updates: Partial<{
      title: string;
      excerpt: string;
      date: string;
      thumbnail: string;
      images: string[];
      fullContent: string;
    }>
  ): Promise<IBlog> {
    const blog = await Blog.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!blog) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Blog not found');
    }

    return blog;
  }

  /**
   * Delete blog
   */
  async deleteBlog(id: string): Promise<void> {
    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Blog not found');
    }
  }
}

export const blogService = new BlogService();

