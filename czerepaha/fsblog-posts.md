---
layout: czerepaha
title: "FS.blog Style Posts"
permalink: /fsblog-posts/
---

# FS.blog Style Posts

Here's a collection of all posts using the FS.blog style layout:

<div class="post-list">
{% assign fsblog_posts = site.posts | where: "layout", "fsblog" %}
{% for post in fsblog_posts %}
<div class="post-list-item">
    <h2 class="post-list-title"><a href="{{ post.url }}">{{ post.title }}</a></h2>
    <div class="post-list-excerpt">
        {{ post.excerpt | strip_html | truncatewords: 50 }}
    </div>
    <div class="post-list-meta">
        <time datetime="{{ post.date }}">{{ post.date | date: site.theme_config.date_format }}</time>
        {% if post.author %}
        by {{ post.author }}
        {% endif %}
    </div>
</div>
{% endfor %}
</div> 
