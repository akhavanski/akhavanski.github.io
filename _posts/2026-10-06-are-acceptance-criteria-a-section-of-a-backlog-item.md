---
layout: post
title: "Are Acceptance Criteria a section of a backlog item?"
tags: [software requirements]
custom_js: [three-c]
published: false
---

From project to project I see that acceptance criteria for a [PBI](#glossary) are in 99% of cases just a section in the task description. Those who write requirements add sections like [User Story](/2021-09-11-user-stories-guide-for-junior-ba-po-pm.html), links to designs or diagrams.

My take is that a ticket is a Card from the [3C model](/2021-09-11-user-stories-guide-for-junior-ba-po-pm.html#три-с-в-user-story).

<div class="three-c" aria-label="Card, Conversation, Confirmation: the conversation either sends the card back to be changed, or confirms it and it goes to the backlog">
  <div class="tc-stage">
    <div class="tc-node tc-card-node">
      <div class="tc-card" tabindex="0">
        <div class="tc-sticky">
          <span class="tc-sticky-text tc-v1">Save my card to pay faster</span>
          <span class="tc-sticky-text tc-v2">Save my card <s>to pay faster</s> for one-tap checkout</span>
        </div>
        <div class="tc-ticket" aria-hidden="true">
          <div class="tc-ticket-top">
            <span class="tc-type" title="Story"></span>
            <span class="tc-key">SHOP-142</span>
            <span class="tc-status">To do</span>
          </div>
          <div class="tc-ticket-title">Save a bank card for one-tap checkout</div>
          <div class="tc-ticket-body">
            <div class="tc-section">Description</div>
            <p><b>As a</b> returning customer, <b>I want</b> to save my card <b>so that</b> I pay in one tap next time.</p>
            <div class="tc-section">Acceptance criteria</div>
            <ul>
              <li>A user can tick “Save card” at checkout</li>
              <li>A saved card is shown first next time</li>
              <li>A user can delete a saved card</li>
            </ul>
            <div class="tc-section">Design</div>
            <p class="tc-link">figma.com/file/checkout-v3</p>
          </div>
          <div class="tc-ticket-side">
            <span>Assignee <i class="tc-avatar">AK</i></span>
            <span>Story points <b>3</b></span>
            <span>Sprint <b>42</b></span>
          </div>
        </div>
      </div>
      <div class="tc-label">Card</div>
    </div>

    <div class="tc-arrow tc-a1"><i></i></div>

    <div class="tc-node tc-talk-node">
      <div class="tc-talk">
        <span class="tc-bubble tc-b1"><i></i><i></i><i></i></span>
        <span class="tc-bubble tc-b2"><i></i><i></i><i></i></span>
      </div>
      <div class="tc-label">Conversation</div>
    </div>

    <div class="tc-arrow tc-a2"><i></i></div>

    <div class="tc-node tc-ok-node">
      <div class="tc-ok"><span class="tc-stamp">OK</span></div>
      <div class="tc-label">Confirmation</div>
    </div>

    <div class="tc-arrow tc-a3"><i></i></div>

    <div class="tc-node tc-backlog-node">
      <div class="tc-backlog">
        <span></span><span></span><span></span>
        <span class="tc-flyer"></span>
      </div>
      <div class="tc-label">Backlog</div>
    </div>

    <svg class="tc-loop" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">
      <path d="M 92 28 C 80 2, 20 2, 8 28" />
    </svg>
    <span class="tc-loop-label">changes the card</span>
  </div>
  <p class="tc-hint"><span class="tc-hint-hover">Hover</span><span class="tc-hint-tap">Tap</span> the card to open it</p>
</div>

## What a task should contain

A task should contain ‘all necessary information to complete it’.

<div class="anatomy" aria-label="Context is inside the card; the rest can live outside: in a knowledge base, in heads, in a design system">
  <div class="an-card">
    <div class="an-row an-context"><b>Context</b> why, what problem, for whom <em class="an-must">must</em></div>
    <div class="an-row an-design">🔗 Design, screenshot or flow</div>
    <div class="an-row an-acs">☑ Acceptance criteria</div>
  </div>
  <div class="an-outside">
    <span class="an-cloud an-kb">knowledge base</span>
    <span class="an-cloud an-heads">heads</span>
    <span class="an-cloud an-ds">design system</span>
  </div>
</div>

For me the must is Context. A description in any wording of why a task exists, what problem it solves and for whom. The rest can actually live somewhere outside the card: in a knowledge base, in heads, in a design system.

Then, I’d add a link to a design, a screenshot, or a flow. And the ACs.

## Are ACs the only ACs?

If you do not mention in ACs “The result follows the design” — but add a link inside the task or in a specific field — does it mean that there’s no such requirement? I think, the fact that there’s a link somewhere means that there’s a requirement **and an AC**!

<div class="hidden-ac" aria-label="The design link in a field is an acceptance criterion too">
  <div class="ha-ticket">
    <div class="ha-field"><span>Design</span><span class="ha-link">figma.com/file/checkout-v3</span></div>
    <div class="ha-section">Acceptance criteria</div>
    <ul>
      <li>A user can tick “Save card” at checkout</li>
      <li>A saved card is shown first next time</li>
      <li>A user can delete a saved card</li>
      <li class="ha-new">The result follows the design</li>
    </ul>
    <span class="ha-ghost">The result follows the design</span>
  </div>
</div>
