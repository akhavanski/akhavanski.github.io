---
layout: post
title: "How to find product hypotheses"
tags: [product]
---

A great majority of product work is some hassle around hypotheses. You uncover them, build them, calculate if the new options work better than the control option. There are many ways to find them.

First, some philosophy. Each hypothesis gives some knowledge. The knowledge moves us to progress [1]. I think a new feature is a beginning of infinity. When you know it works, you can adjust it and new options till infinity.[^romantic]

So my idea is that when you find an option in your product and see if it works better, you can develop new and a new thing over it. Now example.

You have an online shop which has a cart. When the cart is empty, you have a text there “Your cart is empty, go add stuff to it!”

From here you can change the text. “Sir/ma’am, your cart is empty. Please, add something there!” Or you can add link and “add stuff” is not a link to catalog. Or you can add a block with goods relevant to this user. There are other solutions here. As you can see, you can have several “beginnings of infinity” and each is rooted to some other beginning.

Why is it an infinity? I think, again, philosophically that working with hypotheses is a trial to find something perfecter than the previous option. Perfect means ideal and we know from philosophy that an ideal is unreachable in our unperfected world.

**So for me working with hypotheses is trying to find an option closer to perfection than the control option.**

## How do we find hypotheses?

### Philosophical approach

One answer is that you have to find hypotheses from going into the wild. In other words, you're to use genchi genbutsu principle. It's called CusDev in simple words. You go out, speak to people, and their pains, emotions, and so on. On the basis of it you can find some other hypotheses. It is called empiricism.

Deutsch — on the other hand — says that you have to come up with hypotheses yourself and then understand if ideas are wrong via testing. In case of products the testing is either CusDev or A/B testing.

### Steal from peers

You can also use your peers to look for ideas. There are at least 4 types[^competitors] of competitors and each can give you different ideas. Some may give you an idea you can immediately introduce to your product, some can give you a side business you can adapt. You can be a competitor of some type, while vice versa you're not a competitor.

My current company started a product of Post service. We were a potential competitor to other post service peers, now we're a direct one. We're a retail company, but your competitors are not only retailers. It may be a marketplace, a classified, or a company that has same service. Logistics is one of these. I will go back to this example later in this text.

So stealing a hypothesis may be a source of hypotheses for your company or product. What else?

### Make by-products work

Let's go back to retailer with logistics department that starts post service. Fried and DHH talked about it [2]:

> When you make something, you always make something else. You can’t make just one thing. Everything has a by-product. Observant and creative business minds spot these by-products and see opportunities.

From this logic logistics is a by-product of a retail company that can be packed into a product. Other examples? AWS and FBA[^fba] are by-products of a huge company that has huge data centers and capacity in their delivery stations. This post is by-product of me overthinking simple concepts (*ha!*).

### Use problem solving frameworks

You can find ideas using various frameworks. A simple option is using ISRU[^isru] that limits your field to what you have around you. This approach was discussed well in movies about NASA (*I have watched none, it's a hypothesis. The term [ISRU](https://en.wikipedia.org/wiki/In_situ_resource_utilization) comes from NASA.*) or in book “Inside the Box: A Proven System of Creativity for Breakthrough Results” by Drew Boyd and Jacob Goldenberg [3].

Let me introduce you quickly to other ideas from SIT that stands for Systematic Inventive Thinking.

**Subtraction**. In e-comm example of subtraction are one-click checkout and guest checkout. The first gets rid of all the steps and gives a buyer immediate value: an order created in preferred way without any action from a user. The second gets sign up out of the way: you can buy and forget, why to bother with registration if it is once in a lifetime interaction for you?

**Multiplication** is the evil twin of Subtraction. It allows you to multiply something to give value. Example is adding more ways to pay: by card, by cash, after delivery, using a BNPL service. You take one process (payment) and multiply ways to complete it so that more potential customers could use it. One more is showing mini-cart when a user hovers the main go-to-cart button. A user has basically same value in two ways if they have a mini cart.

**Division** is best known by the usage of microservices or lazy load. More product-ish example would be partial delivery, BNPL, or checkout divided into parts.[^ikea] Each of them divide one task into smaller ones: you pay many times smaller amount; you receive a part of your order, but you get value faster.

**Task Unification** also worked in e-commerce (or IT in general). When you tap search field you can often see the whole catalog. Here it is: one place unified two user actions.

The last from SIT is **Attribute Dependency**. It talks about merging several jobs[^jtbd] into one. Before being bombed Russian marketplaces OZON and Wildberries were giving a place where you can pay and check the product. This same approach has [E-obuwie](https://eobuwie.com.pl/), a Polish biggest footwear online store: they have a store which is a place to test, select, store, and buy shoes.

---

Instead of the finish: remember, that there are many (at least four) ways to find new ideas. Ideas and ways to enhance something will never end.[^good] When you have one, it is important to take action on it. Without an action, a brilliant idea dies.

[^romantic]: Later in the text I will present my view of Deutsch's idea. It is probably romantic and it's not scientific.
[^competitors]: Direct, indirect, substitute, and potential.
[^fba]: Fulfillment by Amazon.
[^isru]: In-Situ Resource Utilization.
[^ikea]: AFAIK, e-comms tend to go into one-step checkout. I think this *may* be wrong, look at the IKEA principle for example. This idea assumes that a customer would love a product more if they set it up themselves. It also moves some costs from IKEA to customers, but 🤫
[^jtbd]: I mean JTBD here.
[^good]: Good news for product teams.

## Sources

1. “The Beginning of Infinity”, — David Deutsch.
2. “Rework”, — Jason Fried, David Heinemeier Hansson.
3. “Inside the Box: A Proven System of Creativity for Breakthrough Results”, — Drew Boyd, Jacob Goldenberg.
