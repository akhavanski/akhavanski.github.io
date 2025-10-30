# Deployment Guide for GitHub Pages

## Quick Start - Deploy to GitHub Pages

Your site is ready to deploy! Follow these simple steps:

### 1. Initialize Git Repository

```bash
cd /Users/akhavanski/akhavanski.github.io
git init
git add .
git commit -m "Initial commit - Jekyll site with no-style-please theme"
```

### 2. Push to GitHub

If you haven't already created the repository on GitHub:

1. Go to https://github.com/new
2. Create a repository named `akhavanski.github.io` (or it may already exist)
3. Don't initialize with README, .gitignore, or license

Then push your code:

```bash
git branch -M main
git remote add origin https://github.com/akhavanski/akhavanski.github.io.git
git push -u origin main
```

### 3. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings**
3. Scroll down to **Pages** section (or find it in left sidebar)
4. Under **Source**, select:
   - Branch: `main`
   - Folder: `/ (root)`
5. Click **Save**

### 4. Wait for Deployment

GitHub Pages will automatically build and deploy your site. This usually takes 1-2 minutes.

Once deployed, your site will be available at: **https://akhavanski.github.io**

## Customization

Before deploying, you should customize:

### Edit `_config.yml`:
- Change `title` to your site name
- Change `author` to your name
- Change `email` to your email
- Update `description` with your site description

### Edit `about.md`:
- Add information about yourself

### Edit or delete sample posts in `_posts/`:
- Posts should be named: `YYYY-MM-DD-title.md`
- Add front matter at the top of each post

## Local Testing (Optional)

To test your site locally before deploying:

1. Install Ruby (if not already installed)
2. Install Bundler: `gem install bundler`
3. Install dependencies: `bundle install`
4. Run Jekyll: `bundle exec jekyll serve`
5. Visit: `http://localhost:4000`

## Theme Customization

The theme appearance can be changed in `_config.yml`:

```yaml
theme_config:
  appearance: "auto"  # Options: "light", "dark", or "auto"
  show_description: true
```

## Adding New Posts

1. Create a file in `_posts/` with format: `YYYY-MM-DD-post-title.md`
2. Add front matter:
   ```yaml
   ---
   layout: post
   title: "Your Post Title"
   date: YYYY-MM-DD HH:MM:SS -0000
   categories: your-category
   ---
   ```
3. Write your content in Markdown
4. Commit and push to GitHub

## Troubleshooting

If your site doesn't appear:
1. Check the **Actions** tab in your GitHub repository for build errors
2. Make sure GitHub Pages is enabled in Settings
3. Wait a few minutes - initial deployment can take time
4. Clear your browser cache

## Resources

- [Jekyll Documentation](https://jekyllrb.com/docs/)
- [no-style-please Theme](https://github.com/riggraz/no-style-please)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Markdown Guide](https://www.markdownguide.org/)

---

Happy blogging! 🚀

