<!-- # Linbladian Spectrum of Transverse Field Ising Chain. -->

Transverse Field Ising Model (**TFIM**) is one of the ubiqutious spin models that showcase non trivial quantum physics. One of the simplest variant of is 1D isotropic TFIM is with nearest neighbour interaction whose Hamiltonian as defined as follows:

$$
H_{Ising} = -J \sum_{i} \sigma_{i}^{z}\sigma_{i+1}^{z} - h \sum_{i}\sigma_{i}^{x}
$$

Here, $J$ denotes the interaction strength and $h$ denotes the strength of magnetic field across the transverse direction. Imagine the TFIM to experience amplitude damping due to interaction with the environment. In such a scenario, the dissipation could be modelled with the spin ladder operators, where $$L_{\mu} = \sigma_{\mu}^{-}.$$ 

Implementation of Arnoldi iteration to diagonalize a Linbladian requires a routine to compute $\mathcal{L}\rho$ which given by the Linblad-Master equation

$$\mathcal{L}\rho = -i\left[ H_{Ising}, \rho \right] + \sum_{\mu} \gamma_{\mu} (\sigma_{\mu}^{-}\rho\sigma_{\mu}^{+} - \frac{1}{2}\{\sigma_{\mu}^{+}\sigma_{\mu}^{-},\rho\})$$

For simplicity we could assume the decay rates $\gamma_\mu$ to be constant and equal to one. The computation involves only matrix operations. The computation involves only matrix operations, making it ideal for acceleration using the **BLAS** package [1]. Once the routine has been constructed, one can perform Arnoldi iteration to approximate the Lindbladian spectrum.

My implementation of this routine, along with the Arnoldi iteration, can be found here:

🔗 **https://github.com/NavMohan-24/Parallel-Programming/tree/main/MPI/eigenvalue-computations**



---
<figure>
    <img src="./images/linbladian_diagonalization/linbladian_spectrum.svg"
         alt="Linbladian Spectrum via Arnoldi Iteration">
    <figcaption> Fig 1: Linbladian Spectrum through Arnoldi iteration for different values of k.</figcaption>
</figure>

The figure above depicts the Liouvillian spectrum of a 3-spin TFIM model with parameters $J = -1.0$ and $h = 0.1$, undergoing amplitude damping. Each subplot contains the eigenvalues produced through Arnoldi iteration for different Krylov-subspace dimensions $k$. The results are compared against the exact spectrum obtained from **QuTiP**, which internally represents the Lindbladian in Liouville space as a matrix and performs Arnoldi iteration on the full space. 

As observed, increasing the subspace dimension $k$ improves the agreement between Arnoldi-derived eigenvalues and the exact results. For sufficiently large $k$, the Arnoldi estimates converge and eventually coincide with the exact QuTiP spectrum.

Finally, before ending the blog, I would like to share some qookie crumbs with you. 

- I was very naive in using dense data structures for my my implementation. Arnoldi iteration is advantageous with sparse matrices as they could compute the matrix-vector product ($\mathcal{L}\rho$ in our case) efficiently exploiting the structure. For scaling up the Linbladian diagonalization, it is neccessary to work with sparse data structures and linear algebra routines that could handle sparse data. Further, variants of Arnoldi Iteration like Restarted Arnoldi exist which reduce memory required to store the Krylov subspace vector and the computational cost of orthogonalisation [2].

- Diagonalizing a Lindbladian is very useful for understanding the long-term dynamics of an open quantum system, especially for identifying the steady state.  However, my current approach is not efficient in finding steady state. Arnoldi iteration in its orginal form designed give the dominant eigenvectors iteratively (based on maginitue of eigen values). As steady state correspond zero eigenvalue, my solver takes some iterations to give the steady-state. If the goal is only to obtain the steady state, a shift–invert strategy is much more efficient, since it directly targets eigenvalues near zero by repeatedly solving shifted linear systems.

- Arnoldi iteration is powerful enough to be used for time-evolving open quantum systems as well. A very nice paper in this direction can be found in [3]. The ideas are closely related to what I discussed here, but I discovered this paper quite late — reading it earlier would have saved me a lot of time!

- Finally, the whole implementation becomes much more simpler when using `Eigen`[4] along with the ARPACK library [5] rather than implementing it from scratch using BLAS and Lapack libraries. :)



**References**
1. [Basic Linear Algebra Subprograms](https://www.netlib.org/blas/)
2. [Restarting Arnoldi and Lanczos algorithms](https://people.inf.ethz.ch/arbenz/ewp/Lnotes/chapter11.pdf)
3. [Arnoldi-Lindblad time evolution](https://arxiv.org/pdf/2109.01648)
3. [Eigen Package](https://libeigen.gitlab.io/eigen/docs-nightly/)
4. [ezARPACK](https://krivenko.github.io/ezARPACK/guide/index.html)
