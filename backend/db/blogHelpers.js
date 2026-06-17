const { BlogCategory, BlogTag, Tag } = require('./models');

function mapDocId(doc) {
  if (!doc) return null;
  const plain = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  return { ...plain, id: plain._id };
}

async function enrichBlog(blog) {
  if (!blog) return null;

  const plain = typeof blog.toObject === 'function' ? blog.toObject() : { ...blog };
  const blogId = plain._id;

  const [blogCategory, blogTags] = await Promise.all([
    plain.categoryId ? BlogCategory.findById(plain.categoryId).lean() : null,
    BlogTag.find({ blogId }).lean()
  ]);

  const tagIds = blogTags.map((bt) => bt.tagId);
  const tags = tagIds.length ? await Tag.find({ _id: { $in: tagIds } }).lean() : [];
  const tagMap = new Map(tags.map((tag) => [tag._id, tag]));

  return {
    ...plain,
    id: blogId,
    blogCategory: blogCategory ? mapDocId(blogCategory) : null,
    tags: blogTags.map((bt) => ({
      blogId: bt.blogId,
      tagId: bt.tagId,
      tag: tagMap.get(bt.tagId) ? mapDocId(tagMap.get(bt.tagId)) : null
    }))
  };
}

async function enrichBlogs(blogs) {
  return Promise.all(blogs.map((blog) => enrichBlog(blog)));
}

module.exports = {
  enrichBlog,
  enrichBlogs,
  mapDocId
};
