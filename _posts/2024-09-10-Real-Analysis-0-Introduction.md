---
title: Real Analysis 0 Introduction
date: 2024-09-10
category: [Lecture Notes, Mathematics]
tags: real analysis, functional analysis
math: true
description: Lecture Notes for 0.Introduction to Real Analysis
---
This course aims to prepare for **functional analysis** and is composed by 2 parts:
1. Integration (the sum of (weighted) function values on $$[a,b]$$) (measure, Lebesgue integration, ...)
2. Differentiation (from the perspective of integration) (maximal function, covering lemma)
# Integration
"a integration theory that is comparable to *absolute summation*"
that is, it inherits the property of *absolutely convergent series*.
## Defects of Riemann Integration
$$\rm{R}(f,\Delta,\\{\xi\_i\\})=\sum\_{i=1}^{n}(x\_i-x\_{i-1})\cdot f(\xi\_i)$$
$$\int\_a^b f(x)dx := \lim\_{|x\_i-x\_{i-1}|\rightarrow 0} \rm{R}(f,\Delta,\\{\xi\_i\\})$$ does not describe the theory we want because it cares the sum order: the function **can't jump/oscillate too frequently**.
## Lebesgue's Method
Recall: if $$\sum a\_n$$ converges absolutely, then $$\sum a\_n = \sum a\_n^+ + \sum a\_n^-$$
comparably, we want that $$\int\_a^b f(x)dx = \int\_a^b f(x)^+dx + \int\_a^b f(x)^-dx$$

Or more generally, partition on $$Y(range\; f): \Delta:y\_0<y\_1<\cdots<y\_i<\cdots$$
$$\rm{L}(f,\Delta,{y\_i}) = \sum\_{i=1}^n y\_i \cdot f^{-1}([y\_i,y\_{i+1}])$$, but $$f^{-1}([y\_i,y\_{i+1}])$$ is non-trivial and is reasonable enough to be given a *notion of length*.
> Remark: the action/notion determines the set.
{: .prompt-info}
# Differentiation
"from the perspective to integration"
$$F:[a,b]\rightarrow\mathbb{R},\; F\uparrow$$
For $$[\alpha,\beta] \subset [a,b]$$, we may assign a **F-length**: $$F(\beta) - F(\alpha)$$, and define **F-integral** (a functional in fact): $$\varphi \stackrel{\rm{L}}{\rightarrow} \int\_a^b \varphi (x)dF$$
We wonder whether this functional ==can be represented by a function== $$f$$ in sense that: $$\rm{L}(\varphi)=\int\_a^b \varphi(x)f(x)dx$$, where $$dx$$ is the original measure.
Then $$f$$ is a "*good*" derivative of $$F$$.

Question: if $$f$$ exists almost everywhere, could it recover $$F$$? (As Reimann's integral does)
Answer: Not necessary.

# Cardinality

Thm: (Cantor-Bernstein) $$A,B$$ are sets, if $$|A|\leq |B| \text{ and } |B|\leq|A|$$ then $$|A|=|B|$$
