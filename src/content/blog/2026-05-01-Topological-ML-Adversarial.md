---
title: What Loops Tell You About Adversarial Attacks
pubDate: 2026-05-01
category: Notes
tags: [TDA, Machine Learning]
authors: [xiaoyun-liu]
math: true
description: Extending topological detection from connected components to 1-dimensional homology.
---


## §1 The Gap

Add a tiny perturbation $\boldsymbol{\eta}$ with $\|\boldsymbol{\eta}\|_\infty \leq \epsilon$ to a correctly classified input $\boldsymbol{X}$, and a neural network confidently misclassifies. Goodfellow's linearity argument explains why: for a linear model with weights $\boldsymbol{w}$, the output shifts by $\boldsymbol{w}^T \boldsymbol{\eta}$. Setting $\boldsymbol{\eta} = \epsilon \cdot \text{sign}(\boldsymbol{w})$ maximizes this to $\epsilon m n$, where $m$ is the average weight magnitude and $n$ is the input dimension. The perturbation norm doesn't grow with dimension, but the output change grows linearly. In high dimensions, infinitesimal per-feature changes accumulate into large output shifts [^1].

The detection problem — distinguishing adversarial from clean inputs — has been approached through statistical properties of activation spaces. Kernel density estimation (KD) [^2] asks whether a sample lives in a low-probability region. Local intrinsic dimensionality (LID) [^3] asks whether the local data geometry has anomalously high dimensionality. Both operate on the activation vectors of hidden layers. Both succeed to varying degrees.

But both KD and LID are, at their core, measuring **0-dimensional topology**. They characterize connected component structure — who is near whom, how densely packed, how many dimensions the local neighborhood spans. What they don't look at is **1-dimensional topology**: the loop structure of activation point clouds, captured by the first homology group $H_1$.

This matters because activation point clouds in hidden layers are not just scattered points. They have geometric structure at multiple scales — clusters, bridges, loops. A simplicial filtration (like the Vietoris-Rips complex) captures all of this. The 0-dimensional persistence diagram records when components appear and merge. The 1-dimensional persistence diagram records when loops form and get filled in. KD and LID extract information only from the former.

The question that started this project: **do adversarial perturbations leave topological signatures in $H_1$ that $H_0$ cannot see?**

The answer, empirically, is yes. At fully-connected layers, $H_1$ bottleneck distance separates adversarial from natural noise — something $H_0$ cannot do. The signature is monotonically related to perturbation strength, even after the attack success rate saturates at 100%. And the pipeline — from activation extraction through persistence diagrams to a classifier — converges to Bayes optimal as sample size grows.

What follows is the mathematics that makes this work, the observations from the diagrams, and the conjectures I haven't yet verified.

---

## §2 The Math: Correlation Distance and Why It's Topologically Faithful

### 2.1 Why Not Euclidean

Before computing any topology, we need a distance on activation space. The natural choice is Euclidean distance. It works — you can build a Vietoris-Rips filtration with $d(\phi(\boldsymbol{X})_j, \phi(\boldsymbol{X})_k) = \|\phi(\boldsymbol{X})_j - \phi(\boldsymbol{X})_k\|$ and compute persistence diagrams directly. The $H_1$ separation between adversarial and noisy activations still shows up.

But Euclidean distance conflates two things: the *direction* of an activation vector and its *magnitude*. Adversarial perturbations, being small additive shifts, change magnitudes more than directions. Two activation vectors pointing the same way but with different norms look "far apart" in Euclidean distance, even though they encode the same feature. We want a distance that captures angular structure — orientation, not length.

### 2.2 Correlation Semimetric on the Sphere

Given activation vectors $\{x_1, \ldots, x_m\} \subset \mathbb{R}^d$ extracted at a chosen hidden layer, define the centering projection

$$P = I - \frac{1}{n}\mathbf{1}\mathbf{1}^T$$

and normalize each centered vector to the unit sphere:

$$\hat{x}_i = \frac{P(x_i)}{\|P(x_i)\|} \in \mathbb{S}^{d-2}.$$

The **correlation semimetric** is

$$D(\hat{x}_i, \hat{x}_j) = 1 - \langle \hat{x}_i, \hat{x}_j \rangle.$$

Note: $D$ is *not* a metric. It doesn't satisfy the triangle inequality in general. This raises a question: can we build a Vietoris-Rips complex on a semimetric space? The VR complex is usually defined on a metric space — the definition requires $d(x,y) \leq r$ to determine which subsets are simplices, and in principle the triangle inequality ensures the filtration behaves correctly.

### 2.3 Reconstruction Theorem

The answer is yes, and the reason is that $D$ produces *exactly the same simplicial complex* as Euclidean distance, up to a rescaling of the filtration parameter.

**Theorem.** *Let $\hat{X} = \{\hat{x}_1, \ldots, \hat{x}_m\} \subset \mathbb{S}^{d-2}$ and $D(\hat{x}_i, \hat{x}_j) = 1 - \langle \hat{x}_i, \hat{x}_j \rangle$. Then*

$$\text{VR}(\hat{X}, D, \epsilon) \cong \text{VR}(\hat{X}, d, \sqrt{2\epsilon})$$

*at every filtration level, where $d$ is the Euclidean metric.*

The proof is one equality. Since $\hat{x}_i, \hat{x}_j$ lie on the unit sphere:

$$d^2(\hat{x}_i, \hat{x}_j) = \|\hat{x}_i - \hat{x}_j\|^2 = 2(1 - \langle \hat{x}_i, \hat{x}_j \rangle) = 2\,D(\hat{x}_i, \hat{x}_j).$$

Therefore, for any subset $\sigma \subseteq \hat{X}$:

$$\sigma \in \text{VR}(\hat{X}, d, \sqrt{2\epsilon}) \iff \forall\, i,j \in \sigma:\; d(\hat{x}_i, \hat{x}_j) \leq \sqrt{2\epsilon} \iff \forall\, i,j \in \sigma:\; D(\hat{x}_i, \hat{x}_j) \leq \epsilon \iff \sigma \in \text{VR}(\hat{X}, D, \epsilon).$$

The simplicial complexes are isomorphic at every filtration scale. The semimetric $D$ produces the same topology as Euclidean distance. We get angular structure for free without losing topological fidelity.

In practice, we use the correlation distance matrix

$$D_{jk} = 1 - |\text{corr}(\phi(\boldsymbol{X})_j, \phi(\boldsymbol{X})_k)|$$

with an absolute value. The absolute value makes the distance invariant to sign flips in the correlation — negative correlation is as structurally informative as positive correlation. The reconstruction theorem still applies: $|\langle \hat{x}_i, \hat{x}_j \rangle|$ is unsigned cosine similarity on $\mathbb{S}^{d-2}$, and the same algebra gives $d^2 = 2(1 - |\langle \hat{x}_i, \hat{x}_j \rangle|)$.

### 2.4 The Objects We Compute

The pipeline produces three mathematical objects. Here's what each one is.

**Vietoris-Rips filtration.** Given a finite set of points $(X, d)$ and a scale parameter $r \geq 0$, the Vietoris-Rips complex $\text{VR}(X, d, r)$ is the simplicial complex where a subset $\sigma \subseteq X$ is a simplex iff $d(x,y) \leq r$ for all $x, y \in \sigma$. As $r$ increases, simplices are added but never removed, yielding a filtration:

$$\text{VR}(X, d, 0) \subseteq \text{VR}(X, d, r_1) \subseteq \cdots \subseteq \text{VR}(X, d, r_{\max}).$$

At $r = 0$: every point is an isolated vertex. As $r$ grows: edges appear when pairs come within distance $r$, triangles when triples do, and so on. The filtration records *when* each topological feature appears and disappears.

**Persistence diagram.** The $n$-dimensional persistence diagram $\text{PD}_n$ is a multiset of points $(b, d) \in \mathbb{R}^2$ with $b \leq d$, where each point records the birth $b$ and death $d$ of a generator in $H_n$, the $n$-th homology group. Points far from the diagonal ($d - b$ large) represent significant topological features. Points near the diagonal represent noise.

- $\text{PD}_0$: records connected components. A point $(b, d)$ means a component appears at scale $b$ and merges with another at scale $d$.
- $\text{PD}_1$: records loops. A point $(b, d)$ means a loop forms at scale $b$ and is filled in at scale $d$. The quantity $d - b$ is the **persistence lifetime** — how long the loop survives before it gets filled.

**Persistence image.** A persistence diagram is a multiset, not a vector. To use it as input to a classifier, Adams et al. [^4] introduced the persistence image: map each point $(b_j, d_j)$ to the birth-persistence plane $(b_j, p_j)$ where $p_j = d_j - b_j$, assign weight $w_j = p_j$ (longer-lived features matter more), place a Gaussian kernel $\varphi_\mu(x) = \exp(-\|x - \mu\|^2 / 2\sigma^2)$ at each point, and integrate over a fixed pixel grid. The result is a fixed-length vector:

$$\boldsymbol{v} = \left(\int_{B_i \times P_j} \sum_k w_k\, \varphi_{(b_k, p_k)}(x)\, dx\right)_{i,j}.$$

Persistence images are Lipschitz continuous with respect to the Wasserstein distance on diagrams — the vectorization preserves stability.

### 2.5 Why This Works Through the Network

Each layer $F_i$ in a neural network $F = F_n \circ \cdots \circ F_1$ is continuous. A continuous map $f: X \to Y$ induces group homomorphisms $f_*: H_n(X) \to H_n(Y)$ on homology, with $(g \circ f)_* = g_* \circ f_*$. This means topological features at the input have non-trivial images at each hidden layer — the network transforms the topology but doesn't destroy it entirely. The loops we measure at fc1 are shadows of the input topology, reshaped by the network's learned geometry.

---

## §3 What the Diagrams Show

The pipeline from §2 — activation extraction, point cloud construction, correlation distance, VR filtration, persistence image — produces a feature vector for each group of $g = 25$ samples. Here's what I found when I looked at the results.

To quantify differences between persistence diagrams, I use the **bottleneck distance**: given two diagrams $\text{PD}^1$ and $\text{PD}^2$,

$$d_b(\text{PD}^1, \text{PD}^2) = \inf_\gamma \sup_{(b,d) \in \text{PD}^1} \|(b,d) - \gamma(b,d)\|_\infty$$

where $\gamma$ ranges over all bijections $\text{PD}^1 \cup \Delta \to \text{PD}^2 \cup \Delta$ and $\Delta = \{(x,x) \mid x \in \mathbb{R}\}$ is the diagonal (unmatched points project to their nearest point on $\Delta$). Intuitively: the best matching between two diagrams, measuring the worst-case cost.

### 3.1 $H_1$ Separates Adversarial from Noise; $H_0$ Doesn't

The first thing I looked at: are the persistence diagrams different for clean, adversarial, and noisy inputs?

![](https://cdn.liuxy.space/academic/2026-07-22/persistence_diagrams.jpg "alt text")

*Figure 1: Persistence diagrams at the last hidden layer. Adversarial examples (BIM-A, CW-L2) show $H_1$ generators with longer lifetimes near $\epsilon \in [0.3, 0.4]$ compared to clean and noisy data.*

The visual difference in $H_1$ is clear: adversarial samples produce points further from the diagonal — longer-lived loops. But is this robust across layers?

I computed per-layer $H_1$ bottleneck distance between clean activations and adversarial/noisy activations on two datasets:

**MNIST:**

| Layer | vs BIM-A | vs CW-L₂ | vs Noisy |
|-------|----------|----------|----------|
| conv1 | ≈ 0 | ≈ 0 | 0.002 |
| conv2 | 0.110 | 0.110 | 0.111 |
| **fc1** | **0.118** | **0.112** | **0.082** |
| fc2 | 0.101 | 0.111 | 0.158 |

On MNIST, **fc1 is the only layer where adversarial distance exceeds noisy distance.** At conv2, all three are comparable (~0.11). At fc2, noisy distance (0.158) dominates — noise creates *more* topological distortion than adversarial perturbation at this layer.

**CIFAR-10:**

| Layer | vs BIM-A | vs CW-L₂ | vs Noisy |
|-------|----------|----------|----------|
| conv1–2 | ≈ 0 | ≈ 0 | ≈ 0 |
| conv3–4 | 0.03–0.07 | 0.03–0.07 | 0.05–0.07 |
| conv5–6 | 0.03–0.06 | 0.03–0.06 | 0.03 |
| fc1 | 0.048 | 0.054 | 0.020 |
| **fc2** | **0.049** | **0.049** | **0.017** |
| fc3 | 0.067 | 0.034 | 0.009 |

On CIFAR-10, the pattern is similar but shifted: **fc2 is the layer where adversarial distance most clearly exceeds noisy distance** (0.049 vs 0.017). The *which* fc layer varies by architecture, but the pattern holds: fully-connected layers separate adversarial from noise; convolutional layers don't.

![](https://cdn.liuxy.space/academic/2026-07-22/per_layer_bottleneck_dim1_mnist.jpg "alt text")
![](https://cdn.liuxy.space/academic/2026-07-22/per_layer_bottleneck_dim1_cifar.jpg "alt text")

*Figure 2: Per-layer $H_1$ bottleneck distance. Top: MNIST. Bottom: CIFAR-10. Adversarial distance exceeds noisy distance only at specific fc layers.*

For comparison, $H_0$ bottleneck distances are flat at $\sim 0.04$–$0.05$ across all layers and all perturbation types on MNIST. The 0-dimensional topology — the structure that KD and LID measure — cannot tell adversarial from noise.

### 3.2 Monotonicity Beyond Success

Next question: is the topological distortion proportional to perturbation strength?

I swept $\epsilon$ from 0.05 to 0.5 on MNIST (BIM-A attack) and measured $H_0$ and $H_1$ bottleneck distances between clean and adversarial activations at fc1.

![](https://cdn.liuxy.space/academic/2026-07-22/epsilon_sweep.jpg "alt text")

*Figure 3: Bottleneck distance vs. perturbation magnitude $\epsilon$. $H_1$ grows monotonically ($0.088 \to 0.35$); $H_0$ stays flat. The attack success rate saturates at 100% for $\epsilon \geq 0.1$ (dashed line).*

Three observations:

1. **$H_1$ bottleneck distance increases monotonically** with $\epsilon$: from 0.088 at $\epsilon = 0.05$ to 0.35 at $\epsilon = 0.5$.

2. **$H_0$ stays flat** at $\sim 0.04$–$0.05$. Insensitive to attack strength.

3. **The distance keeps growing after success rate saturates.** At $\epsilon = 0.1$, the attack already succeeds 100% of the time. Yet $H_1$ bottleneck distance continues to increase through $\epsilon = 0.5$. The classification outcome hasn't changed — the model is already fooled perfectly — but the topological distortion keeps growing.

This third point is the most interesting to me. Topology is measuring something about how the activation geometry deforms, not just whether the label flips.

### 3.3 The Heavy Tail (Empirical Observation)

I looked at the $H_1$ persistence lifetime distribution of the last hidden layer across multiple datasets and attack methods.

![](https://cdn.liuxy.space/academic/2026-07-22/h1_summary_table.jpg "alt text")

*Figure 4: $H_1$ lifetime distribution of last hidden layer activation across datasets.*

![](https://cdn.liuxy.space/academic/2026-07-22/h1_distribution_mnist_clean.jpg "alt text")
![](https://cdn.liuxy.space/academic/2026-07-22/h1_distribution_mnist_bim-a.jpg "alt text")
![](https://cdn.liuxy.space/academic/2026-07-22/h1_distribution_mnist_cw-l2.jpg "alt text")

*Figure 5: $H_1$ lifetime distributions on MNIST — clean, BIM-A, CW-L2.*

Three patterns emerge, consistent across MNIST, CIFAR-10, and Fashion-MNIST:

1. **Distributions follow exponential or gamma.** Different datasets follow distinct parameterizations, but the shape family is consistent.

2. **Universal heavy right tail.** Every distribution has a heavy right tail — there are always some long-lived $H_1$ generators. Non-trivial loop structure appears to be a universal property of activation spaces.

3. **Adversarial perturbation flattens part of the tail.** Certain long-lived loops are selectively shortened or destroyed. The effect is consistent across BIM-A, CW-L₂, and PGD attacks.

**These are observations from the diagrams, not derived results.** I don't have a mathematical explanation for why the tail flattens rather than shifts uniformly. One possible reading: gradient-based attacks align with the loss gradient — a single global direction in activation space — and this direction might systematically contract cycles aligned with it while leaving others intact. But this is speculation. I haven't verified it.

### What §3 Tells Us

The empirical picture is:

- $H_1$ at fc layers separates adversarial from noise. $H_0$ doesn't. Conv layers don't.
- The separation is monotonic in $\epsilon$, even beyond the regime of classification success.
- Adversarial perturbation has a consistent topological signature: it flattens the heavy tail of the $H_1$ lifetime distribution.

What remains open: *why* fc layers and not conv layers, *why* the tail flattens, and whether these observations hold on larger models and harder datasets. These are empirical findings, not theorems.

---

## §4 Stress Tests and Open Questions

### 4.1 The fc-Layer Question

The separation property — adversarial distance > noisy distance in $H_1$ — appears at fully-connected layers but not at convolutional layers. On MNIST it's fc1. On CIFAR-10 it's fc2. The *which* varies; the *where* (fc, not conv) doesn't.

I don't have a proof of why. Here's my intuition, stated as such:

Convolutional layers preserve spatial locality. Their activation vectors still encode spatial features — edges, textures, patches. The activation geometry is "image-like." Fully-connected layers destroy spatial structure entirely. Everything is compressed into a high-dimensional manifold where the decision geometry of the network is encoded *topologically*, not spatially.

Adversarial perturbation is a global linear phenomenon. It pushes activations along a single direction in weight space. If the activation manifold at fc layers is topologically rich — full of loops that encode class-separating structure — then a linear perturbation might selectively deform these loops in a way that's visible in $H_1$. At conv layers, where the geometry is still spatial, this deformation might be distributed across many local patches and averaged out.

But this is a post-hoc narrative, not a derivation. The honest statement is: **empirically, fc layers work and conv layers don't, and I don't have a proof of why.**

### 4.2 What Happens Under Strong Attacks

The observations in §3 were made against BIM-A and CW-L₂ — relatively gentle attacks. What happens when a stronger adversary specifically targets the topological features?

Athalye et al. [^5] demonstrated that many adversarial defenses rely on *obfuscated gradients* — non-differentiable operations that give a false sense of security. They proposed BPDA (Backward Pass Differentiable Approximation) to circumvent these defenses, and PGD (Projected Gradient Descent) as a universal first-order adversary [^6].

When PGD and BPDA attack the persistence-based detector, the network enters a degenerate regime:

| | Max Prob | Margin | Entropy | True Prob | fc2 Norm |
|---|----------|--------|---------|-----------|----------|
| Clean | 0.933 | 0.888 | 0.206 | 0.933 | 3500 |
| CW-L2 | 0.615 | 0.420 | 1.049 | 0.178 | 2144 |
| **PGD** | **1.000** | **1.000** | **0.000** | **0.000** | **11627** |
| **BPDA** | **1.000** | **1.000** | **0.000** | **0.000** | **11428** |

PGD and BPDA push $P(\text{true})$ to 0, $P(\text{max})$ to 1.0, entropy to 0. The fc2 norm explodes from 3,500 to 11,500+. The network is pushed to a corner of activation space far from anything it was trained on. This isn't subtle evasion — it's activation-space violence.

![](https://cdn.liuxy.space/academic/2026-07-22/exp8_persistence_lifetime.jpg "alt text")

*Figure 6: Persistence lifetime distribution of fc2 layer under attacks. PGD/BPDA create a distinct topological signature — different from clean, different from CW-L₂, different from noise.*

The topological signature is still there. It's *different* from the signature of weaker attacks — the persistence lifetime distribution shifts — but it's detectable. After PCA on persistence images to 2 dimensions, clean and adversarial samples remain separable:

![](https://cdn.liuxy.space/academic/2026-07-22/exp5_pca_scatter.jpg "alt text")
![](https://cdn.liuxy.space/academic/2026-07-22/exp5_tsne_scatter.jpg "alt text")

*Figure 7: 2D PCA and t-SNE of persistence image features (out of 1922 dimensions). Clean and adversarial samples occupy distinct regions even in 2D.*

The baseline classifier (without augmentation) fails on PGD/BPDA — 0% detection. But with virtual adversarial augmentation — reflecting adversarial samples through the mean of clean samples and adding random rotation, exploiting the empirical observation that adversarial samples distribute *around* the clean manifold — the detector achieves 100% detection on PGD and BPDA.

### 4.3 Two Observations

The stress tests suggest two things:

1. **Adversarial perturbation has a fundamentally different distribution from Gaussian noise.** Noise pushes samples in random directions; adversarial perturbation pushes along a structured direction (the loss gradient). This difference is visible in the topology — not just in $H_1$ lifetime, but in how the activation manifold deforms under perturbation.

2. **Adversarial subspaces surround the clean manifold.** In persistence image space, clean and adversarial data occupy different high-dimensional balls with distinct $(\mu, \sigma)$ statistics. They're not interleaved — they're separated. The topological features make this separation visible in a way that raw activation statistics might not.

---

## §5 Convergence to Bayes Optimal

The persistence-based detection pipeline converges to the Bayes optimal detector as the number of point clouds grows. This is not a single theorem but a chain of four results, assembled into a pipeline argument.

**Assumption.** The activation vectors $\{\phi(X_i)\}_{i=1}^n$ are i.i.d. draws from a probability distribution $\mu$ on $\mathbb{R}^d$. This follows the framework of Ma et al. [^3]. In practice, point clouds are built by partitioning consecutive samples into groups — the i.i.d. assumption is a modeling choice, not a fact about the data ordering. But it's the standard assumption in the literature, and it's the one that makes the convergence argument work.

### Step 1: Stability of Persistence Diagrams [^7]

Small perturbation in the input metric space → small change in the persistence diagram.

*Theorem (Chazal et al. 2012).* Let $X$ and $\tilde{X}$ be two compact metric spaces. Then

$$d_b\bigl(\text{dg}(\text{Filt}(X)),\, \text{dg}(\text{Filt}(\tilde{X}))\bigr) \leq 2\, d_{GH}(X, \tilde{X})$$

where $d_b$ is the bottleneck distance, $\text{dg}$ denotes the persistence diagram, and $d_{GH}$ is the Gromov-Hausdorff distance. When $X$ and $\tilde{X}$ are embedded in the same metric space, the Hausdorff distance $d_H$ suffices.

### Step 2: Convergence of Persistence Diagrams [^8]

The empirical persistence diagram (from finitely many samples) converges to the true diagram (of the underlying distribution).

*Theorem (Chazal et al. 2015).* Let $\mu$ be a probability measure on a metric space $(\mathcal{M}, \rho)$ whose support $X_\mu$ is compact. Suppose $\mu$ satisfies the $(a,b)$-standard assumption: for all $x \in X_\mu$ and $r > 0$,

$$\mu(B(x, r)) \geq \min(a r^b, 1)$$

for constants $a, b > 0$. Then for i.i.d. samples $\{X_1, \ldots, X_n\}$ from $\mu$:

$$d_b\bigl(\text{dg}(\text{Filt}(X_\mu)),\, \text{dg}(\text{Filt}(\hat{X}_n))\bigr) \leq C \left(\frac{\log n}{n}\right)^{1/b}$$

almost surely as $n \to \infty$, where $C$ depends only on $a$ and $b$. The rate is **minimax optimal** up to the logarithmic factor.

For $n$ points sampled from a smooth $k$-dimensional submanifold $X_\mu \subset \mathbb{R}^D$, the convergence rate is $O\bigl((\log n / n)^{1/k}\bigr)$.

### Step 3: Stability of Persistence Images [^4]

The vectorization step (diagram → image) preserves stability.

*Theorem (Adams et al. 2015).* Let $\text{PD}_1$ and $\text{PD}_2$ be two persistence diagrams, and let PI be the persistence image map with Gaussian kernels of bandwidth $\sigma$ and weight function $w$ bounded by $W_{\max}$ on a bounded domain. Then

$$\|\text{PI}(\text{PD}_1) - \text{PI}(\text{PD}_2)\| \leq \frac{W_{\max}}{\sigma} \|\text{PD}_1 - \text{PD}_2\|_1$$

where $\|\cdot\|_1$ denotes the 1-Wasserstein distance. Since $d_b \leq \|\cdot\|_1$, this implies Lipschitz continuity with respect to the bottleneck distance.

### Step 4: Consistency of RBF-SVM [^9]

With enough data, the SVM classifier converges to the best possible classifier.

*Theorem (Steinwart 2001).* Let $P$ be a probability distribution on $\mathbb{R}^d \times \{0,1\}$ and let $\{(X_i, Y_i)\}_{i=1}^n$ be i.i.d. samples. If the SVM uses a universal kernel (e.g., RBF kernel $k(x,y) = \exp(-\gamma\|x-y\|^2)$) with regularization parameter $C_n$ satisfying $C_n \to \infty$ and $C_n / n \to 0$, then

$$R(f_n) \to R_{\text{Bayes}}$$

in probability, where $R_{\text{Bayes}}$ is the Bayes risk.

### The Chain

As $n \to \infty$:

1. $\text{dg}(\text{Filt}(\hat{X}_n)) \xrightarrow{d_b} \text{dg}(\text{Filt}(X_\mu))$ — empirical diagram converges to true diagram (Step 2).
2. $\text{PI}(\text{dg}(\text{Filt}(\hat{X}_n))) \xrightarrow{L^2} \text{PI}(\text{dg}(\text{Filt}(X_\mu)))$ — persistence images converge (Steps 2 + 3).
3. $R(f_n) \to R_{\text{Bayes}}$ — SVM risk converges to Bayes optimal (Step 4).

**Corollary.** The full pipeline — activation extraction → point cloud → persistence diagram → persistence image → SVM — converges to the Bayes optimal detector.

Each link is a published theorem. The contribution here is seeing that they chain: the output of each stage is the input of the next, and each stage preserves the convergence guarantee.

---

## §6 Conjectures

These are actual conjectures. I have not done the experiments to verify them. I'm writing them down because I think they're worth testing, and because being honest about what I don't know is more useful than pretending I do.

### Conjecture 1: Attack Invariance of the Tail Flattening

All first-order adversarial attacks — FGSM, BIM, PGD, CW — align with the loss gradient $\nabla_{\boldsymbol{X}} J(\boldsymbol{X}, y_{\text{true}})$. This is a single global direction in activation space. If the heavy tail flattening observed in §3.3 is caused by this alignment (the perturbation direction systematically contracts cycles aligned with it), then the signature should be **attack-invariant**: a detector trained on one attack should generalize to others.

LID showed partial generalization from simple to complex attacks [^3]. $H_1$ should do better, because persistence diagrams capture multi-scale topological structure — not just local dimensionality. But I haven't tested this.

**How to test:** Train the persistence classifier on FGSM-only data. Evaluate on BIM-A, CW-L₂, PGD, BPDA. Compare generalization gap against LID.

### Conjecture 2: Bottleneck Distance Tracks Geometric Distortion

The $\epsilon$-monotonicity result (§3.2) shows that $d_b(\text{PD}_{\text{clean}}, \text{PD}_{\text{adv}})$ grows even after attack success saturates at 100%. This suggests the bottleneck distance measures something about activation geometry, not classification outcomes.

**Conjecture:** $d_b(\text{PD}_{\text{clean}}, \text{PD}_{\text{adv}})$ correlates with — or bounds — the Wasserstein distance $W_2(\mu_{\text{clean}}, \mu_{\text{adv}})$ between clean and adversarial activation distributions.

If true, this would give a topological proxy for geometric distortion. The implications go beyond detection: a known lower bound on $d_b$ as a function of $\epsilon$ would certify that a model is topologically vulnerable within an $\epsilon$-ball.

**Caveat:** This is the most speculative conjecture here. Monotonicity of one quantity doesn't imply correlation with another. I don't have a theoretical argument for why $d_b$ and $W_2$ should be related. The intuition is that both measure "how far" the adversarial distribution is from the clean one, but in different spaces (diagram space vs. distribution space). Whether these distances are comparable is an open question.

**How to test:** Compute both $d_b$ and $W_2$ for a range of $\epsilon$ values and attack methods. Check correlation. Try to prove a bound.

### Conjecture 3: Why fc Layers

At a fully-connected layer, the activation map is $x \mapsto \text{ReLU}(Wx + b)$ — a piecewise-linear map that folds the input space into polyhedral regions. Adversarial perturbations, aligned with $W^T \nabla J$, push samples across *specific* fold boundaries — structured, deterministic. Gaussian noise pushes samples across *random* fold boundaries — unstructured, averaging out across samples.

This might explain the fc-layer specificity: adversarial perturbation creates or destroys loops systematically (always in the same topological direction), while noise creates or destroys loops randomly (cancelling out in aggregate). The systematic effect shows up in the persistence diagram; the random effect doesn't.

**Caveat:** I haven't worked through the geometry carefully. The piecewise-linear structure of ReLU networks is well-studied [^10], but connecting it to persistence diagram behavior is non-trivial. This is a guess informed by intuition, not a derived result.

---

## §7 Open Directions

**$H_2$ and beyond.** Voids in activation space — 2-dimensional topological features captured by $H_2$ — might carry even richer adversarial signatures. The computational cost is the bottleneck: Ripser's complexity grows with homological dimension. But for small point clouds ($g = 25$), $H_2$ might be feasible. Whether $H_2$ adds information beyond $H_1$ is an empirical question.

**Topological adversarial training.** Instead of detecting adversarial examples after the fact, can we *train* models to preserve topological structure under perturbation? A regularization term

$$\mathcal{L}_{\text{topo}} = \lambda \cdot d_b\bigl(\text{PD}(F(X)),\, \text{PD}(F(X + \delta))\bigr)$$

added to the classification loss, where $\delta$ is a PGD perturbation, would encourage the network to learn representations whose topology is robust to adversarial direction. The persistence stability theorem (Step 1 in §5) guarantees this loss is well-behaved.

**Certification.** If Conjecture 2 holds — if $d_b$ provably bounds $W_2$ — then a known lower bound on $d_b$ as a function of $\epsilon$ would certify vulnerability. This moves from detection to provable guarantees: "this model's activation topology is distorted by at least $c$ within any $\epsilon$-ball." Whether such a bound exists is open.

---

## §8 Scope

This is a topological lens on adversarial perturbations. The core finding is empirical: $H_1$ at fully-connected layers carries information that $H_0$ cannot see, and this information is robust enough to separate adversarial perturbations from natural noise. The convergence guarantee (§5) provides theoretical grounding — the pipeline is consistent, not ad hoc.

What this isn't: a deployed defense system. The SVM classifier built on persistence features achieves strong detection rates and survives BPDA/PGD attacks with augmentation. But the classifier is an engineering validation that the topological features are discriminative — it's not the contribution itself. The contribution is the observation, the mathematics that makes it formal, and the conjectures that point forward.

Source code: [github.com/synxn1o/UG_Thesis](https://github.com/synxn1o/UG_Thesis)

---

## References

[^1]: Goodfellow, Shlens, Szegedy. "Explaining and Harnessing Adversarial Examples." ICLR 2015.

[^2]: Feinman et al. "Detecting Adversarial Samples from Artifacts." ICML Workshop 2017.

[^3]: Ma et al. "Characterizing Adversarial Subspaces Using Local Intrinsic Dimensionality." ICLR 2018.

[^4]: Adams et al. "Persistence Images: A Stable Vector Representation of Persistent Homology." JMLR 2017.

[^5]: Athalye, Carlini, Wagner. "Obfuscated Gradients Give a False Sense of Security." ICML 2018.

[^6]: Madry et al. "Towards Deep Learning Models Resistant to Adversarial Attacks." ICLR 2018.

[^7]: Chazal, de Silva, Glisse, Oudot. *The Structure and Stability of Persistence Modules.* Springer 2016.

[^8]: Chazal, Glisse, Labruère, Michel. "Convergence Rates for Persistence Diagram Estimation in TDA." JMLR 2015.

[^9]: Steinwart. "On the Influence of the Kernel on the Consistency of Support Vector Machines." JMLR 2001.

[^10]: Hein, Andriushchenko, Bitterwolf. "Why ReLU Networks Yield High-Confidence Predictions Far Away from the Training Data." CVPR 2019.

[^11]: Carlini, Wagner. "Towards Evaluating the Robustness of Neural Networks." IEEE S&P 2017.

[^12]: Kurakin, Goodfellow, Bengio. "Adversarial Machine Learning at Scale." ICLR 2017.

[^13]: Zheng et al. "Topological Detection of Trojaned Neural Networks." NeurIPS 2021.

[^14]: Bubenik. "Statistical Topological Data Analysis Using Persistence Landscapes." JMLR 2015.

[^15]: Bobrowski, Skraba. "On the Universality of Random Persistence Diagrams." Annals of Applied Probability 2023.
