---
layout: post
title: "Definition of Ready used by my team on a “Big Three” firm’s projects"
tags: [requirements]
---

I was working on their projects for a long time and have started when there were no requirements at all captured in internal system: not in team’s Jira, not in team’s Confluence, not in other sources were team members could access it. But before we cure this problem, let’s dive into the basics.

## What is Definition of Ready (DoR)?

DoR is a document that is accepted by the team as a template for the next requirements. If a team has accepted some DoR, then all product backlog items are to follow it and contain each part of the document in it.

### Why should a team accept DoR?

Using DoR would solve many problems that your team would face.

- **Requirements are not estimated or prioritized**. When a PBI[^pbi] is ready, it must have specific place on the backlog and contain estimation so that it can be planned.
- **The team does not understand requirements**. Having a PBI is not only about having a set of rules for writing requirements. A ‘ready’ PBI is a one that is discussed with the team, so that you’re sure that relevant team members understand value and ‘to do’s of a PBI. The same thing will also help **if team finds new cases when a feature is in progress**.

### [Definition of Ready vs Definition of Done](#comment "Years go, but the issue is still the same: how to distinguish these two?"){: data-img="/assets/img/dor-vs-dod.png"}

There is another document whose name can confuse an aspiring BA: definition of done. While definition of ready is a document that is to be followed by those who create PBIs, definition of done is for those who **do** the PBIs.

## Our Definition of Ready

Any backlog item on our product could be divided into 2 categories: new features or functions; adjustments to math of the analyses.

### For new functions

- Description of the value / context. It could be a *free text*, that would shortly describe the value behind the backlog item, or a *user story statement*, or a *job story*, or other similar thing.

  In this section of a PBI’s description an author has to answer **why** the function should be added, what need it addresses. The rest of the DoR answers **what** and **how**.

- Short description of the things this feature is to be capable of in order to be considered valuable. Here you answer the question “What should be done so that this item can be delivered?”

  To answer this question a framework called *acceptance criteria* (“A user can turn feature on”, “A user can open menu”, etc.) could be used.

- Then, describe **scenarios** that would show how a feature will be used. Requirements author can use a wide variety of frameworks here:

  1. you can use AC from the previous list item,
  2. you can use Gherk scenarios to cover each scenario,
  3. you can use any diagram to show the scenario instead of writing the whole long thing.

- After that, it is a good move to add some more **details**. For example, you can add a mock up (non-detailed image of the new feature) or just take a screenshot of an existing functionality and show what has to be changed using arrows and texts.

### Specific example

- **User Story Statement**: As a user I want to download analyses results in ThinkCell format so that I can create client PPTs faster.
- **Context**: Our users use ThinkCell to create diagrams and chart inside client PPTs. Our export format allows them to get the results of analyses, but requires a lot of rework of an Excel to make a fine chart.
- **Acceptance criteria**: (*Note: this is also a Definition of Done here!*)
  1. A user can download an Excel file with analysis results AND the output Excel file contains a tab with data aligned to ThinkCell requirements.
  2. Rows and columns in ThinkCell tab correspond to specific Excel format.
  3. Feature can be turned on / off using config of an analyses AND is turned on by default.
- **Other information:**
  1. A table that maps ThinkCell chart type vs analysis in our system.
  2. Description of how rows and columns must be accomodated in an output Excel in order to work in ThinkCell.

### For new analyses

- **Context** in which analyses is working. Usually it is partially known as each data pipeline serves specific need (one would work with pricing, other with marketing or industry data overall). But even here there are things to clarify: *why the existing version is to be changed? on what stage an analyst would use this analysis?*
- Then we go for **As is** where we describe how a problem is solved now. How the feature works. When you write it, you can be free here. Sometimes it would be useful to add some screenshots, in other cases description of cases would work. The only rule here is that *your team should understand how to read and understand the text.*
- When current state is done, you dive into future state. I assume the same rules will apply here.

### Some practical rules for DoRs

1. **Use same formats**. On your project you should use same set of ‘fields’ for requirements descriptions. Your team will create a habit of reading and understanding one format, one approach. When they have same format, they will just read and understand the text faster (*Do you remember when reading BABOK and you understood the format of chapters?*)

2. **Don’t use the set of ‘fields’ as a must**. Don’t take all the fields of your DoR as a must. Too much information could be waste. For example, for some PBIs you probably don’t need detailed scenarios, UMLs or other diagrams, or even too many specific details like colours, texts.

   Your PBI *may* be ready when you have agreement with your team and decision makers on what and how should be done. If you have fixed it as a text in a ticket ot other description, then following a format may be a waste, invaluable work.

3. **Follow 3 C framework: Card, Conversation, Confirmation**. While a tool where your requirement is a card, you have to drive conversation and confirmation.

   - For **card** you can use the system where PBI is described. It may be a page in Confluence or a Jira ticket. No need for a physical card :)
   - For **conversation** you can use comments section to discuss features. Confluence allows to create a comment for the whole page (*you can use it for approving your requirements!*) or for specific parts, lines of your text. Also, don’t forget that we can use ‘three amigos’ technique: call your colleagues and discuss the requirements.
   - For **confirmation** you can use your decision maker’s virtual signature. Just ask them you add “approve” comment when description is approved.

4. **Go with simple frameworks** as no one wants to understand how to use / read your texts before understanding the contents of it. For example, sometimes it is better to use flowcharts instead of complex UMLs as not all of your teammates know how to read them, but anyone can follow simple flowchart. Use simpler lexicon and those terms that are already used in other PBIs or documents.

*Originally published on [Medium](https://akhavanski.medium.com/definition-of-ready-used-by-my-team-on-a-big-three-firms-projects-8c9a3699a372) on November 8, 2023.*

[^pbi]: *Product Backlog Item.* It is something you add to your task tracker.
