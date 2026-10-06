---
layout: post
title: "Are Acceptance Criteria a section of a backlog item?"
tags: [software requirements]
custom_js: [three-c]
published: false
---

I don’t agree, and hear me out.

From project to project I see that acceptance criteria for a [PBI](#glossary) are in 99% of cases just a section in the task description. Those who write requirements add sections like [User Story](/2021-09-11-user-stories-guide-for-junior-ba-po-pm.html), links to designs or diagrams.

My take is that a ticket is a Card from the [3C model](/2021-09-11-user-stories-guide-for-junior-ba-po-pm.html#три-с-в-user-story).

<div class="three-c" aria-label="Card, Conversation, Confirmation: the conversation either sends the card back to be changed, or ends in a handshake">
  <div class="tc-stage">
    <div class="tc-node tc-card-node">
      <div class="tc-card" tabindex="0">
        <div class="tc-sticky">
          <span class="tc-sticky-text">Save my card <s>to pay faster</s> for one-tap pay</span>
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

    <div class="tc-arrow tc-a1"></div>

    <div class="tc-node tc-talk-node">
      <div class="tc-talk">
        <span class="tc-bubble tc-b1"><i></i><i></i><i></i></span>
        <span class="tc-bubble tc-b2"><i></i><i></i><i></i></span>
      </div>
      <div class="tc-label">Conversation</div>
    </div>

    <div class="tc-arrow tc-a2"></div>

    <div class="tc-node tc-ok-node">
      <div class="tc-ok"><img src="/assets/img/epic-handshake.webp" alt="Two arms in a handshake: the team and the client agree"></div>
      <div class="tc-label">Confirmation</div>
    </div>

    <div class="tc-loop" aria-hidden="true">
      <svg viewBox="0 0 100 30" preserveAspectRatio="none">
        <path class="tc-loop-line" d="M 92 28 C 80 2, 20 2, 8 28" pathLength="1" />
      </svg>
      <svg class="tc-loop-head" viewBox="0 0 10 10"><path d="M 1 9 L 3 0 L 10 6 Z" /></svg>
    </div>
    <span class="tc-loop-label">changes the card</span>
  </div>
  <p class="tc-hint"><span class="tc-hint-hover">Hover</span><span class="tc-hint-tap">Tap</span> the card to open it</p>
</div>

A card should contain ‘all necessary information to complete it’.

<div class="anatomy an-swap" aria-label="Context is inside the card; the rest can live outside: in a knowledge base, in a design system">
  <div class="an-stack">
    <div class="an-card an-old">
      <div class="an-row an-context"><b>Context</b> why, what problem, for whom</div>
      <div class="an-row an-design">🔗 Design, screenshot or flow</div>
      <div class="an-row an-acs">☑ Acceptance criteria</div>
    </div>
    <div class="an-card an-new" aria-hidden="true">
      <div class="an-row an-context"><b>Context</b> why, what problem, for whom</div>
      <div class="an-acs-box">
        <div class="an-acs-title">Acceptance criteria</div>
        <div class="an-scraps">
          <span class="an-scrap"><span>Scenarios</span></span>
          <span class="an-scrap"><span>Design</span></span>
          <span class="an-scrap"><span>Screenshots</span></span>
          <span class="an-scrap"><span>Description in Confluence</span></span>
          <span class="an-scrap"><span>NFRs</span></span>
          <span class="an-scrap an-came" data-from="an-kb"><span>Knowledge base</span></span>
          <span class="an-scrap an-came" data-from="an-ds"><span>Design system</span></span>
        </div>
      </div>
    </div>
  </div>
  <div class="an-outside">
    <span class="an-cloud an-kb">knowledge base</span>
    <span class="an-cloud an-ds">design system</span>
  </div>
</div>

<div class="see-it-row"><button class="see-it" type="button">How I see it</button></div>

For me the must is Context. A description in any wording of why a task exists, what problem it solves and for whom. The rest can actually live somewhere outside the card: in a knowledge base, in heads, in a design system.

Then, I’d add a link to a design, a screenshot, or a flow. And the ACs.

Are ACs the only ACs?

If you do not mention in ACs “The result follows the design” — but add a link inside the task or in a specific field — does it mean that there’s no such requirement? I think, the fact that there’s a link somewhere means that there’s a requirement **and an AC**!

## Why I think so?

1. A QA checks the whole card and its context against what is actually done, not the ACs part of the task.
2. A visualisation may present the same info, but without text. We can use a variety of visualisation techniques to show a requirement, and any of them may be better than pure text: a clickable prototype, UML / BPMN, a screenshot with red-pen redlines showing what to do. If we limit ourselves to text, we ignore a very good way of communication.

## Examples

<div class="alt" data-alt="redlines">
  <div class="alt-tabs" role="tablist" aria-label="Kind of a picture">
    <button type="button" role="tab" aria-selected="true" data-for="redlines">Redlines</button>
    <button type="button" role="tab" aria-selected="false" data-for="uml">UML activity</button>
    <button type="button" role="tab" aria-selected="false" data-for="proto">Prototype</button>
  </div>

  <div class="alt-panel" data-panel="redlines" role="tabpanel">
    <div class="alt-text">
      <div class="alt-cap">As text</div>
      <div class="alt-ac-title">Acceptance criteria</div>
      <p>A user sees new text next to the checkbox: <code>Save card for one-tap pay</code></p>
    </div>
    <div class="alt-pic">
      <div class="alt-cap">As a picture</div>
      <div class="rl-screen">
        <div class="rl-head">Checkout</div>
        <div class="rl-field">•••• •••• •••• 4242</div>
        <div class="rl-check"><i></i><span class="rl-old">Remember this card<b class="rl-strike"></b></span><span class="rl-new">Save card for one-tap pay</span></div>
        <div class="rl-pay">Pay $24</div>
      </div>
    </div>
  </div>

  <div class="alt-panel" data-panel="uml" role="tabpanel" hidden>
    <div class="alt-text">
      <div class="alt-cap">As text</div>
      <div class="alt-ac-title">Acceptance criteria</div>
      <div class="alt-scroll">
        <ol class="alt-long">
          <li>When a user opens checkout, the system checks if the user has a saved card.</li>
          <li>If the user has a saved card, the system shows it first among the payment methods.</li>
          <li>The saved card is selected by default.</li>
          <li>When the user taps “Pay”, the system charges the saved card without asking for card details.</li>
          <li>If the user has no saved card, the system shows the card form.</li>
          <li>The card form has the checkbox “Save card for one-tap pay”, unticked by default.</li>
          <li>When the user fills in the form and taps “Pay”, the system charges the card.</li>
          <li>If the checkbox is ticked and the payment succeeds, the system saves the card.</li>
          <li>If the payment fails, the system does not save the card and shows the error.</li>
          <li>After a successful payment the system shows the confirmation screen.</li>
        </ol>
      </div>
    </div>
    <div class="alt-pic">
      <div class="alt-cap">As a picture</div>
      <svg class="uml" viewBox="0 0 300 440" role="img" aria-label="UML activity diagram of paying with a saved card">
        <defs>
          <marker id="uml-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9" />
          </marker>
        </defs>
        <defs>
          <marker id="uml-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9" />
          </marker>
        </defs>
        <g class="uml-edges">
          <path d="M150 20 V35" /><path d="M150 61 V82" />
          <path d="M134 98 H75 V137" /><path d="M166 98 H225 V137" />
          <path d="M225 163 V187" /><path d="M75 163 V250 H134" /><path d="M225 213 V250 H166" />
          <path d="M150 266 V272" /><path d="M150 298 V314" />
          <path d="M166 330 H215" /><path d="M150 346 V365" />
          <path d="M150 391 V408" /><path d="M255 343 V420 H162" />
        </g>
        <g class="uml-nodes">
          <circle cx="150" cy="12" r="8" class="uml-solid" />
          <rect x="85" y="35" width="130" height="26" rx="13" /><text x="150" y="52">Open checkout</text>
          <path d="M150 82 L166 98 L150 114 L134 98 Z" /><text x="176" y="94" class="uml-guard">has a saved card?</text>
          <text x="98" y="92" class="uml-guard">[yes]</text><text x="190" y="112" class="uml-guard">[no]</text>
          <rect x="10" y="137" width="130" height="26" rx="13" /><text x="75" y="154">Show saved card first</text>
          <rect x="160" y="137" width="130" height="26" rx="13" /><text x="225" y="154">Fill in card form</text>
          <rect x="160" y="187" width="130" height="26" rx="13" /><text x="225" y="204">Tick “Save card”</text>
          <path d="M150 234 L166 250 L150 266 L134 250 Z" />
          <rect x="95" y="272" width="110" height="26" rx="13" /><text x="150" y="289">Tap “Pay”</text>
          <path d="M150 314 L166 330 L150 346 L134 330 Z" />
          <text x="172" y="326" class="uml-guard">[failed]</text><text x="156" y="360" class="uml-guard">[paid]</text>
          <rect x="215" y="317" width="80" height="26" rx="13" /><text x="255" y="334">Show error</text>
          <rect x="70" y="365" width="160" height="26" rx="13" /><text x="150" y="382">Save card if ticked</text>
          <circle cx="150" cy="420" r="11" class="uml-end" /><circle cx="150" cy="420" r="6" class="uml-solid" />
        </g>
      </svg>
    </div>
  </div>

  <div class="alt-panel" data-panel="proto" role="tabpanel" hidden>
    <div class="alt-text">
      <div class="alt-cap">As text</div>
      <div class="alt-ac-title">Acceptance criteria</div>
      <div class="alt-scroll">
        <ol class="alt-long">
          <li>When a user opens checkout, the system checks if the user has a saved card.</li>
          <li>If the user has a saved card, the system shows it first among the payment methods.</li>
          <li>The saved card is selected by default.</li>
          <li>When the user taps “Pay”, the system charges the saved card without asking for card details.</li>
          <li>If the user has no saved card, the system shows the card form.</li>
          <li>The card form has the checkbox “Save card for one-tap pay”, unticked by default.</li>
          <li>When the user fills in the form and taps “Pay”, the system charges the card.</li>
          <li>If the checkbox is ticked and the payment succeeds, the system saves the card.</li>
          <li>If the payment fails, the system does not save the card and shows the error.</li>
          <li>After a successful payment the system shows the confirmation screen.</li>
        </ol>
      </div>
    </div>
    <div class="alt-pic">
      <div class="alt-cap">As a picture: click around</div>
      <div class="proto" data-screen="form">
        <div class="pr-screen pr-form">
          <div class="pr-head">Checkout <span>$24</span></div>
          <div class="pr-field">Card number<b>4242 4242 4242 4242</b></div>
          <label class="pr-check"><input type="checkbox"> Save card for one-tap pay</label>
          <button type="button" class="pr-btn" data-go="paid">Pay $24</button>
        </div>
        <div class="pr-screen pr-saved">
          <div class="pr-head">Checkout <span>$24</span></div>
          <div class="pr-card">Visa •••• 4242 <em>saved</em></div>
          <div class="pr-other">+ Another card</div>
          <button type="button" class="pr-btn" data-go="paid">Pay $24 in one tap</button>
        </div>
        <div class="pr-screen pr-paid">
          <div class="pr-done">✓</div>
          <div class="pr-thanks">Paid $24</div>
          <div class="pr-note"></div>
          <button type="button" class="pr-btn pr-again" data-go="again">Order again</button>
        </div>
      </div>
    </div>
  </div>
</div>

## Risks

1. **Changes.** Your links to sources should point to a specific version. You can do it both in Figma and in Confluence.
2. **Inertia.** For decades people have thought that an AC is a short text describing a feature, while in fact it is something we use for judgement: accept or not.

<div class="divider" aria-hidden="true">
  <svg viewBox="0 0 300 30">
    <path class="divider-line" d="M10 15 C100 21 200 21 290 15" />
    <g class="divider-leaves">
      <path d="M0 0 C4 -4 11 -4 15 0 C11 4 4 4 0 0 Z" transform="translate(24 15) rotate(-140)" />
      <path d="M0 0 C4 -4 11 -4 15 0 C11 4 4 4 0 0 Z" transform="translate(24 15) rotate(140)" />
      <path d="M0 0 C4 -4 11 -4 15 0 C11 4 4 4 0 0 Z" transform="translate(38 15) rotate(-140)" />
      <path d="M0 0 C4 -4 11 -4 15 0 C11 4 4 4 0 0 Z" transform="translate(38 15) rotate(140)" />
      <path d="M0 0 C4 -4 11 -4 15 0 C11 4 4 4 0 0 Z" transform="translate(52 15) rotate(-140)" />
      <path d="M0 0 C4 -4 11 -4 15 0 C11 4 4 4 0 0 Z" transform="translate(52 15) rotate(140)" />
      <path d="M0 0 C4 -4 11 -4 15 0 C11 4 4 4 0 0 Z" transform="translate(12 15) rotate(180)" />
    </g>
    <g class="divider-leaves" transform="translate(300 0) scale(-1 1)">
      <path d="M0 0 C4 -4 11 -4 15 0 C11 4 4 4 0 0 Z" transform="translate(24 15) rotate(-140)" />
      <path d="M0 0 C4 -4 11 -4 15 0 C11 4 4 4 0 0 Z" transform="translate(24 15) rotate(140)" />
      <path d="M0 0 C4 -4 11 -4 15 0 C11 4 4 4 0 0 Z" transform="translate(38 15) rotate(-140)" />
      <path d="M0 0 C4 -4 11 -4 15 0 C11 4 4 4 0 0 Z" transform="translate(38 15) rotate(140)" />
      <path d="M0 0 C4 -4 11 -4 15 0 C11 4 4 4 0 0 Z" transform="translate(52 15) rotate(-140)" />
      <path d="M0 0 C4 -4 11 -4 15 0 C11 4 4 4 0 0 Z" transform="translate(52 15) rotate(140)" />
      <path d="M0 0 C4 -4 11 -4 15 0 C11 4 4 4 0 0 Z" transform="translate(12 15) rotate(180)" />
    </g>
  </svg>
</div>

> An AC is anything you’ll use to accept or reject the work.
