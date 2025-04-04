---
layout: czerepaha
title: "Czerepaha Style Posts"
permalink: /czerepaha-posts/
---

# Czerepaha Style Posts

Here's a collection of all posts using the Czerepaha style layout:

<div class="post-list">
{% assign czerepaha_posts = site.posts | where: "layout", "czerepaha" %}
{% for post in czerepaha_posts %}
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